import * as THREE from "three";
import { rng, type Lux } from "./materials";
import {
  archCurve,
  bulb,
  contactShadow,
  cyl,
  flutedCylinder,
  glow,
  mesh,
  rbox,
  reededPanel,
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

/* ── seating ────────────────────────────────────────────────────────────── */

/**
 * A curved, armless sofa that wraps around a point (the coffee table): a
 * floating seat on a recessed plinth, a continuous back, scatter cushions.
 */
export function curvedSofa(L: Lux, rIn = 1.05, rOut = 1.95, a0 = 205 * D2R, a1 = 335 * D2R) {
  const g = new THREE.Group();
  g.add(sector(rIn + 0.14, rOut - 0.16, a0 + 0.05, a1 - 0.05, 0.09, L.stoneDark, 0.01));
  const seat = sector(rIn, rOut - 0.2, a0, a1, 0.33, L.boucle, 0.07);
  seat.position.y = 0.09;
  g.add(seat);
  const back = sector(rOut - 0.3, rOut, a0 - 0.01, a1 + 0.01, 0.72, L.boucle, 0.08);
  back.position.y = 0.09;
  g.add(back);

  const cushions: [number, THREE.Material, number][] = [
    [a0 + (a1 - a0) * 0.22, L.velvetOlive, 0.46],
    [a0 + (a1 - a0) * 0.32, L.linen, 0.4],
    [a0 + (a1 - a0) * 0.72, L.velvetOxblood, 0.44],
  ];
  for (const [a, mat, s] of cushions) {
    const c = mesh(rbox(s, s * 0.86, 0.15, 0.07), mat);
    const rr = rOut - 0.42;
    c.position.set(Math.cos(a) * rr, 0.62, Math.sin(a) * rr);
    c.lookAt(0, 0.5, 0);
    c.rotateX(-0.18);
    g.add(c);
  }
  return g;
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

/* ── tables & surfaces ──────────────────────────────────────────────────── */

/** Round travertine table on a fluted drum, styled with books and a bowl. */
export function travertineTable(L: Lux, r = 0.62) {
  const g = new THREE.Group();
  g.add(flutedCylinder(0.3, 0.33, 22, 0.08, L.travertine));
  g.add(mesh(cyl(r, r - 0.01, 0.07, 72), L.travertine, 0, 0.365, 0));
  // styling: books, a bronze bowl, a single branch
  g.add(mesh(rbox(0.32, 0.04, 0.24, 0.006), L.linen, -0.18, 0.42, 0.08));
  g.add(mesh(rbox(0.28, 0.035, 0.21, 0.006), L.velvetOlive, -0.17, 0.457, 0.07));
  g.add(
    mesh(
      new THREE.SphereGeometry(0.13, 40, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
      Object.assign(L.bronze.clone(), { side: THREE.DoubleSide }),
      0.2,
      0.53,
      -0.08
    )
  );
  g.add(contactShadow(L, 1.7, 1.7, 0.45));
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

export function globeFloorLamp(L: Lux): Fixture {
  const g = new THREE.Group();
  const globeMat = L.opal.clone();
  g.add(mesh(cyl(0.16, 0.17, 0.035, 48), L.nero, 0, 0.018, 0));
  g.add(mesh(cyl(0.011, 0.011, 1.42, 10), L.brass, 0, 0.74, 0));
  g.add(mesh(new THREE.SphereGeometry(0.17, 40, 24), globeMat, 0, 1.58, 0, { cast: false }));
  const light = bulb(0xffc98e, 4.5);
  light.position.set(0, 1.58, 0);
  const halo = glow(L, 1.3);
  halo.position.set(0, 1.58, 0);
  g.add(light, halo);
  g.add(contactShadow(L, 0.6, 0.6, 0.4));
  return fixture(g, { emitters: [globeMat], glows: [halo], lights: [{ light, max: 3.4 }] });
}

/** A brass ring chandelier with a warm LED band, hung on three cables. */
export function ringChandelier(L: Lux, r = 0.62, drop = 0.75): Fixture {
  const g = new THREE.Group();
  const ring = mesh(new THREE.TorusGeometry(r, 0.03, 16, 120), L.brass, 0, 0, 0);
  ring.rotation.x = Math.PI / 2;
  const led = L.ledWarm.clone();
  const band = mesh(new THREE.TorusGeometry(r, 0.012, 8, 120), led, 0, -0.03, 0, { cast: false, receive: false });
  band.rotation.x = Math.PI / 2;
  g.add(ring, band);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    g.add(mesh(cyl(0.003, 0.003, drop, 6), L.blackSteel, Math.cos(a) * r, drop / 2, Math.sin(a) * r, { cast: false }));
  }
  const light = bulb(0xffc98e, 6);
  light.position.set(0, -0.12, 0);
  const glows: THREE.Sprite[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const s = glow(L, 0.55);
    s.position.set(Math.cos(a) * r, -0.04, Math.sin(a) * r);
    glows.push(s);
    g.add(s);
  }
  g.add(light);
  return fixture(g, { leds: [led], glows, lights: [{ light, max: 6 }], glowMax: 0.6 });
}

/** Three amber glass globes on fine cords, staggered heights. */
export function globeCluster(L: Lux, ceiling: number): Fixture {
  const g = new THREE.Group();
  const mats: THREE.MeshStandardMaterial[] = [];
  const glows: THREE.Sprite[] = [];
  const spec: [number, number, number, number][] = [
    [0, ceiling - 1.5, 0, 0.11],
    [0.17, ceiling - 1.22, 0.09, 0.085],
    [-0.13, ceiling - 1.05, -0.08, 0.07],
  ];
  for (const [x, y, z, r] of spec) {
    const m = L.amber.clone();
    mats.push(m);
    g.add(mesh(new THREE.SphereGeometry(r, 32, 20), m, x, y, z, { cast: false }));
    g.add(mesh(cyl(0.0025, 0.0025, ceiling - y - r, 6), L.blackSteel, x, (ceiling + y + r) / 2, z, { cast: false }));
    const s = glow(L, r * 9, 0xffb46a);
    s.position.set(x, y, z);
    glows.push(s);
    g.add(s);
  }
  const light = bulb(0xffa85c, 3.5);
  light.position.set(0, ceiling - 1.3, 0);
  g.add(light);
  return fixture(g, { emitters: mats, glows, lights: [{ light, max: 4 }], glowMax: 0.8, emissiveMax: 3.2 });
}

/** Picture light: a brass bar washing the artwork below with a soft area light. */
export function pictureLight(L: Lux, w: number): Fixture {
  const g = new THREE.Group();
  g.add(mesh(cyl(0.022, 0.022, w * 0.7, 20), L.brass, 0, 0, 0.09).rotateZ(Math.PI / 2));
  g.add(mesh(cyl(0.008, 0.008, 0.1, 8), L.brass, 0, 0, 0.045).rotateX(Math.PI / 2));
  const led = L.ledWarm.clone();
  const strip = mesh(new THREE.BoxGeometry(w * 0.66, 0.006, 0.02), led, 0, -0.022, 0.09, { cast: false, receive: false });
  g.add(strip);
  const area = new THREE.RectAreaLight(0xffd4a0, 0, w * 0.7, 0.05);
  area.position.set(0, -0.03, 0.1);
  area.lookAt(0, -1.2, 0.0);
  g.add(area);
  return fixture(g, { leds: [led], lights: [{ light: area, max: 9 }] });
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

/** Bronze knot on a travertine plinth — the "collected object" in the room. */
export function sculpture(L: Lux) {
  const g = new THREE.Group();
  g.add(mesh(rbox(0.42, 0.92, 0.42, 0.01), L.travertine, 0, 0.46, 0));
  g.add(mesh(cyl(0.05, 0.06, 0.03), L.brass, 0, 0.935, 0));
  const knot = mesh(new THREE.TorusKnotGeometry(0.12, 0.032, 200, 20, 2, 3), L.bronze, 0, 1.12, 0);
  knot.rotation.set(0.4, 0.2, 0);
  g.add(knot);
  g.add(contactShadow(L, 0.9, 0.9, 0.5));
  return { group: g, knot };
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

/**
 * An olive tree in a stone planter: a gently twisting trunk and a silvery
 * canopy of ~500 instanced leaves (one draw call).
 */
export function oliveTree(L: Lux, height = 2.1, seed = 8) {
  const r = rng(seed);
  const g = new THREE.Group();
  g.add(mesh(cyl(0.3, 0.24, 0.5, 56), L.stoneDark, 0, 0.25, 0));
  g.add(mesh(cyl(0.27, 0.27, 0.02, 48), L.bark, 0, 0.5, 0));

  const trunkPts = [
    new THREE.Vector3(0, 0.48, 0),
    new THREE.Vector3(0.05, 0.9, 0.02),
    new THREE.Vector3(-0.04, 1.3, -0.03),
    new THREE.Vector3(0.03, height * 0.78, 0.02),
  ];
  g.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(trunkPts), 24, 0.035, 8), L.bark));
  const clumps: THREE.Vector3[] = [
    new THREE.Vector3(0, height * 0.86, 0),
    new THREE.Vector3(0.32, height * 0.78, 0.1),
    new THREE.Vector3(-0.3, height * 0.8, -0.08),
    new THREE.Vector3(0.1, height * 0.98, -0.2),
    new THREE.Vector3(-0.12, height * 0.7, 0.24),
  ];
  for (const c of clumps.slice(1)) {
    const pts = [trunkPts[2].clone(), c.clone().lerp(trunkPts[2], 0.5).add(new THREE.Vector3(0, 0.1, 0)), c.clone()];
    g.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, 0.014, 6), L.bark));
  }

  const COUNT = 520;
  const leaf = new THREE.SphereGeometry(1, 8, 4);
  const leaves = new THREE.InstancedMesh(leaf, L.leaf, COUNT);
  leaves.castShadow = true;
  leaves.receiveShadow = true;
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const s = new THREE.Vector3();
  const p = new THREE.Vector3();
  const col = new THREE.Color();
  for (let i = 0; i < COUNT; i++) {
    const c = clumps[i % clumps.length];
    const u = r() * Math.PI * 2;
    const v = Math.acos(2 * r() - 1);
    const rad = Math.cbrt(r());
    p.set(
      c.x + Math.sin(v) * Math.cos(u) * 0.34 * rad,
      c.y + Math.cos(v) * 0.22 * rad,
      c.z + Math.sin(v) * Math.sin(u) * 0.34 * rad
    );
    e.set(r() * Math.PI, r() * Math.PI * 2, r() * Math.PI);
    q.setFromEuler(e);
    s.set(0.012, 0.004, 0.05 + r() * 0.02);
    m.compose(p, q, s);
    leaves.setMatrixAt(i, m);
    // olive leaves: dusty sage tops, silver undersides
    col.setHSL(0.22 + r() * 0.05, 0.12 + r() * 0.12, 0.34 + r() * 0.18);
    leaves.setColorAt(i, col);
  }
  leaves.instanceMatrix.needsUpdate = true;
  if (leaves.instanceColor) leaves.instanceColor.needsUpdate = true;
  g.add(leaves);
  g.add(contactShadow(L, 1.1, 1.1, 0.5));
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

