"use client";

import { useEffect, useRef } from "react";

/**
 * Monotone dots + lines assemble into a 3D sphere, shatter, reassemble.
 * Follows the cursor. No color rainbow — ink/slate only.
 */

const N = 96;
const CYCLE_MS = 3800;
const FOV = 2.7;
const INK = { r: 13, g: 44, b: 48 };
const MID = { r: 55, g: 78, b: 84 };

type Vec3 = { x: number; y: number; z: number };

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function rgba(c: { r: number; g: number; b: number }, a: number) {
  return `rgba(${c.r},${c.g},${c.b},${Math.max(0, Math.min(1, a))})`;
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

/** Fibonacci sphere — even coverage on unit sphere */
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

export function CursorOrbit() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sphere = useRef<Vec3[]>([]);
  const scatter = useRef<Vec3[]>([]);
  /** neighbor indices for each point (kNN on sphere) */
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
    // k=5 nearest neighbors on the sphere for wireframe edges
    const neigh: number[][] = [];
    for (let i = 0; i < N; i++) {
      const dists: { j: number; d: number }[] = [];
      for (let j = 0; j < N; j++) {
        if (i === j) continue;
        const a = sph[i];
        const b = sph[j];
        const d =
          (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2;
        dists.push({ j, d });
      }
      dists.sort((a, b) => a.d - b.d);
      neigh.push(dists.slice(0, 5).map((x) => x.j));
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
      const scale = Math.min(w, h) * 0.13;

      const u = reduced ? 0.4 : ((now - start.current) % CYCLE_MS) / CYCLE_MS;
      const assemble = assembleAmount(u);

      const t = now * 0.001;
      const rotY = t * 0.85;
      const rotX = 0.45 + Math.sin(t * 0.4) * 0.35;
      const rotZ = Math.cos(t * 0.28) * 0.18;

      type Proj = { x: number; y: number; z: number; i: number };
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
        };
      }

      // Soft monotone bloom
      const bloom = ctx.createRadialGradient(cx, cy, 2, cx, cy, scale * 1.55);
      bloom.addColorStop(0, rgba(INK, 0.07 * v));
      bloom.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bloom;
      ctx.beginPath();
      ctx.arc(cx, cy, scale * 1.55, 0, Math.PI * 2);
      ctx.fill();

      const order = projected
        .map((_, i) => i)
        .sort((a, b) => projected[a].z - projected[b].z);

      // Edges — monotone, depth-faded, undirected (i < j)
      ctx.lineCap = "round";
      for (let i = 0; i < N; i++) {
        for (const j of links.current[i]) {
          if (j <= i) continue;
          const a = projected[i];
          const b = projected[j];
          const midZ = (a.z + b.z) * 0.5;
          const depth = (midZ + 1.15) / 2.3;
          // Edges strengthen as sphere forms
          const alpha =
            (0.12 + depth * 0.45) * v * (0.2 + assemble * 0.85);
          if (alpha < 0.03) continue;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = rgba(depth > 0.55 ? INK : MID, alpha);
          ctx.lineWidth = 0.7 + depth * 0.55;
          ctx.stroke();
        }
      }

      // Dots — monotone, size by depth (near = larger)
      for (const idx of order) {
        const p = projected[idx];
        const depth = (p.z + 1.15) / 2.3;
        const alpha = (0.35 + depth * 0.6) * v;
        if (alpha < 0.04) continue;
        const persp = FOV / Math.max(0.4, FOV - p.z);
        const rad = Math.max(1.1, (1.15 + depth * 1.1) * persp * (0.85 + assemble * 0.2));
        ctx.beginPath();
        ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
        ctx.fillStyle = rgba(depth > 0.5 ? INK : MID, alpha);
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
