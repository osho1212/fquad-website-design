import * as THREE from "three";

/**
 * The material library behind the interior scenes. Everything is procedural —
 * drawn onto canvases at load — so the scenes ship no image or model files,
 * yet read as real finishes: herringbone smoked oak, travertine, Nero
 * Marquina and Calacatta marble, limewash plaster, bouclé, velvet with sheen,
 * champagne brass.
 */

/* ── tiny deterministic randomness (same textures on every load) ───────── */
export function rng(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvas(w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!, w, h);
  return c;
}

function texture(
  c: HTMLCanvasElement,
  { srgb = true, repeat }: { srgb?: boolean; repeat?: [number, number] } = {}
) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (repeat) t.repeat.set(repeat[0], repeat[1]);
  return t;
}

/* ── surface generators ─────────────────────────────────────────────────── */

/**
 * Classic 45° herringbone. The 90° pattern (lattice (w,w) & (L,−L)) is drawn
 * on a canvas rotated 45°, which turns the lattice into axis-aligned
 * w√2 × L√2 cells — so a 512px canvas tiles seamlessly.
 */
function herringbone(tone: "smoked" | "washed") {
  const r = rng(tone === "smoked" ? 41 : 17);
  const size = 512;
  const w = 64 / Math.SQRT2; // plank width  (64px period across)
  const L = 4 * w; //              plank length (256px period down)
  const base = tone === "smoked" ? { h: 28, s: 26, l: 31 } : { h: 34, s: 24, l: 70 };
  return canvas(size, size, (g) => {
    g.fillStyle = `hsl(${base.h} ${base.s}% ${base.l}%)`;
    g.fillRect(0, 0, size, size);
    g.save();
    g.translate(size / 2, size / 2);
    g.rotate(-Math.PI / 4);
    const plank = (x: number, y: number, pw: number, ph: number, along: "x" | "y") => {
      const dl = (r() - 0.5) * (tone === "smoked" ? 9 : 7);
      const dh = (r() - 0.5) * 6;
      g.fillStyle = `hsl(${base.h + dh} ${base.s + (r() - 0.5) * 8}% ${base.l + dl}%)`;
      g.fillRect(x, y, pw, ph);
      // grain: long soft strokes along the plank
      g.lineWidth = 1;
      for (let k = 0; k < 7; k++) {
        g.strokeStyle = `rgba(${tone === "smoked" ? "20,12,6" : "90,64,40"},${0.05 + r() * 0.08})`;
        g.beginPath();
        if (along === "x") {
          const yy = y + 3 + r() * (ph - 6);
          g.moveTo(x, yy);
          g.bezierCurveTo(x + pw * 0.3, yy + (r() - 0.5) * 3, x + pw * 0.7, yy + (r() - 0.5) * 3, x + pw, yy);
        } else {
          const xx = x + 3 + r() * (pw - 6);
          g.moveTo(xx, y);
          g.bezierCurveTo(xx + (r() - 0.5) * 3, y + ph * 0.3, xx + (r() - 0.5) * 3, y + ph * 0.7, xx, y + ph);
        }
        g.stroke();
      }
      // micro-bevel between boards
      g.strokeStyle = tone === "smoked" ? "rgba(8,5,3,0.55)" : "rgba(70,50,30,0.35)";
      g.lineWidth = 1.2;
      g.strokeRect(x + 0.6, y + 0.6, pw - 1.2, ph - 1.2);
    };
    const span = 14;
    for (let s = -span; s <= span; s++) {
      for (let k = -span * 2; k <= span * 2; k++) {
        const bx = s * L + k * w;
        const by = -s * L + k * w;
        plank(bx, by, L, w, "x");
        plank(bx + L, by - (L - w), w, L, "y");
      }
    }
    g.restore();
  });
}

