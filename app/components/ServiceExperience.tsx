'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

type Panel = {
  from: number;
  to: number;
  zone: string;
  eyebrow: string;
  title: string;
  desc: string;
  btn: string;
  href: string;
};

const panels: Panel[] = [
  { from: 0.05, to: 0.18, zone: 'RECEPTION', eyebrow: '01 · ABOUT F.QUAD', title: 'Where Every\nProject Begins', desc: 'Every client relationship starts with listening. We understand your vision, site, and lifestyle before a single line is drawn.', btn: 'Learn About Us', href: '/about' },
  { from: 0.28, to: 0.42, zone: 'DESIGN STUDIO', eyebrow: '02 · OUR PROCESS', title: 'Designed with\nPrecision', desc: 'Architects, designers, and visualisers working together — from initial sketch to detailed design and documentation.', btn: 'Our Process', href: '/services' },
  { from: 0.48, to: 0.60, zone: 'MODEL WORKSHOP', eyebrow: '03 · CRAFT & DETAIL', title: 'Built to\nBe Touched', desc: 'Scale models and physical mock-ups are part of how we design. We believe in feeling a space before it is built.', btn: 'View Projects', href: '/projects' },
  { from: 0.65, to: 0.78, zone: 'BOARDROOM', eyebrow: '04 · CLIENT PRESENTATIONS', title: 'Ideas Presented\nWithout Compromise', desc: 'Every design presented clearly and completely. You see exactly what you are getting — no surprises on site.', btn: 'Our Services', href: '/services' },
  { from: 0.85, to: 0.98, zone: "PRINCIPAL'S OFFICE", eyebrow: '05 · LEADERSHIP', title: 'Founded by\nAmit & Ashmi', desc: 'F.QUAD is personally led by its founders. Every project receives their direct attention from first brief to final handover.', btn: 'Start a Project', href: '/contact' },
];

