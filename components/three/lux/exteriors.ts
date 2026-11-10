import * as THREE from "three";
import { rng, type Lux } from "./materials";
import { clamp01, contactShadow, disposeTree, glow, keyed, keyedColor, mesh, rbox, seg } from "./kit";
import { oliveTree } from "./pieces";
import type { Built } from "./scenes";

/**
 * The two practices that happen outdoors — architecture and farmhouses —
 * as site models on a plinth, so they sit beside the interiors as the same
 * family: an architect's maquette that comes to life as you scroll.
 */

const D2R = Math.PI / 180;

/* ── shared outdoor pieces ──────────────────────────────────────────────── */

function outdoorMaterials() {
  const std = (p: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(p);
  return {
    grass: std({ color: 0x5e7044, roughness: 1 }),
    soil: std({ color: 0x4a3f33, roughness: 1 }),
    hedge: std({ color: 0x3f5233, roughness: 0.9 }),
    water: new THREE.MeshPhysicalMaterial({
      color: 0x1d5a63,
      roughness: 0.08,
      metalness: 0,
      envMapIntensity: 0.35,
      emissive: 0x3fd0d8,
      emissiveIntensity: 0,
    }),
    tile: std({ color: 0x8e4a33, roughness: 0.82 }),
    tileRidge: std({ color: 0x6f3826, roughness: 0.8 }),
    render: std({ color: 0xf1ece4, roughness: 0.92 }),
    renderWarm: std({ color: 0xe9dcc7, roughness: 0.95 }),
    timber: std({ color: 0x6b4a32, roughness: 0.7 }),
    timberLight: std({ color: 0x9b7550, roughness: 0.65 }),
    interior: std({ color: 0x2a2520, roughness: 0.9, emissive: 0xffc27a, emissiveIntensity: 0 }),
    terracotta: std({ color: 0xb0603e, roughness: 0.85 }),
    ink: new THREE.LineBasicMaterial({ color: 0x1a1a1a, transparent: true, opacity: 0.55 }),
  };
}
type Outdoor = ReturnType<typeof outdoorMaterials>;

/** The model's plinth: a stone base with a lawn top, origin at lawn level. */
function plinth(L: Lux, O: Outdoor, w: number, d: number) {
  const g = new THREE.Group();
  const base = mesh(rbox(w + 0.3, 0.42, d + 0.3, 0.04), L.stoneDark, 0, -0.23, 0, { cast: false });
  const lawn = mesh(new THREE.BoxGeometry(w, 0.05, d), O.grass, 0, -0.025, 0, { cast: false });
  g.add(base, lawn);
  return { group: g, lawn, base };
}

/** A canopy tree: trunk plus a cloud of instanced leaves (one draw call). */
function shadeTree(O: Outdoor, height: number, spread: number, seed: number, leafColor = 0x5f7d40) {
  const r = rng(seed);
  const g = new THREE.Group();
  const trunk = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.06, height * 0.35, 0.03),
    new THREE.Vector3(-0.05, height * 0.62, -0.02),
  ]);
  g.add(mesh(new THREE.TubeGeometry(trunk, 16, 0.07, 8), O.timber));
  const leafMat = new THREE.MeshStandardMaterial({ color: leafColor, roughness: 0.8, side: THREE.DoubleSide });
  const COUNT = 760;
  const leaves = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), leafMat, COUNT);
  leaves.castShadow = true;
  leaves.receiveShadow = true;
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const s = new THREE.Vector3();
  const p = new THREE.Vector3();
  const col = new THREE.Color();
  const lobes = [
    new THREE.Vector3(0, height * 0.82, 0),
    new THREE.Vector3(spread * 0.45, height * 0.72, 0.15),
    new THREE.Vector3(-spread * 0.42, height * 0.75, -0.1),
    new THREE.Vector3(0.1, height * 0.74, spread * 0.4),
    new THREE.Vector3(-0.05, height * 0.78, -spread * 0.38),
  ];
  for (let i = 0; i < COUNT; i++) {
    const c = lobes[i % lobes.length];
    const u = r() * Math.PI * 2;
    const v = Math.acos(2 * r() - 1);
    const rad = Math.cbrt(r());
    p.set(
      c.x + Math.sin(v) * Math.cos(u) * spread * 0.42 * rad,
      c.y + Math.cos(v) * spread * 0.26 * rad,
      c.z + Math.sin(v) * Math.sin(u) * spread * 0.42 * rad
    );
    e.set(r() * Math.PI, r() * Math.PI * 2, r() * Math.PI);
    q.setFromEuler(e);
    s.setScalar(0.07 + r() * 0.05);
    m.compose(p, q, s);
    leaves.setMatrixAt(i, m);
    col.setHex(leafColor).offsetHSL(r() * 0.04 - 0.02, r() * 0.1 - 0.05, r() * 0.12 - 0.06);
    leaves.setColorAt(i, col);
  }
  leaves.instanceMatrix.needsUpdate = true;
  if (leaves.instanceColor) leaves.instanceColor.needsUpdate = true;
  g.add(leaves);
  return g;
}

