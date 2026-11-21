"use client";

import { useEffect, useRef } from "react";
import {
  FOV,
  assembleAmount,
  buildSphereField,
  lerp,
  mix,
  rgba,
  rotXYZ,
  samplePalette,
  surfaceT,
  type Vec3,
} from "@/lib/sphere-field";

/**
 * CURSOR HIGHLIGHTER (separate from SphereMark brand).
 * On hover: thin dots + lines assemble → shatter → reassemble.
 * Brand mark rotation lives in SphereMark and never shatters.
 */

const N = 110;
const CYCLE_MS = 3800;

export function CursorOrbit() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const field = useRef<ReturnType<typeof buildSphereField> | null>(null);
  const raf = useRef<number | null>(null);
  const start = useRef(0);
  const target = useRef({ x: 0.5, y: 0.42, over: false });
  const current = useRef({ x: 0.5, y: 0.42 });
  const vis = useRef(0);

  useEffect(() => {
    field.current = buildSphereField(N, 4);
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
      const f = field.current;
      if (!parent || !f) {
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
      const flow = t * 0.12;

      type Proj = { x: number; y: number; z: number; i: number; local: Vec3 };
      const projected: Proj[] = new Array(N);

      for (let i = 0; i < N; i++) {
        const s = f.sphere[i];
        const sc = f.scatter[i];
        const local = {
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
          local: s,
        };
      }

      const order = projected
        .map((_, i) => i)
        .sort((a, b) => projected[a].z - projected[b].z);

      ctx.lineCap = "round";
      for (let i = 0; i < N; i++) {
        for (const j of f.links[i]) {
          if (j <= i) continue;
          const a = projected[i];
          const b = projected[j];
          const midZ = (a.z + b.z) * 0.5;
          const depth = (midZ + 1.15) / 2.3;
          const alpha =
            (0.18 + depth * 0.5) * v * (0.25 + assemble * 0.8);
          if (alpha < 0.03) continue;
          const c0 = samplePalette(surfaceT(a.local, flow));
          const c1 = samplePalette(surfaceT(b.local, flow));
          const tone = (c: { r: number; g: number; b: number }) =>
            mix({ r: 20, g: 40, b: 45 }, c, 0.72);
          const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
          grad.addColorStop(0, rgba(tone(c0), alpha * 0.75));
          grad.addColorStop(1, rgba(tone(c1), alpha * 0.75));
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 0.45 + depth * 0.2;
          ctx.stroke();
        }
      }

      for (const idx of order) {
        const p = projected[idx];
        const depth = (p.z + 1.15) / 2.3;
        const alpha = (0.45 + depth * 0.5) * v;
        if (alpha < 0.04) continue;
        const persp = FOV / Math.max(0.4, FOV - p.z);
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
