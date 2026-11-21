"use client";

import { useEffect, useRef } from "react";

/**
 * Monotone grid + soft 3D planes that brighten / tilt toward the pointer.
 * Hero-only atmosphere; disabled when prefers-reduced-motion.
 */
export function HeroAtmosphere() {
  const rootRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0.5, y: 0.4 });
  const current = useRef({ x: 0.5, y: 0.4 });
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      root.style.setProperty("--hx", "50%");
      root.style.setProperty("--hy", "40%");
      root.style.setProperty("--tilt-x", "0deg");
      root.style.setProperty("--tilt-y", "0deg");
      return;
    }

    const onMove = (e: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      target.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    };

    const onLeave = () => {
      target.current = { x: 0.5, y: 0.4 };
    };

    const tick = () => {
      const c = current.current;
      const t = target.current;
      c.x += (t.x - c.x) * 0.08;
      c.y += (t.y - c.y) * 0.08;
      root.style.setProperty("--hx", `${(c.x * 100).toFixed(2)}%`);
      root.style.setProperty("--hy", `${(c.y * 100).toFixed(2)}%`);
      // Subtle perspective tilt (monotone 3D feel)
      root.style.setProperty("--tilt-y", `${((c.x - 0.5) * 6).toFixed(2)}deg`);
      root.style.setProperty("--tilt-x", `${((0.5 - c.y) * 4).toFixed(2)}deg`);
      raf.current = requestAnimationFrame(tick);
    };

    root.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerleave", onLeave);
    raf.current = requestAnimationFrame(tick);

    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      if (raf.current != null) cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="hero-atmosphere pointer-events-none absolute inset-0 overflow-hidden"
      style={
        {
          "--hx": "50%",
          "--hy": "40%",
          "--tilt-x": "0deg",
          "--tilt-y": "0deg",
        } as React.CSSProperties
      }
    >
      {/* Base faint grid */}
      <div className="hero-grid hero-grid-base absolute inset-0" />
      {/* Bright grid under cursor spotlight */}
      <div className="hero-grid hero-grid-lit absolute inset-0" />
      {/* Soft luminance bloom */}
      <div className="hero-bloom absolute inset-0" />
      {/* Monotone 3D planes */}
      <div className="hero-stage absolute inset-0 flex items-center justify-center">
        <div className="hero-plane hero-plane-a" />
        <div className="hero-plane hero-plane-b" />
        <div className="hero-plane hero-plane-c" />
      </div>
    </div>
  );
}
