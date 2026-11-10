"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";
import { clamp, damp, onFrame, pointer, prefersReducedMotion, retainPointer } from "@/lib/motion";
import { makeLux, warmLuxCanvases } from "./lux/materials";
import { BUILDERS, type Built, type SceneVariant } from "./lux/scenes";

export type { SceneVariant };

export interface RoomSceneProps {
  /** Which model to show. Changing it swaps the model in place (no new canvas). */
  variant: SceneVariant;
  className?: string;
  /**
   * Element whose scroll progress drives the scene (a tall pinned section).
   * Without it the scene uses its own transit through the viewport.
   */
  trackRef?: React.RefObject<HTMLElement | null>;
  /**
   * Remaps the scene's own viewport transit: progress is 0 at `[0]` and 1 at
   * `[1]` (each 0–1 along the transit). Ignored when `trackRef` is set.
   */
  range?: [number, number];
  /** React to the pointer. */
  interactive?: boolean;
  /** Accessible description of what the model shows. */
  label?: string;
  /**
   * Called each rendered frame with the scene's progress and its caption
   * (the time of day, the material in focus…). Write it to the DOM directly;
   * don't set React state from here.
   */
  onState?: (state: { p: number; label?: string }) => void;
  /** Called once, when the first model has compiled and drawn its first frame. */
  onReady?: () => void;
  /**
   * Reshapes track progress before the model sees it — e.g. one long pinned
   * section that plays each of several models from 0 to 1 in turn.
   */
  mapProgress?: (p: number) => number;
  /** Other variants to build and compile in the background once ready. */
  preload?: SceneVariant[];
}

let areaLightsReady = false;

/**
 * Idle-time warm-up, called by the lazy wrapper once the page has settled:
 * paints the shared procedural textures so the first scene doesn't have to.
 */
export function warm(): void {
  warmLuxCanvases();
}

/**
 * Renders the interiors. The harness owns what every scene shares — renderer,
 * filmic tone mapping, soft shadows, studio reflections, sizing, theme, and
 * drawing only while on screen — and a builder in ./lux/scenes owns the room.
 *
 * Loading is kept off the main thread's critical path: each model's shaders
 * are compiled asynchronously (KHR_parallel_shader_compile where available)
 * in a staging scene before it is shown, instead of stalling the page for
 * 200–300ms (far longer on phones) on its first frame. Built models are
 * cached, so switching `variant` back and forth is instant.
 */