/** Sheer linen curtain: soft folds, lets light (and shadows) through. */
export function sheer(L: Lux, w: number, h: number, folds = 9) {
  const g = new THREE.Group();
  const geo = new THREE.PlaneGeometry(w, h, folds * 8, 1);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const u = (pos.getX(i) + w / 2) / w;
    pos.setZ(i, Math.sin(u * folds * Math.PI * 2) * 0.035);
  }
  geo.computeVertexNormals();
  const mat = new THREE.MeshStandardMaterial({
    color: 0xf6f1e8,
    roughness: 1,
    transparent: true,
    opacity: 0.62,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  g.add(mesh(geo, mat, 0, h / 2, 0, { cast: false, receive: true }));
  g.add(mesh(cyl(0.012, 0.012, w + 0.14, 12), L.brass, 0, h + 0.03, 0.0, { cast: false }).rotateZ(Math.PI / 2));
  return g;
}

/* ── bedroom ────────────────────────────────────────────────────────────── */

/**
 * Wall-to-wall upholstered headboard: reeded velvet, a walnut ledge, and a
 * concealed LED washing down the channels.
 */
export function headboardWall(L: Lux, w: number, h: number): Fixture {
  const g = new THREE.Group();
  g.add(reededPanel(w, h, Math.round(w * 9), 0.035, L.velvetMushroom));
  g.add(mesh(rbox(w + 0.04, 0.05, 0.16, 0.008), L.walnut, 0, h + 0.025, 0.06));
  const led = L.ledWarm.clone();
  g.add(mesh(new THREE.BoxGeometry(w - 0.06, 0.006, 0.01), led, 0, h - 0.005, 0.13, { cast: false, receive: false }));
  const area = new THREE.RectAreaLight(0xffcf96, 0, w * 0.9, 0.06);
  area.position.set(0, h - 0.02, 0.12);
  area.lookAt(0, 0, 0.12);
  g.add(area);
  return fixture(g, { leds: [led], lights: [{ light: area, max: 12 }] });
}

export function bedLux(L: Lux) {
  const g = new THREE.Group();
  // floating platform: walnut deck on a shadowed plinth
  g.add(mesh(rbox(1.7, 0.1, 2.0, 0.01), L.stoneDark, 0, 0.05, 0.02));
  g.add(mesh(rbox(2.0, 0.14, 2.25, 0.02), L.walnut, 0, 0.17, 0));
  g.add(mesh(rbox(1.84, 0.22, 2.04, 0.07), L.linen, 0, 0.35, 0.02));
  // duvet, slightly overhanging and soft
  g.add(mesh(rbox(1.92, 0.1, 1.55, 0.05), L.linen, 0, 0.48, 0.3));
  // folded velvet throw across the foot
  g.add(mesh(rbox(1.96, 0.06, 0.55, 0.03), L.velvetOlive, 0, 0.55, 0.78));
  // pillows: euro squares, sleeping pillows, a bolster
  for (const s of [-1, 1]) {
    const euro = mesh(rbox(0.62, 0.6, 0.16, 0.08), L.velvetMushroom, s * 0.46, 0.72, -0.88);
    euro.rotation.x = -0.32;
    g.add(euro);
    const pill = mesh(rbox(0.66, 0.42, 0.16, 0.08), L.linen, s * 0.42, 0.64, -0.68);
    pill.rotation.x = -0.45;
    g.add(pill);
  }
  const bolster = mesh(new THREE.CapsuleGeometry(0.1, 0.62, 8, 24), L.velvetOxblood, 0, 0.6, -0.48);
  bolster.rotation.z = Math.PI / 2;
  g.add(bolster);
  g.add(contactShadow(L, 2.6, 2.9, 0.5));
  return g;
}

export function floatingNightstand(L: Lux) {
  const g = new THREE.Group();
  g.add(mesh(rbox(0.5, 0.26, 0.4, 0.015), L.walnut, 0, 0.45, 0.2));
  g.add(mesh(new THREE.BoxGeometry(0.46, 0.004, 0.004), L.stoneDark, 0, 0.45, 0.402));
  g.add(mesh(rbox(0.12, 0.012, 0.012, 0.004), L.brass, 0, 0.41, 0.41));
  // a stack of books and a small vase on top
  g.add(mesh(rbox(0.22, 0.035, 0.16, 0.004), L.linen, -0.08, 0.6, 0.2));
  g.add(mesh(new THREE.SphereGeometry(0.06, 24, 16), L.ceramic, 0.12, 0.645, 0.2));
  return g;
}

/** Full-height wardrobe with reeded walnut doors and slim brass pulls. */
export function reededWardrobe(L: Lux, w = 1.7, h = 2.5, d = 0.6) {
  const g = new THREE.Group();
  g.add(mesh(rbox(w, h, d, 0.01), L.walnut, 0, h / 2, 0));
  const doorW = w / 2 - 0.02;
  for (const s of [-1, 1]) {
    const door = reededPanel(doorW, h - 0.08, 16, 0.012, L.walnut);
    door.position.set(s * (w / 4), 0.04, d / 2 + 0.002);
    g.add(door);
    g.add(mesh(cyl(0.008, 0.008, 0.6, 10), L.brass, s * 0.04, h * 0.52, d / 2 + 0.04));
  }
  g.add(contactShadow(L, w + 0.4, d + 0.5, 0.45));
  return g;
}

export function benchLux(L: Lux, w = 1.35) {
  const g = new THREE.Group();
  g.add(mesh(rbox(w, 0.12, 0.42, 0.05), L.boucle, 0, 0.44, 0));
  const bar = (len: number, x: number, y: number, z: number, axis: "x" | "y" | "z") => {
    const geo = new THREE.BoxGeometry(axis === "x" ? len : 0.022, axis === "y" ? len : 0.022, axis === "z" ? len : 0.022);
    g.add(mesh(geo, L.brass, x, y, z));
  };
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) bar(0.38, sx * (w / 2 - 0.05), 0.19, sz * 0.17, "y");
    bar(0.36, sx * (w / 2 - 0.05), 0.02, 0, "z");
  }
  bar(w - 0.1, 0, 0.375, 0.17, "x");
  bar(w - 0.1, 0, 0.375, -0.17, "x");
  g.add(contactShadow(L, w + 0.4, 0.9, 0.4));
  return g;
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