/** A garden lantern / bollard whose head glows after dusk. */
function lantern(L: Lux, O: Outdoor, h = 0.38) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.BoxGeometry(0.06, h, 0.06), O.timber, 0, h / 2, 0));
  const headMat = new THREE.MeshStandardMaterial({ color: 0xfff1d8, emissive: 0xffc070, emissiveIntensity: 0, roughness: 0.5 });
  g.add(mesh(new THREE.BoxGeometry(0.09, 0.1, 0.09), headMat, 0, h + 0.05, 0, { cast: false }));
  const halo = glow(L, 0.7, 0xffc68a);
  halo.position.set(0, h + 0.05, 0);
  g.add(halo);
  return {
    group: g,
    set: (v: number) => {
      headMat.emissiveIntensity = v * 3.2;
      (halo.material as THREE.SpriteMaterial).opacity = v * 0.7;
    },
  };
}

/** Gable roof running along x: a triangular prism with eaves overhang. */
function gableRoof(mat: THREE.Material, length: number, width: number, rise: number) {
  const s = new THREE.Shape();
  s.moveTo(-width / 2, 0);
  s.lineTo(0, rise);
  s.lineTo(width / 2, 0);
  s.lineTo(width / 2 - 0.06, -0.05);
  s.lineTo(0, rise - 0.07);
  s.lineTo(-width / 2 + 0.06, -0.05);
  s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: length, bevelEnabled: false });
  geo.translate(0, 0, -length / 2);
  geo.rotateY(Math.PI / 2);
  return new THREE.Mesh(geo, mat);
}

/** A sun whose shadow covers the whole plinth. */
function siteSun(quality: "high" | "low", half: number) {
  const sun = new THREE.DirectionalLight(0xfff2e2, 3);
  sun.castShadow = true;
  const size = quality === "high" ? 2048 : 1024;
  sun.shadow.mapSize.set(size, size);
  const c = sun.shadow.camera;
  c.left = -half;
  c.right = half;
  c.top = half;
  c.bottom = -half;
  c.near = 1;
  c.far = 50;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.03;
  sun.shadow.radius = 5;
  return sun;
}

/** Places an object and returns it (Object3D.position itself is read-only). */
function at<T extends THREE.Object3D>(o: T, x: number, y: number, z: number): T {
  o.position.set(x, y, z);
  return o;
}

function sharedSet(L: Lux) {
  return new Set<THREE.Material>(Object.values(L).filter((v): v is THREE.Material => v instanceof THREE.Material));
}

/* ═══════════════════════════════════════════════════════════════════════════
   RESIDENCE — architecture: concept model → materials → dusk
   ═══════════════════════════════════════════════════════════════════════════ */