export default function RoomSceneImpl({
  variant,
  className = "",
  trackRef,
  range,
  interactive = true,
  label,
  onState,
  onReady,
  mapProgress,
  preload,
}: RoomSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const onStateRef = useRef(onState);
  onStateRef.current = onState;
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  const variantRef = useRef(variant);
  variantRef.current = variant;
  const mapRef = useRef(mapProgress);
  mapRef.current = mapProgress;
  const preloadRef = useRef(preload);
  preloadRef.current = preload;
  /** Set by the scene effect: asks it to switch to `variantRef.current`. */
  const requestRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    requestRef.current?.();
  }, [variant]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      return; // No WebGL — the surrounding layout stands on its own.
    }
    if (!areaLightsReady) {
      RectAreaLightUniformsLib.init();
      areaLightsReady = true;
    }

    const reduced = prefersReducedMotion();
    // Phones and low-core machines get smaller shadow maps, fewer particles,
    // simpler shaders and a lower pixel ratio; the look is the same.
    const quality: "high" | "low" =
      window.innerWidth < 768 || (navigator.hardwareConcurrency || 8) <= 4 ? "low" : "high";
    // 1.5 is indistinguishable from 2 on a softly lit model and draws ~44%
    // fewer pixels; phones go to 1.25.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality === "high" ? 1.5 : 1.25));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.AgXToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    // Shadows are re-rendered only when something that casts them moves
    // (see renderFrame), not on every frame.
    renderer.shadowMap.autoUpdate = false;
    const SHADOW_MAX = quality === "high" ? 1024 : 512;
    const canvas = renderer.domElement;
    canvas.style.cssText = "width:100%;height:100%;display:block;";
    host.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 120);

    // Soft studio reflections for brass, marble and glass, without an HDR file.
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new RoomEnvironment();
    scene.environment = pmrem.fromScene(envScene, 0.04).texture;
    scene.environmentIntensity = 0.45;

    const lux = makeLux(quality);
    const isDark = () => document.documentElement.getAttribute("data-theme") === "dark";

    /* ── models: built on demand, compiled off-thread, cached ───────────── */
    const cache = new Map<SceneVariant, Built>();
    const ready = new Map<SceneVariant, Promise<Built>>();
    let current: Built | null = null;
    let currentVariant: SceneVariant | null = null;
    let disposed = false;
    let announced = false;
    /** Shader compiles in flight; GPU resources must outlive them (see cleanup). */
    let inflight = 0;
    let freed = false;
    const freeGpu = () => {
      if (freed) return;
      freed = true;
      cache.forEach((b) => b.dispose());
      cache.clear();
      lux.dispose();
      envScene.dispose();
      (scene.environment as THREE.Texture | null)?.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    };

    const show = (v: SceneVariant, b: Built) => {
      if (current) scene.remove(current.root, ...current.lights);
      scene.add(b.root, ...b.lights);
      current = b;
      currentVariant = v;
      // A new model starts from where the scroll is, not from where the last
      // one's easing had got to (it would otherwise play backwards briefly).
      smoothP = progress();
      renderer.shadowMap.needsUpdate = true;
      renderOnce();
      if (!announced) {
        announced = true;
        onReadyRef.current?.();
      }
      // Then quietly prepare whichever model this canvas will be asked for
      // next (only that one — building them all at once cost memory and
      // main-thread time while the visitor was still scrolling).
      const next = (preloadRef.current ?? []).filter((pv) => !ready.has(pv));
      if (next.length) {
        const idle =
          (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number })
            .requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 800));
        idle(() => {
          if (!disposed) next.forEach((pv) => void ensure(pv));
        }, { timeout: 2500 });
      }
    };

    /** Builds a model and compiles its shaders in a staging scene, once. */
    function ensure(v: SceneVariant): Promise<Built> {
      const known = ready.get(v);
      if (known) return known;
      const p = new Promise<Built>((resolve) => {
        const b = BUILDERS[v](lux, quality);
        b.setTheme(isDark());
        cache.set(v, b);
        // Cap shadow maps: a 2048² map per light was the largest per-frame
        // cost, and at these canvas sizes 1024² is visually the same.
        [b.root, ...b.lights].forEach((o) =>
          o.traverse((n) => {
            const l = n as THREE.Light & { shadow?: THREE.LightShadow };
            if (l.shadow && l.shadow.mapSize.x > SHADOW_MAX) l.shadow.mapSize.set(SHADOW_MAX, SHADOW_MAX);
          })
        );
        const staging = new THREE.Scene();
        staging.environment = scene.environment;
        staging.environmentIntensity = scene.environmentIntensity;
        staging.add(b.root, ...b.lights);
        // Materials the model only switches to later get a stand-in mesh each,
        // so their shaders are compiled now rather than on the switch.
        const stand = new THREE.Group();
        const standGeo = new THREE.BoxGeometry(0.001, 0.001, 0.001);
        (b.precompile ?? []).forEach((mat) => {
          const m = new THREE.Mesh(standGeo, mat);
          m.castShadow = m.receiveShadow = true;
          stand.add(m);
        });
        staging.add(stand);
        // Compile from this model's own resting view.
        const cam = camera.clone();
        const f = b.frame(b.restP);
        cam.position.copy(f.pos);
        cam.lookAt(f.look);
        const done = () => {
          inflight--;
          staging.remove(b.root, ...b.lights, stand);
          standGeo.dispose();
          if (disposed) {
            if (inflight === 0) freeGpu();
            return;
          }
          resolve(b);
        };
        inflight++;
        const compile = (renderer as THREE.WebGLRenderer & {
          compileAsync?: (s: THREE.Object3D, c: THREE.Camera) => Promise<unknown>;
        }).compileAsync;
        if (compile) compile.call(renderer, staging, cam).then(done, done);
        else done();
      });
      ready.set(v, p);
      return p;
    }

    const activate = () => {
      const v = variantRef.current;
      if (disposed || v === currentVariant) return;
      void ensure(v).then((b) => {
        // The visitor may have moved on while this compiled.
        if (!disposed && variantRef.current === v && currentVariant !== v) show(v, b);
      });
    };
    requestRef.current = activate;

    const applyTheme = () => {
      const dark = isDark();
      cache.forEach((b) => b.setTheme(dark));
    };
    const themeObserver = new MutationObserver(() => {
      applyTheme();
      renderer.shadowMap.needsUpdate = true;
      renderOnce();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const resize = () => {
      const w = Math.max(1, host.clientWidth);
      const h = Math.max(1, host.clientHeight);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.fov = 30;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(() => {
      resize();
      renderer.shadowMap.needsUpdate = true;
      renderOnce();
    });
    ro.observe(host);

    const releasePointer = interactive && !reduced ? retainPointer() : () => {};

    const progress = (): number => {
      if (reduced) return current?.restP ?? 0.5;
      const vh = window.innerHeight;
      const trackEl = trackRef?.current;
      if (trackEl) {
        const r = trackEl.getBoundingClientRect();
        const raw = clamp(-r.top / Math.max(1, r.height - vh));
        return mapRef.current ? clamp(mapRef.current(raw)) : raw;
      }
      const r = host.getBoundingClientRect();
      const transit = clamp(1 - (r.top + r.height) / (vh + r.height));
      return range ? clamp((transit - range[0]) / (range[1] - range[0])) : transit;
    };

    // The global pointer is window-relative; picking needs it in this
    // canvas's own normalised device coordinates.
    const pointerNdc = (): { x: number; y: number } | null => {
      if (!interactive || reduced || (pointer.tx === 0 && pointer.ty === 0)) return null;
      const r = host.getBoundingClientRect();
      const x = ((pointer.tx + 1) / 2) * window.innerWidth;
      const y = ((pointer.ty + 1) / 2) * window.innerHeight;
      if (x < r.left || x > r.right || y < r.top || y > r.bottom) return null;
      return { x: ((x - r.left) / r.width) * 2 - 1, y: -(((y - r.top) / r.height) * 2 - 1) };
    };

    /*
     * Auto-fit. Each model is measured once (its visible geometry, not the
     * shadow-only blockers) and the camera is pulled back along the scene's
     * own viewing direction until every corner of that box sits inside the
     * frame with a margin — whatever the canvas size or shape. The scene's
     * framing still sets the angle and its motion over the scroll; only the
     * distance and the aim point come from the model itself, so a model can
     * never be clipped by its frame.
     */
    const MARGIN_X = 0.9;
    const MARGIN_Y = 0.86;
    const fits = new WeakMap<Built, { center: THREE.Vector3; corners: THREE.Vector3[]; aspect: number; ratio: number }>();
    const probeCam = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
    const tmpBox = new THREE.Box3();
    const tmpV = new THREE.Vector3();

    function measure(b: Built) {
      const box = new THREE.Box3();
      const rot = b.root.rotation.clone();
      b.root.rotation.set(0, 0, 0);
      b.root.updateMatrixWorld(true);
      // Corners of every mesh's own box, not one box around everything: a
      // cut-away room's overall box has empty corners (the missing walls)
      // that would hold the camera needlessly far back.
      const corners: THREE.Vector3[] = [];
      b.root.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh || m.material === lux.shadowOnly) return;
        if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
        tmpBox.copy(m.geometry.boundingBox!).applyMatrix4(m.matrixWorld);
        box.union(tmpBox);
        for (let i = 0; i < 8; i++) {
          corners.push(new THREE.Vector3(i & 1 ? tmpBox.max.x : tmpBox.min.x, i & 2 ? tmpBox.max.y : tmpBox.min.y, i & 4 ? tmpBox.max.z : tmpBox.min.z));
        }
      });
      b.root.rotation.copy(rot);
      b.root.updateMatrixWorld(true);
      return { center: box.getCenter(new THREE.Vector3()), corners };
    }

    /** Does the model fit when the camera sits `d` from its centre along `dir`? */
    function fitsAt(center: THREE.Vector3, corners: THREE.Vector3[], dir: THREE.Vector3, d: number) {
      probeCam.aspect = camera.aspect;
      probeCam.fov = camera.fov;
      probeCam.updateProjectionMatrix();
      probeCam.position.copy(center).addScaledVector(dir, d);
      probeCam.lookAt(center);
      probeCam.updateMatrixWorld(true);
      const tanV = Math.tan((probeCam.fov * Math.PI) / 360);
      const tanH = tanV * probeCam.aspect;
      for (const c of corners) {
        tmpV.copy(c).applyMatrix4(probeCam.matrixWorldInverse);
        const z = -tmpV.z;
        if (z < 0.2) return false;
        if (Math.abs(tmpV.x / z) > tanH * MARGIN_X || Math.abs(tmpV.y / z) > tanV * MARGIN_Y) return false;
      }
      return true;
    }

    function fitFor(b: Built) {
      let fit = fits.get(b);
      if (fit && Math.abs(fit.aspect - camera.aspect) < 1e-3) return fit;
      const m = fit ?? measure(b);
      const f = b.frame(b.restP);
      const dir = f.pos.clone().sub(f.look);
      const base = dir.length();
      dir.normalize();
      // Smallest distance that fits (fitting is monotonic in distance); then
      // re-aim at the middle of the model's on-screen extent and fit again,
      // so the margin is even on all sides.
      const center = m.center.clone();
      const solve = () => {
        let lo = 0.5;
        let hi = 120;
        for (let i = 0; i < 22; i++) {
          const mid = (lo + hi) / 2;
          if (fitsAt(center, m.corners, dir, mid)) hi = mid;
          else lo = mid;
        }
        return hi;
      };
      for (let pass = 0; pass < 2; pass++) {
        const d = solve();
        probeCam.position.copy(center).addScaledVector(dir, d);
        probeCam.lookAt(center);
        probeCam.updateMatrixWorld(true);
        let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
        for (const c of m.corners) {
          tmpV.copy(c).applyMatrix4(probeCam.matrixWorldInverse);
          const z = -tmpV.z;
          x0 = Math.min(x0, tmpV.x / z);
          x1 = Math.max(x1, tmpV.x / z);
          y0 = Math.min(y0, tmpV.y / z);
          y1 = Math.max(y1, tmpV.y / z);
        }
        const right = new THREE.Vector3().setFromMatrixColumn(probeCam.matrixWorld, 0);
        const up = new THREE.Vector3().setFromMatrixColumn(probeCam.matrixWorld, 1);
        center.addScaledVector(right, ((x0 + x1) / 2) * d).addScaledVector(up, ((y0 + y1) / 2) * d);
      }
      fit = { center, corners: m.corners, aspect: camera.aspect, ratio: solve() / base };
      fits.set(b, fit);
      return fit;
    }

    function placeCamera(b: Built, p: number) {
      const fit = fitFor(b);
      const f = b.frame(p);
      const dir = f.pos.sub(f.look);
      camera.position.copy(fit.center).addScaledVector(dir, fit.ratio);
      camera.lookAt(fit.center);
    }

    let smoothP = progress();
    let time = 0;
    let lastLabel: string | undefined;
    // What the shadows were last drawn for, and when the last frame was drawn.
    let shadowP = -1;
    let shadowPx = 0;
    let shadowPy = 0;
    let framesSinceShadow = 0;
    let sinceDraw = 1;

    function renderFrame(dt: number, force = true) {
      const b = current;
      if (!b) return;
      const target = progress();
      const px = interactive && !reduced ? pointer.x : 0;
      const py = interactive && !reduced ? pointer.y : 0;
      // Settled (no scroll easing left, pointer still): the scene only has
      // its slow idle drift, so draw at ~20fps instead of every frame.
      sinceDraw += dt;
      const settled = Math.abs(target - smoothP) < 0.0004 && Math.abs(px - shadowPx) + Math.abs(py - shadowPy) < 0.002;
      if (!force && settled && sinceDraw < 0.05) return;
      sinceDraw = 0;
      smoothP = reduced ? target : damp(smoothP, target, 6, dt);
      // Shadows follow the sun (progress) and the model (pointer sway); the
      // idle drift alone only refreshes them every few draws.
      framesSinceShadow++;
      if (Math.abs(smoothP - shadowP) > 0.0015 || Math.abs(px - shadowPx) + Math.abs(py - shadowPy) > 0.004 || framesSinceShadow > 8) {
        renderer.shadowMap.needsUpdate = true;
        shadowP = smoothP;
        shadowPx = px;
        shadowPy = py;
        framesSinceShadow = 0;
      }
      placeCamera(b, smoothP);
      const caption = b.update(
        {
          p: smoothP,
          t: time,
          dt,
          px,
          py,
          ndc: pointerNdc(),
        },
        camera
      );
      renderer.toneMappingExposure = b.exposure ? b.exposure(smoothP) : 1;
      scene.environmentIntensity = b.env ? b.env(smoothP) : 0.45;
      renderer.render(scene, camera);
      const lbl = caption || undefined;
      if (onStateRef.current && (lbl !== lastLabel || !reduced)) {
        lastLabel = lbl;
        onStateRef.current({ p: smoothP, label: lbl });
      }
    }
    function renderOnce() {
      renderer.shadowMap.needsUpdate = true;
      renderFrame(1 / 60, true);
    }

    let stop: (() => void) | null = null;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !stop && !reduced) {
          stop = onFrame((_, dt) => {
            if (document.hidden) return;
            time += dt;
            renderFrame(dt, false);
          });
        } else if (!entry.isIntersecting && stop) {
          stop();
          stop = null;
        }
      },
      { rootMargin: "15% 0px" }
    );
    io.observe(host);
    activate();

    return () => {
      disposed = true;
      requestRef.current = null;
      stop?.();
      io.disconnect();
      ro.disconnect();
      themeObserver.disconnect();
      releasePointer();
      canvas.remove();
      // three polls each material's program while compileAsync runs; freeing
      // them mid-compile throws inside its timer. Let a pending compile
      // settle first (its `done` frees everything once it sees `disposed`).
      if (inflight === 0) freeGpu();
    };
    // `range` is a fresh array each render; key the effect on its values.
    // `variant` is read through variantRef and handled by the effect above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackRef, interactive, range?.[0], range?.[1]]);

  return (
    <div
      ref={hostRef}
      role="img"
      aria-label={label ?? "Interactive 3D model"}
      className={`fq-scene ${className}`}
    />
  );
}