export default function ServiceExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const mount = mountRef.current;
    if (!container || !mount) return;

    gsap.registerPlugin(ScrollTrigger);

    // ---------- SCENE / RENDERER / CAMERA ----------
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0F0F0F');
    scene.fog = new THREE.Fog('#0F0F0F', 18, 35);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(container.clientWidth, container.clientHeight);
    mount.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 1.7, 11);

    // ---------- LIGHTS ----------
    scene.add(new THREE.AmbientLight('#F8F4EE', 0.3));

    const dirLight = new THREE.DirectionalLight('#FFFFFF', 1.0);
    dirLight.position.set(4, 6, 2);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const reception = new THREE.PointLight('#E8D8B0', 1.2, 12);
    reception.position.set(0, 2.8, 0);
    scene.add(reception);

    const studioNorth = new THREE.PointLight('#D0E4F0', 0.5, 10);
    studioNorth.position.set(-2, 2, -6);
    scene.add(studioNorth);

    const workshopPendant = new THREE.PointLight('#E8D8B0', 0.9, 12);
    workshopPendant.position.set(0, 2.8, -13);
    scene.add(workshopPendant);

    const boardroomLight = new THREE.PointLight('#D0E4F0', 0.5, 10);
    boardroomLight.position.set(3, 1.5, -19);
    scene.add(boardroomLight);

    const spot = new THREE.SpotLight('#FFFFFF', 2);
    spot.position.set(0, 2.9, -10);
    spot.target.position.set(0, 0, -10);
    spot.angle = 0.3;
    spot.penumbra = 0.5;
    scene.add(spot);
    scene.add(spot.target);

    // ---------- BUILDER HELPERS ----------
    function box(w: number, h: number, d: number, material: THREE.Material, px: number, py: number, pz: number, rx = 0, ry = 0, rz = 0) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
      m.position.set(px, py, pz);
      m.rotation.set(rx, ry, rz);
      m.castShadow = false;
      m.receiveShadow = false;
      scene.add(m);
      return m;
    }
    function cyl(rt: number, rb: number, h: number, seg: number, material: THREE.Material, px: number, py: number, pz: number) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), material);
      m.position.set(px, py, pz);
      scene.add(m);
      return m;
    }
    function floor_mesh(w: number, h: number, d: number, material: THREE.Material, px: number, py: number, pz: number) {
      const m = box(w, h, d, material, px, py, pz);
      m.receiveShadow = true;
      return m;
    }

    // ---------- MATERIALS ----------
    function mat(c: string, r: number, mm: number) {
      return new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: mm });
    }
    function mat_t(c: string, r: number, mm: number, o: number) {
      return new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: mm, transparent: true, opacity: o });
    }
    function mat_e(c: string, i: number) {
      return new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: i });
    }

    const M = {
      concrete: mat('#C8C4BC', 0.95, 0),
      dark_c: mat('#1A1A1A', 0.9, 0),
      floor_m: mat('#E8E0D4', 0.4, 0),
      ceiling_m: mat('#F0EDE8', 1, 0),
      steel: mat('#8A8A8A', 0.3, 0.9),
      brass: mat('#7A7870', 0.4, 0.8),
      dark_wood: mat('#2A1F14', 0.7, 0),
      light_wood: mat('#9C9488', 0.6, 0),
      white_s: mat('#F5F2EE', 0.9, 0),
      black_s: mat('#0D0D0D', 0.8, 0.1),
      paper: mat('#F8F5F0', 1, 0),
      glass_m: mat_t('#C8D8E0', 0, 0, 0.25),
      sky_emit: mat_e('#FFFAF0', 0.8),
      green: mat('#2A3A20', 0.9, 0),
    };

    // ---------- STUDIO STRUCTURE (8w x 3.5h x 30d) ----------
    floor_mesh(8, 0.08, 30, M.floor_m, 0, -0.04, 0);
    floor_mesh(8, 0.08, 30, M.ceiling_m, 0, 3.58, 0);
    floor_mesh(0.12, 3.5, 30, M.concrete, -4, 1.75, 0);
    floor_mesh(0.12, 3.5, 30, M.concrete, 4, 1.75, 0);
    floor_mesh(8, 3.5, 0.12, M.dark_c, 0, 1.75, -15);
    box(0.8, 0.04, 4, M.sky_emit, 0, 3.56, 2);
    box(0.8, 0.04, 4, M.sky_emit, 0, 3.56, -6);
    box(0.8, 0.04, 4, M.sky_emit, 0, 3.56, -13);

    // ---------- ZONE 1 — RECEPTION (z 6→1) ----------
    box(6, 2.5, 0.08, M.dark_c, 0, 1.75, 5.9);
    box(2.5, 0.9, 0.7, M.dark_c, 0, 0.45, 3.5);
    box(2.7, 0.06, 0.8, M.light_wood, 0, 0.93, 3.5);
    box(2.5, 0.08, 0.7, M.brass, 0, 0.06, 3.5);
    box(0.55, 0.06, 0.55, M.white_s, -2.2, 0.45, 2.5);
    box(0.55, 0.5, 0.05, M.white_s, -2.2, 0.73, 2.27);
    box(0.55, 0.06, 0.55, M.white_s, 2.2, 0.45, 2.5);
    box(0.55, 0.5, 0.05, M.white_s, 2.2, 0.73, 2.27);
    box(0.8, 0.06, 0.5, M.dark_wood, 0, 0.38, 2.2);
    cyl(0.12, 0.1, 0.4, 8, M.concrete, 3.2, 0.2, 3);
    cyl(0.03, 0.03, 1.2, 6, M.green, 3.2, 0.8, 3);
    box(0.06, 2.2, 1.8, M.steel, 1.5, 1.1, 1.8);

    // ---------- ZONE 2 — DESIGN STUDIO (z 1→-6) ----------
    [[-1.5, -1], [-1.5, -3.5], [1.5, -1], [1.5, -3.5]].forEach(([x, z]) => {
      box(1.6, 0.05, 0.9, M.light_wood, x, 0.9, z);
      [[-0.72, -0.4], [-0.72, 0.4], [0.72, -0.4], [0.72, 0.4]].forEach(([lx, lz]) =>
        box(0.05, 0.9, 0.05, M.steel, x + lx, 0.45, z + lz));
      box(0.7, 0.45, 0.04, M.steel, x, 1.37, z - 0.38);
      box(0.08, 0.15, 0.2, M.brass, x, 1.0, z - 0.3);
      box(0.4, 0.04, 0.3, M.paper, x, 0.95, z + 0.1);
      cyl(0.22, 0.22, 0.04, 16, M.black_s, x, 0.72, z + 0.55);
      cyl(0.04, 0.04, 0.72, 8, M.steel, x, 0.36, z + 0.55);
      cyl(0.28, 0.28, 0.03, 16, M.steel, x, 0.015, z + 0.55);
    });
    box(3.5, 0.04, 0.3, M.light_wood, -3.7, 1.8, -2);
    box(3.5, 0.04, 0.3, M.light_wood, -3.7, 2.4, -2);
    [-3.0, -2.6, -2.2, -1.8, -1.4, -1.0, -0.6, -0.2].forEach((sx, i) =>
      box(0.2, 0.15, 0.25, i % 2 === 0 ? M.white_s : M.dark_c, sx, 1.9, -1.85));
    box(1.2, 0.7, 0.5, M.black_s, 3.5, 0.35, -4);
    box(1.1, 0.05, 0.01, M.paper, 3.5, 0.75, -4.26);
    box(0.05, 2.8, 4, M.white_s, 3.95, 1.4, -2);
    [-0.5, 0.2, 0.9, 1.6].forEach((pz) =>
      box(0.04, 0.6, 0.42, M.paper, 3.92, 1.8, -2 + pz));

    // ---------- ZONE 3 — MODEL WORKSHOP (z -6→-12) ----------
    box(5, 0.08, 1.2, M.light_wood, 0, 0.9, -8.5);
    [-2, -1, 0, 1, 2].forEach((lx) => box(0.06, 0.9, 0.06, M.steel, lx, 0.45, -8.5));
    box(4.8, 0.7, 1.1, M.dark_c, 0, 0.35, -8.5);
    box(0.4, 0.04, 0.3, M.white_s, -1.8, 0.94, -8.1);
    box(0.3, 0.3, 0.25, M.white_s, -1.8, 1.23, -8.1);
    box(0.5, 0.1, 0.35, M.white_s, -0.5, 0.95, -8.2);
    box(0.15, 0.5, 0.15, M.white_s, 0.5, 1.15, -7.9);
    box(0.6, 0.04, 0.4, M.white_s, 1.8, 0.94, -8.1);
    box(0.4, 0.02, 0.3, M.brass, 1.8, 0.96, -8.1);
    box(4.6, 0.02, 1.1, new THREE.MeshStandardMaterial({ color: '#2A4A2A', roughness: 1 }), 0, 0.95, -8.5);
    box(2, 0.04, 0.04, M.steel, -3.5, 2, -8.5);
    [-3.8, -3.4, -3.0, -2.6, -2.2].forEach((tx) => box(0.03, 0.3, 0.03, M.brass, tx, 1.85, -8.5));
    box(5, 0.04, 0.04, M.steel, 0, 3.4, -9);
    [-1.8, -0.9, 0, 0.9, 1.8].forEach((tx) => cyl(0.06, 0.04, 0.12, 8, M.black_s, tx, 3.33, -9));

    // ---------- ZONE 4 — BOARDROOM (z -12→-20) ----------
    box(3.6, 0.07, 1.4, M.dark_wood, 0, 0.73, -16);
    [[-1.7, -0.6], [-1.7, 0.6], [1.7, -0.6], [1.7, 0.6]].forEach(([lx, lz]) =>
      box(0.08, 0.73, 0.08, M.brass, lx, 0.365, lz - 16));
    [-1.4, -1.4, 1.4, 1.4].forEach((cx) => {
      [-15.3, -16.7].forEach((cz) => {
        box(0.5, 0.06, 0.5, M.black_s, cx, 0.55, cz);
        box(0.5, 0.55, 0.06, M.black_s, cx, 0.835, cx < 0 ? cz + 0.26 : cz - 0.26);
      });
    });
    box(3.5, 2, 0.04, M.white_s, 0, 1.75, -19.8);
    box(3.7, 2.2, 0.02, M.steel, 0, 1.75, -19.85);
    box(0.4, 0.12, 0.3, M.black_s, 0, 3.3, -15);
    box(0.04, 0.3, 0.04, M.steel, 0, 3.46, -15);
    box(3, 0.8, 0.45, M.dark_wood, -3.5, 0.4, -15.5);
    box(2.5, 0.04, 0.3, M.brass, -3.5, 1.4, -15.5);
    [-3.9, -3.3, -2.7, -2.1].forEach((ax) => {
      box(0.08, 0.3, 0.08, M.brass, ax, 1.58, -15.5);
      box(0.14, 0.04, 0.14, M.brass, ax, 1.44, -15.5);
    });
    box(0.08, 2.2, 3, M.steel, 3.96, 1.6, -15.5);
    [-15, -15.9, -16.8].forEach((wz) => box(0.04, 2, 0.9, M.glass_m, 3.94, 1.6, wz));

    // ---------- ZONE 5 — PRINCIPAL OFFICE (z -20→-30) ----------
    box(7.8, 3.5, 0.1, M.dark_c, 0, 1.75, -27);
    [0.8, 1.4, 2.0].forEach((sy) => {
      box(2, 0.04, 0.3, M.light_wood, 0, sy, -26.95);
      [-0.8, -0.4, 0, 0.4, 0.8].forEach((bx) =>
        box(0.04, sy * 0.18, 0.22, M.dark_c, bx, sy + 0.1, -26.9));
    });
    box(2.2, 0.06, 1, M.dark_wood, -0.5, 0.75, -22.5);
    box(1, 0.06, 0.8, M.dark_wood, -1.1, 0.75, -23.3);
    [[-1.4, -22], [-1.4, -23], [0.4, -22]].forEach(([lx, lz]) =>
      box(0.08, 0.75, 0.08, M.brass, lx, 0.375, lz));
    box(0.8, 0.02, 0.5, new THREE.MeshStandardMaterial({ color: '#1A1209', roughness: 0.95 }), -0.2, 0.79, -22.3);
    box(0.65, 0.08, 0.65, M.black_s, -0.5, 0.55, -21.6);
    box(0.65, 0.8, 0.08, M.black_s, -0.5, 1.0, -21.96);
    cyl(0.06, 0.06, 0.55, 8, M.steel, -0.5, 0.28, -21.6);
    cyl(0.35, 0.35, 0.03, 16, M.steel, -0.5, 0.015, -21.6);
    [-23, -24.2].forEach((lz) => {
      box(0.7, 0.45, 0.7, M.white_s, 2, 0.4, lz);
      box(0.7, 0.6, 0.08, M.white_s, 2, 0.7, lz + 0.36);
    });
    box(0.7, 0.04, 0.5, M.brass, 2, 0.38, -23.6);
    box(0.25, 3.4, 3.5, M.dark_wood, -3.88, 1.7, -24);
    [0.5, 1.0, 1.5, 2.0, 2.5, 3.0].forEach((sy) =>
      box(0.22, 0.03, 3.4, M.dark_wood, -3.88, sy, -24));
    Array.from({ length: 28 }, (_, i) =>
      box(
        0.04, 0.18 + Math.random() * 0.12, 0.22,
        i % 3 === 0 ? M.dark_c : i % 3 === 1 ? M.brass : M.white_s,
        -4.0, (i % 6) * 0.42 + 0.6, -24 + (i % 6) * 0.0 - 1.6 + ((i * 0.11) % 3.2)
      ));

    // ---------- CAMERA PATH ----------
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 1.7, 11),
      new THREE.Vector3(0, 1.65, 7),
      new THREE.Vector3(0, 1.6, 3.5),
      new THREE.Vector3(0, 1.6, 0),
      new THREE.Vector3(-0.4, 1.6, -2),
      new THREE.Vector3(0, 1.6, -5),
      new THREE.Vector3(0, 1.6, -8.5),
      new THREE.Vector3(0, 1.6, -12),
      new THREE.Vector3(0, 1.6, -16),
      new THREE.Vector3(0, 1.6, -20),
      new THREE.Vector3(0, 1.6, -23),
      new THREE.Vector3(0, 1.6, -26.5),
    ]);
    curve.tension = 0.4;

    const lookAtTarget = new THREE.Vector3();
    function updateCamera(p: number) {
      const pos = curve.getPointAt(p);
      const tan = curve.getTangentAt(Math.min(p + 0.01, 1));
      camera.position.copy(pos);
      camera.position.x += Math.sin(Date.now() * 0.0003) * 0.04; // subtle sway
      lookAtTarget.copy(pos).add(tan.multiplyScalar(2.5));
      camera.lookAt(lookAtTarget);
    }
    updateCamera(0);

    // ---------- SCROLL ----------
    ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: `+=${window.innerHeight * 8}`,
      pin: true,
      scrub: 1.5,
      onUpdate: (self) => {
        setProgress(self.progress);
        updateCamera(self.progress);
      },
    });

    // ---------- RENDER LOOP ----------
    function tick() {
      animRef.current = requestAnimationFrame(tick);
      renderer.render(scene, camera);
    }
    tick();

    // ---------- RESIZE ----------
    function handleResize() {
      const w = container!.clientWidth;
      const h = container!.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', handleResize);

    // ---------- CLEANUP ----------
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animRef.current);
      ScrollTrigger.getAll().forEach((t) => t.kill());
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  const activePanel = panels.findIndex((p) => progress >= p.from && progress <= p.to);
  const labelPanel = activePanel >= 0
    ? panels[activePanel]
    : panels[Math.max(0, panels.findIndex((p) => progress < p.from) - 1)];

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', background: '#0F0F0F' }}>
      <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />

      {/* SERVICE PANEL */}
      <div style={{
        position: 'absolute', bottom: 36, left: 36,
        background: 'rgba(10,10,10,0.88)',
        backdropFilter: 'blur(20px)',
        border: '0.5px solid rgba(248,248,246,0.1)',
        borderRadius: 6, padding: '32px 36px', maxWidth: 300,
        opacity: activePanel >= 0 ? 1 : 0,
        transform: activePanel >= 0 ? 'translateY(0)' : 'translateY(14px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
        pointerEvents: activePanel >= 0 ? 'auto' : 'none',
      }}>
        {activePanel >= 0 && (
          <>
            <div style={{ fontSize: 9, color: 'rgba(248,248,246,0.25)', letterSpacing: '0.22em', marginBottom: 6 }}>{panels[activePanel].zone}</div>
            <div style={{ fontSize: 10, color: '#9C9488', letterSpacing: '0.18em', marginBottom: 14 }}>{panels[activePanel].eyebrow}</div>
            <div style={{ fontSize: 21, color: '#FAFAF8', fontFamily: "'Good Times', sans-serif", lineHeight: 1.25, marginBottom: 14, whiteSpace: 'pre-line' }}>{panels[activePanel].title}</div>
            <div style={{ fontSize: 13, color: 'rgba(248,248,246,0.6)', lineHeight: 1.8, marginBottom: 22 }}>{panels[activePanel].desc}</div>
            <a href={panels[activePanel].href} style={{ padding: '10px 20px', border: '0.5px solid rgba(248,248,246,0.3)', color: '#FAFAF8', fontSize: 11, letterSpacing: '0.14em', textDecoration: 'none', display: 'inline-block', borderRadius: 2, fontFamily: 'inherit' }}>
              {panels[activePanel].btn}
            </a>
          </>
        )}
      </div>

      {/* ZONE LABEL top-right */}
      <div style={{ position: 'absolute', top: 28, right: 32, fontSize: 11, color: 'rgba(248,248,246,0.25)', letterSpacing: '0.2em', transition: 'opacity 0.4s' }}>
        {labelPanel?.zone ?? 'F.QUAD STUDIO'}
      </div>

      {/* PROGRESS BAR right edge */}
      <div style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)' }}>
        <div style={{ width: 1, height: 120, background: 'rgba(255,255,255,0.08)', borderRadius: 1, position: 'relative' }}>
          <div style={{ width: 1, background: 'rgba(248,248,246,0.7)', borderRadius: 1, height: progress * 120, transition: 'height 0.1s' }} />
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{ position: 'absolute', left: -3, top: i * 24, width: 7, height: 1, background: progress > i * 0.2 ? 'rgba(248,248,246,0.7)' : 'rgba(255,255,255,0.15)' }} />
          ))}
        </div>
      </div>

      {/* CONTINUE PROMPT */}
      {progress > 0.93 && (
        <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', fontSize: 10, color: 'rgba(248,248,246,0.35)', letterSpacing: '0.2em', animation: 'bounce 2s infinite' }}>
          SCROLL TO CONTINUE
        </div>
      )}
    </div>
  );
}
