/* ══════════════════════════════════════════════════════════════════════════
   curtain.ts — the black-velvet stage curtain, in WebGL

   DYNAMIC IMPORT ONLY. intro.ts reaches this file with `import("./curtain")`
   and nothing else in the site references it, which is what keeps three.js
   out of the main chunk (DESIGN §6's 150KB gz budget is for the page, and
   the page must not pay for an intro it will only ever see once). A static
   import anywhere would fold the whole library back into main — if you add
   one, the budget breaks silently.

   The cloth is not simulated. It is a closed-form displacement of two plane
   meshes, evaluated per vertex on the CPU, and the entire realism budget is
   spent in three places:

     PLEATS      a primary cosine fold plus a smaller, faster ripple, both
                 read off the fabric's MATERIAL coordinate rather than its
                 screen position. That single choice is what makes the open
                 look right: when the material compresses, the folds compress
                 with it, so the pleat wavelength shortens on its own.
     THE GATHER  opening does not slide the halves sideways. It remaps the
                 material onto a shrinking span with a non-uniform curve, so
                 cloth stacks against the outer edge the way a real curtain
                 does — leading edge travels furthest, outer folds pack
                 tightest and deepen as they pack.
     THE LIGHT   black velvet on a black page has no shading of its own. One
                 warm spot and a sheen term do all the drawing; the folds are
                 visible because their crests catch the wash and their
                 valleys fall to nothing.

   Cost control: m (the material coordinate) and v (the height coordinate)
   never change, so every trigonometric term that depends only on them is
   evaluated ONCE at build time into a flat Float32Array. The per-frame loop
   is arithmetic and two multiplies of a per-frame sine — no Math.cos inside
   it at all. Normals are analytic (dz/dm over dx/dm), not
   computeVertexNormals: same result, a fraction of the cost, and it holds
   60fps on integrated graphics.
   ══════════════════════════════════════════════════════════════════════════ */

import {
  AmbientLight,
  CanvasTexture,
  Color,
  DirectionalLight,
  Mesh,
  MeshPhysicalMaterial,
  NoToneMapping,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  SpotLight,
  WebGLRenderer,
} from "three";

export interface Curtain {
  /** Part the curtains. Resolves when the pull has fully landed. */
  open(): Promise<void>;
  /** The invitation pool breathes brighter under a hovering pointer. */
  invite(on: boolean): void;
  /** Renderer, geometries, materials, listeners, canvas — all of it. */
  dispose(): void;
}

/* ── the numbers ───────────────────────────────────────────────────────── */

/** Mesh resolution per half. 97 × 65 = 6305 vertices; the folds need the
 *  horizontal density, the vertical is only carrying the taper and the sag. */
const SEG_X = 96;
const SEG_Y = 64;

/** Folds across one half at rest. User-tuned: 8.5 → 5.5 → 3 ("lets start
 *  with 6 curves" = six across the whole stage). The per-half phase offsets
 *  (p0/p1 below) keep the centre seam from mirroring even at an integer
 *  count. */
const FOLDS = 2; /* user-tuned: riding 6 → 10 → 3 → 6 → 4 total across the stage */

/** THE LIVING PLEATS (user call: real brushed cloth CHANGES its fold count
 *  and the folds SHIFT). Two fold tables per half — the rest state above
 *  and a disturbed state with more, tighter folds — blended per vertex by
 *  the wake's local energy: cloth bunches into extra folds under the
 *  stroke and lazily relaxes back to the broad rest pleats. On top, a
 *  stroke-driven PHASE DRIFT slides the whole pattern along the hand's
 *  direction and springs back home. All of it stays trig-free per vertex
 *  via the angle-sum identity over precomputed cos/sin tables. */
const FOLDS_B = 2.5; /* user call: the brush adds just ONE fold — 4 at rest, 5 disturbed */
const RATE_A = Math.PI * 2 * FOLDS;
const RATE_B = Math.PI * 2 * FOLDS_B;
/** How fast the pleats reorganize toward the disturbed state, and how much
 *  more lazily they settle back. */
const MIX_IN = 0.055;
const MIX_OUT = 0.012;
/** Local field magnitude → extra local fold-mix. */
const MIX_LOCAL = 9.0;
/** Stroke → phase drift coupling, its damping, and its travel cap (rad). */
const DRIFT_K = 2.6;
const DRIFT_DAMP = 0.975;
const DRIFT_MAX = 1.6;

/** The secondary ripple rides at 2.6× the primary and 0.34 of its depth —
 *  incommensurate, so no two folds in the run are quite the same shape. */
const RIPPLE_RATE = 2.6;
const RIPPLE_DEPTH = 0.34;

