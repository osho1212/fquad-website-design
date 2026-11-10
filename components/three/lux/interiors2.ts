import * as THREE from "three";
import { rng, type Lux } from "./materials";
import {
  archShape,
  clamp01,
  contactShadow,
  cyl,
  disposeTree,
  glow,
  keyed,
  keyedColor,
  mesh,
  rbox,
  reededPanel,
  seg,
  smooth,
  wallWithOpenings,
} from "./kit";
import { barrelChair, drumTable, globeFloorLamp, mushroomLamp, oliveTree, rug, sculpture, vaseBranches } from "./pieces";
import type { Built } from "./scenes";

/**
 * Two interiors for the What We Do stage, distinct from the salon and the
 * suite used elsewhere on the site:
 *
 *  SKY LOUNGE (Interior Design) — a penthouse living room behind a glazed
 *  wall onto the city: polished Nero floor with inlaid light lines, a
 *  floating stair, a halo light, a calacatta bar. Afternoon to night.
 *
 *  ATELIER (Interior Styling) — a dark gallery room being styled: an empty
 *  shell, then furniture, then the objects arriving one by one, then lit
 *  for the evening by track spots, a backlit onyx wall and shelf light.
 */

const D2R = Math.PI / 180;

function sharedSet(L: Lux) {
  return new Set<THREE.Material>(Object.values(L).filter((v): v is THREE.Material => v instanceof THREE.Material));
}

