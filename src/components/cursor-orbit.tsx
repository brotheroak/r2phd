"use client";

import { useEffect, useRef } from "react";

/**
 * Self-tracking 3D torus orbit on the hero.
 * Assembles → holds → shatters → reassembles forever while the pointer is over.
 */

const SEGMENTS = 72;
const CYCLE_MS = 4000;
const FOV = 2.55;

const PALETTE = [
  { r: 15, g: 107, b: 99 },
  { r: 70, g: 150, b: 140 },
  { r: 196, g: 110, b: 95 },
  { r: 190, g: 145, b: 95 },
  { r: 100, g: 135, b: 165 },
  { r: 15, g: 107, b: 99 },
];

type Vec3 = { x: number; y: number; z: number };

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function mix(a: (typeof PALETTE)[0], b: (typeof PALETTE)[0], t: number) {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  };
}

function samplePalette(t: number) {
  const x = ((t % 1) + 1) % 1;
  const s = x * (PALETTE.length - 1);
  const i = Math.floor(s);
  return mix(PALETTE[i], PALETTE[Math.min(i + 1, PALETTE.length - 1)], s - i);
}

function rgba(c: { r: number; g: number; b: number }, a: number) {
  return `rgba(${c.r | 0},${c.g | 0},${c.b | 0},${Math.max(0, Math.min(1, a))})`;
}

function rotXYZ(p: Vec3, rx: number, ry: number, rz: number): Vec3 {
  let { x, y, z } = p;
  const xz = x * Math.cos(rz) - y * Math.sin(rz);
  const yz = x * Math.sin(rz) + y * Math.cos(rz);
  x = xz;
  y = yz;
  const yx = y * Math.cos(rx) - z * Math.sin(rx);
  const zx = y * Math.sin(rx) + z * Math.cos(rx);
  y = yx;
  z = zx;
  const xy = x * Math.cos(ry) + z * Math.sin(ry);
  const zy = -x * Math.sin(ry) + z * Math.cos(ry);
  return { x: xy, y, z: zy };
}

/** Continuous loop that always returns to assemble=1 */
function assembleAmount(u: number) {
  // assemble 0–0.30, hold 0.30–0.50, shatter 0.50–0.80, gather prep 0.80–1.00
  if (u < 0.3) return easeInOut(u / 0.3);
  if (u < 0.5) return 1;
  if (u < 0.8) return 1 - easeInOut((u - 0.5) / 0.3);
  // brief rest at 0, then next cycle reassembles from 0
  return 0;
}

