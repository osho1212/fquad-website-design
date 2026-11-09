import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { Lux } from "./materials";

/* ── primitives ─────────────────────────────────────────────────────────── */

export function mesh<G extends THREE.BufferGeometry>(
  geo: G,
  mat: THREE.Material | THREE.Material[],
  x = 0,
  y = 0,
  z = 0,
  { cast = true, receive = true } = {}
) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = cast;
  m.receiveShadow = receive;
  return m;
}

export const rbox = (w: number, h: number, d: number, r = 0.03, seg = 4) =>
  new RoundedBoxGeometry(w, h, d, seg, Math.max(0.002, Math.min(r, Math.min(w, h, d) / 2 - 0.002)));

export const cyl = (rTop: number, rBot: number, h: number, seg = 48) =>
  new THREE.CylinderGeometry(rTop, rBot, h, seg);

/* ── shapes ─────────────────────────────────────────────────────────────── */

/** A rectangle with a semicircular head, base at y = 0, centred on x. */
export function archShape(w: number, h: number, cx = 0, y0 = 0): THREE.Shape {
  const s = new THREE.Shape();
  const r = w / 2;
  s.moveTo(cx - r, y0);
  s.lineTo(cx - r, y0 + h - r);
  s.absarc(cx, y0 + h - r, r, Math.PI, 0, true);
  s.lineTo(cx + r, y0);
  s.closePath();
  return s;
}

function archPath(w: number, h: number, cx: number, y0: number): THREE.Path {
  const p = new THREE.Path();
  const r = w / 2;
  p.moveTo(cx - r, y0);
  p.lineTo(cx + r, y0);
  p.lineTo(cx + r, y0 + h - r);
  p.absarc(cx, y0 + h - r, r, 0, Math.PI, false);
  p.lineTo(cx - r, y0);
  return p;
}

/** The centre line of an arch's head and jambs (for LED strips and frames). */
export function archCurve(w: number, h: number, cx = 0, y0 = 0, z = 0): THREE.CurvePath<THREE.Vector3> {
  const r = w / 2;
  const path = new THREE.CurvePath<THREE.Vector3>();
  path.add(new THREE.LineCurve3(new THREE.Vector3(cx - r, y0, z), new THREE.Vector3(cx - r, y0 + h - r, z)));
  const arc = new THREE.EllipseCurve(cx, y0 + h - r, r, r, Math.PI, 0, true);
  const pts = arc.getPoints(48).map((p) => new THREE.Vector3(p.x, p.y, z));
  for (let i = 0; i < pts.length - 1; i++) path.add(new THREE.LineCurve3(pts[i], pts[i + 1]));
  path.add(new THREE.LineCurve3(new THREE.Vector3(cx + r, y0 + h - r, z), new THREE.Vector3(cx + r, y0, z)));
  return path;
}

export interface Opening {
  kind: "arch" | "rect";
  /** Centre along the wall (wall-local x). */
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * A wall slab (x along the wall, y up, thickness t into −z) with arched or
 * rectangular openings cut clean through — real geometry, so light passes
 * through and shadows have the right shape.
 */
export function wallWithOpenings(len: number, height: number, t: number, openings: Opening[], mat: THREE.Material) {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(len, 0);
  s.lineTo(len, height);
  s.lineTo(0, height);
  s.closePath();
  for (const o of openings) {
    if (o.kind === "arch") s.holes.push(archPath(o.w, o.h, o.x, o.y));
    else {
      const p = new THREE.Path();
      p.moveTo(o.x - o.w / 2, o.y);
      p.lineTo(o.x + o.w / 2, o.y);
      p.lineTo(o.x + o.w / 2, o.y + o.h);
      p.lineTo(o.x - o.w / 2, o.y + o.h);
      p.lineTo(o.x - o.w / 2, o.y);
      s.holes.push(p);
    }
  }
  const geo = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false, curveSegments: 40 });
  geo.translate(0, 0, -t);
  return mesh(geo, mat);
}

/**
 * Reeded (convex half-round) panel facing +z. One displaced plane plus a
 * backing slab — cheap, and it catches raking light beautifully.
 */
export function reededPanel(w: number, h: number, reeds: number, depth: number, mat: THREE.Material) {
  const seg = reeds * 10;
  const geo = new THREE.PlaneGeometry(w, h, seg, 1);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const u = (pos.getX(i) + w / 2) / w;
    const t = (u * reeds) % 1;
    const z = depth * Math.sqrt(Math.max(0, 1 - (2 * t - 1) ** 2));
    pos.setZ(i, z);
  }
  geo.computeVertexNormals();
  const g = new THREE.Group();
  g.add(mesh(geo, mat, 0, h / 2, 0));
  g.add(mesh(new THREE.BoxGeometry(w, h, 0.02), mat, 0, h / 2, -0.01));
  return g;
}

