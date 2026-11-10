import * as THREE from "three";
import { swatchSet, type Lux } from "./materials";
import { decorAt, mainAt } from "./suiteStages";
import { buildFarmhouse, buildResidence } from "./exteriors";
import { buildAtelier, buildSkyLounge } from "./interiors2";

export { BEDROOM_PIECES, bedroomPlaced } from "./suiteStages";
import {
  archShape,
  clamp01,
  contactShadow,
  disposeTree,
  glow,
  keyed,
  keyedColor,
  mesh,
  reededPanel,
  rbox,
  seg,
  wallWithOpenings,
} from "./kit";
import {
  archLed,
  artwork,
  barrelChair,
  bedLux,
  benchLux,
  curvedSofa,
  drumTable,
  floatingNightstand,
  globeCluster,
  globeFloorLamp,
  headboardWall,
  mushroomLamp,
  oliveTree,
  pictureLight,
  reededWardrobe,
  ringChandelier,
  rug,
  sculpture,
  sheer,
  swatch,
  travertineTable,
  vaseBranches,
  type Fixture,
} from "./pieces";

/**
 * living — Interior Design (the salon); bedroom — Interior Styling (the suite
 * built in four stages); lounge — the material library; residence —
 * Architecture; farmhouse — Farmhouses.
 */
export type SceneVariant =
  | "living"
  | "bedroom"
  | "lounge"
  | "residence"
  | "farmhouse"
  /** Interior Design on the What We Do stage — a futuristic penthouse. */
  | "skylounge"
  /** Interior Styling on the What We Do stage — a gallery room being styled. */
  | "atelier";

export interface SceneState {
  p: number;
  t: number;
  dt: number;
  /** Smoothed pointer over the whole window, −1…1. */
  px: number;
  py: number;
  /** Pointer in this canvas's normalised device coords, when it's over it. */
  ndc: { x: number; y: number } | null;
}

export interface Built {
  root: THREE.Group;
  lights: THREE.Object3D[];
  frame: (p: number) => { pos: THREE.Vector3; look: THREE.Vector3 };
  /** Returns an optional caption (time of day, material name…). */
  update: (s: SceneState, camera: THREE.Camera) => string | void;
  exposure?: (p: number) => number;
  /** Strength of the studio reflections (dimmed at night). */
  env?: (p: number) => number;
  setTheme: (dark: boolean) => void;
  /** Progress shown to visitors who prefer reduced motion. */
  restP: number;
  /**
   * Materials the model switches to later (e.g. real finishes replacing the
   * white concept model), compiled up front with the rest so the switch
   * doesn't stall a frame.
   */
  precompile?: THREE.Material[];
  dispose: () => void;
}

const D2R = Math.PI / 180;

/* ── shared room shell ──────────────────────────────────────────────────── */

interface Shell {
  group: THREE.Group;
  walls: THREE.Mesh[];
  floor: THREE.Mesh;
}

/**
 * Floor slab (travertine edge, timber top), a back and a left wall with real
 * openings, and an invisible ceiling that only exists for shadows — so the
 * sun reaches the room through the windows instead of over the open top.
 */
function shell(
  L: Lux,
  o: {
    W: number;
    D: number;
    H: number;
    tBack: number;
    tLeft: number;
    floorMat: THREE.MeshPhysicalMaterial;
    back?: Parameters<typeof wallWithOpenings>[3];
    left?: Parameters<typeof wallWithOpenings>[3];
  }
): Shell {
  const { W, D, H, tBack, tLeft } = o;
  const group = new THREE.Group();

  const fw = W + tLeft;
  const fd = D + tBack;
  const map = o.floorMat.map;
  if (map) map.repeat.set(fw / 2.4, fd / 2.4);
  const edge = L.travertine;
  const floor = mesh(new THREE.BoxGeometry(fw, 0.22, fd), [edge, edge, o.floorMat, edge, edge, edge], -tLeft / 2, -0.11, -tBack / 2);
  floor.castShadow = false;
  group.add(floor);

  const back = wallWithOpenings(W + tLeft, H, tBack, o.back ?? [], L.plaster);
  back.position.set(-W / 2 - tLeft, 0, -D / 2);
  const left = wallWithOpenings(D, H, tLeft, o.left ?? [], L.plaster);
  left.rotation.y = Math.PI / 2;
  left.position.set(-W / 2, 0, D / 2);
  group.add(back, left);

  // skirting shadow gap
  group.add(mesh(new THREE.BoxGeometry(W, 0.012, 0.012), L.stoneDark, 0, 0.006, -D / 2 + 0.006, { cast: false }));
  group.add(mesh(new THREE.BoxGeometry(0.012, 0.012, D), L.stoneDark, -W / 2 + 0.006, 0.006, 0, { cast: false }));

  const ceiling = new THREE.Mesh(new THREE.BoxGeometry(W + 2, 0.1, D + 2), L.shadowOnly);
  ceiling.position.set(0, H + 0.05, 0);
  ceiling.castShadow = true;
  group.add(ceiling);

  return { group, walls: [back, left], floor };
}