function travertine() {
  const r = rng(7);
  return canvas(512, 512, (g, w, h) => {
    g.fillStyle = "#d8c7aa";
    g.fillRect(0, 0, w, h);
    // horizontal sediment bands
    for (let i = 0; i < 90; i++) {
      const y = r() * h;
      g.strokeStyle = r() > 0.5 ? `rgba(255,248,232,${0.08 + r() * 0.12})` : `rgba(150,124,88,${0.06 + r() * 0.1})`;
      g.lineWidth = 1 + r() * 5;
      g.beginPath();
      g.moveTo(0, y);
      for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * 0.02 + i) * 2 + (r() - 0.5) * 2);
      g.stroke();
    }
    // the pits that make travertine travertine
    for (let i = 0; i < 260; i++) {
      g.fillStyle = `rgba(120,96,64,${0.25 + r() * 0.35})`;
      g.beginPath();
      g.ellipse(r() * w, r() * h, 1 + r() * 6, 0.6 + r() * 1.6, 0, 0, Math.PI * 2);
      g.fill();
    }
  });
}

function marble(kind: "nero" | "calacatta") {
  const r = rng(kind === "nero" ? 3 : 29);
  return canvas(512, 512, (g, w, h) => {
    g.fillStyle = kind === "nero" ? "#141414" : "#f3f0ea";
    g.fillRect(0, 0, w, h);
    // cloudy depth
    for (let i = 0; i < 40; i++) {
      const grd = g.createRadialGradient(r() * w, r() * h, 0, r() * w, r() * h, 60 + r() * 140);
      grd.addColorStop(0, kind === "nero" ? "rgba(60,60,62,0.25)" : "rgba(220,214,204,0.35)");
      grd.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = grd;
      g.fillRect(0, 0, w, h);
    }
    // veins: a few dominant, many hairlines
    const vein = (alpha: number, width: number) => {
      g.strokeStyle =
        kind === "nero" ? `rgba(240,238,232,${alpha})` : r() > 0.7 ? `rgba(176,140,80,${alpha})` : `rgba(120,118,114,${alpha})`;
      g.lineWidth = width;
      g.beginPath();
      let x = r() * w;
      let y = -20;
      g.moveTo(x, y);
      while (y < h + 20) {
        const nx = x + (r() - 0.45) * 90;
        const ny = y + 30 + r() * 60;
        g.quadraticCurveTo(x + (r() - 0.5) * 60, (y + ny) / 2, nx, ny);
        x = nx;
        y = ny;
      }
      g.stroke();
    };
    g.filter = "blur(1.2px)";
    for (let i = 0; i < 4; i++) vein(0.55, 2.5 + r() * 2);
    g.filter = "none";
    for (let i = 0; i < 18; i++) vein(0.18 + r() * 0.25, 0.6 + r());
  });
}

/** Limewash: barely-there clouds of lighter and darker wash. */
function limewash(hex: string) {
  const r = rng(13);
  return canvas(512, 512, (g, w, h) => {
    g.fillStyle = hex;
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) {
      const x = r() * w;
      const y = r() * h;
      const rad = 40 + r() * 130;
      const grd = g.createRadialGradient(x, y, 0, x, y, rad);
      const light = r() > 0.5;
      grd.addColorStop(0, light ? "rgba(255,255,255,0.07)" : "rgba(90,70,50,0.05)");
      grd.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = grd;
      g.fillRect(0, 0, w, h);
    }
  });
}

/** Height noise for bump maps: bouclé loops, velvet pile, rug wool. */
function speckle(seed: number, density: number, max: number) {
  const r = rng(seed);
  return canvas(256, 256, (g, w, h) => {
    g.fillStyle = "#808080";
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < density; i++) {
      const v = Math.floor(90 + r() * 165);
      g.fillStyle = `rgb(${v},${v},${v})`;
      g.beginPath();
      g.arc(r() * w, r() * h, 0.6 + r() * max, 0, Math.PI * 2);
      g.fill();
    }
  });
}

