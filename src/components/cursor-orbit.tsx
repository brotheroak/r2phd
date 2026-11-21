"use client";

import { useEffect, useRef } from "react";

/**
 * Thin monotone wire + slightly thicker dots assemble into a 3D sphere.
 * Across the sphere as a whole, palette gradient flows over time.
 */

const N = 110;
const CYCLE_MS = 3800;
const FOV = 2.7;

/** Soft brand washes — flow across the sphere surface */
const PALETTE = [
  { r: 15, g: 107, b: 99 }, // teal
  { r: 90, g: 140, b: 155 }, // slate-teal
  { r: 170, g: 120, b: 110 }, // coral muted
  { r: 180, g: 150, b: 110 }, // peach muted
  { r: 100, g: 130, b: 160 }, // slate
  { r: 15, g: 107, b: 99 },
];

type Vec3 = { x: number; y: number; z: number };
type RGB = { r: number; g: number; b: number };

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function mix(a: RGB, b: RGB, t: number): RGB {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  };
}

function samplePalette(t: number): RGB {
  const x = ((t % 1) + 1) % 1;
  const s = x * (PALETTE.length - 1);
  const i = Math.floor(s);
  return mix(PALETTE[i], PALETTE[Math.min(i + 1, PALETTE.length - 1)], s - i);
}

function rgba(c: RGB, a: number) {
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

function fibSphere(i: number, n: number): Vec3 {
  const phi = Math.acos(1 - (2 * (i + 0.5)) / n);
  const theta = Math.PI * (1 + Math.sqrt(5)) * i;
  return {
    x: Math.sin(phi) * Math.cos(theta),
    y: Math.cos(phi),
    z: Math.sin(phi) * Math.sin(theta),
  };
}

function assembleAmount(u: number) {
  if (u < 0.28) return easeInOut(u / 0.28);
  if (u < 0.48) return 1;
  if (u < 0.78) return 1 - easeInOut((u - 0.48) / 0.3);
  return 0;
}

/** Hue position on sphere surface — longitude + latitude blend */
function surfaceT(p: Vec3, flow: number) {
  const lon = Math.atan2(p.z, p.x) / (Math.PI * 2) + 0.5;
  const lat = Math.acos(Math.max(-1, Math.min(1, p.y))) / Math.PI;
  return lon * 0.65 + lat * 0.35 + flow;
}

export function CursorOrbit() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sphere = useRef<Vec3[]>([]);
  const scatter = useRef<Vec3[]>([]);
  const links = useRef<number[][]>([]);
  const raf = useRef<number | null>(null);
  const start = useRef(0);
  const target = useRef({ x: 0.5, y: 0.42, over: false });
  const current = useRef({ x: 0.5, y: 0.42 });
  const vis = useRef(0);

  useEffect(() => {
    const sph: Vec3[] = [];
    const sca: Vec3[] = [];
    for (let i = 0; i < N; i++) {
      sph.push(fibSphere(i, N));
      const lon = Math.random() * Math.PI * 2;
      const lat = (Math.random() - 0.5) * Math.PI;
      const d = 1.8 + Math.random() * 2.6;
      sca.push({
        x: Math.cos(lon) * Math.cos(lat) * d,
        y: Math.sin(lat) * d,
        z: Math.sin(lon) * Math.cos(lat) * d,
      });
    }
    const neigh: number[][] = [];
    for (let i = 0; i < N; i++) {
      const dists: { j: number; d: number }[] = [];
      for (let j = 0; j < N; j++) {
        if (i === j) continue;
        const a = sph[i];
        const b = sph[j];
        dists.push({
          j,
          d: (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2,
        });
      }
      dists.sort((a, b) => a.d - b.d);
      neigh.push(dists.slice(0, 4).map((x) => x.j));
    }
    sphere.current = sph;
    scatter.current = sca;
    links.current = neigh;
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

      current.current.x += (target.current.x - current.current.x) * 0.28;
      current.current.y += (target.current.y - current.current.y) * 0.28;
      vis.current += ((target.current.over ? 1 : 0) - vis.current) * 0.16;
      const v = vis.current;
      if (v < 0.015) {
        raf.current = requestAnimationFrame(tick);
        return;
      }

      const cx = current.current.x * w;
      const cy = current.current.y * h;
      const scale = Math.min(w, h) * 0.125;

      const u = reduced ? 0.4 : ((now - start.current) % CYCLE_MS) / CYCLE_MS;
      const assemble = assembleAmount(u);

      const t = now * 0.001;
      const rotY = t * 0.85;
      const rotX = 0.45 + Math.sin(t * 0.4) * 0.35;
      const rotZ = Math.cos(t * 0.28) * 0.18;
      const flow = t * 0.12; // slow color wash across surface

      type Proj = {
        x: number;
        y: number;
        z: number;
        i: number;
        local: Vec3;
      };
      const projected: Proj[] = new Array(N);

      for (let i = 0; i < N; i++) {
        const s = sphere.current[i];
        const sc = scatter.current[i];
        const local: Vec3 = {
          x: lerp(sc.x, s.x, assemble),
          y: lerp(sc.y, s.y, assemble),
          z: lerp(sc.z, s.z, assemble),
        };
        const p = rotXYZ(local, rotX, rotY, rotZ);
        const persp = FOV / Math.max(0.4, FOV - p.z);
        projected[i] = {
          x: cx + p.x * scale * persp,
          y: cy + p.y * scale * persp,
          z: p.z,
          i,
          local: s, // color keyed to sphere rest position for stable flow
        };
      }

      // Gradient lives only on dots & edges — no ambient wash around the sphere
      const order = projected
        .map((_, i) => i)
        .sort((a, b) => projected[a].z - projected[b].z);

      // —— Thin elegant edges ——
      ctx.lineCap = "round";
      for (let i = 0; i < N; i++) {
        for (const j of links.current[i]) {
          if (j <= i) continue;
          const a = projected[i];
          const b = projected[j];
          const midZ = (a.z + b.z) * 0.5;
          const depth = (midZ + 1.15) / 2.3;
          const alpha =
            (0.18 + depth * 0.5) * v * (0.25 + assemble * 0.8);
          if (alpha < 0.03) continue;

          const ta = surfaceT(a.local, flow);
          const tb = surfaceT(b.local, flow);
          const c0 = samplePalette(ta);
          const c1 = samplePalette(tb);
          // Pull toward ink so it stays refined, not neon
          const tone = (c: RGB) =>
            mix({ r: 20, g: 40, b: 45 }, c, 0.72);

          const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
          grad.addColorStop(0, rgba(tone(c0), alpha * 0.75));
          grad.addColorStop(1, rgba(tone(c1), alpha * 0.75));

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 0.45 + depth * 0.2; // hairline
          ctx.stroke();
        }
      }

      // —— Dots: only slightly thicker than hairline edges ——
      for (const idx of order) {
        const p = projected[idx];
        const depth = (p.z + 1.15) / 2.3;
        const alpha = (0.45 + depth * 0.5) * v;
        if (alpha < 0.04) continue;
        const persp = FOV / Math.max(0.4, FOV - p.z);
        // ~0.9–1.25px radius — barely thicker than the thin lines
        const rad = Math.max(0.85, (0.95 + depth * 0.25) * persp);

        const c = samplePalette(surfaceT(p.local, flow));
        const tone = mix({ r: 18, g: 36, b: 40 }, c, 0.78);

        ctx.beginPath();
        ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
        ctx.fillStyle = rgba(tone, alpha);
        ctx.fill();
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