export function buildResidence(L: Lux, quality: "high" | "low"): Built {
  const root = new THREE.Group();
  const O = outdoorMaterials();
  const shared = sharedSet(L);
  const SW = 9;
  const SD = 6.6;

  // Every architectural surface starts as white card (the concept model) and
  // takes its real finish at its own moment, in construction order.
  const swaps: { m: THREE.Mesh; real: THREE.Material; at: number }[] = [];
  let order = 0;
  const part = (m: THREE.Mesh, real: THREE.Material, step = true) => {
    swaps.push({ m, real, at: 0.3 + Math.min(order, 9) * 0.03 });
    if (step) order++;
    m.material = L.clay;
    root.add(m);
    return m;
  };

  const site = plinth(L, O, SW, SD);
  root.add(site.group);
  swaps.push({ m: site.lawn, real: O.grass, at: 0.3 });
  site.lawn.material = L.clay;

  // Site drawing: plot boundary, setbacks and a grid, inked on the card.
  const lines: number[] = [];
  const edge = (x0: number, z0: number, x1: number, z1: number) => lines.push(x0, 0.006, z0, x1, 0.006, z1);
  for (let x = -SW / 2 + 0.5; x < SW / 2; x += 0.5) edge(x, -SD / 2 + 0.1, x, SD / 2 - 0.1);
  for (let z = -SD / 2 + 0.5; z < SD / 2; z += 0.5) edge(-SW / 2 + 0.1, z, SW / 2 - 0.1, z);
  const gridGeo = new THREE.BufferGeometry();
  gridGeo.setAttribute("position", new THREE.Float32BufferAttribute(lines, 3));
  const gridMat = O.ink.clone();
  gridMat.opacity = 0.12;
  const grid = new THREE.LineSegments(gridGeo, gridMat);
  root.add(grid);

  // Terrace and path
  part(mesh(new THREE.BoxGeometry(6.2, 0.06, 1.5), L.travertine, -0.4, 0.03, 0.55, { cast: false }), L.travertine);
  for (let i = 0; i < 4; i++) {
    part(mesh(new THREE.BoxGeometry(0.7, 0.04, 0.36), L.travertine, -2.6, 0.02, 1.65 + i * 0.5, { cast: false }), L.travertine, false);
  }

  // Ground floor: a glazed pavilion between a stone fin and the pool.
  part(mesh(new THREE.BoxGeometry(5.8, 0.14, 3.0), L.travertine, -0.4, 0.07, -1.45), L.travertine);
  const gfInterior = part(mesh(new THREE.BoxGeometry(5.0, 1.2, 1.5), O.interior, -0.55, 0.74, -2.15, { cast: false }), O.interior);
  const glassGF = mesh(new THREE.PlaneGeometry(5.0, 1.2), L.glass, -0.55, 0.74, -0.58, { cast: false, receive: false });
  root.add(glassGF);
  for (let i = 0; i <= 6; i++) {
    part(mesh(new THREE.BoxGeometry(0.04, 1.2, 0.05), L.blackSteel, -3.05 + i * (5.0 / 6), 0.74, -0.57), L.blackSteel, false);
  }
  part(mesh(new THREE.BoxGeometry(6.4, 0.18, 3.2), O.render, -0.2, 1.43, -1.4), O.render);
  part(mesh(new THREE.BoxGeometry(6.3, 0.05, 3.1), L.blackSteel, -0.2, 1.315, -1.4, { cast: false }), L.blackSteel, false);

  // Upper floor: a rendered box cantilevered over the pool, with a long
  // window screened by timber fins.
  const ffX = 0.95;
  part(mesh(new THREE.BoxGeometry(4.1, 1.15, 2.5), O.render, ffX, 2.1, -1.55), O.render);
  const ffInterior = O.interior.clone();
  const ffGlow = part(mesh(new THREE.BoxGeometry(3.5, 0.62, 0.02), ffInterior, ffX, 2.12, -0.29, { cast: false }), ffInterior);
  for (let i = 0; i < 19; i++) {
    part(mesh(new THREE.BoxGeometry(0.035, 0.74, 0.1), L.walnut, ffX - 1.75 + i * (3.5 / 18), 2.12, -0.22), L.walnut, false);
  }
  part(mesh(new THREE.BoxGeometry(4.5, 0.12, 2.9), O.render, ffX, 2.74, -1.5), O.render);
  part(mesh(new THREE.BoxGeometry(4.4, 0.04, 2.8), L.blackSteel, ffX, 2.66, -1.5, { cast: false }), L.blackSteel, false);

  // Travertine fin: the house's spine, running through both floors.
  part(mesh(new THREE.BoxGeometry(0.34, 3.0, 3.8), L.travertine, -3.25, 1.5, -1.2), L.travertine);

  // Pool, cut into the terrace under the cantilever.
  part(mesh(new THREE.BoxGeometry(3.0, 0.08, 1.5), L.travertine, 2.05, 0.04, 0.55, { cast: false }), L.travertine);
  const water = part(mesh(new THREE.BoxGeometry(2.7, 0.02, 1.2), O.water, 2.05, 0.085, 0.55, { cast: false }), O.water);

  // Hedges along the back boundary
  part(mesh(rbox(7.6, 0.42, 0.32, 0.1), O.hedge, -0.2, 0.21, -3.0), O.hedge);

  // Trees: olive by the entrance, a shade tree behind the pool.
  const olive = oliveTree(L, 1.7, 21);
  olive.position.set(-3.9, 0, 1.6);
  olive.scale.setScalar(0.9);
  root.add(olive);
  const tree = shadeTree(O, 3.0, 1.6, 7);
  tree.position.set(3.7, 0, -2.3);
  root.add(tree);
  root.add(at(contactShadow(L, 2.4, 2.4, 0.4), 3.7, 0.006, -2.3));

  // Garden lights along the path and pool edge
  const lamps = [
    [-3.1, 1.7],
    [-3.1, 2.7],
    [0.4, 1.45],
    [3.65, 1.45],
  ].map(([x, z]) => {
    const l = lantern(L, O, 0.26);
    l.group.position.set(x, 0, z);
    root.add(l.group);
    return l;
  });

  /* ── detail: the life of the house ─────────────────────────────── */
  // Ground-floor living room, seen through the glazing.
  const room = new THREE.Group();
  room.add(mesh(rbox(1.5, 0.3, 0.46, 0.06), L.boucle, -1.9, 0.29, -1.05));
  room.add(mesh(rbox(1.5, 0.26, 0.12, 0.05), L.boucle, -1.9, 0.5, -1.25));
  room.add(mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.06, 32), L.travertine, -1.9, 0.27, -0.75));
  room.add(mesh(rbox(1.3, 0.05, 0.55, 0.02), L.walnut, 0.55, 0.62, -0.95));
  for (const dx of [-0.45, 0, 0.45]) room.add(mesh(rbox(0.3, 0.42, 0.3, 0.05), L.velvetMushroom, 0.55 + dx, 0.36, -1.35));
  room.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.85, 8), L.brass, -3.0 + 0.45, 0.55, -1.0));
  // stair to the upper floor, against the spine wall
  for (let i = 0; i < 6; i++) room.add(mesh(new THREE.BoxGeometry(0.5, 0.04, 0.16), L.walnut, 1.6, 0.2 + i * 0.18, -0.7 - i * 0.11));
  root.add(room);
  room.visible = false;
  // three pendants over the dining table, and a floor lamp by the sofa
  const pendantMat = new THREE.MeshStandardMaterial({ color: 0xfff1d8, emissive: 0xffc27a, emissiveIntensity: 0, roughness: 0.5 });
  const pendantGlows: THREE.Sprite[] = [];
  for (const dx of [-0.4, 0, 0.4]) {
    room.add(mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.3, 4), L.blackSteel, 0.55 + dx, 1.12, -0.95, { cast: false }));
    room.add(mesh(new THREE.SphereGeometry(0.07, 16, 12), pendantMat, 0.55 + dx, 0.95, -0.95, { cast: false }));
    const g = glow(L, 0.55, 0xffc68a);
    g.position.set(0.55 + dx, 0.95, -0.9);
    root.add(g);
    pendantGlows.push(g);
  }
  room.add(mesh(new THREE.SphereGeometry(0.09, 16, 12), pendantMat, -2.55, 1.0, -1.0, { cast: false }));

  // LED cove along the roof-slab edge
  const coveMat = new THREE.MeshBasicMaterial({ color: 0xffd6a0, toneMapped: false });
  const cove = mesh(new THREE.BoxGeometry(6.1, 0.012, 0.02), coveMat, -0.2, 1.33, 0.18, { cast: false, receive: false });
  root.add(cove);

  // Warm uplight washes on the travertine spine
  const washMats: THREE.MeshBasicMaterial[] = [];
  for (const z of [-0.05, 0.45]) {
    const wm = new THREE.MeshBasicMaterial({
      map: L.glowTex,
      color: 0xffc27a,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    washMats.push(wm);
    const w = mesh(new THREE.PlaneGeometry(0.5, 2.6), wm, -3.075, 1.15, z, { cast: false, receive: false });
    w.rotation.y = Math.PI / 2;
    root.add(w);
  }

  // Roof garden on the open part of the lower roof
  part(mesh(rbox(1.9, 0.22, 0.32, 0.06), O.hedge, -2.25, 1.63, 0.0), O.hedge, false);
  const roofOlive = oliveTree(L, 1.2, 33);
  roofOlive.position.set(-2.55, 1.52, -1.7);
  roofOlive.scale.setScalar(0.55);
  root.add(roofOlive);

  // Loungers and an umbrella on the pool terrace
  for (const x of [-0.25, -0.9]) {
    part(mesh(rbox(0.3, 0.08, 0.72, 0.03), L.linen, x, 0.14, 0.75), L.linen, false);
    const back = mesh(rbox(0.3, 0.06, 0.3, 0.03), L.linen, x, 0.26, 0.38);
    back.rotation.x = -0.7;
    part(back, L.linen, false);
  }
  part(mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.9, 8), L.blackSteel, -1.6, 0.5, 0.7), L.blackSteel, false);
  part(mesh(new THREE.ConeGeometry(0.4, 0.16, 12, 1, false), L.linen, -1.6, 1.0, 0.7), L.linen, false);

  const interiorLight = new THREE.PointLight(0xffc27a, 0, 6, 2);
  interiorLight.position.set(-0.5, 0.9, -0.9);
  const poolLight = new THREE.PointLight(0x5fe0e8, 0, 3, 2);
  poolLight.position.set(2.05, 0.2, 0.55);
  root.add(interiorLight, poolLight);

  const hemi = new THREE.HemisphereLight(0xdfe9f5, 0x6d6450, 0.9);
  const sun = siteSun(quality, 7);
  const target = new THREE.Object3D();
  sun.target = target;
  const sunDir = new THREE.Vector3();

  const PHASES = ["Concept model", "Materials & daylight", "Dusk"] as const;

  return {
    root,
    lights: [hemi, sun, target],
    restP: 0.62,
    precompile: [...new Set([...swaps.map((s) => s.real), ffInterior])],
    frame: (p) => ({
      pos: new THREE.Vector3(10.5 - p * 1.2, 7.4 - p * 1.4, 12.5 - p * 0.8),
      look: new THREE.Vector3(0.1, 0.95, -0.6),
    }),
    exposure: (p) => keyed(p, [
      { at: 0, v: 1.02 },
      { at: 0.6, v: 1 },
      { at: 0.85, v: 1.2 },
      { at: 1, v: 1.32 },
    ]),
    env: (p) => keyed(p, [
      { at: 0, v: 0.5 },
      { at: 0.6, v: 0.38 },
      { at: 1, v: 0.12 },
    ]),
    update: ({ p, t, px, py }) => {
      for (const s of swaps) {
        const want = p >= s.at ? s.real : L.clay;
        if (s.m.material !== want) s.m.material = want;
      }
      gridMat.opacity = 0.12 * (1 - seg(p, 0.2, 0.42));
      grid.visible = gridMat.opacity > 0.005;
      glassGF.visible = p >= 0.33;

      // day → dusk
      const el = keyed(p, [
        { at: 0, v: 52 },
        { at: 0.6, v: 30 },
        { at: 0.82, v: 9 },
        { at: 1, v: 2 },
      ]) * D2R;
      const az = keyed(p, [
        { at: 0, v: 38 },
        { at: 1, v: 72 },
      ]) * D2R;
      sunDir.set(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)).normalize();
      sun.position.copy(target.position).addScaledVector(sunDir, 18);
      sun.intensity = keyed(p, [
        { at: 0, v: 3.2 },
        { at: 0.6, v: 3.6 },
        { at: 0.82, v: 2.2 },
        { at: 1, v: 0.5 },
      ]);
      keyedColor(p, [
        { at: 0, c: 0xffffff },
        { at: 0.6, c: 0xfff0dc },
        { at: 0.82, c: 0xffa868 },
        { at: 1, c: 0xff7a52 },
      ], sun.color);
      hemi.intensity = keyed(p, [
        { at: 0, v: 1.0 },
        { at: 0.6, v: 0.7 },
        { at: 0.85, v: 0.32 },
        { at: 1, v: 0.18 },
      ]);
      keyedColor(p, [
        { at: 0, c: 0xeef2f6 },
        { at: 0.6, c: 0xdfe9f5 },
        { at: 0.85, c: 0x8a86b8 },
        { at: 1, c: 0x3a4068 },
      ], hemi.color);

      const night = clamp01(keyed(p, [
        { at: 0, v: 0 },
        { at: 0.62, v: 0.05 },
        { at: 0.8, v: 0.6 },
        { at: 0.95, v: 1 },
      ]));
      // At dusk the house lights up one system at a time, so the sequence
      // reads: cove, living room, pendants, upper floor, pool, garden, stone.
      const on = (a: number) => (p >= 0.3 ? clamp01((p - a) / 0.06) * (0.35 + night * 0.65) : 0);
      room.visible = p >= 0.33;
      const cv = on(0.62);
      coveMat.color.setHex(0xffd6a0).multiplyScalar(0.08 + cv * 1.6);
      const gf = on(0.66);
      O.interior.emissiveIntensity = 0.12 + gf * 1.5;
      interiorLight.intensity = gf * 7;
      const pd = on(0.7);
      pendantMat.emissiveIntensity = pd * 3;
      pendantGlows.forEach((g) => ((g.material as THREE.SpriteMaterial).opacity = pd * 0.6));
      ffInterior.emissiveIntensity = 0.12 + on(0.74) * 1.6;
      const pool = on(0.78);
      O.water.emissiveIntensity = pool * 0.6;
      poolLight.intensity = pool * 2.4;
      lamps.forEach((l, i) => l.set(on(0.8 + i * 0.025)));
      const wash = on(0.88);
      washMats.forEach((m) => (m.opacity = wash * 0.55));

      root.rotation.y = px * 0.14 + Math.sin(t * 0.1) * 0.02;
      root.rotation.x = py * 0.02;
      void gfInterior;
      void ffGlow;
      void water;
      return PHASES[p < 0.3 ? 0 : p < 0.68 ? 1 : 2];
    },
    setTheme: (dark) => {
      gridMat.color.setHex(dark ? 0xe8e4dc : 0x1a1a1a);
    },
    dispose: () => {
      disposeTree(root, shared);
      Object.values(O).forEach((m) => m.dispose());
      ffInterior.dispose();
      gridMat.dispose();
      sun.shadow.map?.dispose();
    },
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   FARMHOUSE — a weekend estate from first light to lantern light
   ═══════════════════════════════════════════════════════════════════════════ */

