"use client";

import { useEffect, useRef } from "react";
import { CursorOrbit } from "@/components/cursor-orbit";

/**
 * Two independent layers:
 * 1) Full-field randomized wave — always runs, never follows the cursor
 * 2) 3D assemble/shatter orbit highlighter — cursor only (self-tracking)
 */
export function HeroAtmosphere() {
  const rootRef = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0.5, y: 0.42, visible: 0, targetVisible: 0 });
  const lobes = useRef([
    { x: 0.22, y: 0.38, tx: 0.55, ty: 0.28, phase: 0 },
    { x: 0.68, y: 0.52, tx: 0.3, ty: 0.62, phase: 2.1 },
    { x: 0.48, y: 0.7, tx: 0.78, ty: 0.4, phase: 4.2 },
  ]);
  const raf = useRef<number | null>(null);
  const tRef = useRef(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      root.dataset.ready = "1";
      root.style.setProperty("--hx", "50%");
      root.style.setProperty("--hy", "42%");
      root.style.setProperty("--lit", "0");
      root.style.setProperty("--wx1", "28%");
      root.style.setProperty("--wy1", "36%");
      root.style.setProperty("--wx2", "72%");
      root.style.setProperty("--wy2", "58%");
      root.style.setProperty("--wx3", "48%");
      root.style.setProperty("--wy3", "70%");
      root.style.setProperty("--wave", "0.4");
      return;
    }

    const retarget = (i: number) => {
      const l = lobes.current[i];
      l.tx = 0.08 + Math.random() * 0.84;
      l.ty = 0.12 + Math.random() * 0.76;
    };
    lobes.current.forEach((_, i) => retarget(i));

    const onMove = (e: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      if (rect.height <= 0 || rect.width <= 0) return;
      const over =
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom &&
        e.clientX >= rect.left &&
        e.clientX <= rect.right;
      if (!over) {
        pointer.current.targetVisible = 0;
        return;
      }
      pointer.current.targetVisible = 1;
      pointer.current.x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      pointer.current.y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    };

    const onLeave = () => {
      pointer.current.targetVisible = 0;
    };

    const tick = () => {
      tRef.current += 0.016;
      const t = tRef.current;
      const p = pointer.current;

      lobes.current.forEach((l, i) => {
        l.phase += 0.016;
        const dx = l.tx - l.x;
        const dy = l.ty - l.y;
        l.x += dx * 0.012 + Math.sin(l.phase * 0.55 + i) * 0.0018;
        l.y += dy * 0.012 + Math.cos(l.phase * 0.42 + i * 1.3) * 0.0015;
        if (Math.hypot(dx, dy) < 0.05) retarget(i);
      });

      const breath = 0.38 + 0.14 * Math.sin(t * 0.85);
      p.visible += (p.targetVisible - p.visible) * 0.12;

      const [a, b, c] = lobes.current;
      root.style.setProperty("--wx1", `${(a.x * 100).toFixed(2)}%`);
      root.style.setProperty("--wy1", `${(a.y * 100).toFixed(2)}%`);
      root.style.setProperty("--wx2", `${(b.x * 100).toFixed(2)}%`);
      root.style.setProperty("--wy2", `${(b.y * 100).toFixed(2)}%`);
      root.style.setProperty("--wx3", `${(c.x * 100).toFixed(2)}%`);
      root.style.setProperty("--wy3", `${(c.y * 100).toFixed(2)}%`);
      root.style.setProperty("--wave", breath.toFixed(3));
      root.style.setProperty("--hx", `${(p.x * 100).toFixed(2)}%`);
      root.style.setProperty("--hy", `${(p.y * 100).toFixed(2)}%`);
      root.style.setProperty("--lit", p.visible.toFixed(3));

      raf.current = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    raf.current = requestAnimationFrame(tick);
    root.dataset.ready = "1";

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
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
          "--lit": "0",
          "--wx1": "22%",
          "--wy1": "38%",
          "--wx2": "68%",
          "--wy2": "52%",
          "--wx3": "48%",
          "--wy3": "70%",
          "--wave": "0.4",
        } as React.CSSProperties
      }
    >
      <div className="hero-wash absolute inset-0" />
      <div className="hero-grid hero-grid-base absolute inset-0" />
      <div className="hero-grid hero-grid-wave absolute inset-0" />
      {/* Soft under-glow still tracks cursor; orbit is the main highlighter */}
      <div className="hero-grid hero-grid-lit absolute inset-0 opacity-35" />
      <div className="hero-bloom absolute inset-0" />
      <CursorOrbit />
    </div>
  );
}