/** Sun with a soft, high-resolution shadow. */
function sunLight(quality: "high" | "low") {
  const sun = new THREE.DirectionalLight(0xfff2e2, 3);
  sun.castShadow = true;
  const size = quality === "high" ? 2048 : 1024;
  sun.shadow.mapSize.set(size, size);
  const c = sun.shadow.camera;
  c.left = -5.5;
  c.right = 5.5;
  c.top = 5.5;
  c.bottom = -5.5;
  c.near = 1;
  c.far = 40;
  sun.shadow.bias = -0.0003;
  sun.shadow.normalBias = 0.025;
  sun.shadow.radius = 6;
  return sun;
}

/** A window's sky: a vertex-coloured gradient we can re-tint every frame. */
function skyPane(shape: THREE.Shape) {
  const geo = new THREE.ShapeGeometry(shape, 40);
  geo.computeBoundingBox();
  const bb = geo.boundingBox!;
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const colors = new Float32Array(pos.count * 3);
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: true });
  const m = new THREE.Mesh(geo, mat);
  const zen = new THREE.Color();
  const hor = new THREE.Color();
  const tmp = new THREE.Color();
  const setSky = (zenith: THREE.Color, horizon: THREE.Color) => {
    zen.copy(zenith);
    hor.copy(horizon);
    for (let i = 0; i < pos.count; i++) {
      const t = (pos.getY(i) - bb.min.y) / Math.max(0.001, bb.max.y - bb.min.y);
      tmp.copy(hor).lerp(zen, Math.pow(t, 0.8));
      colors[i * 3] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;
    }
    (geo.attributes.color as THREE.BufferAttribute).needsUpdate = true;
  };
  return { mesh: m, setSky };
}

/* ═══════════════════════════════════════════════════════════════════════════
   SALON — a living room told from noon to night as you scroll
   ═══════════════════════════════════════════════════════════════════════════ */
