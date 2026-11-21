"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
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

type Size = "nav" | "hero" | "footer";

const PRESETS: Record<
  Size,
  { px: number; n: number; cycle: number; scale: number }
> = {
  nav: { px: 34, n: 56, cycle: 4200, scale: 0.38 },
  hero: { px: 88, n: 84, cycle: 4000, scale: 0.4 },
  footer: { px: 28, n: 48, cycle: 4400, scale: 0.38 },
};

/**
 * Brand mark: sparse dots + hairlines assemble into a 3D sphere,
 * shatter, and reassemble — palette flows only on the wire itself.
 */
export function SphereMark({
  size = "nav",
  className,
}: {
  size?: Size;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const preset = PRESETS[size];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { sphere, scatter, links } = buildSphereField(preset.n, 4);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    let raf: number | null = null;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const px = preset.px;
      canvas.width = Math.floor(px * dpr);
      canvas.height = Math.floor(px * dpr);
      canvas.style.width = `${px}px`;
      canvas.style.height = `${px}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const tick = (now: number) => {
      const px = preset.px;
      ctx.clearRect(0, 0, px, px);

      const cx = px / 2;
      const cy = px / 2;
      const scale = px * preset.scale;

      const u = reduced ? 0.4 : ((now - start) % preset.cycle) / preset.cycle;
      const assemble = assembleAmount(u);
      const t = now * 0.001;
      const rotY = t * 0.9;
      const rotX = 0.5 + Math.sin(t * 0.42) * 0.32;
      const rotZ = Math.cos(t * 0.3) * 0.16;
      const flow = t * 0.12;

      type Proj = { x: number; y: number; z: number; i: number; local: Vec3 };
      const projected: Proj[] = new Array(preset.n);

      for (let i = 0; i < preset.n; i++) {
        const s = sphere[i];
        const sc = scatter[i];
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
      for (let i = 0; i < preset.n; i++) {
        for (const j of links[i]) {
          if (j <= i) continue;
          const a = projected[i];
          const b = projected[j];
          const midZ = (a.z + b.z) * 0.5;
          const depth = (midZ + 1.15) / 2.3;
          const alpha = (0.22 + depth * 0.55) * (0.3 + assemble * 0.75);
          if (alpha < 0.04) continue;
          const c0 = samplePalette(surfaceT(a.local, flow));
          const c1 = samplePalette(surfaceT(b.local, flow));
          const tone = (c: { r: number; g: number; b: number }) =>
            mix({ r: 20, g: 40, b: 45 }, c, 0.72);
          const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
          grad.addColorStop(0, rgba(tone(c0), alpha * 0.8));
          grad.addColorStop(1, rgba(tone(c1), alpha * 0.8));
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = grad;
          ctx.lineWidth = size === "nav" || size === "footer" ? 0.5 : 0.55;
          ctx.stroke();
        }
      }

      for (const idx of order) {
        const p = projected[idx];
        const depth = (p.z + 1.15) / 2.3;
        const alpha = 0.5 + depth * 0.45;
        const persp = FOV / Math.max(0.4, FOV - p.z);
        const rad = Math.max(
          size === "hero" ? 0.9 : 0.7,
          (size === "hero" ? 0.95 : 0.75) * persp * (0.85 + depth * 0.2)
        );
        const c = samplePalette(surfaceT(p.local, flow));
        const tone = mix({ r: 18, g: 36, b: 40 }, c, 0.78);
        ctx.beginPath();
        ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
        ctx.fillStyle = rgba(tone, alpha);
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, [preset, size]);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        className
      )}
      style={{ width: preset.px, height: preset.px }}
      aria-label="IntentSpec"
      title="뜻이 모이는 구"
    >
      <canvas ref={canvasRef} className="block" aria-hidden />
    </span>
  );
}
