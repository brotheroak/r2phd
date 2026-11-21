"use client";

import { useEffect, useRef } from "react";

/**
 * Monotone grid + soft 3D planes that brighten / tilt toward the pointer.
 * Listens on window — the layer itself stays pointer-events-none so text stays clickable.
 */
export function HeroAtmosphere() {
  const rootRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0.5, y: 0.42 });
  const current = useRef({ x: 0.5, y: 0.42 });
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      root.dataset.ready = "1";
      root.style.setProperty("--hx", "50%");
      root.style.setProperty("--hy", "42%");
      root.style.setProperty("--tilt-x", "0deg");
      root.style.setProperty("--tilt-y", "0deg");
      return;
    }

    const onMove = (e: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      if (rect.height <= 0 || rect.width <= 0) return;
      // Only react while pointer is over the hero band (plus a little slack)
      if (
        e.clientY < rect.top - 40 ||
        e.clientY > rect.bottom + 40 ||
        e.clientX < rect.left - 40 ||
        e.clientX > rect.right + 40
      ) {
        target.current = { x: 0.5, y: 0.42 };
        return;
      }
      target.current = {
        x: Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)),
        y: Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height)),
      };
    };

    const tick = () => {
      const c = current.current;
      const t = target.current;
      c.x += (t.x - c.x) * 0.12;
      c.y += (t.y - c.y) * 0.12;
      root.style.setProperty("--hx", `${(c.x * 100).toFixed(2)}%`);
      root.style.setProperty("--hy", `${(c.y * 100).toFixed(2)}%`);
      root.style.setProperty("--tilt-y", `${((c.x - 0.5) * 10).toFixed(2)}deg`);
      root.style.setProperty("--tilt-x", `${((0.5 - c.y) * 7).toFixed(2)}deg`);
      raf.current = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf.current = requestAnimationFrame(tick);
    root.dataset.ready = "1";

    return () => {
      window.removeEventListener("pointermove", onMove);
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
          "--hy": "42%",
          "--tilt-x": "0deg",
          "--tilt-y": "0deg",
        } as React.CSSProperties
      }
    >
      <div className="hero-grid hero-grid-base absolute inset-0" />
      <div className="hero-grid hero-grid-lit absolute inset-0" />
      <div className="hero-bloom absolute inset-0" />
      <div className="hero-stage absolute inset-0 flex items-center justify-center">
        <div className="hero-plane hero-plane-a" />
        <div className="hero-plane hero-plane-b" />
        <div className="hero-plane hero-plane-c" />
      </div>
    </div>
  );
}