/** Fraction of a half's original span that the stack occupies when fully
 *  open. Real curtains do not vanish; they bunch against the proscenium and
 *  stay there, which is a large part of why a parted curtain looks parted. */
const STACK = 0.15;

/** The gather curve's exponent. g(m) = STACK · m^PACK at t = 1, so
 *  g'(m) = STACK · PACK · m^(PACK−1): with PACK > 1 the derivative is small
 *  near m = 0 and large near m = 1, which means material near the OUTER edge
 *  is compressed hardest and the leading edge stays comparatively open. That
 *  is the stack: tight folds at the wall, the last fold hanging looser at the
 *  front. Wavelength shortens exactly where compression is greatest, because
 *  wavelength IS 1/compression here. */
const PACK = 1.7;

/** The rail leads, the hem follows. The top of the cloth runs 14% ahead of
 *  the bottom through the pull, so the hem drags and catches up at the end. */
const LAG = 0.14;

/** Fold depth, as a fraction of a half's span. */
const AMP = 0.052;

/** How much deeper the folds get where the cloth has bunched. */
const PACK_DEEPEN = 1.45;

/** Idle hem sway and the lift the leading edge takes during the pull, both
 *  as fractions of span / height. Sway doubled from 0.013 (user call: the
 *  closed cloth read too still). */
const SWAY = 0.028;
const LIFT = 0.055;

/** THE HAND, round 2 (user call: a dent glued to the cursor read fake).
 *  Real cloth answers a stroke with a WAKE — so the disturbance is now a
 *  coarse damped wave field the cloth samples: the pointer injects impulses
 *  scaled by its own speed, and the classic two-buffer ripple integrator
 *  makes them PROPAGATE outward, trail the stroke, and keep rolling after
 *  the hand has passed. A still cursor injects almost nothing; a sweep
 *  leaves a living wake. */
const FIELD_X = 44;
const FIELD_Y = 28;
/** Neighbour coupling per step (wave speed) and per-step energy retention. */
const FIELD_WAVE = 0.24;
const FIELD_DAMP = 0.955;
/** Impulse: a floor for a resting touch plus a speed-scaled term, capped. */
const FIELD_TOUCH = 0.05;
const FIELD_STROKE = 0.9;
const FIELD_MAX_IMPULSE = 0.6;
/** World amplitude of a full-strength field cell, as a fraction of span. */
const FIELD_AMP = 0.075;

/** The pull. 2.6s, power2.inOut. */
const OPEN_MS = 2600;

/** Two incommensurate sway frequencies (rad/s) — their sum never repeats, so
 *  the idle loop has no seam to notice. Roughly doubled from 0.31/0.47
 *  (user call: the idle cloth moved too slowly). */
const SWAY_F1 = 1.5;
const SWAY_F2 = 2.3;

/** Spatial phase of the travelling sway along the cloth. */
const SWAY_K = 2.1;

const CAM_FOV = 40;
const CAM_Z = 5;

/* power2.inOut, hand-written: this module deliberately imports nothing but
   three, so the curtain chunk carries no second dependency. */