export function buildSalon(L: Lux, quality: "high" | "low"): Built {
  const root = new THREE.Group();
  const W = 5.6;
  const D = 4.6;
  const H = 3.0;
  const tBack = 0.2;
  const tLeft = 0.34;
  const shared = new Set<THREE.Material>(Object.values(L).filter((v): v is THREE.Material => v instanceof THREE.Material));

  // Window on the back wall (world x = 1.45); niche in the left wall (world z = −0.15).
  const winX = 1.45;
  const winW = 1.5;
  const winH = 2.45;
  const winY = 0.32;
  const nicheZ = -0.15;
  const nicheW = 1.05;
  const nicheH = 2.15;
  const nicheY = 0.4;
  const sh = shell(L, {
    W,
    D,
    H,
    tBack,
    tLeft,
    floorMat: L.oakSmoked,
    back: [{ kind: "arch", x: winX + W / 2 + tLeft, y: winY, w: winW, h: winH }],
    left: [{ kind: "arch", x: D / 2 - nicheZ, y: nicheY, w: nicheW, h: nicheH }],
  });
  root.add(sh.group);

  /* window: bronze frame, glass, sky, sheers */
  const zWin = -D / 2 - tBack;
  const frameMat = L.bronze;
  const frameGeo = new THREE.ExtrudeGeometry(
    (() => {
      const outer = archShape(winW, winH, winX, winY);
      const hole = archShape(winW - 0.07, winH - 0.035, winX, winY + 0.035);
      outer.holes.push(hole);
      return outer;
    })(),
    { depth: 0.05, bevelEnabled: false, curveSegments: 40 }
  );
  const frame = mesh(frameGeo, frameMat, 0, 0, zWin + tBack / 2 - 0.025);
  root.add(frame);
  root.add(mesh(new THREE.BoxGeometry(0.03, winH - 0.05, 0.04), frameMat, winX, winY + (winH - 0.05) / 2, zWin + tBack / 2));
  root.add(mesh(new THREE.BoxGeometry(winW - 0.06, 0.03, 0.04), frameMat, winX, winY + winH * 0.62, zWin + tBack / 2));
  const glassPane = new THREE.Mesh(new THREE.ShapeGeometry(archShape(winW, winH, winX, winY), 40), L.glass);
  glassPane.position.z = zWin + tBack / 2;
  root.add(glassPane);
  // sized to stay hidden behind the wall from the elevated camera
  const sky = skyPane(archShape(winW + 0.3, winH + 0.15, winX, winY - 0.1));
  sky.mesh.position.z = zWin - 0.6;
  root.add(sky.mesh);
  for (const s of [-1, 1]) {
    const c = sheer(L, 0.55, H - 0.12, 8);
    c.position.set(winX + s * (winW / 2 + 0.36), 0, -D / 2 + 0.14);
    root.add(c);
  }

  /* reeded walnut wall + art + picture light */
  const panelW = W / 2 + winX - winW / 2 - 0.45;
  const panel = reededPanel(panelW, 2.62, Math.round(panelW * 11), 0.028, L.walnut);
  panel.position.set(-W / 2 + panelW / 2, 0, -D / 2 + 0.02);
  root.add(panel);
  const artCx = -W / 2 + panelW / 2 + 0.1;
  const art = artwork(L, L.art, 1.15, 1.42);
  art.position.set(artCx, 1.62, -D / 2 + 0.055);
  root.add(art);
  const pic = pictureLight(L, 1.15);
  pic.group.position.set(artCx, 2.46, -D / 2 + 0.06);
  root.add(pic.group);

  /* niche: deep plaster recess, travertine shelves, collected objects, cove LED */
  const nx = -W / 2 - tLeft;
  const nicheBack = mesh(rbox(0.06, nicheH + 0.1, nicheW + 0.1, 0.005), L.plasterDeep, nx - 0.03, nicheY + nicheH / 2, nicheZ);
  root.add(nicheBack);
  for (const y of [nicheY + 0.75, nicheY + 1.38]) {
    root.add(mesh(new THREE.BoxGeometry(tLeft + 0.04, 0.045, nicheW), L.travertine, nx + tLeft / 2, y, nicheZ));
  }
  const v1 = vaseBranches(L, 0.34, 4);
  v1.position.set(nx + 0.16, nicheY + 0.775, nicheZ - 0.2);
  root.add(v1);
  root.add(mesh(new THREE.SphereGeometry(0.09, 32, 20), L.bronze, nx + 0.16, nicheY + 1.49, nicheZ + 0.25));
  root.add(mesh(rbox(0.22, 0.05, 0.16, 0.005), L.linen, nx + 0.17, nicheY + 1.43, nicheZ - 0.18));
  root.add(mesh(rbox(0.2, 0.04, 0.15, 0.005), L.velvetOlive, nx + 0.17, nicheY + 1.475, nicheZ - 0.19));
  const nicheLed = archLed(L, nicheW - 0.08, nicheH - 0.06, 0);
  nicheLed.mesh.rotation.y = Math.PI / 2;
  nicheLed.mesh.position.set(nx + 0.04, nicheY + 0.03, nicheZ);
  root.add(nicheLed.mesh);
  const nicheArea = new THREE.RectAreaLight(0xffcf96, 0, 0.5, nicheW * 0.8);
  nicheArea.position.set(nx + 0.12, nicheY + nicheH - 0.25, nicheZ);
  nicheArea.lookAt(nx + 0.5, nicheY, nicheZ);
  root.add(nicheArea);
  const nicheGlow = glow(L, 1.6);
  nicheGlow.position.set(nx + 0.2, nicheY + 1.1, nicheZ);
  root.add(nicheGlow);

  /* furniture */
  const C = new THREE.Vector3(-0.55, 0, 0.3);
  root.add(rug(L, 3.7, 2.8, 0.25).translateX(C.x).translateZ(C.z + 0.05));
  const sofa = curvedSofa(L);
  sofa.position.copy(C);
  root.add(sofa);
  const sofaShadow = contactShadow(L, 4.4, 2.6, 0.45);
  sofaShadow.position.set(C.x, 0.004, C.z - 1.2);
  root.add(sofaShadow);
  const table = travertineTable(L);
  table.position.copy(C);
  root.add(table);

  const chairPos = new THREE.Vector3(1.62, 0, 1.0);
  const chair = barrelChair(L);
  chair.position.copy(chairPos);
  chair.rotation.y = Math.atan2(C.x - chairPos.x, C.z - chairPos.z);
  root.add(chair);
  const side = drumTable(L, L.nero, 0.5, 0.21);
  side.position.set(2.3, 0, 0.42);
  root.add(side);
  const tableLamp = mushroomLamp(L);
  tableLamp.group.position.set(2.3, 0.5, 0.42);
  root.add(tableLamp.group);

  const floorLamp = globeFloorLamp(L);
  floorLamp.group.position.set(-2.38, 0, -1.25);
  root.add(floorLamp.group);

  const chandelier = ringChandelier(L, 0.62, H - 2.28);
  chandelier.group.position.set(C.x, 2.28, C.z);
  root.add(chandelier.group);

  const tree = oliveTree(L, 2.25);
  tree.position.set(2.42, 0, -1.72);
  root.add(tree);

  const sculpt = sculpture(L);
  sculpt.group.position.set(-2.32, 0, 1.6);
  root.add(sculpt.group);

  /* sun, shafts and dust */
  const hemi = new THREE.HemisphereLight(0xdfe9f5, 0x8a7560, 0.9);
  const sun = sunLight(quality);
  const target = new THREE.Object3D();
  target.position.set(0.4, 0, 0);
  sun.target = target;
  const fixtures: Fixture[] = [chandelier, floorLamp, tableLamp, pic];

  const shaftMats: THREE.MeshBasicMaterial[] = [];
  const shafts: THREE.Mesh[] = [];
  const shaftGeo = new THREE.ShapeGeometry(archShape(winW - 0.07, winH - 0.04, 0, 0), 32);
  for (let i = 0; i < 6; i++) {
    const m = new THREE.MeshBasicMaterial({
      color: 0xffc98a,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
      side: THREE.DoubleSide,
    });
    shaftMats.push(m);
    const s = new THREE.Mesh(shaftGeo, m);
    s.renderOrder = 2;
    shafts.push(s);
    root.add(s);
  }

  const DUST = quality === "high" ? 220 : 90;
  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(DUST * 3);
  const dustSeed = Array.from({ length: DUST }, () => [Math.random(), Math.random(), Math.random(), Math.random()]);
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  const dustMat = new THREE.PointsMaterial({
    size: 0.028,
    map: L.glowTex,
    color: 0xffe0b8,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  root.add(dust);

  const sunDir = new THREE.Vector3();
  const zen = new THREE.Color();
  const hor = new THREE.Color();
  const col = new THREE.Color();

  return {
    root,
    lights: [hemi, sun, target],
    restP: 0.55,
    frame: (p) => ({
      pos: new THREE.Vector3(7.5 - p * 0.5, 4.75 - p * 0.25, 8.2 - p * 0.3),
      look: new THREE.Vector3(0.05, 1.05, -0.15),
    }),
    exposure: (p) => keyed(p, [
      { at: 0, v: 0.92 },
      { at: 0.55, v: 0.98 },
      { at: 0.8, v: 1.25 },
      { at: 1, v: 1.4 },
    ]),
    env: (p) => keyed(p, [
      { at: 0, v: 0.38 },
      { at: 0.6, v: 0.3 },
      { at: 0.85, v: 0.12 },
      { at: 1, v: 0.08 },
    ]),
    update: ({ p, t, px, py }) => {
      // ── time of day ───────────────────────────────────────────────────
      const el = keyed(p, [
        { at: 0, v: 54 },
        { at: 0.55, v: 17 },
        { at: 0.74, v: 7 },
        { at: 1, v: 1 },
      ]) * D2R;
      const az = keyed(p, [
        { at: 0, v: -4 },
        { at: 1, v: -16 },
      ]) * D2R;
      // the sun sits behind the back wall; as it drops, the window's light
      // stretches across the herringbone toward the chair
      sunDir.set(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el)).normalize();
      sun.position.copy(target.position).addScaledVector(sunDir, 14);
      sun.intensity = keyed(p, [
        { at: 0, v: 5 },
        { at: 0.4, v: 5.6 },
        { at: 0.58, v: 6.4 },
        { at: 0.74, v: 2 },
        { at: 0.88, v: 0 },
      ]);
      keyedColor(p, [
        { at: 0, c: 0xfff1df },
        { at: 0.38, c: 0xffe0b8 },
        { at: 0.58, c: 0xffa95f },
        { at: 0.76, c: 0xff7444 },
      ], sun.color);
      // Low fill so the sunlit patch reads against the shade.
      hemi.intensity = keyed(p, [
        { at: 0, v: 0.5 },
        { at: 0.55, v: 0.34 },
        { at: 0.74, v: 0.2 },
        { at: 0.9, v: 0.1 },
        { at: 1, v: 0.08 },
      ]);
      keyedColor(p, [
        { at: 0, c: 0xdfe9f5 },
        { at: 0.55, c: 0xffd7b0 },
        { at: 0.78, c: 0x6a74a8 },
        { at: 1, c: 0x2b3352 },
      ], hemi.color);
      keyedColor(p, [
        { at: 0, c: 0x8bbce6 },
        { at: 0.55, c: 0xe2a978 },
        { at: 0.74, c: 0x6d6aa0 },
        { at: 0.9, c: 0x26335e },
        { at: 1, c: 0x0f1630 },
      ], zen);
      keyedColor(p, [
        { at: 0, c: 0xeaf4fb },
        { at: 0.55, c: 0xffd9a8 },
        { at: 0.74, c: 0xff9a68 },
        { at: 0.9, c: 0x7c5476 },
        { at: 1, c: 0x232a44 },
      ], hor);
      sky.setSky(zen, hor);

      // ── interior lights come on through dusk ─────────────────────────
      const night = keyed(p, [
        { at: 0, v: 0 },
        { at: 0.52, v: 0.06 },
        { at: 0.68, v: 0.55 },
        { at: 0.84, v: 1 },
      ]);
      fixtures.forEach((f) => f.set(night));
      nicheArea.intensity = night * 6;
      nicheLed.mat.color.setHex(0xffd6a0).multiplyScalar(0.15 + night * 1.6);
      (nicheGlow.material as THREE.SpriteMaterial).opacity = night * 0.55;

      // ── sunbeams + dust, strongest at golden hour ────────────────────
      const beam = keyed(p, [
        { at: 0, v: 0.18 },
        { at: 0.36, v: 0.45 },
        { at: 0.56, v: 1 },
        { at: 0.72, v: 0.4 },
        { at: 0.84, v: 0 },
      ]);
      col.copy(sun.color);
      const travel = sunDir.clone().negate();
      shafts.forEach((s, i) => {
        const d = 0.18 + i * 0.42;
        s.position.set(winX, winY + 0.02, zWin + tBack / 2).addScaledVector(travel, d);
        shaftMats[i].color.copy(col);
        shaftMats[i].opacity = beam * 0.055 * (1 - i / shafts.length);
        s.visible = beam > 0.01;
      });
      for (let i = 0; i < DUST; i++) {
        const [a, b, c, ph] = dustSeed[i];
        const d = 0.2 + a * 2.2;
        const x = winX + (b - 0.5) * (winW - 0.2) + Math.sin(t * 0.3 + ph * 9) * 0.04;
        const y = winY + 0.1 + c * (winH - 0.4) + Math.sin(t * 0.21 + ph * 7) * 0.05;
        dustPos[i * 3] = x + travel.x * d;
        dustPos[i * 3 + 1] = y + travel.y * d;
        dustPos[i * 3 + 2] = zWin + tBack / 2 + travel.z * d;
      }
      (dustGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      dustMat.opacity = beam * 0.85;
      dust.visible = beam > 0.01;

      sculpt.knot.rotation.y = t * 0.15;
      root.rotation.y = px * 0.16 + Math.sin(t * 0.12) * 0.02;
      root.rotation.x = py * 0.025;

      const mins = Math.round((12 * 60 + p * 10 * 60) / 5) * 5;
      return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
    },
    setTheme: () => {},
    dispose: () => {
      disposeTree(root, shared);
      sun.shadow.map?.dispose();
    },
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   SUITE — a bedroom built in the four stages of a project
   ═══════════════════════════════════════════════════════════════════════════ */

export function buildSuite(L: Lux, quality: "high" | "low"): Built {
  const root = new THREE.Group();
  const W = 5.4;
  const D = 4.6;
  const H = 3.0;
  const tBack = 0.2;
  const tLeft = 0.3;
  const shared = new Set<THREE.Material>(Object.values(L).filter((v): v is THREE.Material => v instanceof THREE.Material));

  const winZ = 1.1;
  const winW = 1.5;
  const winH = 2.35;
  const winY = 0.3;
  const sh = shell(L, {
    W,
    D,
    H,
    tBack,
    tLeft,
    floorMat: L.oakWashed,
    left: [{ kind: "rect", x: D / 2 - winZ, y: winY, w: winW, h: winH }],
  });
  root.add(sh.group);

  // window: frame, glass, sky — shown once the architecture is finished
  const windowParts = new THREE.Group();
  root.add(windowParts);
  const wx = -W / 2 - tLeft / 2;
  const frameMat = L.bronze;
  windowParts.add(mesh(new THREE.BoxGeometry(0.05, 0.04, winW), frameMat, wx, winY + winH * 0.7, winZ));
  windowParts.add(mesh(new THREE.BoxGeometry(0.05, winH, 0.035), frameMat, wx, winY + winH / 2, winZ));
  const pane = new THREE.Mesh(new THREE.PlaneGeometry(winW, winH), L.glass);
  pane.rotation.y = Math.PI / 2;
  pane.position.set(wx, winY + winH / 2, winZ);
  windowParts.add(pane);
  const skyShape = new THREE.Shape();
  skyShape.moveTo(-winW / 2 - 0.3, 0);
  skyShape.lineTo(winW / 2 + 0.3, 0);
  skyShape.lineTo(winW / 2 + 0.3, winH + 0.4);
  skyShape.lineTo(-winW / 2 - 0.3, winH + 0.4);
  skyShape.closePath();
  const sky = skyPane(skyShape);
  sky.mesh.rotation.y = Math.PI / 2;
  sky.mesh.position.set(-W / 2 - tLeft - 0.6, winY - 0.2, winZ);
  windowParts.add(sky.mesh);

  /* pieces — each is a group we can raise in clay and then "finish" */
  interface Piece {
    g: THREE.Group;
    kind: "main" | "decor";
    order: number;
    meshes: { m: THREE.Mesh; orig: THREE.Material | THREE.Material[] }[];
    sprites: THREE.Sprite[];
  }
  const pieces: Piece[] = [];
  const mains: Piece[] = [];
  const decors: Piece[] = [];
  const add = (g: THREE.Group, kind: "main" | "decor") => {
    const meshes: Piece["meshes"] = [];
    const sprites: THREE.Sprite[] = [];
    g.traverse((o) => {
      if ((o as THREE.Sprite).isSprite) sprites.push(o as THREE.Sprite);
      else if ((o as THREE.Mesh).isMesh) meshes.push({ m: o as THREE.Mesh, orig: (o as THREE.Mesh).material });
    });
    const list = kind === "main" ? mains : decors;
    const pc: Piece = { g, kind, order: list.length, meshes, sprites };
    list.push(pc);
    pieces.push(pc);
    root.add(g);
    return pc;
  };

  const bedX = 0.25;
  const headboard = headboardWall(L, 3.6, 1.32);
  headboard.group.position.set(bedX, 0, -D / 2 + 0.02);
  add(headboard.group, "main");

  const bed = bedLux(L);
  bed.position.set(bedX, 0, -D / 2 + 0.02 + 1.18);
  add(bed, "main");

  for (const s of [-1, 1]) {
    const ns = floatingNightstand(L);
    ns.position.set(bedX + s * 1.42, 0, -D / 2 + 0.06);
    add(ns, "main");
  }
  const wardrobe = reededWardrobe(L, 1.75, 2.55, 0.62);
  wardrobe.rotation.y = Math.PI / 2;
  wardrobe.position.set(-W / 2 + 0.31, 0, -1.25);
  add(wardrobe, "main");
  const bench = benchLux(L, 1.4);
  bench.position.set(bedX, 0, 0.62);
  add(bench, "main");
  const chairGroup = new THREE.Group();
  const chair = barrelChair(L, L.boucle, L.boucle);
  chair.rotation.y = Math.atan2(bedX + 1.9, -0.6 - 1.55);
  chairGroup.add(chair);
  chairGroup.position.set(-1.9, 0, 1.55);
  add(chairGroup, "main");

  const rugGroup = new THREE.Group();
  rugGroup.add(rug(L, 3.3, 3.1, 0.22));
  rugGroup.position.set(bedX, 0, -0.55);
  add(rugGroup, "main");

  // styling: pendants, sheers, tree, side table + lamp, floor vase
  const pendants: Fixture[] = [];
  for (const s of [-1, 1]) {
    const pc = globeCluster(L, H);
    pc.group.position.set(bedX + s * 1.42, 0, -D / 2 + 0.3);
    pendants.push(pc);
    add(pc.group, "decor");
  }
  const sheers = new THREE.Group();
  for (const s of [-1, 1]) {
    const c = sheer(L, 0.5, H - 0.12, 7);
    c.rotation.y = Math.PI / 2;
    c.position.set(-W / 2 + 0.12, 0, winZ + s * (winW / 2 + 0.3));
    sheers.add(c);
  }
  add(sheers, "decor");
  const tree = oliveTree(L, 2.1, 12);
  tree.position.set(2.32, 0, -1.75);
  add(tree, "decor");
  const sideGroup = new THREE.Group();
  sideGroup.add(drumTable(L, L.travertine, 0.48, 0.2));
  const lamp = mushroomLamp(L);
  lamp.group.position.y = 0.48;
  sideGroup.add(lamp.group);
  sideGroup.position.set(-1.25, 0, 1.95);
  add(sideGroup, "decor");
  const vase = vaseBranches(L, 0.62, 9);
  vase.position.set(2.2, 0, 0.9);
  add(vase, "decor");

  const architecture = [...sh.walls, sh.floor];
  const archOrig = architecture.map((m) => m.material);

  /* stage-one drawing: edge lines, footprints and dimensions */
  const ink = new THREE.LineBasicMaterial({ color: 0x141414, transparent: true, opacity: 0 });
  const dash = new THREE.LineDashedMaterial({ color: 0x141414, dashSize: 0.1, gapSize: 0.07, transparent: true, opacity: 0 });
  const drawing = new THREE.Group();
  for (const m of architecture) {
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry, 25), ink);
    e.position.copy(m.position);
    e.rotation.copy(m.rotation);
    drawing.add(e);
  }
  root.updateMatrixWorld(true);
  for (const pc of mains) {
    const b = new THREE.Box3().setFromObject(pc.g);
    const y = 0.008;
    const loop = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(b.min.x, y, b.min.z),
        new THREE.Vector3(b.max.x, y, b.min.z),
        new THREE.Vector3(b.max.x, y, b.max.z),
        new THREE.Vector3(b.min.x, y, b.max.z),
      ]),
      dash
    );
    loop.computeLineDistances();
    drawing.add(loop);
  }
  const dimPts: number[] = [];
  const zf = D / 2 + 0.45;
  const xr = W / 2 + 0.45;
  dimPts.push(-W / 2, 0.01, zf, W / 2, 0.01, zf, -W / 2, 0.01, zf - 0.12, -W / 2, 0.01, zf + 0.12, W / 2, 0.01, zf - 0.12, W / 2, 0.01, zf + 0.12);
  dimPts.push(xr, 0.01, -D / 2, xr, 0.01, D / 2, xr - 0.12, 0.01, -D / 2, xr + 0.12, 0.01, -D / 2, xr - 0.12, 0.01, D / 2, xr + 0.12, 0.01, D / 2);
  const dimGeo = new THREE.BufferGeometry();
  dimGeo.setAttribute("position", new THREE.Float32BufferAttribute(dimPts, 3));
  drawing.add(new THREE.LineSegments(dimGeo, ink));
  root.add(drawing);

  const ghost = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.08, depthWrite: false });

  /* lighting: soft studio daylight → evening */
  const hemi = new THREE.HemisphereLight(0xeef2f8, 0x9a8a78, 1.0);
  const sun = sunLight(quality);
  const target = new THREE.Object3D();
  target.position.set(0, 0, 0.3);
  sun.target = target;
  const sunDir = new THREE.Vector3(-1, 0.75, -0.42).normalize();
  sun.position.copy(target.position).addScaledVector(sunDir, 14);

  const setMaterial = (pc: Piece, clay: boolean) => {
    for (const { m, orig } of pc.meshes) m.material = clay ? L.clay : orig;
    for (const s of pc.sprites) s.visible = !clay;
  };
  pieces.forEach((pc) => setMaterial(pc, true));
  const zen = new THREE.Color();
  const hor = new THREE.Color();

  // Real finishes go on during the scroll; compile them with the rest so
  // the switch never stalls a frame.
  const finishes = new Set<THREE.Material>([ghost, ...archOrig.flat()]);
  pieces.forEach((pc) => pc.meshes.forEach(({ orig }) => (Array.isArray(orig) ? orig : [orig]).forEach((m) => finishes.add(m))));

  return {
    root,
    lights: [hemi, sun, target],
    restP: 1,
    precompile: [...finishes],
    frame: (p) => ({
      pos: new THREE.Vector3(6.3 - p * 0.3, 4.6 - p * 0.15, 7.3),
      look: new THREE.Vector3(0, 0.95, -0.1),
    }),
    exposure: (p) => keyed(p, [
      { at: 0, v: 1.05 },
      { at: 0.76, v: 1.0 },
      { at: 1, v: 1.18 },
    ]),
    env: (p) => keyed(p, [
      { at: 0, v: 0.45 },
      { at: 0.8, v: 0.4 },
      { at: 1, v: 0.12 },
    ]),
    update: ({ p, t, px, py }) => {
      // Stage 1 — the brief: a line drawing of the room and its furniture plan
      const drawingOn = 1 - seg(p, 0.3, 0.46);
      ink.opacity = 0.75 * drawingOn;
      dash.opacity = 0.7 * drawingOn;
      drawing.visible = drawingOn > 0.01;

      // Architecture: ghost → white card model → real finishes
      const solid = seg(p, 0.18, 0.3);
      const finished = p >= 0.5;
      architecture.forEach((m, i) => {
        m.material = solid < 0.5 ? ghost : finished ? archOrig[i] : L.clay;
      });
      windowParts.visible = finished;
      ghost.opacity = 0.08 + solid * 0.4;

      // Stage 2 — concept: each main piece rises out of the floor as a white maquette
      for (const pc of mains) {
        const rise = seg(p, 0.24 + pc.order * 0.025, 0.36 + pc.order * 0.025);
        const e = 1 - Math.pow(1 - rise, 3);
        pc.g.visible = e > 0.002;
        pc.g.scale.set(1, Math.max(0.001, e), 1);
        // Stage 3 — development: the finishes go on, one piece after another
        setMaterial(pc, p < mainAt(pc.order));
      }
      // Stage 4 — delivery: styling arrives
      for (const pc of decors) {
        const a = seg(p, decorAt(pc.order), decorAt(pc.order) + 0.08);
        const e = a <= 0 ? 0 : 1 + 2.2 * Math.pow(a - 1, 3) + 1.2 * Math.pow(a - 1, 2);
        pc.g.visible = a > 0.002;
        pc.g.scale.setScalar(Math.max(0.001, e));
        setMaterial(pc, false);
      }

      // Light: bright studio day, then evening with the lamps on
      const evening = seg(p, 0.8, 0.97);
      sun.intensity = 2.6 * (1 - evening) + 0.22 * evening;
      keyedColor(evening, [
        { at: 0, c: 0xfff4e6 },
        { at: 1, c: 0xff8a52 },
      ], sun.color);
      // Evening: the daylight drains away so the lamps carry the room.
      hemi.intensity = 1.0 - evening * 0.9;
      keyedColor(evening, [
        { at: 0, c: 0xeef2f8 },
        { at: 1, c: 0x3a4266 },
      ], hemi.color);
      keyedColor(evening, [
        { at: 0, c: 0x9cc6e8 },
        { at: 1, c: 0x2a2a52 },
      ], zen);
      keyedColor(evening, [
        { at: 0, c: 0xeef6fb },
        { at: 1, c: 0xd77b5a },
      ], hor);
      sky.setSky(zen, hor);
      const lamps = clamp01(evening * 1.2);
      headboard.set(p >= mainAt(0) ? 0.25 + lamps * 0.75 : 0);
      pendants.forEach((f) => f.set(lamps));
      lamp.set(lamps);

      root.rotation.y = 0.28 - p * 0.38 + px * 0.14 + Math.sin(t * 0.1) * 0.015;
      root.rotation.x = py * 0.025;
    },
    setTheme: (dark) => {
      const c = dark ? 0xf2f2f2 : 0x141414;
      ink.color.setHex(c);
      dash.color.setHex(c);
      ghost.color.setHex(dark ? 0x2a2a2a : 0xffffff);
    },
    dispose: () => {
      architecture.forEach((m, i) => (m.material = archOrig[i]));
      pieces.forEach((pc) => setMaterial(pc, false));
      disposeTree(root, shared);
      ghost.dispose();
      sun.shadow.map?.dispose();
    },
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   LIBRARY — a reading chair in a lit niche, with the studio's materials in
   orbit; the one nearest your pointer comes forward and names itself
   ═══════════════════════════════════════════════════════════════════════════ */
export function buildLibrary(L: Lux, quality: "high" | "low"): Built {
  const root = new THREE.Group();
  const shared = new Set<THREE.Material>(Object.values(L).filter((v): v is THREE.Material => v instanceof THREE.Material));

  // travertine stage with a brass inlay
  const stage = mesh(new THREE.CylinderGeometry(1.75, 1.78, 0.18, 96), L.travertine, 0, 0.09, 0);
  root.add(stage);
  const inlay = mesh(new THREE.TorusGeometry(1.62, 0.008, 8, 160), L.brass, 0, 0.181, 0, { cast: false });
  inlay.rotation.x = Math.PI / 2;
  root.add(inlay);
  const base = 0.18;

  // arched niche wall behind
  const wallLen = 3.4;
  const archW = 1.75;
  const archH = 2.35;
  const wall = wallWithOpenings(wallLen, 2.85, 0.32, [{ kind: "arch", x: wallLen / 2, y: base, w: archW, h: archH }], L.plaster);
  wall.position.set(-wallLen / 2, 0, -0.95);
  root.add(wall);
  root.add(mesh(new THREE.BoxGeometry(archW + 0.2, archH + 0.2, 0.06), L.plasterDeep, 0, base + archH / 2, -0.95 - 0.32 - 0.03));
  const led = archLed(L, archW - 0.05, archH - 0.03, 0);
  led.mesh.position.set(0, base + 0.015, -0.95 - 0.29);
  root.add(led.mesh);
  const nicheArea = new THREE.RectAreaLight(0xffcf96, 9, archW * 0.8, 0.3);
  nicheArea.position.set(0, base + archH - 0.35, -1.12);
  nicheArea.lookAt(0, base, -0.8);
  root.add(nicheArea);

  const chair = barrelChair(L, L.leather, L.boucle);
  chair.position.set(0, base, -0.45);
  chair.rotation.y = 0.18;
  root.add(chair);
  const side = drumTable(L, L.nero, 0.46, 0.2);
  side.position.set(0.82, base, -0.2);
  root.add(side);
  const lamp = mushroomLamp(L);
  lamp.group.position.set(0.82, base + 0.46, -0.2);
  root.add(lamp.group);
  lamp.set(0.85);
  const vase = vaseBranches(L, 0.7, 5);
  vase.position.set(-0.86, base, -0.5);
  root.add(vase);

  // the material library in orbit
  const set = swatchSet(L);
  const orbit = new THREE.Group();
  orbit.position.set(0, 1.15, -0.2);
  root.add(orbit);
  const tiles = set.map((s) => {
    const holder = new THREE.Group();
    const tile = swatch(s.mat);
    holder.add(tile);
    orbit.add(holder);
    return { holder, tile, name: s.name, lift: 0 };
  });

  // gallery light: a soft spot on the chair, a dim fill
  const spot = new THREE.SpotLight(0xffe4c4, 26, 14, 0.42, 0.75, 1.6);
  spot.position.set(1.6, 5.2, 3.0);
  spot.castShadow = true;
  spot.shadow.mapSize.set(quality === "high" ? 2048 : 1024, quality === "high" ? 2048 : 1024);
  spot.shadow.bias = -0.0003;
  spot.shadow.radius = 5;
  spot.target.position.set(0, 0.5, -0.4);
  const hemi = new THREE.HemisphereLight(0xf3ece2, 0x6b5a48, 0.55);
  const key = new THREE.DirectionalLight(0xfff0dc, 0.6);
  key.position.set(-3, 4, 4);

  let active = 0;
  let lastSwitch = 0;
  const v = new THREE.Vector3();
  const q0 = new THREE.Quaternion();

  return {
    root,
    lights: [spot, spot.target, hemi, key],
    restP: 0.5,
    frame: () => ({
      pos: new THREE.Vector3(4.1, 2.7, 6.0),
      look: new THREE.Vector3(0, 1.0, -0.3),
    }),
    exposure: () => 1.05,
    update: ({ t, dt, px, py, ndc }, camera) => {
      const n = tiles.length;
      // pick: nearest tile to the pointer on screen, else a slow tour
      if (ndc) {
        let best = active;
        let bestD = Infinity;
        tiles.forEach((tl, i) => {
          tl.holder.getWorldPosition(v);
          v.project(camera);
          const d = Math.hypot(v.x - ndc.x, v.y - ndc.y);
          if (d < bestD) {
            bestD = d;
            best = i;
          }
        });
        active = best;
        lastSwitch = t;
      } else if (t - lastSwitch > 2.6) {
        active = (active + 1) % n;
        lastSwitch = t;
      }

      tiles.forEach((tl, i) => {
        const a = (i / n) * Math.PI * 2 + t * 0.11;
        const on = i === active;
        tl.lift += ((on ? 1 : 0) - tl.lift) * (1 - Math.exp(-6 * dt));
        const r = 1.85 + tl.lift * 0.45;
        const y = Math.sin(i * 1.7) * 0.45 + Math.sin(t * 0.6 + i) * 0.05 + tl.lift * 0.12;
        tl.holder.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
        // drift outward-facing; the sample in focus turns to face the viewer
        tl.holder.lookAt(orbit.position.x + Math.cos(a) * 9, orbit.position.y + y, orbit.position.z + Math.sin(a) * 9);
        if (tl.lift > 0.01) {
          q0.copy(tl.holder.quaternion);
          tl.holder.lookAt(camera.position);
          tl.holder.quaternion.copy(q0.slerp(tl.holder.quaternion, tl.lift));
        }
        tl.tile.rotation.set(Math.sin(t * 0.4 + i) * 0.1 * (1 - tl.lift), Math.sin(t * 0.5) * 0.18 * tl.lift, 0);
        tl.holder.scale.setScalar(1.15 + tl.lift * 0.55);
      });
      orbit.rotation.x = py * 0.06;
      root.rotation.y = px * 0.22 + Math.sin(t * 0.15) * 0.04;
      return tiles[active].name;
    },
    setTheme: () => {},
    dispose: () => {
      disposeTree(root, shared);
      spot.shadow.map?.dispose();
    },
  };
}

export const BUILDERS: Record<SceneVariant, (L: Lux, q: "high" | "low") => Built> = {
  living: buildSalon,
  bedroom: buildSuite,
  lounge: buildLibrary,
  residence: buildResidence,
  farmhouse: buildFarmhouse,
  skylounge: buildSkyLounge,
  atelier: buildAtelier,
};