/** Hand-knotted wool: tonal sand ground, an organic inner field, soft border. */
function rug() {
  const r = rng(5);
  return canvas(1024, 1024, (g, w, h) => {
    g.fillStyle = "#e7dccb";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(160,138,108,0.55)";
    g.lineWidth = 10;
    g.strokeRect(40, 40, w - 80, h - 80);
    g.lineWidth = 2;
    g.strokeRect(70, 70, w - 140, h - 140);
    // organic, abstract field — like a contemporary Tibetan knot
    const blob = (cx: number, cy: number, rad: number, fill: string) => {
      g.fillStyle = fill;
      g.beginPath();
      for (let a = 0; a <= Math.PI * 2 + 0.01; a += Math.PI / 24) {
        const rr = rad * (0.82 + 0.18 * Math.sin(a * 3 + cx) + (r() - 0.5) * 0.04);
        const x = cx + Math.cos(a) * rr;
        const y = cy + Math.sin(a) * rr * 0.7;
        if (a === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.closePath();
      g.fill();
    };
    blob(380, 420, 230, "rgba(201,184,158,0.55)");
    blob(640, 600, 200, "rgba(176,150,118,0.35)");
    blob(560, 360, 120, "rgba(234,226,212,0.9)");
    // wool texture
    for (let i = 0; i < 9000; i++) {
      g.fillStyle = `rgba(${r() > 0.5 ? "255,255,255" : "90,70,50"},${0.04 + r() * 0.05})`;
      g.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2);
    }
  });
}

/** A quiet abstract painting in earth tones — gallery, not décor shop. */
function painting(seed: number) {
  const r = rng(seed);
  return canvas(512, 640, (g, w, h) => {
    g.fillStyle = "#e9e1d3";
    g.fillRect(0, 0, w, h);
    const wash = (x: number, y: number, rad: number, col: string) => {
      const grd = g.createRadialGradient(x, y, 0, x, y, rad);
      grd.addColorStop(0, col);
      grd.addColorStop(1, "rgba(233,225,211,0)");
      g.fillStyle = grd;
      g.fillRect(0, 0, w, h);
    };
    wash(170, 470, 300, "rgba(176,120,72,0.75)");
    wash(380, 180, 220, "rgba(196,170,120,0.6)");
    g.fillStyle = "#2d2a26";
    g.beginPath();
    g.arc(330, 300, 70, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "rgba(45,42,38,0.85)";
    g.lineWidth = 14;
    g.lineCap = "round";
    g.beginPath();
    g.moveTo(70, 160);
    g.bezierCurveTo(200, 90, 260, 260, 450, 210);
    g.stroke();
    for (let i = 0; i < 4000; i++) {
      g.fillStyle = `rgba(0,0,0,${r() * 0.04})`;
      g.fillRect(r() * w, r() * h, 2, 2);
    }
  });
}

function terrazzo() {
  const r = rng(11);
  return canvas(512, 512, (g, w, h) => {
    g.fillStyle = "#ece6dc";
    g.fillRect(0, 0, w, h);
    const chips = ["#b9a07a", "#7f8c74", "#c97b56", "#3c3a36", "#d9cbb3"];
    for (let i = 0; i < 520; i++) {
      g.fillStyle = chips[Math.floor(r() * chips.length)];
      g.beginPath();
      const cx = r() * w;
      const cy = r() * h;
      const s = 2 + r() * 9;
      const n = 4 + Math.floor(r() * 3);
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2 + r();
        const rr = s * (0.6 + r() * 0.6);
        if (k === 0) g.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
        else g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
      }
      g.closePath();
      g.fill();
    }
  });
}

/** Soft radial falloff — glow sprites and fake contact shadows. */
function radial(inner: string, outer: string) {
  return canvas(128, 128, (g, w, h) => {
    const grd = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    grd.addColorStop(0, inner);
    grd.addColorStop(1, outer);
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
  });
}

/* ── the library ────────────────────────────────────────────────────────── */

export interface Lux {
  oakSmoked: THREE.MeshPhysicalMaterial;
  oakWashed: THREE.MeshPhysicalMaterial;
  walnut: THREE.MeshPhysicalMaterial;
  travertine: THREE.MeshPhysicalMaterial;
  nero: THREE.MeshPhysicalMaterial;
  calacatta: THREE.MeshPhysicalMaterial;
  terrazzo: THREE.MeshStandardMaterial;
  plaster: THREE.MeshStandardMaterial;
  plasterDeep: THREE.MeshStandardMaterial;
  boucle: THREE.MeshStandardMaterial;
  linen: THREE.MeshPhysicalMaterial;
  velvetOlive: THREE.MeshPhysicalMaterial;
  velvetMushroom: THREE.MeshPhysicalMaterial;
  velvetEmerald: THREE.MeshPhysicalMaterial;
  velvetOxblood: THREE.MeshPhysicalMaterial;
  leather: THREE.MeshPhysicalMaterial;
  brass: THREE.MeshPhysicalMaterial;
  bronze: THREE.MeshPhysicalMaterial;
  blackSteel: THREE.MeshStandardMaterial;
  glass: THREE.MeshPhysicalMaterial;
  opal: THREE.MeshStandardMaterial;
  amber: THREE.MeshStandardMaterial;
  ledWarm: THREE.MeshBasicMaterial;
  rug: THREE.MeshStandardMaterial;
  art: THREE.MeshStandardMaterial;
  art2: THREE.MeshStandardMaterial;
  leaf: THREE.MeshStandardMaterial;
  bark: THREE.MeshStandardMaterial;
  ceramic: THREE.MeshPhysicalMaterial;
  stoneDark: THREE.MeshStandardMaterial;
  /** White card-model clay for the "maquette" stage. */
  clay: THREE.MeshStandardMaterial;
  /** Renders nothing but still casts shadows (implied ceilings, blockers). */
  shadowOnly: THREE.MeshBasicMaterial;
  glowTex: THREE.Texture;
  shadowTex: THREE.Texture;
  dispose: () => void;
}

export function makeLux(): Lux {
  const textures: THREE.Texture[] = [];
  const keep = <T extends THREE.Texture>(t: T) => (textures.push(t), t);

  const oakSmokedMap = keep(texture(herringbone("smoked")));
  const oakWashedMap = keep(texture(herringbone("washed")));
  const travMap = keep(texture(travertine()));
  const neroMap = keep(texture(marble("nero")));
  const calaMap = keep(texture(marble("calacatta")));
  const plasterMap = keep(texture(limewash("#e6ded2"), { repeat: [0.35, 0.35] }));
  const plasterDeepMap = keep(texture(limewash("#cfc3b2"), { repeat: [0.4, 0.4] }));
  const boucleBump = keep(texture(speckle(3, 5200, 2.2), { srgb: false, repeat: [5, 5] }));
  const pileBump = keep(texture(speckle(9, 9000, 1), { srgb: false, repeat: [6, 6] }));
  const rugMap = keep(texture(rug()));
  const artMap = keep(texture(painting(4)));
  const art2Map = keep(texture(painting(19)));
  const terrMap = keep(texture(terrazzo()));
  const glowTex = keep(texture(radial("rgba(255,214,160,1)", "rgba(255,190,120,0)")));
  const shadowTex = keep(texture(radial("rgba(0,0,0,0.55)", "rgba(0,0,0,0)")));
  glowTex.wrapS = glowTex.wrapT = shadowTex.wrapS = shadowTex.wrapT = THREE.ClampToEdgeWrapping;

  const phys = (p: THREE.MeshPhysicalMaterialParameters) => new THREE.MeshPhysicalMaterial(p);
  const std = (p: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(p);
  const velvet = (color: number, sheen: number) =>
    phys({
      color,
      roughness: 0.82,
      sheen: 1,
      sheenColor: new THREE.Color(sheen),
      sheenRoughness: 0.42,
      bumpMap: pileBump,
      bumpScale: 0.6,
    });

  const lux: Omit<Lux, "dispose"> = {
    oakSmoked: phys({ map: oakSmokedMap, roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.35 }),
    oakWashed: phys({ map: oakWashedMap, roughness: 0.55, clearcoat: 0.2, clearcoatRoughness: 0.5 }),
    walnut: phys({ color: 0x5a3c28, roughness: 0.45, clearcoat: 0.4, clearcoatRoughness: 0.3 }),
    travertine: phys({ map: travMap, roughness: 0.62 }),
    nero: phys({ map: neroMap, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.08 }),
    calacatta: phys({ map: calaMap, roughness: 0.14, clearcoat: 1, clearcoatRoughness: 0.08 }),
    terrazzo: std({ map: terrMap, roughness: 0.35 }),
    plaster: std({ map: plasterMap, roughness: 0.95 }),
    plasterDeep: std({ map: plasterDeepMap, roughness: 0.95 }),
    boucle: std({ color: 0xefe8dc, roughness: 1, bumpMap: boucleBump, bumpScale: 2.2 }),
    linen: phys({ color: 0xf4f0e8, roughness: 0.9, sheen: 0.4, sheenColor: new THREE.Color(0xffffff), bumpMap: pileBump, bumpScale: 0.3 }),
    velvetOlive: velvet(0x4d5232, 0x9aa070),
    velvetMushroom: velvet(0x8f8072, 0xd8c9b8),
    velvetEmerald: velvet(0x123d33, 0x3f8f72),
    velvetOxblood: velvet(0x4a1c1a, 0xa2504a),
    leather: phys({ color: 0x6b3a20, roughness: 0.48, clearcoat: 0.35, clearcoatRoughness: 0.45 }),
    brass: phys({ color: 0xc9a25e, metalness: 1, roughness: 0.26 }),
    bronze: phys({ color: 0x6e4a2c, metalness: 1, roughness: 0.32 }),
    blackSteel: std({ color: 0x151515, metalness: 0.8, roughness: 0.38 }),
    glass: phys({
      color: 0xdde8ef,
      roughness: 0.04,
      metalness: 0,
      transparent: true,
      opacity: 0.14,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
    opal: std({ color: 0xfff6e8, emissive: 0xffd8a8, emissiveIntensity: 0, roughness: 0.6 }),
    amber: std({ color: 0xd08a3c, emissive: 0xff9a40, emissiveIntensity: 0, roughness: 0.25, transparent: true, opacity: 0.92 }),
    ledWarm: new THREE.MeshBasicMaterial({ color: 0xffd6a0, toneMapped: false }),
    rug: std({ map: rugMap, roughness: 1, bumpMap: pileBump, bumpScale: 1.2 }),
    art: std({ map: artMap, roughness: 0.85 }),
    art2: std({ map: art2Map, roughness: 0.85 }),
    leaf: std({ color: 0x6f7d56, roughness: 0.7, side: THREE.DoubleSide }),
    bark: std({ color: 0x5b4a3a, roughness: 0.95 }),
    ceramic: phys({ color: 0xe9e2d6, roughness: 0.35, clearcoat: 0.6 }),
    stoneDark: std({ color: 0x3a3632, roughness: 0.8 }),
    clay: std({ color: 0xf2efe9, roughness: 1 }),
    shadowOnly: new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false }),
    glowTex,
    shadowTex,
  };

  return {
    ...lux,
    dispose: () => {
      textures.forEach((t) => t.dispose());
      Object.values(lux).forEach((v) => {
        if (v instanceof THREE.Material) v.dispose();
      });
    },
  };
}

/** Swatch materials for the material library, with display names. */
export function swatchSet(L: Lux): { name: string; mat: THREE.Material }[] {
  return [
    { name: "Travertino Navona", mat: L.travertine },
    { name: "Nero Marquina marble", mat: L.nero },
    { name: "Calacatta Oro marble", mat: L.calacatta },
    { name: "Smoked oak, herringbone", mat: L.oakSmoked },
    { name: "American walnut", mat: L.walnut },
    { name: "Brushed champagne brass", mat: L.brass },
    { name: "Ivory bouclé", mat: L.boucle },
    { name: "Emerald velvet", mat: L.velvetEmerald },
    { name: "Venetian terrazzo", mat: L.terrazzo },
  ];
}
