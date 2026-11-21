/** Shared math for the IntentSpec assemble/shatter sphere mark */

export type Vec3 = { x: number; y: number; z: number };
export type RGB = { r: number; g: number; b: number };

export const SPHERE_PALETTE: RGB[] = [
  { r: 15, g: 107, b: 99 },
  { r: 90, g: 140, b: 155 },
  { r: 170, g: 120, b: 110 },
  { r: 180, g: 150, b: 110 },
  { r: 100, g: 130, b: 160 },
  { r: 15, g: 107, b: 99 },
];

export const FOV = 2.7;

export function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function mix(a: RGB, b: RGB, t: number): RGB {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  };
}

export function samplePalette(t: number, palette: RGB[] = SPHERE_PALETTE): RGB {
  const x = ((t % 1) + 1) % 1;
  const s = x * (palette.length - 1);
  const i = Math.floor(s);
  return mix(palette[i], palette[Math.min(i + 1, palette.length - 1)], s - i);
}

export function rgba(c: RGB, a: number) {
  return `rgba(${c.r | 0},${c.g | 0},${c.b | 0},${Math.max(0, Math.min(1, a))})`;
}

export function rotXYZ(p: Vec3, rx: number, ry: number, rz: number): Vec3 {
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

export function fibSphere(i: number, n: number): Vec3 {
  const phi = Math.acos(1 - (2 * (i + 0.5)) / n);
  const theta = Math.PI * (1 + Math.sqrt(5)) * i;
  return {
    x: Math.sin(phi) * Math.cos(theta),
    y: Math.cos(phi),
    z: Math.sin(phi) * Math.sin(theta),
  };
}

export function assembleAmount(u: number) {
  if (u < 0.28) return easeInOut(u / 0.28);
  if (u < 0.48) return 1;
  if (u < 0.78) return 1 - easeInOut((u - 0.48) / 0.3);
  return 0;
}

export function surfaceT(p: Vec3, flow: number) {
  const lon = Math.atan2(p.z, p.x) / (Math.PI * 2) + 0.5;
  const lat = Math.acos(Math.max(-1, Math.min(1, p.y))) / Math.PI;
  return lon * 0.65 + lat * 0.35 + flow;
}

export function buildSphereField(n: number, neighbors = 4) {
  const sphere: Vec3[] = [];
  const scatter: Vec3[] = [];
  for (let i = 0; i < n; i++) {
    sphere.push(fibSphere(i, n));
    const lon = Math.random() * Math.PI * 2;
    const lat = (Math.random() - 0.5) * Math.PI;
    const d = 1.8 + Math.random() * 2.6;
    scatter.push({
      x: Math.cos(lon) * Math.cos(lat) * d,
      y: Math.sin(lat) * d,
      z: Math.sin(lon) * Math.cos(lat) * d,
    });
  }
  const links: number[][] = [];
  for (let i = 0; i < n; i++) {
    const dists: { j: number; d: number }[] = [];
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const a = sphere[i];
      const b = sphere[j];
      dists.push({
        j,
        d: (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2,
      });
    }
    dists.sort((a, b) => a.d - b.d);
    links.push(dists.slice(0, neighbors).map((x) => x.j));
  }
  return { sphere, scatter, links };
}