export function CursorOrbit() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scatter = useRef<Vec3[]>([]);
  const raf = useRef<number | null>(null);
  const start = useRef(0);
  const target = useRef({ x: 0.5, y: 0.42, over: false });
  const current = useRef({ x: 0.5, y: 0.42 });
  const vis = useRef(0);

  useEffect(() => {
    const pts: Vec3[] = [];
    for (let i = 0; i < SEGMENTS; i++) {
      const lon = Math.random() * Math.PI * 2;
      const lat = (Math.random() - 0.5) * Math.PI;
      const d = 1.5 + Math.random() * 2.4;
      pts.push({
        x: Math.cos(lon) * Math.cos(lat) * d,
        y: Math.sin(lat) * d,
        z: Math.sin(lon) * Math.cos(lat) * d,
      });
    }
    scatter.current = pts;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    start.current = performance.now();

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const onMove = (e: PointerEvent) => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const over =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      target.current.over = over;
      if (!over) return;
      target.current.x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      target.current.y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    };

    window.addEventListener("pointermove", onMove, { passive: true });

    const tick = (now: number) => {
      const parent = canvas.parentElement;
      if (!parent) {
        raf.current = requestAnimationFrame(tick);
        return;
      }
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      ctx.clearRect(0, 0, w, h);

      current.current.x += (target.current.x - current.current.x) * 0.3;
      current.current.y += (target.current.y - current.current.y) * 0.3;
      const visTarget = target.current.over ? 1 : 0;
      vis.current += (visTarget - vis.current) * 0.18;
      const v = vis.current;
      if (v < 0.015) {
        raf.current = requestAnimationFrame(tick);
        return;
      }

      const cx = current.current.x * w;
      const cy = current.current.y * h;
      const scale = Math.min(w, h) * 0.145;

      const u = reduced ? 0.4 : ((now - start.current) % CYCLE_MS) / CYCLE_MS;
      const assemble = assembleAmount(u);

      const t = now * 0.001;
      const rotY = t * 1.05;
      const rotX = 0.62 + Math.sin(t * 0.48) * 0.38;
      const rotZ = Math.cos(t * 0.33) * 0.22;
      const flow = t * 0.2;
      const tubeR = 0.1;

      type Proj = {
        x: number;
        y: number;
        z: number;
        i: number;
        nz: number;
      };
      const projected: Proj[] = new Array(SEGMENTS);

      for (let i = 0; i < SEGMENTS; i++) {
        const theta = (i / SEGMENTS) * Math.PI * 2;
        const ring: Vec3 = { x: Math.cos(theta), y: Math.sin(theta), z: 0 };
        const sc = scatter.current[i];
        const local: Vec3 = {
          x: lerp(sc.x, ring.x, assemble),
          y: lerp(sc.y, ring.y, assemble),
          z: lerp(sc.z, ring.z, assemble),
        };
        const p = rotXYZ(local, rotX, rotY, rotZ);
        const n = rotXYZ({ x: Math.cos(theta), y: Math.sin(theta), z: 0 }, rotX, rotY, rotZ);
        const persp = FOV / (FOV - p.z);
        projected[i] = {
          x: cx + p.x * scale * persp,
          y: cy + p.y * scale * persp,
          z: p.z,
          i,
          nz: n.z,
        };
      }

      // Under glow
      const bloom = ctx.createRadialGradient(cx, cy, 4, cx, cy, scale * 1.85);
      bloom.addColorStop(0, rgba(samplePalette(flow), 0.22 * v));
      bloom.addColorStop(0.55, rgba(samplePalette(flow + 0.35), 0.08 * v));
      bloom.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bloom;
      ctx.beginPath();
      ctx.arc(cx, cy, scale * 1.85, 0, Math.PI * 2);
      ctx.fill();

      const order = projected
        .map((_, i) => i)
        .sort((a, b) => projected[a].z - projected[b].z);

      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (const i of order) {
        const a = projected[i];
        const next = projected[(i + 1) % SEGMENTS];
        const midZ = (a.z + next.z) * 0.5;
        const depth = (midZ + 1.2) / 2.4;
        const light = Math.max(0.2, Math.min(1, 0.4 + a.nz * 0.55));
        const alpha = (0.45 + depth * 0.5) * v * (0.4 + assemble * 0.6);
        if (alpha < 0.04) continue;

        const c0 = samplePalette(i / SEGMENTS + flow);
        const c1 = samplePalette((i + 1) / SEGMENTS + flow);
        const shade = (c: { r: number; g: number; b: number }, k: number) => ({
          r: c.r * k,
          g: c.g * k,
          b: c.b * k,
        });
        const k = 0.4 + light * 0.75;
        const tubePx = Math.max(
          1.2,
          scale * tubeR * (FOV / Math.max(0.35, FOV - a.z)) * (1.15 + assemble * 0.95)
        );

        // Dark rim (volume)
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(next.x, next.y);
        ctx.strokeStyle = rgba(shade(c0, 0.28), alpha * 0.7);
        ctx.lineWidth = tubePx * 2.6;
        ctx.stroke();

        // Lit tube body with flowing gradient
        const grad = ctx.createLinearGradient(a.x, a.y, next.x, next.y);
        grad.addColorStop(0, rgba(shade(c0, k), alpha));
        grad.addColorStop(1, rgba(shade(c1, k), alpha));
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(next.x, next.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = tubePx * 1.65;
        ctx.stroke();

        // Specular ridge
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(next.x, next.y);
        ctx.strokeStyle = rgba({ r: 255, g: 255, b: 255 }, alpha * light * 0.4);
        ctx.lineWidth = tubePx * 0.42;
        ctx.stroke();
      }

      // Shatter beads when not fully assembled
      if (assemble < 0.95) {
        for (const i of order) {
          const p = projected[i];
          const depth = (p.z + 1.2) / 2.4;
          const light = Math.max(0.25, 0.45 + p.nz * 0.5);
          const alpha = (0.5 + depth * 0.45) * v * (1 - assemble * 0.5);
          if (alpha < 0.05) continue;
          const c = samplePalette(i / SEGMENTS + flow);
          const rad = Math.max(
            1.5,
            scale * tubeR * (FOV / Math.max(0.35, FOV - p.z)) * (1.7 + (1 - assemble) * 1.1)
          );
          const g = ctx.createRadialGradient(
            p.x - rad * 0.35,
            p.y - rad * 0.4,
            Math.max(0.01, rad * 0.08),
            p.x,
            p.y,
            rad
          );
          g.addColorStop(0, rgba({ r: 255, g: 255, b: 255 }, alpha * 0.95));
          g.addColorStop(
            0.38,
            rgba(
              {
                r: c.r * (0.5 + light * 0.55),
                g: c.g * (0.5 + light * 0.55),
                b: c.b * (0.5 + light * 0.55),
              },
              alpha
            )
          );
          g.addColorStop(
            1,
            rgba({ r: c.r * 0.25, g: c.g * 0.25, b: c.b * 0.25 }, alpha * 0.9)
          );
          ctx.beginPath();
          ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        }
      }

      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf.current != null) cancelAnimationFrame(raf.current);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-[3]"
      aria-hidden
    />
  );
}