function canvasTex(w: number, h: number, paint: (g: CanvasRenderingContext2D) => void, srgb = true) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  paint(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** A material whose texture is an independently-repeated copy of `src`'s. */
function retiled<T extends THREE.MeshStandardMaterial>(src: T, rx: number, ry: number): T {
  const m = src.clone() as T;
  if (src.map) {
    m.map = src.map.clone();
    m.map.wrapS = m.map.wrapT = THREE.RepeatWrapping;
    m.map.repeat.set(rx, ry);
    m.map.needsUpdate = true;
  }
  return m;
}

/** A strip of LED (unlit, bright) whose level is set per frame. */
function ledStrip(w: number, h: number, d: number, color = 0xffd6a0) {
  const mat = new THREE.MeshBasicMaterial({ color, toneMapped: false });
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.castShadow = m.receiveShadow = false;
  const base = new THREE.Color(color);
  return {
    mesh: m,
    mat,
    set: (v: number) => {
      mat.color.copy(base).multiplyScalar(0.06 + v * 1.7);
    },
  };
}

function keyLight(quality: "high" | "low", half: number) {
  const l = new THREE.DirectionalLight(0xfff2e2, 3);
  l.castShadow = true;
  const s = quality === "high" ? 2048 : 1024;
  l.shadow.mapSize.set(s, s);
  const c = l.shadow.camera;
  c.left = -half;
  c.right = half;
  c.top = half;
  c.bottom = -half;
  c.near = 1;
  c.far = 40;
  l.shadow.bias = -0.0003;
  l.shadow.normalBias = 0.025;
  l.shadow.radius = 6;
  return l;
}

/* ═══════════════════════════════════════════════════════════════════════════
   SKY LOUNGE — Interior Design
   ═══════════════════════════════════════════════════════════════════════════ */

export function buildSkyLounge(L: Lux, quality: "high" | "low"): Built {
  const root = new THREE.Group();
  const shared = sharedSet(L);
  const own: THREE.Material[] = [];
  const ownTex: THREE.Texture[] = [];
  const keep = <M extends THREE.Material>(m: M) => (own.push(m), m);

  const W = 6.0;
  const D = 4.8;
  const H = 3.1;
  const tL = 0.3;

  /* shell: Nero floor with light inlays, a plaster side wall, glazing */
  const floorMat = keep(retiled(L.nero, 3, 2.5));
  const floor = mesh(new THREE.BoxGeometry(W + tL, 0.22, D + 0.2), [L.stoneDark, L.stoneDark, floorMat, L.stoneDark, L.stoneDark, L.stoneDark], -tL / 2, -0.11, -0.1);
  floor.castShadow = false;
  root.add(floor);

  const left = wallWithOpenings(D, H, tL, [], L.plaster);
  left.rotation.y = Math.PI / 2;
  left.position.set(-W / 2, 0, D / 2);
  root.add(left);
  // reeded plaster panel and a recessed light slot along the side wall
  const reeds = reededPanel(2.6, H - 0.2, 26, 0.03, L.plaster);
  reeds.rotation.y = Math.PI / 2;
  reeds.position.set(-W / 2 + 0.01, 0, 0.9);
  root.add(reeds);
  const slot = ledStrip(0.02, H - 0.1, 0.03);
  slot.mesh.position.set(-W / 2 + 0.015, H / 2, -0.55);
  root.add(slot.mesh);

  // shadow-only ceiling so the sun comes in through the glass only
  const ceiling = new THREE.Mesh(new THREE.BoxGeometry(W + 2, 0.1, D + 2), L.shadowOnly);
  ceiling.position.set(0, H + 0.05, 0);
  ceiling.castShadow = true;
  root.add(ceiling);

  // glazed back wall: slim black mullions, a transom line, glass
  const zG = -D / 2;
  root.add(mesh(new THREE.BoxGeometry(W + tL, 0.08, 0.14), L.blackSteel, -tL / 2, 0.04, zG));
  root.add(mesh(new THREE.BoxGeometry(W + tL, 0.08, 0.14), L.blackSteel, -tL / 2, H - 0.04, zG));
  for (let i = 0; i <= 8; i++) {
    root.add(mesh(new THREE.BoxGeometry(0.045, H, 0.12), L.blackSteel, -W / 2 + i * (W / 8), H / 2, zG, { receive: false }));
  }
  root.add(mesh(new THREE.BoxGeometry(W, 0.035, 0.1), L.blackSteel, 0, 2.2, zG, { receive: false }));
  root.add(mesh(new THREE.PlaneGeometry(W, H), L.glass, 0, H / 2, zG + 0.02, { cast: false, receive: false }));

  // the city: a painted skyline behind the glass, its windows on a second
  // (additive) layer that lights up after sunset
  const r = rng(42);
  const towers: { x: number; w: number; h: number; tone: number }[] = [];
  for (let x = -20; x < 1044; ) {
    const w = 30 + r() * 70;
    towers.push({ x, w, h: 120 + r() * 300, tone: 30 + r() * 26 });
    x += w + r() * 10;
  }
  const skyTex = canvasTex(1024, 512, (g) => {
    const grd = g.createLinearGradient(0, 0, 0, 512);
    grd.addColorStop(0, "#9fb9d3");
    grd.addColorStop(0.7, "#e7eef2");
    grd.addColorStop(1, "#f3efe8");
    g.fillStyle = grd;
    g.fillRect(0, 0, 1024, 512);
    // distant haze towers, then the near ones
    for (const t of towers) {
      g.fillStyle = `rgba(120,135,150,0.35)`;
      g.fillRect(t.x + 20, 512 - t.h * 0.7 - 30, t.w, t.h);
    }
    for (const t of towers) {
      g.fillStyle = `rgb(${t.tone},${t.tone + 4},${t.tone + 12})`;
      g.fillRect(t.x, 512 - t.h, t.w, t.h);
      g.fillStyle = "rgba(255,255,255,0.08)";
      for (let y = 512 - t.h + 8; y < 506; y += 10) for (let x = t.x + 5; x < t.x + t.w - 6; x += 8) g.fillRect(x, y, 4, 5);
    }
  });
  const winTex = canvasTex(1024, 512, (g) => {
    g.fillStyle = "#000";
    g.fillRect(0, 0, 1024, 512);
    for (const t of towers) {
      for (let y = 512 - t.h + 8; y < 506; y += 10)
        for (let x = t.x + 5; x < t.x + t.w - 6; x += 8) {
          if (r() < 0.42) {
            const warm = r() < 0.8;
            g.fillStyle = warm ? `rgba(255,${190 + r() * 40},${110 + r() * 50},1)` : "rgba(200,225,255,1)";
            g.fillRect(x, y, 4, 5);
          }
        }
    }
  });
  ownTex.push(skyTex, winTex);
  const skyMat = keep(new THREE.MeshBasicMaterial({ map: skyTex, toneMapped: true }));
  const winMat = keep(
    new THREE.MeshBasicMaterial({ map: winTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })
  );
  const sky = mesh(new THREE.PlaneGeometry(W, H), skyMat, 0, H / 2, zG - 0.09, { cast: false, receive: false });
  const city = mesh(new THREE.PlaneGeometry(W, H), winMat, 0, H / 2, zG - 0.08, { cast: false, receive: false });
  root.add(sky, city);

  // inlaid floor light lines
  const lines = [ledStrip(W - 0.6, 0.006, 0.025), ledStrip(W - 0.6, 0.006, 0.025), ledStrip(0.025, 0.006, D - 1.0)];
  lines[0].mesh.position.set(0.2, 0.003, zG + 0.32);
  lines[1].mesh.position.set(0.2, 0.003, 1.95);
  lines[2].mesh.position.set(2.6, 0.003, -0.05);
  lines.forEach((l) => root.add(l.mesh));

  /* the floating stair along the side wall */
  const treads: ReturnType<typeof ledStrip>[] = [];
  for (let i = 0; i < 12; i++) {
    const y = 0.22 + i * 0.23;
    const z = 1.75 - i * 0.3;
    root.add(mesh(rbox(0.9, 0.06, 0.28, 0.01), L.walnut, -W / 2 + 0.47, y, z));
    const led = ledStrip(0.84, 0.008, 0.02);
    led.mesh.position.set(-W / 2 + 0.47, y - 0.035, z + 0.12);
    root.add(led.mesh);
    treads.push(led);
  }
  // glass balustrade with a brass handrail
  const bal = mesh(new THREE.PlaneGeometry(3.7, 0.9), L.glass, -W / 2 + 0.93, 1.9, 0.1, { cast: false, receive: false });
  bal.rotation.y = Math.PI / 2;
  bal.rotation.z = -0.62;
  root.add(bal);

  /* lounge: lit-plinth modular sofa, oval stone table, egg chairs */
  const sx = -0.35;
  const sz = -1.25;
  root.add(mesh(rbox(2.7, 0.12, 0.98, 0.02), L.stoneDark, sx, 0.08, sz));
  const sofaGlow = ledStrip(2.6, 0.01, 0.9);
  sofaGlow.mesh.position.set(sx, 0.012, sz);
  root.add(sofaGlow.mesh);
  for (const dx of [-0.88, 0, 0.88]) root.add(mesh(rbox(0.86, 0.2, 0.86, 0.08), L.boucle, sx + dx, 0.25, sz + 0.04));
  root.add(mesh(rbox(2.7, 0.46, 0.24, 0.1), L.boucle, sx, 0.46, sz - 0.38));
  for (const dx of [-1.28, 1.28]) root.add(mesh(rbox(0.16, 0.34, 0.9, 0.07), L.boucle, sx + dx, 0.32, sz));
  root.add(mesh(rbox(0.42, 0.3, 0.12, 0.06), L.velvetEmerald, sx - 0.6, 0.5, sz - 0.2));
  root.add(mesh(rbox(0.38, 0.28, 0.12, 0.06), L.leather, sx + 0.7, 0.49, sz - 0.2));
  root.add(at(contactShadow(L, 3.2, 1.4, 0.45), sx, 0.005, sz));

  const table = new THREE.Group();
  const top = mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.06, 64), L.calacatta, 0, 0.36, 0);
  top.scale.set(1.4, 1, 0.85);
  table.add(top);
  const base = mesh(new THREE.CylinderGeometry(0.3, 0.36, 0.33, 48), L.brass, 0, 0.165, 0);
  base.scale.set(1.4, 1, 0.85);
  table.add(base);
  table.add(mesh(new THREE.SphereGeometry(0.08, 24, 16), L.bronze, 0.22, 0.46, 0.02));
  table.add(mesh(rbox(0.3, 0.04, 0.22, 0.01), L.leather, -0.25, 0.41, 0));
  table.position.set(sx, 0, -0.25);
  root.add(table);
  root.add(rug(L, 3.4, 2.5, 0.4));
  (root.children[root.children.length - 1] as THREE.Mesh).position.set(sx, 0.004, -0.55);

  // egg chairs: an open spherical shell on a brass swivel, turned so the
  // opening (local −z) faces the coffee table
  const egg = (x: number, z: number) => {
    const g = new THREE.Group();
    const shell = mesh(new THREE.SphereGeometry(0.46, 40, 24, 0, Math.PI * 1.2, 0, Math.PI * 0.62), L.leather, 0, 0.62, 0);
    g.add(shell);
    const inner = mesh(new THREE.SphereGeometry(0.43, 40, 24, 0, Math.PI * 1.2, 0, Math.PI * 0.6), L.boucle, 0, 0.63, 0);
    inner.scale.setScalar(0.98);
    g.add(inner);
    g.add(mesh(cyl(0.04, 0.04, 0.3, 16), L.brass, 0, 0.17, 0));
    g.add(mesh(cyl(0.3, 0.3, 0.03, 40), L.brass, 0, 0.015, 0));
    g.add(contactShadow(L, 1.0, 1.0, 0.45));
    g.position.set(x, 0, z);
    const dx = sx - x;
    const dz = -0.25 - z;
    g.rotation.y = Math.atan2(-dx, -dz);
    root.add(g);
  };
  egg(sx - 1.15, 0.75);
  egg(sx + 1.05, 0.8);

  /* bar: calacatta island on a reeded walnut base, under-glow, stools */
  const bx = 1.95;
  const bz = 0.4;
  const barBase = reededPanel(1.9, 0.92, 22, 0.025, L.walnut);
  barBase.rotation.y = -Math.PI / 2;
  barBase.position.set(bx - 0.3, 0, bz);
  root.add(barBase);
  root.add(mesh(new THREE.BoxGeometry(0.6, 0.92, 1.9), L.walnut, bx, 0.46, bz));
  root.add(mesh(rbox(0.78, 0.06, 2.06, 0.015), L.calacatta, bx - 0.05, 0.95, bz));
  const barGlow = ledStrip(0.02, 0.01, 1.86);
  barGlow.mesh.position.set(bx - 0.33, 0.04, bz);
  root.add(barGlow.mesh);
  for (let i = 0; i < 3; i++) {
    const z = bz - 0.6 + i * 0.6;
    root.add(mesh(cyl(0.18, 0.18, 0.06, 32), L.leather, bx - 0.75, 0.72, z));
    root.add(mesh(cyl(0.015, 0.015, 0.68, 8), L.brass, bx - 0.75, 0.36, z));
    root.add(mesh(new THREE.TorusGeometry(0.15, 0.008, 6, 32), L.brass, bx - 0.75, 0.3, z));
    (root.children[root.children.length - 1] as THREE.Mesh).rotation.x = Math.PI / 2;
    root.add(mesh(cyl(0.2, 0.2, 0.015, 32), L.brass, bx - 0.75, 0.008, z));
  }
  const bottles = vaseBranches(L, 0.32, 5);
  bottles.position.set(bx - 0.05, 0.98, bz + 0.6);
  root.add(bottles);

  // backlit onyx disc on the side wall
  const onyxMat = keep(
    new THREE.MeshStandardMaterial({ map: L.calacatta.map, emissive: 0xffb26a, emissiveMap: L.calacatta.map, emissiveIntensity: 0.1, roughness: 0.3 })
  );
  const disc = mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.04, 64), onyxMat, -W / 2 + 0.05, 2.05, 1.25, { cast: false });
  disc.rotation.z = Math.PI / 2;
  root.add(disc);
  root.add(at(mesh(new THREE.TorusGeometry(0.64, 0.018, 8, 80), L.brass, -W / 2 + 0.06, 2.05, 1.25), -W / 2 + 0.06, 2.05, 1.25));
  (root.children[root.children.length - 1] as THREE.Mesh).rotation.y = Math.PI / 2;
  const discGlow = glow(L, 2.4, 0xffb877);
  discGlow.position.set(-W / 2 + 0.3, 2.05, 1.25);
  root.add(discGlow);

  // halo light over the lounge
  const haloMat = keep(new THREE.MeshBasicMaterial({ color: 0xffe2bd, toneMapped: false }));
  const halo = mesh(new THREE.TorusGeometry(1.0, 0.022, 10, 140), haloMat, sx, 2.55, -0.55, { cast: false, receive: false });
  halo.rotation.x = Math.PI / 2;
  root.add(halo);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    root.add(mesh(cyl(0.003, 0.003, H - 2.55, 4), L.blackSteel, sx + Math.cos(a) * 1.0, 2.55 + (H - 2.55) / 2, -0.55 + Math.sin(a) * 1.0, { cast: false }));
  }
  const haloLight = new THREE.PointLight(0xffd6a8, 0, 6, 2);
  haloLight.position.set(sx, 2.3, -0.55);
  root.add(haloLight);
  const barLight = new THREE.PointLight(0xffc488, 0, 3.5, 2);
  barLight.position.set(bx - 0.4, 1.6, bz);
  root.add(barLight);

  const tree = oliveTree(L, 2.0, 12);
  tree.position.set(2.45, 0, zG + 0.55);
  root.add(tree);

  /* daylight through the glass, then night */
  const hemi = new THREE.HemisphereLight(0xdfe9f5, 0x6e6252, 0.7);
  const sun = keyLight(quality, 6);
  const target = new THREE.Object3D();
  target.position.set(0, 0, 0.4);
  sun.target = target;
  const dir = new THREE.Vector3();
  const tint = new THREE.Color();

  return {
    root,
    lights: [hemi, sun, target],
    restP: 0.82,
    frame: (p) => ({
      pos: new THREE.Vector3(8.2 - p * 0.6, 5.0 - p * 0.3, 8.8 - p * 0.4),
      look: new THREE.Vector3(-0.15, 1.15, -0.35),
    }),
    exposure: (p) => keyed(p, [
      { at: 0, v: 0.95 },
      { at: 0.5, v: 1.0 },
      { at: 0.75, v: 1.25 },
      { at: 1, v: 1.4 },
    ]),
    env: (p) => keyed(p, [
      { at: 0, v: 0.42 },
      { at: 0.55, v: 0.32 },
      { at: 0.8, v: 0.12 },
      { at: 1, v: 0.08 },
    ]),
    update: ({ p, t, px, py }) => {
      // sun sets behind the city, light raking in through the glazing
      const el = keyed(p, [
        { at: 0, v: 34 },
        { at: 0.45, v: 12 },
        { at: 0.62, v: 3 },
        { at: 1, v: -4 },
      ]) * D2R;
      const az = keyed(p, [
        { at: 0, v: 28 },
        { at: 1, v: 8 },
      ]) * D2R;
      dir.set(Math.sin(az) * Math.cos(el), Math.max(0.02, Math.sin(el)), -Math.cos(az) * Math.cos(el)).normalize();
      sun.position.copy(target.position).addScaledVector(dir, 14);
      sun.intensity = keyed(p, [
        { at: 0, v: 4.6 },
        { at: 0.45, v: 5.4 },
        { at: 0.62, v: 1.6 },
        { at: 0.72, v: 0 },
      ]);
      keyedColor(p, [
        { at: 0, c: 0xfff1df },
        { at: 0.4, c: 0xffb46a },
        { at: 0.62, c: 0xff7444 },
      ], sun.color);
      hemi.intensity = keyed(p, [
        { at: 0, v: 0.62 },
        { at: 0.5, v: 0.4 },
        { at: 0.75, v: 0.14 },
        { at: 1, v: 0.08 },
      ]);
      keyedColor(p, [
        { at: 0, c: 0xdfe9f5 },
        { at: 0.5, c: 0xffcfa0 },
        { at: 0.75, c: 0x5a64a0 },
        { at: 1, c: 0x2a3150 },
      ], hemi.color);
      keyedColor(p, [
        { at: 0, c: 0xffffff },
        { at: 0.45, c: 0xffc79a },
        { at: 0.62, c: 0xc78a8a },
        { at: 0.8, c: 0x404a78 },
        { at: 1, c: 0x1c2240 },
      ], tint);
      skyMat.color.copy(tint);

      // night comes on in a sequence: the city, the stair tread by tread,
      // then the halo, the bar, the onyx, the floor lines and the sofa glow
      const on = (a: number, span = 0.05) => clamp01((p - a) / span);
      winMat.opacity = on(0.52, 0.18) * 0.95;
      treads.forEach((tr, i) => tr.set(on(0.6 + i * 0.012, 0.03)));
      const hl = on(0.66);
      haloMat.color.setHex(0xffe2bd).multiplyScalar(0.12 + hl * 1.5);
      haloLight.intensity = hl * 5;
      const br = on(0.7);
      barGlow.set(br);
      barLight.intensity = br * 3;
      const ox = on(0.74);
      onyxMat.emissiveIntensity = 0.08 + ox * 1.4;
      (discGlow.material as THREE.SpriteMaterial).opacity = ox * 0.45;
      slot.set(on(0.72));
      lines.forEach((l, i) => l.set(on(0.78 + i * 0.03)));
      sofaGlow.set(on(0.86));

      root.rotation.y = px * 0.14 + Math.sin(t * 0.11) * 0.018;
      root.rotation.x = py * 0.02;

      const mins = Math.round((15 * 60 + p * 8 * 60) / 5) * 5;
      return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
    },
    setTheme: () => {},
    dispose: () => {
      disposeTree(root, shared);
      own.forEach((m) => m.dispose());
      ownTex.forEach((t) => t.dispose());
      floorMat.map?.dispose();
      sun.shadow.map?.dispose();
    },
  };
}