function power2InOut(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/** Everything about one half that never changes once built. Each array is
 *  indexed by vertex. */
interface Half {
  mesh: Mesh;
  geo: PlaneGeometry;
  pos: Float32Array;
  nrm: Float32Array;
  /** +1 for the left half (material runs left→right), −1 for the right. */
  dir: number;
  /** m^PACK and m^(PACK−1) — the gather map and its derivative. */
  mPow: Float32Array;
  mPowD: Float32Array;
  /** m^0.8 (deepening) and m³ (the leading-edge lift). */
  mSoft: Float32Array;
  mCube: Float32Array;
  /** The two fold states, as cos/sin pairs of primary (P) and ripple (R)
   *  angles — the angle-sum identity turns a live phase drift and a
   *  two-state blend into pure arithmetic per vertex. A = rest, B =
   *  disturbed (more, tighter folds). */
  foldAcP: Float32Array;
  foldAsP: Float32Array;
  foldAcR: Float32Array;
  foldAsR: Float32Array;
  foldBcP: Float32Array;
  foldBsP: Float32Array;
  foldBcR: Float32Array;
  foldBsR: Float32Array;
  /** Material coordinate, 0 at the outer (stack) edge, 1 at the leading edge. */
  m: Float32Array;
  /** Height coordinate, 0 at the hem, 1 at the rail. */
  v: Float32Array;
  /** Fold amplitude taper and its derivative in v. */
  ampV: Float32Array;
  dampV: Float32Array;
  /** (1−v)² — the sway and sag envelope. */
  hem: Float32Array;
  /** (1−v)²·sin(πm) — the static horizontal sag of the hem. */
  sag: Float32Array;
  /** cos(SWAY_K·m) and sin(SWAY_K·m), so the travelling sway needs no
   *  per-vertex trig at all: sin(ωt + km) = sin(ωt)·cos(km) + cos(ωt)·sin(km). */
  swayC: Float32Array;
  swayS: Float32Array;
}

export function mount(container: HTMLElement): Curtain {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearAlpha(0);
  /* Grade 5 (user call: "use the same colour as the site"): the cloth's
     tones now target the site's own gray ladder — valleys at canvas
     #0a0a0a, crests in the hairline grays. NO tone mapping, so the lit
     values land literally on the ladder instead of being curve-shifted. */
  renderer.toneMapping = NoToneMapping;
  renderer.toneMappingExposure = 1.0;
  container.appendChild(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(CAM_FOV, 1, 0.1, 40);
  camera.position.set(0, 0, CAM_Z);

  /* ── the velvet ──────────────────────────────────────────────────────────
     Base is a charcoal, never #000: pure black has no shading to give and
     the folds would be invisible. The signature of velvet is the sheen — a
     retroreflective lobe that lights the crests facing the wash while the
     valleys stay dark — so sheen is at full and its colour is the warm
     champagne of the stage lamp, not the cloth. */
  /* REGRADED after the first screenshot round (user catch, probe-confirmed):
     the original grade — sheen #8a734a at full, spot 7.2, exposure 1.3 —
     painted the whole cloth bronze-gold. Black velvet means the CLOTH stays
     black and only the crests carry a dim warm edge, so every light source
     comes down hard and the sheen goes dimmer and grayer. */
  /* THE WORDS, WRITTEN ON THE CLOTH (user call): "click to reveal" is
     rendered to a canvas and glued to the mesh as an emissive map, so the
     letters ride the folds, compress into the gather, and sway with the
     velvet — paint, not a floating label. The UVs are WORLD-aligned in
     resize(), so the text draws seamlessly across both halves and their
     centre overlap (both paint the same world pixels; depth picks one). */
  const labelCanvas = document.createElement("canvas");
  labelCanvas.width = 2048;
  labelCanvas.height = 1024;
  const lctx = labelCanvas.getContext("2d");
  if (lctx) {
    lctx.clearRect(0, 0, 2048, 1024);
    lctx.fillStyle = "#dcc48a";
    lctx.textAlign = "center";
    lctx.textBaseline = "middle";
    try {
      (lctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "18px";
    } catch {
      /* older engines: tighter tracking, still legible */
    }
    lctx.font = "500 54px system-ui, Segoe UI, Arial, sans-serif";
    lctx.fillText("click to reveal", 1024 + 9, 512);
  }
  const makeLabelTex = (): CanvasTexture => {
    const t = new CanvasTexture(labelCanvas);
    t.anisotropy = 4;
    return t;
  };
  const labelTexL = makeLabelTex();
  const labelTexR = makeLabelTex();

  /* The site's own inks: surface #111111 as the cloth, hairline-strong
     #3f3f3f as the crest sheen — the curtain is drawn with the page's
     palette, just folded. Two materials, one per half, because each half
     shows its own window of the shared label texture. */
  const makeMaterial = (tex: CanvasTexture): MeshPhysicalMaterial =>
    new MeshPhysicalMaterial({
      color: new Color(0x111111),
      roughness: 0.85,
      metalness: 0,
      sheen: 1,
      sheenColor: new Color(0x555555),
      sheenRoughness: 0.5,
      emissive: new Color(0xffffff),
      emissiveMap: tex,
      emissiveIntensity: 0.85,
    });
  const materialL = makeMaterial(labelTexL);
  const materialR = makeMaterial(labelTexR);

  /* ── the stage wash ────────────────────────────────────────────────────
     One warm spot from top-centre-front, wide and very soft (penumbra 0.95)
     so the pool falls off down the cloth instead of drawing an edge. No
     decay: this is a theatre lamp a long way off, not a bulb in the room,
     and no shadow map — the fold normals do every bit of the shading. */
  /* Grade round 4 (user verdict on 3: still not black): even a whisper of
     warmth reads brown on dark cloth, so the grade goes fully MONOCHROME —
     black velvet under a silver-gray lamp. With zero hue anywhere in the
     light path, the cloth cannot read as anything but black. */
  const spot = new SpotLight(0xffffff, 2.7, 0, 0.9, 0.95, 0);
  spot.position.set(0, 4.4, 4.2);
  const spotTarget = new Object3D();
  spotTarget.position.set(0, -0.7, 0);
  scene.add(spot, spotTarget);
  spot.target = spotTarget;

  /* THE INVITATION POOL (user pick: the button became light). A second,
     much tighter spot aimed at the cloth's centre — a defined pool that
     BENDS over the pleats because the fold normals shade it, which is the
     whole reason it lives in here and not in CSS. It breathes brighter
     under a hovering pointer (invite()), blooms once at the click, and
     hands its light off as the pull begins. */
  const pool = new SpotLight(0xffffff, 2.0, 0, 0.24, 0.65, 0);
  pool.position.set(0, 0.7, 4.6);
  const poolTarget = new Object3D();
  poolTarget.position.set(0, 0, 0);
  scene.add(pool, poolTarget);
  pool.target = poolTarget;
  const POOL_BASE = 2.0;
  const POOL_HOVER = 1.5;
  let poolHover = 0;
  let poolHoverTarget = 0;
  let bloomAt = -1;

  /* Enough to keep the valleys from clipping to absolute nothing. */
  const ambient = new AmbientLight(0xffffff, 0.35);
  /* A dim front fill so the fabric nearest the camera is not a silhouette. */
  const fill = new DirectionalLight(0xffffff, 0.08);
  fill.position.set(0.4, 0.3, 1);
  scene.add(ambient, fill);

  /* ── geometry ─────────────────────────────────────────────────────────── */

  /** World half-height and half-width of the viewport at z = 0. */
  let viewW = 1;
  let viewH = 1;
  /** A half's material span in world units, and the cloth's height. */
  let span = 1;
  let height = 1;

  function buildHalf(dir: number): Half {
    const geo = new PlaneGeometry(1, 1, SEG_X, SEG_Y);
    const base = geo.attributes.position!.array as Float32Array;
    const n = base.length / 3;

    const half: Half = {
      mesh: new Mesh(geo, dir > 0 ? materialL : materialR),
      geo,
      pos: base,
      nrm: geo.attributes.normal!.array as Float32Array,
      dir,
      mPow: new Float32Array(n),
      mPowD: new Float32Array(n),
      mSoft: new Float32Array(n),
      mCube: new Float32Array(n),
      foldAcP: new Float32Array(n),
      foldAsP: new Float32Array(n),
      foldAcR: new Float32Array(n),
      foldAsR: new Float32Array(n),
      foldBcP: new Float32Array(n),
      foldBsP: new Float32Array(n),
      foldBcR: new Float32Array(n),
      foldBsR: new Float32Array(n),
      m: new Float32Array(n),
      v: new Float32Array(n),
      ampV: new Float32Array(n),
      dampV: new Float32Array(n),
      hem: new Float32Array(n),
      sag: new Float32Array(n),
      swayC: new Float32Array(n),
      swayS: new Float32Array(n),
    };

    const A = Math.PI * 2 * FOLDS;
    const B = A * RIPPLE_RATE;
    const A2 = Math.PI * 2 * FOLDS_B;
    const B2 = A2 * RIPPLE_RATE;
    /* Offset phases so neither half starts on a crest at its outer edge. */
    const p0 = dir > 0 ? 0.42 : 2.15;
    const p1 = dir > 0 ? 1.9 : 0.6;
    const q0 = dir > 0 ? 1.1 : 2.7;
    const q1 = dir > 0 ? 0.3 : 1.4;

    for (let i = 0; i < n; i++) {
      /* PlaneGeometry(1,1) puts x in [−0.5, 0.5] and y in [−0.5, 0.5]. The
         material coordinate m runs 0 at the OUTER (stack) edge to 1 at the
         leading edge, which is the +x end for the left half and the −x end
         for the right — hence the mirror. */
      const x0 = base[i * 3]!;
      const y0 = base[i * 3 + 1]!;
      const m = dir > 0 ? x0 + 0.5 : 0.5 - x0;
      const v = y0 + 0.5;

      half.m[i] = m;
      half.v[i] = v;
      half.mPow[i] = Math.pow(m, PACK);
      half.mPowD[i] = Math.pow(m, PACK - 1);
      half.mSoft[i] = Math.pow(m, 0.8);
      half.mCube[i] = m * m * m;
      half.foldAcP[i] = Math.cos(A * m + p0);
      half.foldAsP[i] = Math.sin(A * m + p0);
      half.foldAcR[i] = Math.cos(B * m + p1);
      half.foldAsR[i] = Math.sin(B * m + p1);
      half.foldBcP[i] = Math.cos(A2 * m + q0);
      half.foldBsP[i] = Math.sin(A2 * m + q0);
      half.foldBcR[i] = Math.cos(B2 * m + q1);
      half.foldBsR[i] = Math.sin(B2 * m + q1);

      /* Fabric is gathered tight at the rail and hangs open at the hem, so
         the folds are shallowest at the top and deepest at the bottom. */
      const om = 1 - v;
      const taper = Math.pow(om, 1.35);
      half.ampV[i] = 0.3 + 0.7 * taper;
      half.dampV[i] = -0.7 * 1.35 * Math.pow(om, 0.35);

      half.hem[i] = om * om;
      half.sag[i] = om * om * Math.sin(Math.PI * m);
      half.swayC[i] = Math.cos(SWAY_K * m);
      half.swayS[i] = Math.sin(SWAY_K * m);
    }

    scene.add(half.mesh);
    return half;
  }

  const left = buildHalf(1);
  const right = buildHalf(-1);
  const halves: Half[] = [left, right];

  /* ── the per-frame displacement ───────────────────────────────────────── */

  function shape(half: Half, t: number, time: number): void {
    const { pos, nrm, dir } = half;
    const n = pos.length / 3;

    /* The wake's world amplitude this frame. */
    const fieldAmp = span * FIELD_AMP;
    const fieldOn = handStrength > 0.002 || fieldEnergy > 0.0004;

    const amp = span * AMP;
    const swayAmp = span * SWAY * (0.35 + 0.65 * (1 - t));
    const swayZ = Math.sin(SWAY_F2 * time);
    const s1 = Math.sin(SWAY_F1 * time);
    const c1 = Math.cos(SWAY_F1 * time);
    const lift = height * LIFT;
    const sagAmt = height * 0.018;
    /* The half's outer edge, a hair past the viewport so the stack sits
       against the proscenium rather than floating inside the frame. */
    const xOuter = dir > 0 ? -viewW * 0.51 : viewW * 0.51;

    /* Hoisted out of the loop: 6300 property chains per half per frame is
       real money at 60fps, and the `!` is the house pattern for indexing
       under noUncheckedIndexedAccess (tsconfig). Every one of these arrays
       is exactly `n` long by construction — they are allocated from
       `pos.length / 3` and never resized. */
    const aM = half.m;
    const aV = half.v;
    const aMPow = half.mPow;
    const aMPowD = half.mPowD;
    const aMSoft = half.mSoft;
    const aMCube = half.mCube;
    const aAcP = half.foldAcP;
    const aAsP = half.foldAsP;
    const aAcR = half.foldAcR;
    const aAsR = half.foldAsR;
    const aBcP = half.foldBcP;
    const aBsP = half.foldBsP;
    const aBcR = half.foldBcR;
    const aBsR = half.foldBsR;
    const RATE_AR = RATE_A * RIPPLE_RATE;
    const RATE_BR = RATE_B * RIPPLE_RATE;
    const aAmpV = half.ampV;
    const aDAmpV = half.dampV;
    const aHem = half.hem;
    const aSag = half.sag;
    const aSwayC = half.swayC;
    const aSwayS = half.swayS;

    for (let i = 0; i < n; i++) {
      const v = aV[i]!;

      /* Rail leads, hem follows. Each vertex runs its own clock, offset by
         how far down the cloth it sits, then clamped so nobody overshoots. */
      let tv = t * (1 + LAG) - LAG * (1 - v);
      if (tv < 0) tv = 0;
      else if (tv > 1) tv = 1;
      const utv = 1 - tv;

      /* THE GATHER.
             g(m,t)  = (1−t)·m + t·STACK·m^PACK
             g'(m,t) = (1−t)   + t·STACK·PACK·m^(PACK−1)
         g maps a point of fabric onto its position across the current span;
         g' is the local stretch, and 1/g' is the local compression that the
         pleats — being functions of m, not of x — inherit for free. */
      const g = utv * aM[i]! + tv * STACK * aMPow[i]!;
      let gp = utv + tv * STACK * PACK * aMPowD[i]!;
      /* Floor it: at t = 1 the derivative goes to zero at the outer edge and
         dz/dx would blow up with it, spraying garbage normals. */
      if (gp < 0.06) gp = 0.06;

      /* Folds deepen where the cloth has packed. */
      const ampT = 1 + PACK_DEEPEN * tv * (1 - aMSoft[i]!);
      const depth = amp * aAmpV[i]! * ampT;

      /* A travelling sway along the hem, from two frequencies that never
         line up — the angle-sum identity keeps it trig-free per vertex. */
      const env = aHem[i]! * swayAmp;
      const sway = env * (s1 * aSwayC[i]! + c1 * aSwayS[i]!);

      /* The leading edge picks up and swings as it is pulled, peaking at
         mid-travel: 4t(1−t) is the parabola that does what sin(πt) does,
         without the call. */
      const liftY = lift * (4 * tv * utv) * aMCube[i]!;

      const j = i * 3;
      const wx = xOuter + dir * g * span + sway;
      const wy = (v - 0.5) * height - sagAmt * aSag[i]! + liftY;

      /* THE WAKE first: its local energy also drives the pleats' living
         reorganization below. */
      let fz = 0;
      let fgx = 0;
      let fgy = 0;
      if (fieldOn) {
        sampleField(wx, wy);
        fz = fieldOut[0]!;
        fgx = fieldOut[1]!;
        fgy = fieldOut[2]!;
      }

      /* THE LIVING PLEATS: the two fold states, each phase-shifted by the
         stroke drift (angle-sum identities over the precomputed tables),
         blended by global energy + the wake's local magnitude — cloth
         bunches into more, tighter folds under the hand and settles back. */
      let mix = mixG + (fz > 0 ? fz : -fz) * MIX_LOCAL;
      if (mix > 1) mix = 1;
      const um = 1 - mix;
      const fA = aAcP[i]! * cD - aAsP[i]! * sD + RIPPLE_DEPTH * (aAcR[i]! * cD2 - aAsR[i]! * sD2);
      const dA = -RATE_A * (aAsP[i]! * cD + aAcP[i]! * sD) - RIPPLE_DEPTH * RATE_AR * (aAsR[i]! * cD2 + aAcR[i]! * sD2);
      const fB = aBcP[i]! * cD - aBsP[i]! * sD + RIPPLE_DEPTH * (aBcR[i]! * cD2 - aBsR[i]! * sD2);
      const dB = -RATE_B * (aBsP[i]! * cD + aBcP[i]! * sD) - RIPPLE_DEPTH * RATE_BR * (aBsR[i]! * cD2 + aBcR[i]! * sD2);
      const fold = um * fA + mix * fB;
      const dfold = um * dA + mix * dB;

      const wz = depth * fold + env * swayZ + fz * fieldAmp;

      /* ANALYTIC NORMALS. z is a height field over (x, y), so the surface
         normal is (−∂z/∂x, −∂z/∂y, 1) normalised. ∂z/∂x comes through the
         material: (dz/dm)/(dx/dm), and dx/dm is dir·span·gp — which is why
         a compressed region automatically gets steeper, brighter fold walls
         instead of the flat shading a screen-space fold would give. The
         wake's slope rides in as well, so ripples shade too. */
      const nx = -(depth * dfold) / (dir * span * gp) - fgx * fieldAmp;
      const ny = -(amp * aDAmpV[i]! * ampT * fold) / height - fgy * fieldAmp;

      pos[j] = wx;
      pos[j + 1] = wy;
      pos[j + 2] = wz;
      const inv = 1 / Math.sqrt(nx * nx + ny * ny + 1);
      nrm[j] = nx * inv;
      nrm[j + 1] = ny * inv;
      nrm[j + 2] = inv;
    }

    half.geo.attributes.position!.needsUpdate = true;
    half.geo.attributes.normal!.needsUpdate = true;
  }

  /* ── sizing ───────────────────────────────────────────────────────────── */

  function resize(): void {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);

    /* The world size of the viewport plane at z = 0 — everything else is
       expressed as a fraction of it, so the cloth covers the frame at any
       aspect ratio without a magic number. */
    viewH = 2 * Math.tan((CAM_FOV * Math.PI) / 360) * CAM_Z;
    viewW = viewH * camera.aspect;
    /* 0.53 rather than 0.5: the two halves overlap across the centre, so the
       seam is a fold on top of a fold and never a visible join. Taller than
       the frame for the same reason at the hem. */
    span = viewW * 0.53;
    height = viewH * 1.14;

    /* World-align the label windows: the full cloth spans 1.02·viewW from
       the left half's outer edge to the right's; each half shows the slice
       of the texture its REST-state geometry covers, so the words sit
       seamlessly across the centre. (During the pull, the vertices carry
       their UVs into the stack — the paint compresses with the cloth.) */
    const totalW = 1.02;
    const share = 0.53 / totalW;
    labelTexL.repeat.set(share, 1);
    labelTexL.offset.set(0, 0);
    labelTexR.repeat.set(share, 1);
    labelTexR.offset.set(1 - share, 0);
  }

  resize();
  window.addEventListener("resize", resize);

  /* ── the hand ─────────────────────────────────────────────────────────────
     Window-level, because the overlay's button and valance sit above the
     canvas and would eat a canvas-local pointermove. Screen coords project
     onto the z=0 plane the same way resize() sized it. Strength eases in
     and out (a hand arrives and leaves, it does not teleport) and dies with
     the pull — a parting curtain is nobody's to stroke. */
  let handX = 0;
  let handY = 0;
  let handPX = 0;
  let handPY = 0;
  let handIn = false;
  let handFresh = false;
  let handStrength = 0;

  /* The wave field: two buffers, ripple-integrated each frame. Indexed
     [gy * FIELD_X + gx] over the cloth's world extent. */
  const fieldZ = new Float32Array(FIELD_X * FIELD_Y);
  const fieldV = new Float32Array(FIELD_X * FIELD_Y);

  function onPointerMove(e: PointerEvent): void {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    handX = (e.clientX / w - 0.5) * viewW;
    handY = (0.5 - e.clientY / h) * viewH;
    handIn = true;
    handFresh = true;
  }
  function onPointerGone(): void {
    handIn = false;
  }
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  document.documentElement.addEventListener("pointerleave", onPointerGone);

  /** One integration step: inject the pointer's impulse, then let the
   *  ripple spread and decay. Runs once per frame, over ~1.2k cells. */
  function stepField(): void {
    if (handStrength > 0.002 && handIn) {
      /* Impulse where the hand is, scaled by how fast it moved this frame —
         a resting touch barely stirs the cloth, a sweep shoves it. */
      const dx = handX - handPX;
      const dy = handY - handPY;
      /* The stroke's sideways component feeds the pleats' phase drift. */
      strokeVX = (dx / Math.max(viewW, 0.001)) * handStrength;
      const speed = Math.sqrt(dx * dx + dy * dy) / Math.max(viewW, 0.001);
      let force = FIELD_TOUCH * (handFresh ? 1 : 0.2) + FIELD_STROKE * speed * 14;
      if (force > FIELD_MAX_IMPULSE) force = FIELD_MAX_IMPULSE;
      force *= handStrength;
      const gx = Math.round(((handX / viewW) * 0.98 + 0.5) * (FIELD_X - 1));
      const gy = Math.round(((handY / viewH) * 0.86 + 0.5) * (FIELD_Y - 1));
      for (let oy = -1; oy <= 1; oy++) {
        for (let ox = -1; ox <= 1; ox++) {
          const cx = gx + ox;
          const cy = gy + oy;
          if (cx < 0 || cx >= FIELD_X || cy < 0 || cy >= FIELD_Y) continue;
          const w = ox === 0 && oy === 0 ? 1 : 0.45;
          fieldV[cy * FIELD_X + cx]! -= force * w;
        }
      }
    }
    handPX = handX;
    handPY = handY;
    handFresh = false;

    for (let gy = 0; gy < FIELD_Y; gy++) {
      for (let gx = 0; gx < FIELD_X; gx++) {
        const i = gy * FIELD_X + gx;
        const zc = fieldZ[i]!;
        const zl = gx > 0 ? fieldZ[i - 1]! : zc;
        const zr = gx < FIELD_X - 1 ? fieldZ[i + 1]! : zc;
        const zu = gy > 0 ? fieldZ[i - FIELD_X]! : zc;
        const zd = gy < FIELD_Y - 1 ? fieldZ[i + FIELD_X]! : zc;
        const lap = zl + zr + zu + zd - 4 * zc;
        fieldV[i] = (fieldV[i]! + lap * FIELD_WAVE) * FIELD_DAMP;
      }
    }
    for (let i = 0; i < fieldZ.length; i++) fieldZ[i] = (fieldZ[i]! + fieldV[i]!) * FIELD_DAMP;
  }

  /** Bilinear sample of the field at a world point; out[0]=z, out[1]=dz/dx,
   *  out[2]=dz/dy (world-unit slopes for the normals). */
  const fieldOut = new Float32Array(3);
  function sampleField(wx: number, wy: number): void {
    const fx = ((wx / viewW) * 0.98 + 0.5) * (FIELD_X - 1);
    const fy = ((wy / viewH) * 0.86 + 0.5) * (FIELD_Y - 1);
    const x0 = Math.floor(fx);
    const y0 = Math.floor(fy);
    if (x0 < 0 || x0 >= FIELD_X - 1 || y0 < 0 || y0 >= FIELD_Y - 1) {
      fieldOut[0] = 0;
      fieldOut[1] = 0;
      fieldOut[2] = 0;
      return;
    }
    const tx = fx - x0;
    const ty = fy - y0;
    const i00 = y0 * FIELD_X + x0;
    const z00 = fieldZ[i00]!;
    const z10 = fieldZ[i00 + 1]!;
    const z01 = fieldZ[i00 + FIELD_X]!;
    const z11 = fieldZ[i00 + FIELD_X + 1]!;
    const zx0 = z00 + (z10 - z00) * tx;
    const zx1 = z01 + (z11 - z01) * tx;
    fieldOut[0] = zx0 + (zx1 - zx0) * ty;
    /* Cell size in world units gives the gradient its physical scale. */
    const cellW = (viewW / 0.98) / (FIELD_X - 1);
    const cellH = (viewH / 0.86) / (FIELD_Y - 1);
    fieldOut[1] = ((z10 - z00) * (1 - ty) + (z11 - z01) * ty) / cellW;
    fieldOut[2] = ((z01 - z00) * (1 - tx) + (z11 - z10) * tx) / cellH;
  }

  /* ── the loop ─────────────────────────────────────────────────────────── */

  let raf = 0;
  let alive = true;
  let openStart = 0;
  let opening = false;
  let fieldEnergy = 0;
  /* The living pleats' state: global mix, phase drift, and the per-frame
     cos/sin of the drift the shape loop reads. */
  let mixG = 0;
  let drift = 0;
  let strokeVX = 0;
  let cD = 1;
  let sD = 0;
  let cD2 = 1;
  let sD2 = 0;
  let t = 0;
  let resolveOpen: (() => void) | null = null;
  const t0 = performance.now();

  function frame(now: number): void {
    if (!alive) return;
    raf = requestAnimationFrame(frame);

    if (opening) {
      const raw = Math.min(1, (now - openStart) / OPEN_MS);
      t = power2InOut(raw);
      if (raw >= 1) {
        opening = false;
        const done = resolveOpen;
        resolveOpen = null;
        if (done) done();
      }
    }

    const time = (now - t0) / 1000;
    /* The pool: eased hover breath + a decaying bloom at the click + a slow
       idle shimmer, all dying with the pull — the light hands the stage
       over to the part. */
    poolHover += (poolHoverTarget - poolHover) * 0.07;
    const bloom = bloomAt >= 0 ? 5.5 * Math.exp(-(now - bloomAt) / 320) : 0;
    const shimmer = 1 + 0.06 * Math.sin(0.9 * time) * Math.sin(0.57 * time);
    pool.intensity = (POOL_BASE * shimmer + POOL_HOVER * poolHover + bloom) * (1 - t);
    /* The painted words brighten with the hover and leave with the pull. */
    const labelI = (0.85 + 0.45 * poolHover) * (1 - t) * (1 - t);
    materialL.emissiveIntensity = labelI;
    materialR.emissiveIntensity = labelI;
    /* The hand arrives and leaves smoothly, and lets go as the pull begins —
       a parting curtain is nobody's to stroke. The FIELD, though, keeps
       ringing after the hand is gone: injection is gated, propagation
       is not. */
    const handTarget = handIn ? 1 - t : 0;
    handStrength += (handTarget - handStrength) * 0.08;
    /* The living pleats: drift follows the stroke and springs home; the
       mix chases the wake's energy in quickly and settles out lazily. */
    drift = drift * DRIFT_DAMP + strokeVX * DRIFT_K;
    if (drift > DRIFT_MAX) drift = DRIFT_MAX;
    else if (drift < -DRIFT_MAX) drift = -DRIFT_MAX;
    strokeVX = 0;
    cD = Math.cos(drift);
    sD = Math.sin(drift);
    cD2 = Math.cos(drift * 1.6);
    sD2 = Math.sin(drift * 1.6);
    const mixTarget = Math.min(1, handStrength * 0.35 + fieldEnergy * 26) * (1 - t);
    mixG += (mixTarget - mixG) * (mixTarget > mixG ? MIX_IN : MIX_OUT);
    stepField();
    fieldEnergy = 0;
    for (let i = 0; i < fieldZ.length; i += 7) {
      const z = fieldZ[i]!;
      fieldEnergy += z > 0 ? z : -z;
    }
    fieldEnergy /= fieldZ.length / 7;
    shape(left, t, time);
    shape(right, t, time);
    renderer.render(scene, camera);
  }
  raf = requestAnimationFrame(frame);

  return {
    open(): Promise<void> {
      if (opening) return Promise.resolve();
      /* The click's bloom: the light flares once, then the pull takes over. */
      bloomAt = performance.now();
      return new Promise<void>((resolve) => {
        resolveOpen = resolve;
        openStart = performance.now();
        opening = true;
      });
    },

    invite(on: boolean): void {
      poolHoverTarget = on ? 1 : 0;
    },

    dispose(): void {
      if (!alive) return;
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerGone);
      /* A pending open() must never leave its awaiter hanging — disposing
         mid-pull resolves it, so intro.ts's flow always continues. */
      const pending = resolveOpen;
      resolveOpen = null;
      if (pending) pending();
      for (const half of halves) {
        scene.remove(half.mesh);
        half.geo.dispose();
      }
      scene.remove(spot, spotTarget, pool, poolTarget, ambient, fill);
      labelTexL.dispose();
      labelTexR.dispose();
      materialL.dispose();
      materialR.dispose();
      renderer.dispose();
      /* Not merely polite: a browser keeps a small pool of live WebGL
         contexts and silently kills the oldest. Handing this one back means
         a `?intro` demo run five times over does not cost the page a
         context it might want later. */
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
