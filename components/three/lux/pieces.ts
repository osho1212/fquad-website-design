import * as THREE from "three";
import { rng, type Lux } from "./materials";
import {
  archCurve,
  bulb,
  contactShadow,
  cyl,
  glow,
  mesh,
  rbox,
  sector,
} from "./kit";

const D2R = Math.PI / 180;

/**
 * A light that can be dimmed as one unit: its emitter material, halo and
 * actual light source. Scenes drive `level` 0–1 (off → full).
 */
export interface Fixture {
  group: THREE.Group;
  set: (level: number) => void;
}

function fixture(
  group: THREE.Group,
  parts: {
    emitters?: THREE.MeshStandardMaterial[];
    leds?: THREE.MeshBasicMaterial[];
    glows?: THREE.Sprite[];
    lights?: { light: THREE.Light; max: number }[];
    glowMax?: number;
    emissiveMax?: number;
  }
): Fixture {
  const { emitters = [], leds = [], glows = [], lights = [], glowMax = 0.9, emissiveMax = 2.4 } = parts;
  const ledBase = leds.map((m) => m.color.clone());
  return {
    group,
    set: (level) => {
      const l = Math.max(0, Math.min(1, level));
      emitters.forEach((m) => (m.emissiveIntensity = l * emissiveMax));
      leds.forEach((m, i) => m.color.copy(ledBase[i]).multiplyScalar(0.15 + l * 1.6));
      glows.forEach((s) => ((s.material as THREE.SpriteMaterial).opacity = l * glowMax));
      lights.forEach(({ light, max }) => (light.intensity = l * max));
    },
  };
}

/** Barrel lounge chair: a wrap-around shell on a brass swivel base. */
export function barrelChair(L: Lux, shellMat: THREE.Material = L.leather, seatMat: THREE.Material = L.leather) {
  const g = new THREE.Group();
  g.add(mesh(cyl(0.3, 0.3, 0.018), L.brass, 0, 0.009, 0));
  g.add(mesh(cyl(0.05, 0.07, 0.11), L.brass, 0, 0.07, 0));
  const shell = sector(0.33, 0.44, 160 * D2R, 380 * D2R, 0.62, shellMat, 0.05);
  shell.position.y = 0.12;
  g.add(shell);
  g.add(mesh(cyl(0.36, 0.37, 0.16), seatMat, 0, 0.24, 0));
  const cushion = mesh(new THREE.SphereGeometry(0.35, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2), seatMat, 0, 0.32, 0.01);
  cushion.scale.y = 0.24;
  g.add(cushion);
  g.add(contactShadow(L, 1.15, 1.15, 0.5));
  return g;
}

export function drumTable(L: Lux, mat: THREE.Material = L.travertine, h = 0.52, r = 0.22) {
  const g = new THREE.Group();
  g.add(mesh(cyl(r, r, h, 56), mat, 0, h / 2, 0));
  const ring = mesh(new THREE.TorusGeometry(r + 0.002, 0.006, 8, 64), L.brass, 0, h - 0.04, 0);
  ring.rotation.x = Math.PI / 2;
  g.add(ring);
  g.add(contactShadow(L, r * 3.6, r * 3.6, 0.5));
  return g;
}

/* ── lighting ───────────────────────────────────────────────────────────── */

export function mushroomLamp(L: Lux): Fixture {
  const g = new THREE.Group();
  const shadeMat = L.opal.clone();
  g.add(mesh(cyl(0.08, 0.1, 0.02), L.brass, 0, 0.01, 0));
  g.add(mesh(cyl(0.012, 0.012, 0.26, 12), L.brass, 0, 0.14, 0));
  const shade = mesh(new THREE.SphereGeometry(0.15, 40, 18, 0, Math.PI * 2, 0, Math.PI / 2), shadeMat, 0, 0.27, 0, { cast: false });
  shade.scale.y = 0.75;
  g.add(shade);
  const light = bulb(0xffc27a, 3.2);
  light.position.set(0, 0.24, 0);
  const halo = glow(L, 0.9);
  halo.position.set(0, 0.26, 0);
  g.add(light, halo);
  return fixture(g, { emitters: [shadeMat], glows: [halo], lights: [{ light, max: 2.6 }] });
}

