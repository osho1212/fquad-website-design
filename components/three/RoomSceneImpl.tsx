"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";
import { clamp, damp, onFrame, pointer, prefersReducedMotion, retainPointer } from "@/lib/motion";
import { makeLux } from "./lux/materials";
import { BUILDERS, type SceneVariant } from "./lux/scenes";

export type { SceneVariant };

export interface RoomSceneProps {
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
}

let areaLightsReady = false;

/**
 * Renders one interior. The harness owns what every scene shares — renderer,
 * filmic tone mapping, soft shadows, studio reflections, sizing, theme, and
 * drawing only while on screen — and a builder in ./lux/scenes owns the room.
 */
export default function RoomSceneImpl({
  variant,
  className = "",
  trackRef,
  range,
  interactive = true,
  label,
  onState,
}: RoomSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const onStateRef = useRef(onState);
  onStateRef.current = onState;

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
    // Phones and low-core machines get smaller shadow maps, fewer particles
    // and a lower pixel ratio; the look is the same, the cost is not.
    const quality: "high" | "low" =
      window.innerWidth < 768 || (navigator.hardwareConcurrency || 8) <= 4 ? "low" : "high";
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality === "high" ? 2 : 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.AgXToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    const canvas = renderer.domElement;
    canvas.style.cssText = "width:100%;height:100%;display:block;";
    host.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80);

    // Soft studio reflections for brass, marble and glass, without an HDR file.
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new RoomEnvironment();
    scene.environment = pmrem.fromScene(envScene, 0.04).texture;
    scene.environmentIntensity = 0.45;

    const lux = makeLux();
    const built = BUILDERS[variant](lux, quality);
    scene.add(built.root, ...built.lights);

    const applyTheme = () => built.setTheme(document.documentElement.getAttribute("data-theme") === "dark");
    applyTheme();
    const themeObserver = new MutationObserver(() => {
      applyTheme();
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
      renderOnce();
    });
    ro.observe(host);

    const releasePointer = interactive && !reduced ? retainPointer() : () => {};

    const progress = (): number => {
      if (reduced) return built.restP;
      const vh = window.innerHeight;
      const trackEl = trackRef?.current;
      if (trackEl) {
        const r = trackEl.getBoundingClientRect();
        return clamp(-r.top / Math.max(1, r.height - vh));
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

    let smoothP = progress();
    let time = 0;
    let lastLabel: string | undefined;

    const renderFrame = (dt: number) => {
      const target = progress();
      smoothP = reduced ? target : damp(smoothP, target, 6, dt);
      // Scenes are framed for a ~5:4 box; narrower boxes (a tall column, a
      // phone) pull the camera back along the same line so nothing is cropped.
      const f = built.frame(smoothP);
      const fit = camera.aspect < 1.25 ? Math.pow(1.25 / camera.aspect, 0.85) : 1;
      camera.position.copy(f.look).add(f.pos.sub(f.look).multiplyScalar(fit));
      camera.lookAt(f.look);
      const caption = built.update(
        {
          p: smoothP,
          t: time,
          dt,
          px: interactive && !reduced ? pointer.x : 0,
          py: interactive && !reduced ? pointer.y : 0,
          ndc: pointerNdc(),
        },
        camera
      );
      if (built.exposure) renderer.toneMappingExposure = built.exposure(smoothP);
      if (built.env) scene.environmentIntensity = built.env(smoothP);
      renderer.render(scene, camera);
      const lbl = caption || undefined;
      if (onStateRef.current && (lbl !== lastLabel || !reduced)) {
        lastLabel = lbl;
        onStateRef.current({ p: smoothP, label: lbl });
      }
    };
    const renderOnce = () => renderFrame(1 / 60);

    let stop: (() => void) | null = null;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !stop && !reduced) {
          stop = onFrame((_, dt) => {
            if (document.hidden) return;
            time += dt;
            renderFrame(dt);
          });
        } else if (!entry.isIntersecting && stop) {
          stop();
          stop = null;
        }
      },
      { rootMargin: "15% 0px" }
    );
    io.observe(host);
    renderOnce();

    return () => {
      stop?.();
      io.disconnect();
      ro.disconnect();
      themeObserver.disconnect();
      releasePointer();
      built.dispose();
      lux.dispose();
      envScene.dispose();
      (scene.environment as THREE.Texture | null)?.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
    // `range` is a fresh array each render; key the effect on its values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant, trackRef, interactive, range?.[0], range?.[1]]);

  return (
    <div
      ref={hostRef}
      role="img"
      aria-label={label ?? "Interactive 3D interior"}
      className={`fq-scene ${className}`}
    />
  );
}
