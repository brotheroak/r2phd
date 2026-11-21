"use client";

import { useEffect, useRef } from "react";

/**
 * Grid spotlight that follows the pointer, plus a soft randomized wave
 * even when the cursor is idle. No floating rectangles.
 */
export function HeroAtmosphere() {
  const rootRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0.5, y: 0.42 });
  const current = useRef({ x: 0.5, y: 0.42 });
  const wave = useRef({ x: 0.35, y: 0.45, tx: 0.7, ty: 0.35, t: 0 });
  const raf = useRef<number | null>(null);
  const pointerActive = useRef(false);
  const idleSince = useRef(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      root.dataset.ready = "1";
      root.style.setProperty("--hx", "50%");
      root.style.setProperty("--hy", "42%");
      root.style.setProperty("--wx", "50%");
      root.style.setProperty("--wy", "42%");
      root.style.setProperty("--wave", "0.35");
      return;
    }

    const pickWaveTarget = () => {
      wave.current.tx = 0.12 + Math.random() * 0.76;
      wave.current.ty = 0.18 + Math.random() * 0.64;
    };
    pickWaveTarget();

    const onMove = (e: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      if (rect.height <= 0 || rect.width <= 0) return;
      const over =
        e.clientY >= rect.top - 24 &&
        e.clientY <= rect.bottom + 24 &&
        e.clientX >= rect.left - 24 &&
        e.clientX <= rect.right + 24;
      if (!over) {
        pointerActive.current = false;
        return;
      }
      pointerActive.current = true;
      idleSince.current = performance.now();
      target.current = {
        x: Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)),
        y: Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height)),
      };
    };

    const tick = (now: number) => {
      const c = current.current;
      const t = target.current;
      const w = wave.current;

      // Idle randomized wave always drifts
      w.t += 0.016;
      const dx = w.tx - w.x;
      const dy = w.ty - w.y;
      w.x += dx * 0.018 + Math.sin(w.t * 0.7) * 0.0015;
      w.y += dy * 0.018 + Math.cos(w.t * 0.55) * 0.0012;
      if (Math.hypot(dx, dy) < 0.04) pickWaveTarget();

      // Pointer spotlight: follow when active, else ease toward wave
      if (pointerActive.current && now - idleSince.current < 1600) {
        c.x += (t.x - c.x) * 0.14;
        c.y += (t.y - c.y) * 0.14;
      } else {
        pointerActive.current = false;
        c.x += (w.x - c.x) * 0.04;
        c.y += (w.y - c.y) * 0.04;
      }

      const pulse = 0.28 + 0.12 * Math.sin(w.t * 1.1);
      root.style.setProperty("--hx", `${(c.x * 100).toFixed(2)}%`);
      root.style.setProperty("--hy", `${(c.y * 100).toFixed(2)}%`);
      root.style.setProperty("--wx", `${(w.x * 100).toFixed(2)}%`);
      root.style.setProperty("--wy", `${(w.y * 100).toFixed(2)}%`);
      root.style.setProperty("--wave", pulse.toFixed(3));
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
          "--wx": "35%",
          "--wy": "48%",
          "--wave": "0.35",
        } as React.CSSProperties
      }
    >
      <div className="hero-grid hero-grid-base absolute inset-0" />
      <div className="hero-grid hero-grid-wave absolute inset-0" />
      <div className="hero-grid hero-grid-lit absolute inset-0" />
      <div className="hero-bloom absolute inset-0" />
    </div>
  );
}