/* ── art, objects, plants ───────────────────────────────────────────────── */

export function artwork(L: Lux, mat: THREE.Material, w: number, h: number) {
  const g = new THREE.Group();
  // floating frame with a shadow gap
  g.add(mesh(rbox(w + 0.06, h + 0.06, 0.035, 0.004), L.walnut, 0, 0, 0.0175));
  g.add(mesh(new THREE.BoxGeometry(w + 0.01, h + 0.01, 0.01), L.stoneDark, 0, 0, 0.036));
  g.add(mesh(new THREE.PlaneGeometry(w, h), mat, 0, 0, 0.042, { cast: false }));
  return g;
}

/** Ceramic vase with dried branches. */
export function vaseBranches(L: Lux, h = 0.55, seed = 2) {
  const r = rng(seed);
  const g = new THREE.Group();
  const prof = [
    [0.0, 0],
    [0.09, 0.0],
    [0.13, 0.08],
    [0.14, 0.2],
    [0.1, 0.34],
    [0.045, 0.42],
    [0.05, 0.46],
  ].map(([x, y]) => new THREE.Vector2(x * (h / 0.46), y * (h / 0.46)));
  g.add(mesh(new THREE.LatheGeometry(prof, 48), L.ceramic));
  for (let i = 0; i < 5; i++) {
    const a = r() * Math.PI * 2;
    const lean = 0.15 + r() * 0.35;
    const len = h * (1.2 + r() * 0.9);
    const pts = [
      new THREE.Vector3(0, h * 0.95, 0),
      new THREE.Vector3(Math.cos(a) * lean * 0.3, h + len * 0.45, Math.sin(a) * lean * 0.3),
      new THREE.Vector3(Math.cos(a) * lean, h + len, Math.sin(a) * lean),
    ];
    g.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.006, 5), L.bark, 0, 0, 0, { cast: true }));
  }
  g.add(contactShadow(L, h * 0.9, h * 0.9, 0.45));
  return g;
}

/** Hand-knotted rug with softly rounded corners, texture mapped 0–1. */
export function rug(L: Lux, w: number, d: number, radius = 0.18) {
  const s = new THREE.Shape();
  const x0 = -w / 2;
  const y0 = -d / 2;
  s.moveTo(x0 + radius, y0);
  s.lineTo(x0 + w - radius, y0);
  s.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + radius);
  s.lineTo(x0 + w, y0 + d - radius);
  s.quadraticCurveTo(x0 + w, y0 + d, x0 + w - radius, y0 + d);
  s.lineTo(x0 + radius, y0 + d);
  s.quadraticCurveTo(x0, y0 + d, x0, y0 + d - radius);
  s.lineTo(x0, y0 + radius);
  s.quadraticCurveTo(x0, y0, x0 + radius, y0);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.014, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.008, bevelSegments: 2 });
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const uv = geo.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) - x0) / w, (pos.getY(i) - y0) / d);
  geo.rotateX(-Math.PI / 2);
  const m = mesh(geo, L.rug, 0, 0.004, 0, { cast: false });
  return m;
}

/* ── library ────────────────────────────────────────────────────────────── */

/** A glowing LED line traced around an arch (a niche or an opening). */
export function archLed(L: Lux, w: number, h: number, z: number): { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial } {
  const mat = L.ledWarm.clone();
  const m = mesh(new THREE.TubeGeometry(archCurve(w, h, 0, 0, z), 200, 0.01, 6, false), mat, 0, 0, 0, {
    cast: false,
    receive: false,
  });
  return { mesh: m, mat };
}

export function swatch(mat: THREE.Material) {
  return mesh(rbox(0.46, 0.46, 0.045, 0.012), mat, 0, 0, 0, { cast: true, receive: false });
}
