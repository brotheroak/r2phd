"use client";

import { useEffect, useRef } from "react";

type Node = {
  /** rest scatter in local 3D */
  sx: number;
  sy: number;
  sz: number;
  /** ring angle */
  theta: number;
  /** size */
  r: number;
};

const N = 28;
const CYCLE = 4.2;
const R = 1; // unit ring radius in local space

/** Palette stops — teal ↔ coral, slate ↔ peach, ink accents */
const PALETTE = [
  { r: 15, g: 107, b: 99 }, // primary teal
  { r: 183, g: 223, b: 215 }, // wash-teal
  { r: 236, g: 192, b: 182 }, // wash-coral
  { r: 196, g: 92, b: 74 }, // glow-coral
  { r: 197, g: 210, b: 228 }, // wash-slate
  { r: 239, g: 208, b: 168 }, // wash-peach
  { r: 217, g: 119, b: 6 }, // signal
  { r: 13, g: 44, b: 48 }, // ink
];

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function mixColor(a: (typeof PALETTE)[0], b: (typeof PALETTE)[0], t: number) {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  };
}

function samplePalette(t: number) {
  const x = ((t % 1) + 1) % 1;
  const scaled = x * PALETTE.length;
  const i = Math.floor(scaled) % PALETTE.length;
  const j = (i + 1) % PALETTE.length;
  const f = scaled - Math.floor(scaled);
  return mixColor(PALETTE[i], PALETTE[j], f);
}

function rgba(c: { r: number; g: number; b: number }, a: number) {
  return `rgba(${c.r | 0},${c.g | 0},${c.b | 0},${Math.max(0, Math.min(1, a))})`;
}

/**
 * True 3D assemble/shatter orbit locked to the cursor.
 * Palette colors flow as a gradient along dots & edges.
 */