/** Places an object and returns it (Object3D.position itself is read-only). */
function at<T extends THREE.Object3D>(o: T, x: number, y: number, z: number): T {
  o.position.set(x, y, z);
  return o;
}

/* ═══════════════════════════════════════════════════════════════════════════
   ATELIER — Interior Styling
   ═══════════════════════════════════════════════════════════════════════════ */

export function buildAtelier(L: Lux, quality: "high" | "low"): Built {
  const root = new THREE.Group();
  const shared = sharedSet(L);
  const own: THREE.Material[] = [];
  const keep = <M extends THREE.Material>(m: M) => (own.push(m), m);
  const fixtures: { set: (v: number) => void }[] = [];

  const W = 5.6;
  const D = 4.6;
  const H = 3.0;
  const tB = 0.26;
  const tL = 0.3;

  const charcoal = keep(new THREE.MeshStandardMaterial({ color: 0x3a3733, roughness: 0.92 }));
  const charcoalDeep = keep(new THREE.MeshStandardMaterial({ color: 0x23211f, roughness: 0.95 }));
  const floorMat = keep(retiled(L.terrazzo, 2.6, 2.2));

  /* shell */
  const floor = mesh(new THREE.BoxGeometry(W + tL, 0.22, D + tB), [L.stoneDark, L.stoneDark, floorMat, L.stoneDark, L.stoneDark, L.stoneDark], -tL / 2, -0.11, -tB / 2);
  floor.castShadow = false;
  root.add(floor);
  const wx = (worldX: number) => worldX + W / 2 + tL; // back-wall local x
  const nicheW = 0.86;
  const nicheH = 1.95;
  const nicheY = 0.42;
  const back = wallWithOpenings(W + tL, H, tB, [
    { kind: "arch", x: wx(-1.75), y: nicheY, w: nicheW, h: nicheH },
    { kind: "arch", x: wx(1.75), y: nicheY, w: nicheW, h: nicheH },
  ], charcoal);
  back.position.set(-W / 2 - tL, 0, -D / 2);
  root.add(back);
  const left = wallWithOpenings(D, H, tL, [], charcoal);
  left.rotation.y = Math.PI / 2;
  left.position.set(-W / 2, 0, D / 2);
  root.add(left);
  const ceiling = new THREE.Mesh(new THREE.BoxGeometry(W + 2, 0.1, D + 2), L.shadowOnly);
  ceiling.position.set(0, H + 0.05, 0);
  ceiling.castShadow = true;
  root.add(ceiling);

  // niches: a deep back, lit glass shelves, objects that arrive later
  const nicheObjects: THREE.Object3D[] = [];
  const nicheLeds: ReturnType<typeof ledStrip>[] = [];
  for (const nx of [-1.75, 1.75]) {
    root.add(mesh(new THREE.BoxGeometry(nicheW + 0.1, nicheH + 0.5, 0.04), charcoalDeep, nx, nicheY + nicheH / 2, -D / 2 - tB - 0.02));
    const arch = new THREE.Mesh(new THREE.ShapeGeometry(archShape(nicheW, nicheH, 0, 0), 40), keep(new THREE.MeshStandardMaterial({ color: 0x2c2926, roughness: 0.6 })));
    arch.position.set(nx, nicheY, -D / 2 - tB + 0.005);
    root.add(arch);
    for (let s = 0; s < 3; s++) {
      const y = nicheY + 0.45 + s * 0.5;
      root.add(mesh(new THREE.BoxGeometry(nicheW - 0.04, 0.018, tB - 0.02), L.glass, nx, y, -D / 2 - tB / 2, { cast: false }));
      const led = ledStrip(nicheW - 0.08, 0.008, 0.012);
      led.mesh.position.set(nx, y + 0.42, -D / 2 - 0.02);
      root.add(led.mesh);
      nicheLeds.push(led);
      const o = s === 1 ? vaseBranches(L, 0.2, 3 + s) : mesh(new THREE.SphereGeometry(0.07, 24, 16), s ? L.ceramic : L.bronze, 0, 0.07, 0);
      o.position.set(nx, y + 0.01, -D / 2 - tB / 2);
      root.add(o);
      nicheObjects.push(o);
    }
  }

  // backlit onyx feature wall between the niches, framed in brass
  const onyxMat = keep(
    new THREE.MeshStandardMaterial({ map: L.calacatta.map, emissive: 0xffb26a, emissiveMap: L.calacatta.map, emissiveIntensity: 0.05, roughness: 0.25 })
  );
  root.add(mesh(new THREE.BoxGeometry(2.0, 2.3, 0.05), onyxMat, 0, 0.35 + 1.15, -D / 2 + 0.03, { cast: false }));
  root.add(mesh(new THREE.BoxGeometry(2.08, 0.04, 0.08), L.brass, 0, 0.33, -D / 2 + 0.04));
  root.add(mesh(new THREE.BoxGeometry(2.08, 0.04, 0.08), L.brass, 0, 2.67, -D / 2 + 0.04));
  const onyxGlow = glow(L, 3.4, 0xffb877);
  onyxGlow.position.set(0, 1.5, -D / 2 + 0.4);
  root.add(onyxGlow);
  const onyxArea = new THREE.RectAreaLight(0xffc48a, 0, 2.0, 2.3);
  onyxArea.position.set(0, 1.5, -D / 2 + 0.07);
  onyxArea.lookAt(0, 1.5, 2);
  root.add(onyxArea);

  // glass display cabinet on the side wall
  const cab = new THREE.Group();
  const cw = 2.3;
  const ch = 2.55;
  const cd = 0.46;
  cab.add(mesh(new THREE.BoxGeometry(cd, ch, 0.05), L.walnut, 0, ch / 2, -cw / 2));
  cab.add(mesh(new THREE.BoxGeometry(cd, ch, 0.05), L.walnut, 0, ch / 2, cw / 2));
  cab.add(mesh(new THREE.BoxGeometry(cd, 0.06, cw), L.walnut, 0, 0.03, 0));
  cab.add(mesh(new THREE.BoxGeometry(cd, 0.06, cw), L.walnut, 0, ch - 0.03, 0));
  cab.add(mesh(new THREE.BoxGeometry(0.03, ch, cw), charcoalDeep, -cd / 2 + 0.015, ch / 2, 0));
  cab.add(mesh(new THREE.BoxGeometry(0.02, ch - 0.1, 0.03), L.brass, cd / 2, ch / 2, 0));
  cab.add(mesh(new THREE.PlaneGeometry(cw - 0.06, ch - 0.1), L.glass, cd / 2 + 0.005, ch / 2, 0, { cast: false, receive: false }));
  (cab.children[cab.children.length - 1] as THREE.Mesh).rotation.y = Math.PI / 2;
  const cabLeds: ReturnType<typeof ledStrip>[] = [];
  const cabObjects: THREE.Object3D[] = [];
  const r = rng(77);
  for (let s = 0; s < 4; s++) {
    const y = 0.5 + s * 0.52;
    cab.add(mesh(new THREE.BoxGeometry(cd - 0.06, 0.016, cw - 0.1), L.glass, 0, y, 0, { cast: false }));
    const led = ledStrip(0.012, 0.008, cw - 0.12);
    led.mesh.position.set(cd / 2 - 0.04, y + 0.45, 0);
    cab.add(led.mesh);
    cabLeds.push(led);
    for (let k = 0; k < 3; k++) {
      const z = -cw / 2 + 0.35 + k * 0.78 + (r() - 0.5) * 0.1;
      let o: THREE.Object3D;
      const pick = (s + k) % 3;
      if (pick === 0) {
        o = new THREE.Group();
        const cols = [L.leather, L.velvetEmerald, L.linen, L.velvetOxblood];
        for (let b = 0; b < 4; b++) o.add(mesh(new THREE.BoxGeometry(0.16, 0.24 - b * 0.02, 0.035), cols[b], 0, 0.12 - b * 0.01, b * 0.04 - 0.06));
      } else if (pick === 1) {
        o = mesh(new THREE.LatheGeometry([0, 0.07, 0.11, 0.1, 0.05, 0.055].map((x, i) => new THREE.Vector2(x, i * 0.05)), 32), L.ceramic, 0, 0, 0);
      } else {
        o = mesh(new THREE.SphereGeometry(0.06, 20, 12), L.brass, 0, 0.06, 0);
      }
      o.position.set(0, y + 0.01, z);
      cab.add(o);
      cabObjects.push(o);
    }
  }
  cab.position.set(-W / 2 + cd / 2 + 0.02, 0, 0.35);
  root.add(cab);

  // track rail with spot heads and visible light cones
  root.add(mesh(new THREE.BoxGeometry(W - 0.8, 0.04, 0.05), L.blackSteel, 0.2, H - 0.06, -0.2, { cast: false }));
  const cones: THREE.MeshBasicMaterial[] = [];
  const spotsAt: [number, number, number][] = [
    [-0.4, 0.45, 0.25],
    [0.95, 0.55, -0.35],
    [-2.05, 1.0, -1.55],
    [1.9, 0.5, 1.0],
  ];
  for (const [x, yT, z] of spotsAt) {
    const head = mesh(cyl(0.05, 0.06, 0.16, 16), L.blackSteel, x, H - 0.16, -0.2, { cast: false });
    const v = new THREE.Vector3(x, yT, z).sub(head.position).normalize();
    head.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), v);
    root.add(head);
    const coneMat = keep(
      new THREE.MeshBasicMaterial({ color: 0xffdcae, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false })
    );
    cones.push(coneMat);
    const len = new THREE.Vector3(x, yT, z).distanceTo(head.position);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.42, len, 32, 1, true), coneMat);
    cone.position.copy(head.position).addScaledVector(v, len / 2);
    cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.clone().negate());
    cone.renderOrder = 3;
    root.add(cone);
  }
  const spotA = new THREE.SpotLight(0xffd6a8, 0, 7, 0.5, 0.6, 1.6);
  spotA.position.set(-0.4, H - 0.2, -0.2);
  spotA.target.position.set(-0.4, 0.4, 0.25);
  spotA.castShadow = true;
  spotA.shadow.mapSize.set(quality === "high" ? 1024 : 512, quality === "high" ? 1024 : 512);
  const spotB = new THREE.SpotLight(0xffd6a8, 0, 7, 0.45, 0.6, 1.6);
  spotB.position.set(0.95, H - 0.2, -0.2);
  spotB.target.position.set(0.95, 0.5, -0.35);
  root.add(spotA, spotA.target, spotB, spotB.target);

  /* furniture (arrives in the second stage) */
  const furniture: THREE.Object3D[] = [];
  const day = new THREE.Group();
  day.add(mesh(rbox(1.9, 0.12, 0.82, 0.03), L.walnut, 0, 0.1, 0));
  day.add(mesh(rbox(1.86, 0.2, 0.78, 0.08), L.velvetMushroom, 0, 0.26, 0));
  for (const dx of [-0.86, 0.86]) {
    const b = mesh(cyl(0.12, 0.12, 0.74, 32), L.velvetMushroom, dx, 0.46, 0);
    b.rotation.x = Math.PI / 2;
    day.add(b);
  }
  day.add(contactShadow(L, 2.3, 1.2, 0.5));
  day.position.set(-0.4, 0, 0.25);
  root.add(day);
  furniture.push(day);

  const side = drumTable(L, L.travertine, 0.5, 0.3);
  side.position.set(0.95, 0, -0.35);
  root.add(side);
  furniture.push(side);

  const chair = barrelChair(L, L.leather, L.boucle);
  chair.position.set(1.85, 0, 1.0);
  chair.rotation.y = -2.4;
  root.add(chair);
  furniture.push(chair);

  const plinth = sculpture(L);
  plinth.group.position.set(-2.05, 0, -1.55);
  root.add(plinth.group);
  furniture.push(plinth.group);

  /* styling — the objects, one by one */
  const objects: THREE.Object3D[] = [];
  const rugM = rug(L, 2.9, 2.0, 0.3);
  rugM.position.set(-0.1, 0.004, 0.25);
  objects.push(rugM);
  const throwM = mesh(rbox(0.7, 0.03, 0.8, 0.01), L.linen, 0.45, 0.37, 0.25);
  throwM.rotation.y = 0.1;
  objects.push(throwM);
  const c1 = mesh(rbox(0.42, 0.34, 0.12, 0.06), L.velvetEmerald, -0.7, 0.52, -0.05);
  c1.rotation.set(-0.2, 0.15, 0.05);
  objects.push(c1);
  const c2 = mesh(rbox(0.4, 0.32, 0.12, 0.06), L.velvetOxblood, -0.25, 0.5, -0.07);
  c2.rotation.set(-0.2, -0.1, -0.04);
  objects.push(c2);
  const vase = vaseBranches(L, 0.34, 9);
  vase.position.set(0.88, 0.5, -0.42);
  objects.push(vase);
  const books = new THREE.Group();
  [L.leather, L.linen, L.velvetEmerald].forEach((m, i) => books.add(mesh(new THREE.BoxGeometry(0.26 - i * 0.02, 0.04, 0.2), m, 0, 0.02 + i * 0.04, 0)));
  books.position.set(1.1, 0.5, -0.22);
  books.rotation.y = 0.4;
  objects.push(books);
  const lamp = mushroomLamp(L);
  lamp.group.position.set(1.1, 0.62, -0.22);
  lamp.group.scale.setScalar(0.7);
  fixtures.push(lamp);
  objects.push(lamp.group);
  const candleMat = keep(new THREE.MeshStandardMaterial({ color: 0xfff4e4, emissive: 0xffb060, emissiveIntensity: 0, roughness: 0.6 }));
  const candles = new THREE.Group();
  [0.18, 0.13, 0.1].forEach((h, i) => candles.add(mesh(cyl(0.03, 0.03, h, 16), candleMat, i * 0.08, h / 2, (i % 2) * 0.05)));
  candles.position.set(0.72, 0.5, -0.2);
  objects.push(candles);
  const floorLamp = globeFloorLamp(L);
  floorLamp.group.position.set(-1.65, 0, 0.75);
  fixtures.push(floorLamp);
  objects.push(floorLamp.group);
  const tree = oliveTree(L, 1.9, 5);
  tree.position.set(2.15, 0, -1.6);
  objects.push(tree);
  const bowl = mesh(new THREE.LatheGeometry([0.02, 0.16, 0.2, 0.21].map((x, i) => new THREE.Vector2(x, i * 0.03)), 40), L.bronze, -0.4, 0.37, 0.55);
  objects.push(bowl);
  objects.forEach((o) => root.add(o));
  const styled = [...objects, ...nicheObjects, ...cabObjects];
  const baseY = new Map<THREE.Object3D, number>();
  styled.forEach((o) => baseY.set(o, o.position.y));
  furniture.forEach((o) => baseY.set(o, o.position.y));

  /* light */
  const hemi = new THREE.HemisphereLight(0xe9eef5, 0x5a5048, 0.9);
  const key = keyLight(quality, 5.5);
  key.position.set(5, 7, 6);
  const keyT = new THREE.Object3D();
  key.target = keyT;

  const STAGES = ["Empty shell", "Furniture", "Objects & art", "Lit & styled"] as const;
  const arrive = (o: THREE.Object3D, k: number) => {
    o.visible = k > 0.001;
    o.position.y = (baseY.get(o) ?? 0) + (1 - k) * 0.45;
    o.scale.setScalar(0.6 + 0.4 * k);
  };

  return {
    root,
    lights: [hemi, key, keyT],
    restP: 1,
    frame: (p) => ({
      pos: new THREE.Vector3(7.4 - p * 0.5, 4.6 - p * 0.3, 7.9 - p * 0.4),
      look: new THREE.Vector3(0.0, 1.05, -0.2),
    }),
    exposure: (p) => keyed(p, [
      { at: 0, v: 1.05 },
      { at: 0.8, v: 1.0 },
      { at: 1, v: 1.35 },
    ]),
    env: (p) => keyed(p, [
      { at: 0, v: 0.45 },
      { at: 0.78, v: 0.35 },
      { at: 1, v: 0.1 },
    ]),
    update: ({ p, t, px, py }) => {
      furniture.forEach((o, i) => arrive(o, smooth(seg(p, 0.2 + i * 0.05, 0.27 + i * 0.05))));
      const n = styled.length;
      let placed = 0;
      styled.forEach((o, i) => {
        const a = 0.44 + (i / n) * 0.34;
        const k = smooth(seg(p, a, a + 0.04));
        if (k > 0.99) placed++;
        arrive(o, k);
      });

      // daylight gives way to the evening scheme in the last stage
      const eve = smooth(seg(p, 0.8, 0.96));
      hemi.intensity = 0.9 - eve * 0.78;
      key.intensity = 2.6 * (1 - eve) + 0.05;
      const on = (a: number) => clamp01((p - a) / 0.05);
      onyxMat.emissiveIntensity = 0.05 + on(0.8) * 1.5;
      onyxArea.intensity = on(0.8) * 10;
      (onyxGlow.material as THREE.SpriteMaterial).opacity = on(0.8) * 0.5;
      cones.forEach((m, i) => (m.opacity = on(0.84 + i * 0.025) * 0.06));
      spotA.intensity = on(0.84) * 22;
      spotB.intensity = on(0.865) * 18;
      nicheLeds.forEach((l, i) => l.set(on(0.88 + (i % 3) * 0.015)));
      cabLeds.forEach((l, i) => l.set(on(0.9 + i * 0.012)));
      fixtures.forEach((f) => f.set(on(0.92)));
      candleMat.emissiveIntensity = on(0.94) * 2.5 * (0.9 + Math.sin(t * 9) * 0.06);

      plinth.knot.rotation.y = t * 0.2;
      root.rotation.y = px * 0.14 + Math.sin(t * 0.11) * 0.018;
      root.rotation.x = py * 0.02;

      const stage = p < 0.2 ? 0 : p < 0.44 ? 1 : p < 0.8 ? 2 : 3;
      return stage === 2 ? `${STAGES[2]} · ${placed}/${n}` : STAGES[stage];
    },
    setTheme: () => {},
    dispose: () => {
      disposeTree(root, shared);
      own.forEach((m) => m.dispose());
      floorMat.map?.dispose();
      key.shadow.map?.dispose();
      spotA.shadow.map?.dispose();
    },
  };
}
