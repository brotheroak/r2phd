"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  FOV,
  buildSphereField,
  mix,
  rgba,
  rotXYZ,
  samplePalette,
  surfaceT,
  type Vec3,
} from "@/lib/sphere-field";

type Size = "nav" | "hero" | "footer";

/** Unit-sphere radius → ~SPHERE_SCALE * px from center */
const SPHERE_SCALE = 0.42;

const PRESETS: Record<Size, { px: number; n: number }> = {
  nav: { px: 40, n: 64 },
  hero: { px: 112, n: 96 },
  footer: { px: 32, n: 52 },
};

/**
 * Brand mark — rotating wire sphere only.
 * No center discs. Cursor assemble/shatter stays in CursorOrbit.
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
  const sphereDiameter = preset.px * SPHERE_SCALE * 2;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { sphere, links } = buildSphereField(preset.n, 4);
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
      const scale = px * SPHERE_SCALE;
      const t = reduced ? 0 : (now - start) * 0.001;
      const rotY = t * 0.7;
      const rotX = 0.55 + Math.sin(t * 0.35) * 0.2;
      const rotZ = Math.cos(t * 0.25) * 0.1;
      const flow = t * 0.1;

      type Proj = { x: number; y: number; z: number; i: number; local: Vec3 };
      const projected: Proj[] = new Array(preset.n);

      for (let i = 0; i < preset.n; i++) {
        const s = sphere[i];
        const p = rotXYZ(s, rotX, rotY, rotZ);
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
          const alpha = 0.2 + depth * 0.55;
          const c0 = samplePalette(surfaceT(a.local, flow));
          const c1 = samplePalette(surfaceT(b.local, flow));
          const tone = (c: { r: number; g: number; b: number }) =>
            mix({ r: 20, g: 40, b: 45 }, c, 0.7);
          const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
          grad.addColorStop(0, rgba(tone(c0), alpha * 0.75));
          grad.addColorStop(1, rgba(tone(c1), alpha * 0.75));
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = grad;
          // Line weight also scales with sphere size
          ctx.lineWidth = Math.max(0.4, sphereDiameter * 0.006);
          ctx.stroke();
        }
      }

      for (const idx of order) {
        const p = projected[idx];
        const depth = (p.z + 1.15) / 2.3;
        const persp = FOV / Math.max(0.4, FOV - p.z);
        const rad = Math.max(
          0.55,
          sphereDiameter * 0.012 * persp * (0.9 + depth * 0.15)
        );
        const c = samplePalette(surfaceT(p.local, flow));
        const tone = mix({ r: 18, g: 36, b: 40 }, c, 0.75);
        ctx.beginPath();
        ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
        ctx.fillStyle = rgba(tone, 0.55 + depth * 0.4);
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, [preset, size, sphereDiameter]);

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        className
      )}
      style={{ width: preset.px, height: preset.px }}
      aria-label="IntentSpec"
      title="IntentSpec"
    >
      <canvas ref={canvasRef} className="block" aria-hidden />
    </span>
  );
}