export function CursorOrbit({
  active,
  nx,
  ny,
}: {
  active: number;
  nx: number; // 0..1 within hero
  ny: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodes = useRef<Node[]>([]);
  const raf = useRef<number | null>(null);
  const start = useRef(0);
  const target = useRef({ x: 0.5, y: 0.42 });
  const current = useRef({ x: 0.5, y: 0.42 });
  const vis = useRef(0);
  const visTarget = useRef(0);

  useEffect(() => {
    if (nodes.current.length) return;
    const list: Node[] = [];
    for (let i = 0; i < N; i++) {
      const theta = (i / N) * Math.PI * 2;
      const scatter = 1.4 + Math.random() * 1.8;
      const lat = (Math.random() - 0.5) * Math.PI;
      const lon = Math.random() * Math.PI * 2;
      list.push({
        theta,
        sx: Math.cos(lon) * Math.cos(lat) * scatter,
        sy: Math.sin(lat) * scatter,
        sz: Math.sin(lon) * Math.cos(lat) * scatter,
        r: 1.6 + Math.random() * 2.2,
      });
    }
    nodes.current = list;
  }, []);

  useEffect(() => {
    target.current = { x: nx, y: ny };
    visTarget.current = active;
  }, [nx, ny, active]);

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

    const tick = (now: number) => {
      const parent = canvas.parentElement;
      if (!parent) {
        raf.current = requestAnimationFrame(tick);
        return;
      }
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      ctx.clearRect(0, 0, w, h);

      // Smooth follow + fade
      current.current.x += (target.current.x - current.current.x) * 0.22;
      current.current.y += (target.current.y - current.current.y) * 0.22;
      vis.current += (visTarget.current - vis.current) * 0.14;
      const v = vis.current;
      if (v < 0.012) {
        raf.current = requestAnimationFrame(tick);
        return;
      }

      const cx = current.current.x * w;
      const cy = current.current.y * h;
      const scale = Math.min(w, h) * 0.11;

      // Assemble / shatter cycle
      const elapsed = reduced ? CYCLE * 0.42 : ((now - start.current) / 1000) % CYCLE;
      const u = elapsed / CYCLE;
      let assemble = 0;
      if (u < 0.36) assemble = easeInOut(u / 0.36);
      else if (u < 0.5) assemble = 1;
      else if (u < 0.86) assemble = 1 - easeInOut((u - 0.5) / 0.36);
      else assemble = 0;

      // 3D orientation — continuous tumble
      const t = reduced ? 0 : now * 0.001;
      const rotY = t * 0.85;
      const rotX = Math.sin(t * 0.55) * 0.55 + 0.35;
      const rotZ = Math.cos(t * 0.4) * 0.25;
      const flow = t * 0.22; // palette flow along ring

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosZ = Math.cos(rotZ);
      const sinZ = Math.sin(rotZ);

      type Proj = {
        x: number;
        y: number;
        z: number;
        i: number;
        r: number;
        colorT: number;
      };
      const projected: Proj[] = [];

      for (let i = 0; i < nodes.current.length; i++) {
        const n = nodes.current[i];
        // Target on ring in XY plane
        const rx = Math.cos(n.theta) * R;
        const ry = Math.sin(n.theta) * R;
        const rz = 0;

        const m = assemble;
        let x = n.sx + (rx - n.sx) * m;
        let y = n.sy + (ry - n.sy) * m;
        let z = n.sz + (rz - n.sz) * m;

        // Rotate Z → X → Y (true 3D tumble)
        let x1 = x * cosZ - y * sinZ;
        let y1 = x * sinZ + y * cosZ;
        let z1 = z;

        let y2 = y1 * cosX - z1 * sinX;
        let z2 = y1 * sinX + z1 * cosX;
        let x2 = x1;

        const x3 = x2 * cosY + z2 * sinY;
        const z3 = -x2 * sinY + z2 * cosY;
        const y3 = y2;

        // Perspective
        const persp = 2.4 / (2.4 - z3);
        const px = cx + x3 * scale * persp;
        const py = cy + y3 * scale * persp;

        projected.push({
          x: px,
          y: py,
          z: z3,
          i,
          r: n.r * persp,
          colorT: n.theta / (Math.PI * 2) + flow,
        });
      }

      projected.sort((a, b) => a.z - b.z);

      // Index map for edge drawing in ring order
      const byIndex = new Array<Proj>(N);
      for (const p of projected) byIndex[p.i] = p;

      // Soft depth fog disc under structure
      const fog = ctx.createRadialGradient(cx, cy, 4, cx, cy, scale * 1.8);
      fog.addColorStop(0, rgba(samplePalette(flow), 0.14 * v));
      fog.addColorStop(0.45, rgba(samplePalette(flow + 0.35), 0.07 * v));
      fog.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = fog;
      ctx.beginPath();
      ctx.arc(cx, cy, scale * 1.85, 0, Math.PI * 2);
      ctx.fill();

      // Edges — ring neighbors + a few chords (gradient flowing)
      ctx.lineCap = "round";
      for (let i = 0; i < N; i++) {
        const a = byIndex[i];
        const b = byIndex[(i + 1) % N];
        if (!a || !b) continue;
        const depth = ((a.z + b.z) / 2 + 1.2) / 2.4;
        const alpha = (0.12 + depth * 0.55) * (0.25 + assemble * 0.75) * v;
        if (alpha < 0.02) continue;

        const midT = (a.colorT + b.colorT) / 2;
        const c0 = samplePalette(midT);
        const c1 = samplePalette(midT + 0.12);
        const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        grad.addColorStop(0, rgba(c0, alpha));
        grad.addColorStop(1, rgba(c1, alpha));
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 0.85 + depth * 1.1;
        ctx.stroke();
      }

      // Structural spokes when mostly assembled
      if (assemble > 0.4) {
        const spokeA = (assemble - 0.4) * 0.9 * v;
        for (let s = 0; s < 4; s++) {
          const i = Math.floor((s * N) / 4);
          const j = (i + Math.floor(N / 2)) % N;
          const a = byIndex[i];
          const b = byIndex[j];
          if (!a || !b) continue;
          const c = samplePalette(flow + s * 0.18);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = rgba(c, spokeA * 0.35);
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }

      // Nodes with flowing palette + depth
      for (const p of projected) {
        const depth = (p.z + 1.2) / 2.4;
        const alpha = (0.35 + depth * 0.6) * v;
        const c = samplePalette(p.colorT);
        const cEdge = samplePalette(p.colorT + 0.2);

        // Glow halo
        const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3.2);
        halo.addColorStop(0, rgba(c, alpha * 0.45));
        halo.addColorStop(1, rgba(c, 0));
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3.2, 0, Math.PI * 2);
        ctx.fill();

        // Sphere-ish body with gradient
        const body = ctx.createRadialGradient(
          p.x - p.r * 0.35,
          p.y - p.r * 0.4,
          p.r * 0.1,
          p.x,
          p.y,
          p.r * 1.3
        );
        body.addColorStop(0, rgba({ r: 255, g: 255, b: 255 }, alpha * 0.85));
        body.addColorStop(0.35, rgba(c, alpha));
        body.addColorStop(1, rgba(cEdge, alpha * 0.9));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (0.85 + depth * 0.35), 0, Math.PI * 2);
        ctx.fillStyle = body;
        ctx.fill();
      }

      // Assembled ring ghost with flowing stroke
      if (assemble > 0.55) {
        const ga = (assemble - 0.55) * 1.6 * v;
        const g0 = samplePalette(flow);
        const g1 = samplePalette(flow + 0.33);
        const g2 = samplePalette(flow + 0.66);
        // Approximate ellipse from current orientation: sample many points
        ctx.beginPath();
        for (let k = 0; k <= 48; k++) {
          const th = (k / 48) * Math.PI * 2;
          let x = Math.cos(th) * R;
          let y = Math.sin(th) * R;
          let z = 0;
          let x1 = x * cosZ - y * sinZ;
          let y1 = x * sinZ + y * cosZ;
          let z1 = z;
          let y2 = y1 * cosX - z1 * sinX;
          let z2 = y1 * sinX + z1 * cosX;
          let x2 = x1;
          const x3 = x2 * cosY + z2 * sinY;
          const z3 = -x2 * sinY + z2 * cosY;
          const y3 = y2;
          const persp = 2.4 / (2.4 - z3);
          const px = cx + x3 * scale * persp;
          const py = cy + y3 * scale * persp;
          if (k === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        const ringGrad = ctx.createLinearGradient(cx - scale, cy, cx + scale, cy);
        ringGrad.addColorStop(0, rgba(g0, ga * 0.55));
        ringGrad.addColorStop(0.5, rgba(g1, ga * 0.7));
        ringGrad.addColorStop(1, rgba(g2, ga * 0.55));
        ctx.strokeStyle = ringGrad;
        ctx.lineWidth = 1.25;
        ctx.stroke();
      }

      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-[2]"
      aria-hidden
    />
  );
}
