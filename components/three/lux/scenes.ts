import * as THREE from "three";
import { swatchSet, type Lux } from "./materials";

import { disposeTree,
  mesh,
  wallWithOpenings } from "./kit";
import {
  archLed,
  barrelChair,
  drumTable,
  mushroomLamp,
  swatch,
  vaseBranches,
} from "./pieces";

/**
 * The one 3D scene the site shows: the material library in the footer.
 * (Every other room, and the How We Work suite, have been removed.)
 */
export type SceneVariant = "lounge";

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
  lounge: buildLibrary,
};