/**
 * Ring sector (a curve of seating) extruded upward with soft edges. Angles
 * in radians, measured from +x toward +z; origin at the circle's centre.
 */
export function sector(
  rIn: number,
  rOut: number,
  a0: number,
  a1: number,
  height: number,
  mat: THREE.Material,
  bevel = 0.05
) {
  const s = new THREE.Shape();
  s.absarc(0, 0, rOut, a0, a1, false);
  s.absarc(0, 0, rIn, a1, a0, true);
  s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, {
    depth: Math.max(0.01, height - bevel * 2),
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 5,
    curveSegments: 64,
  });
  // Rotating +90° about x maps the shape's y onto world +z (so angles read
  // from +x toward +z) and sends the extrusion downward; lift it so the
  // piece sits on y = 0 and tops out at `height`.
  geo.rotateX(Math.PI / 2);
  geo.translate(0, height - bevel, 0);
  return mesh(geo, mat);
}

/** Fluted (concave grooves) cylinder — pedestals, drums, column bases. */
export function flutedCylinder(r: number, h: number, flutes: number, depth: number, mat: THREE.Material) {
  const geo = new THREE.CylinderGeometry(r, r, h, flutes * 8, 1);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const rr = Math.hypot(v.x, v.z);
    if (rr < 1e-4) continue;
    const a = Math.atan2(v.z, v.x);
    const t = ((a / (Math.PI * 2)) * flutes) % 1;
    const k = 1 - depth * Math.sqrt(Math.max(0, 1 - (2 * ((t + 1) % 1) - 1) ** 2));
    pos.setX(i, (v.x / rr) * r * k);
    pos.setZ(i, (v.z / rr) * r * k);
  }
  geo.computeVertexNormals();
  return mesh(geo, mat, 0, h / 2, 0);
}

/* ── light helpers ──────────────────────────────────────────────────────── */

/** An additive halo — the "bloom" around a bulb, without post-processing. */
export function glow(L: Lux, size: number, color = 0xffd2a0) {
  const mat = new THREE.SpriteMaterial({
    map: L.glowTex,
    color,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
  const s = new THREE.Sprite(mat);
  s.scale.setScalar(size);
  return s;
}

/** A soft dark disc under a piece — grounds it like ambient occlusion would. */
export function contactShadow(L: Lux, w: number, d: number, opacity = 0.55) {
  const mat = new THREE.MeshBasicMaterial({
    map: L.shadowTex,
    transparent: true,
    opacity,
    depthWrite: false,
    toneMapped: false,
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
  m.rotation.x = -Math.PI / 2;
  m.position.y = 0.004;
  m.renderOrder = 1;
  return m;
}

/** Dimmer-controlled warm point light, attached to a lamp. */
export function bulb(color = 0xffc488, distance = 4.5) {
  const l = new THREE.PointLight(color, 0, distance, 2);
  l.castShadow = false;
  return l;
}

/* ── small helpers ─────────────────────────────────────────────────────── */

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const smooth = (t: number) => t * t * (3 - 2 * t);
export const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

/** Piecewise interpolation over keyframes [{at, value}] (numbers or colours). */
export function keyed(p: number, keys: { at: number; v: number }[]): number {
  if (p <= keys[0].at) return keys[0].v;
  for (let i = 1; i < keys.length; i++) {
    if (p <= keys[i].at) {
      const t = smooth((p - keys[i - 1].at) / (keys[i].at - keys[i - 1].at));
      return lerp(keys[i - 1].v, keys[i].v, t);
    }
  }
  return keys[keys.length - 1].v;
}

const _c1 = new THREE.Color();
const _c2 = new THREE.Color();
export function keyedColor(p: number, keys: { at: number; c: number }[], out: THREE.Color) {
  if (p <= keys[0].at) return out.setHex(keys[0].c);
  for (let i = 1; i < keys.length; i++) {
    if (p <= keys[i].at) {
      const t = smooth((p - keys[i - 1].at) / (keys[i].at - keys[i - 1].at));
      _c1.setHex(keys[i - 1].c);
      _c2.setHex(keys[i].c);
      return out.copy(_c1).lerp(_c2, t);
    }
  }
  return out.setHex(keys[keys.length - 1].c);
}

/** Free every geometry and any material not owned by the shared library. */
export function disposeTree(root: THREE.Object3D, shared: Set<THREE.Material>) {
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    m.geometry?.dispose?.();
    const mat = m.material as THREE.Material | THREE.Material[] | undefined;
    if (!mat) return;
    (Array.isArray(mat) ? mat : [mat]).forEach((x) => {
      if (!shared.has(x)) x.dispose();
    });
  });
}
