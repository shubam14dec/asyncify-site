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
  ACESFilmicToneMapping,
  AmbientLight,
  Color,
  DirectionalLight,
  Mesh,
  MeshPhysicalMaterial,
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
  /** Renderer, geometries, materials, listeners, canvas — all of it. */
  dispose(): void;
}

/* ── the numbers ───────────────────────────────────────────────────────── */

/** Mesh resolution per half. 97 × 65 = 6305 vertices; the folds need the
 *  horizontal density, the vertical is only carrying the taper and the sag. */
const SEG_X = 96;
const SEG_Y = 64;

/** Folds across one half at rest. Eight and a half, not eight: an integer
 *  count puts a crest at both edges of both halves and the centre seam reads
 *  as a mirror. */
const FOLDS = 8.5;

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

/** THE HAND (user call): the pointer presses a soft dimple into the cloth,
 *  following the cursor like a palm run across hanging velvet. Amplitude
 *  and radius as fractions of a half's span; the wobble gives the dent a
 *  living edge instead of a stamped circle. */
const HAND_AMP = 0.055;
const HAND_SIGMA = 0.17;
const HAND_WOB = 0.35;

/** The pull. 2.6s, power2.inOut. */
const OPEN_MS = 2600;

/** Two incommensurate sway frequencies (rad/s) — their sum never repeats, so
 *  the idle loop has no seam to notice. */
const SWAY_F1 = 0.31;
const SWAY_F2 = 0.47;

/** Spatial phase of the travelling sway along the cloth. */
const SWAY_K = 1.7;

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
  /** The fold profile and its derivative, both functions of m alone. */
  fold: Float32Array;
  dfold: Float32Array;
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
  /* Filmic, and a touch hot: everything in frame is within a stop or two of
     black, and the sheen highlights are the only thing carrying shape. */
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
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
  const material = new MeshPhysicalMaterial({
    color: new Color(0x0e0e0e),
    roughness: 0.85,
    metalness: 0,
    sheen: 1,
    sheenColor: new Color(0x9a9186),
    sheenRoughness: 0.5,
  });

  /* ── the stage wash ────────────────────────────────────────────────────
     One warm spot from top-centre-front, wide and very soft (penumbra 0.95)
     so the pool falls off down the cloth instead of drawing an edge. No
     decay: this is a theatre lamp a long way off, not a bulb in the room,
     and no shadow map — the fold normals do every bit of the shading. */
  /* Grade round 3 (probe loop): rounds 1-2 proved the HUE was the problem —
     a champagne lamp tints black cloth chocolate no matter the intensity.
     Black velvet under stage light reads as black cloth with near-NEUTRAL
     silvery-warm crest light, so the lamp goes almost white with only a
     whisper of warmth, and the narrower cone pools it centre-top. */
  const spot = new SpotLight(0xf7efdd, 3.0, 0, 0.9, 0.95, 0);
  spot.position.set(0, 4.4, 4.2);
  const spotTarget = new Object3D();
  spotTarget.position.set(0, -0.7, 0);
  scene.add(spot, spotTarget);
  spot.target = spotTarget;

  /* Enough to keep the valleys from clipping to absolute nothing. */
  const ambient = new AmbientLight(0x0b0b0d, 0.7);
  /* A dim front fill so the fabric nearest the camera is not a silhouette. */
  const fill = new DirectionalLight(0xcfc6b8, 0.1);
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
      mesh: new Mesh(geo, material),
      geo,
      pos: base,
      nrm: geo.attributes.normal!.array as Float32Array,
      dir,
      mPow: new Float32Array(n),
      mPowD: new Float32Array(n),
      mSoft: new Float32Array(n),
      mCube: new Float32Array(n),
      fold: new Float32Array(n),
      dfold: new Float32Array(n),
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
    /* Offset phases so neither half starts on a crest at its outer edge. */
    const p0 = dir > 0 ? 0.42 : 2.15;
    const p1 = dir > 0 ? 1.9 : 0.6;

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
      half.fold[i] = Math.cos(A * m + p0) + RIPPLE_DEPTH * Math.cos(B * m + p1);
      half.dfold[i] = -A * Math.sin(A * m + p0) - RIPPLE_DEPTH * B * Math.sin(B * m + p1);

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

    /* The hand's dent, precomputed per frame. */
    const sigma = span * HAND_SIGMA;
    const sigma2 = sigma * sigma;
    const reach = 3 * sigma;
    const handAmp = span * HAND_AMP * handStrength;
    const handOn = handAmp > 0.0005;

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
    const aFold = half.fold;
    const aDFold = half.dfold;
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

      const fold = aFold[i]!;
      const j = i * 3;
      const wx = xOuter + dir * g * span + sway;
      const wy = (v - 0.5) * height - sagAmt * aSag[i]! + liftY;
      let wz = depth * fold + env * swayZ;

      /* ANALYTIC NORMALS. z is a height field over (x, y), so the surface
         normal is (−∂z/∂x, −∂z/∂y, 1) normalised. ∂z/∂x comes through the
         material: (dz/dm)/(dx/dm), and dx/dm is dir·span·gp — which is why
         a compressed region automatically gets steeper, brighter fold walls
         instead of the flat shading a screen-space fold would give. */
      let nx = -(depth * aDFold[i]!) / (dir * span * gp);
      let ny = -(amp * aDAmpV[i]! * ampT * fold) / height;

      /* THE HAND: a gaussian press into the cloth under the pointer, with a
         slow-living edge, and — critically — its own slope folded into the
         normals so the dent SHADES instead of reading as a flat decal. */
      if (handOn) {
        const hdx = wx - handX;
        if (hdx > -reach && hdx < reach) {
          const hdy = wy - handY;
          if (hdy > -reach && hdy < reach) {
            const d2 = hdx * hdx + hdy * hdy;
            const gauss = Math.exp(-d2 / (2 * sigma2));
            const wob = 1 - HAND_WOB * 0.5 + HAND_WOB * 0.5 * Math.sin(4.2 * ((wx + wy) / span) - 5 * time);
            const press = handAmp * gauss * wob;
            wz -= press;
            const slope = press / sigma2;
            nx += slope * hdx;
            ny += slope * hdy;
          }
        }
      }

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
  let handIn = false;
  let handStrength = 0;

  function onPointerMove(e: PointerEvent): void {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    handX = (e.clientX / w - 0.5) * viewW;
    handY = (0.5 - e.clientY / h) * viewH;
    handIn = true;
  }
  function onPointerGone(): void {
    handIn = false;
  }
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  document.documentElement.addEventListener("pointerleave", onPointerGone);

  /* ── the loop ─────────────────────────────────────────────────────────── */

  let raf = 0;
  let alive = true;
  let openStart = 0;
  let opening = false;
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
    /* The hand arrives and leaves smoothly, and lets go as the pull begins —
       a parting curtain is nobody's to stroke. */
    const handTarget = handIn ? 1 - t : 0;
    handStrength += (handTarget - handStrength) * 0.08;
    shape(left, t, time);
    shape(right, t, time);
    renderer.render(scene, camera);
  }
  raf = requestAnimationFrame(frame);

  return {
    open(): Promise<void> {
      if (opening) return Promise.resolve();
      return new Promise<void>((resolve) => {
        resolveOpen = resolve;
        openStart = performance.now();
        opening = true;
      });
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
      scene.remove(spot, spotTarget, ambient, fill);
      material.dispose();
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