export function buildFarmhouse(L: Lux, quality: "high" | "low"): Built {
  const root = new THREE.Group();
  const O = outdoorMaterials();
  const shared = sharedSet(L);
  const SW = 10;
  const SD = 7;

  const site = plinth(L, O, SW, SD);
  root.add(site.group);

  const add = (m: THREE.Object3D) => (root.add(m), m);
  const windows: THREE.MeshStandardMaterial[] = [];
  const windowMat = () => {
    const m = new THREE.MeshStandardMaterial({ color: 0x2e2a24, roughness: 0.3, emissive: 0xffb866, emissiveIntensity: 0 });
    windows.push(m);
    return m;
  };

  /* main wing (along x) */
  const mainL = 5.0;
  const mainD = 1.9;
  const wallH = 1.05;
  const mx = -1.2;
  const mz = -2.0;
  add(mesh(new THREE.BoxGeometry(mainL + 0.3, 0.16, mainD + 1.5), L.travertine, mx, 0.08, mz + 0.55));
  add(mesh(new THREE.BoxGeometry(mainL, wallH, mainD), O.renderWarm, mx, 0.16 + wallH / 2, mz));
  const roofA = gableRoof(O.tile, mainL + 0.5, mainD + 0.7, 0.85);
  roofA.position.set(mx, 0.16 + wallH, mz);
  roofA.castShadow = roofA.receiveShadow = true;
  add(roofA);
  add(mesh(new THREE.BoxGeometry(mainL + 0.5, 0.06, 0.08), O.tileRidge, mx, 0.16 + wallH + 0.83, mz));

  // Verandah: timber posts and a lean-to roof across the front.
  const vz = mz + mainD / 2 + 0.6;
  for (let i = 0; i < 7; i++) {
    add(mesh(new THREE.BoxGeometry(0.08, 0.95, 0.08), O.timber, mx - mainL / 2 + 0.2 + i * ((mainL - 0.4) / 6), 0.16 + 0.475, vz + 0.45));
  }
  const lean = mesh(new THREE.BoxGeometry(mainL + 0.3, 0.06, 1.35), O.tile, mx, 0.16 + 1.0, vz);
  lean.rotation.x = 0.16;
  add(lean);
  add(mesh(new THREE.BoxGeometry(mainL + 0.3, 0.1, 0.08), O.timber, mx, 0.16 + 0.95, vz + 0.45));

  // Doors and windows on the verandah wall
  const front = mz + mainD / 2 + 0.01;
  for (let i = 0; i < 5; i++) {
    const x = mx - mainL / 2 + 0.55 + i * ((mainL - 1.1) / 4);
    const tall = i === 2;
    const h = tall ? 0.8 : 0.55;
    add(mesh(new THREE.BoxGeometry(tall ? 0.5 : 0.46, h + 0.06, 0.04), O.timber, x, 0.16 + (tall ? 0.43 : 0.5), front, { cast: false }));
    add(mesh(new THREE.BoxGeometry(tall ? 0.42 : 0.38, h, 0.02), windowMat(), x, 0.16 + (tall ? 0.43 : 0.5), front + 0.025, { cast: false }));
  }

  /* side wing (along z), making an L around the courtyard */
  const sx = 2.25;
  const sz = -1.15;
  const sideL = 3.6;
  const sideW = 1.7;
  add(mesh(new THREE.BoxGeometry(sideW + 0.3, 0.16, sideL + 0.3), L.travertine, sx, 0.08, sz));
  add(mesh(new THREE.BoxGeometry(sideW, wallH, sideL), O.renderWarm, sx, 0.16 + wallH / 2, sz));
  const roofB = gableRoof(O.tile, sideL + 0.5, sideW + 0.7, 0.8);
  roofB.rotation.y = Math.PI / 2;
  roofB.position.set(sx, 0.16 + wallH, sz);
  roofB.castShadow = roofB.receiveShadow = true;
  add(roofB);
  for (let i = 0; i < 3; i++) {
    const z = sz - sideL / 2 + 0.7 + i * 1.1;
    add(mesh(new THREE.BoxGeometry(0.04, 0.6, 0.5), O.timber, sx - sideW / 2 - 0.01, 0.16 + 0.5, z, { cast: false }));
    add(mesh(new THREE.BoxGeometry(0.02, 0.52, 0.42), windowMat(), sx - sideW / 2 - 0.035, 0.16 + 0.5, z, { cast: false }));
  }
  // chimney
  add(mesh(new THREE.BoxGeometry(0.3, 0.7, 0.3), O.renderWarm, sx + 0.3, 0.16 + wallH + 0.7, sz - 0.9));

  /* courtyard: lawn, pool, pergola, path */
  add(mesh(new THREE.BoxGeometry(3.9, 0.07, 1.4), L.travertine, -1.6, 0.035, 1.25, { cast: false }));
  const water = mesh(new THREE.BoxGeometry(3.5, 0.02, 1.0), O.water, -1.6, 0.075, 1.25, { cast: false });
  add(water);
  for (let i = 0; i < 6; i++) {
    add(mesh(new THREE.BoxGeometry(0.42, 0.04, 0.42), L.travertine, 1.3, 0.02, 3.1 - i * 0.55, { cast: false }));
  }

  // Pergola with climbers, over an outdoor sitting area
  const pg = new THREE.Group();
  pg.position.set(-4.0, 0, 1.4);
  const px0 = [-0.7, 0.7];
  const pz0 = [-0.6, 0.6];
  for (const x of px0) for (const z of pz0) pg.add(mesh(new THREE.BoxGeometry(0.09, 1.25, 0.09), O.timberLight, x, 0.625, z));
  for (const z of pz0) pg.add(mesh(new THREE.BoxGeometry(1.7, 0.08, 0.1), O.timberLight, 0, 1.25, z));
  for (let i = 0; i < 7; i++) pg.add(mesh(new THREE.BoxGeometry(0.06, 0.06, 1.5), O.timberLight, -0.75 + i * 0.25, 1.32, 0));
  pg.add(mesh(new THREE.BoxGeometry(1.5, 0.05, 1.3), L.travertine, 0, 0.025, 0, { cast: false }));
  pg.add(mesh(rbox(0.9, 0.36, 0.42, 0.06), L.boucle, 0, 0.2, -0.3));
  pg.add(mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.3, 24), L.travertine, 0, 0.15, 0.25));
  const vines = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ color: 0x55703c, roughness: 0.8 }), 260);
  vines.castShadow = true;
  {
    const r = rng(5);
    const m4 = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    for (let i = 0; i < 260; i++) {
      const onTop = i < 190;
      const p = onTop
        ? new THREE.Vector3(-0.8 + r() * 1.6, 1.36 + r() * 0.08, -0.7 + r() * 1.4)
        : new THREE.Vector3(px0[i % 2] + (r() - 0.5) * 0.12, r() * 1.25, pz0[(i >> 1) % 2] + (r() - 0.5) * 0.12);
      q.setFromEuler(new THREE.Euler(r() * 3, r() * 6, r() * 3));
      m4.compose(p, q, new THREE.Vector3().setScalar(0.05 + r() * 0.04));
      vines.setMatrixAt(i, m4);
    }
    vines.instanceMatrix.needsUpdate = true;
  }
  pg.add(vines);
  add(pg);

  // Boundary: a low stone wall along the back and left, gate posts at front.
  add(mesh(new THREE.BoxGeometry(SW - 0.3, 0.32, 0.18), L.stoneDark, 0, 0.16, -SD / 2 + 0.2));
  add(mesh(new THREE.BoxGeometry(0.18, 0.32, SD - 0.4), L.stoneDark, -SW / 2 + 0.2, 0.16, 0));
  add(mesh(new THREE.BoxGeometry(0.3, 0.7, 0.3), L.stoneDark, 0.85, 0.35, SD / 2 - 0.3));
  add(mesh(new THREE.BoxGeometry(0.3, 0.7, 0.3), L.stoneDark, 1.75, 0.35, SD / 2 - 0.3));

  // Trees: a big shade tree, olives by the pool, terracotta planters.
  const mango = shadeTree(O, 3.4, 2.0, 11, 0x557238);
  mango.position.set(-3.9, 0, -2.25);
  add(mango);
  add(at(contactShadow(L, 3, 3, 0.45), -3.9, 0.006, -2.25));
  const o1 = oliveTree(L, 1.6, 3);
  o1.position.set(0.7, 0, 0.6);
  o1.scale.setScalar(0.75);
  add(o1);
  const o2 = oliveTree(L, 1.5, 9);
  o2.position.set(3.95, 0, 2.55);
  o2.scale.setScalar(0.8);
  add(o2);
  for (const [x, z] of [[-3.4, 0.25], [0.2, 2.1], [-2.9, 2.1]] as const) {
    add(mesh(new THREE.CylinderGeometry(0.15, 0.11, 0.26, 20), O.terracotta, x, 0.13, z));
    add(mesh(new THREE.SphereGeometry(0.17, 12, 8), O.hedge, x, 0.33, z));
  }

  // Lanterns along the entrance path and under the verandah
  const lamps = [
    [0.95, 2.9],
    [1.65, 2.3],
    [0.95, 1.7],
    [-4.0, 2.25],
    [0.6, -0.6],
  ].map(([x, z]) => {
    const l = lantern(L, O, 0.32);
    l.group.position.set(x, 0, z);
    add(l.group);
    return l;
  });
  const porch = new THREE.PointLight(0xffb866, 0, 5, 2);
  porch.position.set(mx, 0.9, vz);
  root.add(porch);
  const pgLight = new THREE.PointLight(0xffc27a, 0, 3, 2);
  pgLight.position.set(-4.0, 1.1, 1.4);
  root.add(pgLight);

  /* ── detail: life on the estate ────────────────────────────────── */
  // Verandah: a swing and two easy chairs
  const swingY = 0.16 + 0.42;
  add(mesh(rbox(0.9, 0.06, 0.34, 0.03), O.timberLight, mx - 1.3, swingY, vz + 0.05));
  add(mesh(rbox(0.9, 0.3, 0.05, 0.02), O.timberLight, mx - 1.3, swingY + 0.17, vz - 0.1));
  for (const dx of [-0.42, 0.42]) add(mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.52, 4), L.blackSteel, mx - 1.3 + dx, swingY + 0.29, vz + 0.05, { cast: false }));
  for (const dx of [0.6, 1.25]) {
    add(mesh(rbox(0.42, 0.22, 0.42, 0.06), L.linen, mx + dx, 0.16 + 0.15, vz));
    add(mesh(rbox(0.42, 0.26, 0.08, 0.04), L.linen, mx + dx, 0.16 + 0.36, vz - 0.17));
  }

  // Kitchen garden: three raised beds of greens
  const beds = new THREE.Group();
  const greens = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ color: 0x6f8f45, roughness: 0.85 }), 150);
  {
    const r = rng(17);
    const m4 = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    let k = 0;
    for (let b = 0; b < 3; b++) {
      const bx = -3.35 + b * 1.05;
      beds.add(mesh(new THREE.BoxGeometry(0.9, 0.16, 0.42), O.timber, bx, 0.08, 2.75));
      beds.add(mesh(new THREE.BoxGeometry(0.84, 0.02, 0.36), O.soil, bx, 0.16, 2.75, { cast: false }));
      for (let j = 0; j < 50; j++, k++) {
        q.setFromEuler(new THREE.Euler(r() * 3, r() * 6, r() * 3));
        m4.compose(
          new THREE.Vector3(bx - 0.38 + r() * 0.76, 0.2 + r() * 0.05, 2.6 + r() * 0.3),
          q,
          new THREE.Vector3().setScalar(0.035 + r() * 0.03)
        );
        greens.setMatrixAt(k, m4);
      }
    }
    greens.instanceMatrix.needsUpdate = true;
  }
  greens.castShadow = true;
  beds.add(greens);
  add(beds);

  // Fire pit with benches, by the side wing
  const fx = 2.75;
  const fz = 1.75;
  add(mesh(new THREE.CylinderGeometry(0.34, 0.38, 0.16, 28), L.stoneDark, fx, 0.08, fz));
  add(mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.02, 24), O.soil, fx, 0.165, fz, { cast: false }));
  for (const [dx, dz, ry] of [[0, -0.75, 0], [-0.75, 0, Math.PI / 2], [0.75, 0, Math.PI / 2]] as const) {
    const bench = mesh(rbox(0.8, 0.14, 0.26, 0.04), O.timberLight, fx + dx, 0.18, fz + dz);
    bench.rotation.y = ry;
    add(bench);
  }
  const flame = glow(L, 0.9, 0xff9a4a);
  flame.position.set(fx, 0.34, fz);
  add(flame);
  const fireLight = new THREE.PointLight(0xff8a3a, 0, 3.2, 2);
  fireLight.position.set(fx, 0.45, fz);
  root.add(fireLight);

  // String lights draped from the pergola to the verandah and across to the wing
  const bulbMat = new THREE.MeshStandardMaterial({ color: 0xfff1d8, emissive: 0xffc070, emissiveIntensity: 0, roughness: 0.4 });
  const cords: THREE.Vector3[][] = [];
  const drape = (a: THREE.Vector3, b: THREE.Vector3, sag: number, count: number) => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      pts.push(new THREE.Vector3().lerpVectors(a, b, t).add(new THREE.Vector3(0, -Math.sin(t * Math.PI) * sag, 0)));
    }
    cords.push(pts);
  };
  drape(new THREE.Vector3(-3.3, 1.3, 0.85), new THREE.Vector3(mx - 0.6, 1.08, vz + 0.45), 0.32, 14);
  drape(new THREE.Vector3(mx + 1.8, 1.08, vz + 0.45), new THREE.Vector3(sx - sideW / 2, 1.05, 0.35), 0.24, 10);
  drape(new THREE.Vector3(-3.3, 1.3, 1.95), new THREE.Vector3(fx - 0.2, 1.0, fz), 0.42, 18);
  const bulbCount = cords.reduce((n, c) => n + c.length, 0);
  const bulbs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.026, 8, 6), bulbMat, bulbCount);
  {
    const m4 = new THREE.Matrix4();
    let k = 0;
    cords.forEach((c) => c.forEach((p) => m4.makeTranslation(p.x, p.y - 0.03, p.z) && bulbs.setMatrixAt(k++, m4)));
    bulbs.instanceMatrix.needsUpdate = true;
  }
  add(bulbs);
  const cordMat = new THREE.LineBasicMaterial({ color: 0x2a2520 });
  cords.forEach((c) => add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(c), cordMat)));
  const stringLight = new THREE.PointLight(0xffc070, 0, 5, 2);
  stringLight.position.set(-1.2, 1.0, 1.2);
  root.add(stringLight);

  const hemi = new THREE.HemisphereLight(0xe8eef5, 0x6d6450, 0.9);
  const sun = siteSun(quality, 7.5);
  const target = new THREE.Object3D();
  sun.target = target;
  const sunDir = new THREE.Vector3();

  return {
    root,
    lights: [hemi, sun, target],
    restP: 0.45,
    frame: (p) => ({
      pos: new THREE.Vector3(11.5 - p * 1.5, 7.6 - p * 1.2, 12.8 - p * 0.6),
      look: new THREE.Vector3(-0.2, 0.7, -0.2),
    }),
    exposure: (p) => keyed(p, [
      { at: 0, v: 1.05 },
      { at: 0.5, v: 0.98 },
      { at: 0.85, v: 1.2 },
      { at: 1, v: 1.32 },
    ]),
    env: (p) => keyed(p, [
      { at: 0, v: 0.36 },
      { at: 0.5, v: 0.42 },
      { at: 1, v: 0.12 },
    ]),
    update: ({ p, t, px, py }) => {
      // The sun crosses from the east (morning, low and gold), over the
      // courtyard at noon, and sets pink behind the side wing.
      const el = keyed(p, [
        { at: 0, v: 12 },
        { at: 0.45, v: 62 },
        { at: 0.82, v: 12 },
        { at: 1, v: 2 },
      ]) * D2R;
      const az = keyed(p, [
        { at: 0, v: -80 },
        { at: 0.45, v: 10 },
        { at: 1, v: 95 },
      ]) * D2R;
      sunDir.set(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)).normalize();
      sun.position.copy(target.position).addScaledVector(sunDir, 18);
      sun.intensity = keyed(p, [
        { at: 0, v: 2.2 },
        { at: 0.2, v: 3.4 },
        { at: 0.5, v: 3.8 },
        { at: 0.82, v: 2.2 },
        { at: 1, v: 0.35 },
      ]);
      keyedColor(p, [
        { at: 0, c: 0xffc88e },
        { at: 0.25, c: 0xfff1df },
        { at: 0.6, c: 0xfff3e4 },
        { at: 0.84, c: 0xffa060 },
        { at: 1, c: 0xff6f58 },
      ], sun.color);
      hemi.intensity = keyed(p, [
        { at: 0, v: 0.7 },
        { at: 0.45, v: 1.0 },
        { at: 0.85, v: 0.38 },
        { at: 1, v: 0.18 },
      ]);
      keyedColor(p, [
        { at: 0, c: 0xf2dcc8 },
        { at: 0.45, c: 0xe8eef5 },
        { at: 0.85, c: 0x9a88b0 },
        { at: 1, c: 0x3a4068 },
      ], hemi.color);

      const night = clamp01(keyed(p, [
        { at: 0, v: 0.25 },
        { at: 0.14, v: 0 },
        { at: 0.7, v: 0.05 },
        { at: 0.86, v: 0.65 },
        { at: 1, v: 1 },
      ]));
      // Evening comes on in a sequence: rooms one by one, the porch, the
      // path lanterns, the string lights, and last the fire.
      const on = (a: number) => clamp01((p - a) / 0.06) * (0.4 + night * 0.6);
      windows.forEach((w, i) => (w.emissiveIntensity = on(0.66 + (i % 8) * 0.018) * 2.2));
      lamps.forEach((l, i) => l.set(on(0.78 + i * 0.02)));
      const str = on(0.84);
      bulbMat.emissiveIntensity = str * 3.4;
      stringLight.intensity = str * 3;
      const fire = on(0.9);
      const flicker = 0.82 + Math.sin(t * 13.1) * 0.08 + Math.sin(t * 7.3 + 1.2) * 0.1;
      (flame.material as THREE.SpriteMaterial).opacity = fire * 0.85 * flicker;
      flame.scale.setScalar(0.8 + fire * 0.25 * flicker);
      fireLight.intensity = fire * 4 * flicker;
      porch.intensity = on(0.72) * 6;
      pgLight.intensity = on(0.84) * 3;
      O.water.emissiveIntensity = night * 0.45;

      root.rotation.y = px * 0.14 + Math.sin(t * 0.1) * 0.02;
      root.rotation.x = py * 0.02;

      const mins = Math.round((7 * 60 + p * 13 * 60) / 5) * 5;
      return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
    },
    setTheme: () => {},
    dispose: () => {
      disposeTree(root, shared);
      Object.values(O).forEach((m) => m.dispose());
      windows.forEach((w) => w.dispose());
      bulbMat.dispose();
      cordMat.dispose();
      sun.shadow.map?.dispose();
    },
  };
}
