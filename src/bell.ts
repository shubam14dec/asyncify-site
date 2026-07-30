/* ══════════════════════════════════════════════════════════════════════════
   SCENE 1 — THE BELL
   ──────────────────────────────────────────────────────────────────────────
   A bell hangs from a 1px thread. It breathes. It reacts to the cursor like a
   real object on a string. Click it and it rings: the clapper strikes, the
   body flexes, one green ripple leaves the mouth, six paths draw out to six
   channels, a packet runs each path, and a receipt lands under each chip.

   Everything below is driven by two damped-spring integrations on
   gsap.ticker — not keyframes. The constants are at the top and every one of
   them is explained, because tuning "does this feel like metal on a thread?"
   is the whole job of this file.
   ══════════════════════════════════════════════════════════════════════════ */

import { gsap } from "gsap";
import { acquirePointer, type PointerHandle } from "./pointer";

/* ══════════════════════════════════════════════════════════════════════════
   TUNING CONSTANTS  —  change these, not the code below
   ══════════════════════════════════════════════════════════════════════════ */

/* ── The bell pendulum ─────────────────────────────────────────────────────
   Integrated as a damped harmonic oscillator:   θ'' = −K·θ − D·θ'
   with θ in DEGREES and t in SECONDS.

   ω  = √K            → natural angular frequency
   ζ  = D / (2·√K)    → damping ratio (0 = rings forever, 1 = no overshoot)

   K = 20.0  → ω = 4.472 rad/s → period 1.405 s. A ~1.4 s period is what a
               fist-sized object on a ~50 cm thread actually does; anything
               faster reads as plastic, anything slower reads as a hot-air
               balloon.
   D = 1.45  → ζ = 0.162. Amplitude envelope is e^(−ζωt) = e^(−0.724·t):
               50% at 1.0 s, 12% at 3.0 s, 5.7% at 4.0 s. So a hard flick
               shows ~5 clean swings and is visually dead at ~3.5–4 s, which
               is the brief. ζ below ~0.08 looks like a physics-demo pendulum
               (it never stops, and it gets annoying). ζ above ~0.30 looks
               like the bell is hanging in syrup.                            */
const BELL_K = 20.0;
const BELL_D = 1.45;

/** Hard cap on angular velocity. 90 deg/s ⇒ peak angle ≈ 90/ω ≈ 20°.
 *  Beyond ~22° the flat SVG bell stops reading as a bell and starts reading
 *  as a windscreen wiper. */
const BELL_MAX_VEL = 90;

/** Snap-to-rest thresholds. Without these the sim jitters forever at the
 *  sub-pixel level and the GPU never gets to idle. */
const BELL_REST_ANGLE = 0.02; // deg
const BELL_REST_VEL = 0.05; // deg/s

/* ── The clapper ───────────────────────────────────────────────────────────
   A second, stiffer spring whose target is the bell's own angle:
       clap'' = KC·(bellAngle − clapAngle) − DC·clap'

   KC = 48   → ω_c = 6.93 rad/s (the clapper is a shorter pendulum than the
               bell, so it must be faster — that is what makes it read as a
               separate object rather than as part of the drawing).
   DC = 5.5  → ζ_c = 0.397.

   Driven at the bell's ω = 4.472 (r = ω/ω_c = 0.645) this gives:
       phase lag = atan( 2ζ_c·r / (1 − r²) ) ≈ 41°  ≈ 11% of a cycle
       gain      = 1 / √((1−r²)² + (2ζ_c·r)²) ≈ 1.29
   i.e. the clapper trails the bell by about a tenth of a swing and
   over-swings it by ~30%. That over-swing is the tell that sells it.        */
const CLAP_K = 48;
const CLAP_D = 5.5;

/** Impulse injected into the clapper on a ring, in deg/s.
 *  Peak angle ≈ vel/ω_c = 140/6.93 ≈ 20.2°, which is the angle at which the
 *  ball reaches the inner wall — measured off the geometry in index.html:
 *  arm length 99−26 = 73u, ball radius 9.5u, and the right profile passes
 *  x ≈ 39.4 at y ≈ 93, so contact needs asin((39.4−9.5)/73) ≈ 24°:
 *  166/6.93 ≈ 24.0°. The clapper therefore visibly touches the wall; it does
 *  not pass through it or stop short, which is what makes a strike a strike. */
const CLAP_STRIKE_VEL = 166;

/** Newton's third law, scaled. The bell takes back ~30% of the clapper's
 *  strike energy, reduced by the clapper↔bell inertia ratio (the bell is much
 *  heavier), landing at 20 deg/s in the opposite direction.
 *  Peak ≈ 20/4.472 ≈ 4.5°: clearly visible, never comic. */
const RING_BELL_KICK = -20;

/* ── Idle breath (BEAT 1) ─────────────────────────────────────────────────
   Purely decorative and purely additive: a slow sine layered on top of
   whatever the physics is doing, so a bell at rest is never quite dead. */
const SWAY_DEG = 0.5; // ±0.5°
const SWAY_PERIOD = 6; // seconds
const SWAY_CLAP_GAIN = 1.25; // clapper breathes a little wider than the bell
const SWAY_CLAP_LAG = 0.9; // 0.9 s of 6 s = 15% phase behind

/* ── Cursor coupling (BEAT 2) ─────────────────────────────────────────────
   Momentum transfer is applied as a RATE on the ticker, not as an impulse per
   mousemove event — otherwise a high-polling-rate mouse deposits ten times
   the energy of a low-polling-rate one for the identical gesture.

   The velocity estimate itself (sliding window, staleness) lives in
   pointer.ts, because the headline's words are brushed by the same cursor and
   the two scenes must agree on what "fast" means. */

/** Influence radius = this × the bell's on-screen height. 1.7 means a bell
 *  ~170px tall is felt from ~290px away: close enough that the reaction feels
 *  caused, far enough that you discover it by accident. */
const POINTER_RADIUS_K = 1.7;

/** deg/s of angular velocity added per (px/s of pointer velocity) per second
 *  of contact, at proximity 1. Worked example: a deliberate flick across the
 *  bell at 3000 px/s with proximity ~0.9 for ~0.10 s deposits
 *  3000 × 0.9 × 0.18 × 0.10 ≈ 49 deg/s ⇒ ~11° peak. A lazy drift past at
 *  600 px/s deposits ~2°. That spread is the whole feel of the interaction. */
const POINTER_TRANSFER = 0.18;

/* ── Drag (touch, and mouse-down drag) ────────────────────────────────────── */
const DRAG_DEG_PER_PX = 0.12; // 150px of drag ⇒ 18°, the full range
const DRAG_MAX_DEG = 18;
const DRAG_CLICK_SLOP = 6; // px of movement below which a drag is a click

/* ── The ring sequence (BEAT 3) ───────────────────────────────────────────── */
const RIPPLE_FROM = 0.2;
const RIPPLE_TO = 2.2;
const RIPPLE_DUR = 0.9;
const PATH_DRAW_DUR = 0.5;
const PATH_STAGGER = 0.06;
/** Per-path packet flight time. Fixed rather than random so the arrival
 *  rhythm is designed, not rolled: the two centre paths are shortest, the
 *  outer ones take longer, and no two arrivals land on the same frame. */
const PKT_DUR = [0.62, 0.55, 0.71, 0.58, 0.75, 0.66];
/** Draw/arrive order: centre pair first, then outward. Reads as a spray. */
const PKT_ORDER = [2, 3, 1, 4, 0, 5];
const HOLD_AFTER_LAST = 1.6;
const AUTO_RING_DELAY_MS = 2200;

/** When the ring's pressure wave leaves the bell, in seconds from t=0. This is
 *  the same instant the green ripple leaves the mouth (see the RIPPLE tween
 *  below) — one event, two renderings of it: a circle expanding through space
 *  and a shiver passing through the type. Fire it at the strike (0.055) and it
 *  reads as a separate, earlier thing. */
const RESONANCE_LEAD = 0.09;


/* ── Composition ──────────────────────────────────────────────────────────
   The scene band is whatever vertical space is left between the top edge of
   the viewport and the copy block, measured at runtime. These are its shares. */
/** Bell height as a fraction of the band, then clamped. The bell is the hero;
 *  the fan below it is protected by FAN_MAX_ASPECT rather than by starving the
 *  bell of size. */
const BELL_BAND_SHARE = 0.52;
const BELL_MIN_PX = 132;
const BELL_MAX_PX = 325;
/** How far below the top edge the thread ends (= the bell's pivot). */
const PIVOT_BAND_SHARE = 0.09;
const PIVOT_MIN_PX = 42;
const PIVOT_MAX_PX = 108;
/** Minimum air between the bell's mouth and the nearest chip. */
const BELL_CHIP_CLEARANCE = 56;
/** Half-width of the chip row, as a fraction of the viewport. Wider than
 *  ~0.34 and the fan's aspect ratio (spread ÷ drop) gets so extreme that no
 *  amount of control-point work makes the paths read as curves. */
const CHIP_SPREAD_RATIO = 0.40;
const CHIP_SPREAD_MAX = 520;
/** A taller bell eats the vertical drop the fan has to work with. Rather than
 *  shrink the bell back, narrow the fan: a path whose horizontal run is more
 *  than ~5× its vertical drop cannot be made to read as a curve by any amount
 *  of control-point work. This is what keeps the +30% bell honest on a short
 *  laptop window; on a normal-height monitor the cap never engages. */
const FAN_MAX_ASPECT = 6.5;
/** …but never narrower than this, or the six chips crowd into each other. */
const FAN_MIN_SPREAD = 380;
/** Upper bound on the mouth→chip gap. Without it, a very tall monitor parks
 *  the chips 480px below the bell with nothing in between. */
const CHIP_GAP_MAX_SHARE = 0.3;
const CHIP_GAP_MAX_PX = 260;
/** Arc depth as a fraction of the chip spread's half-width. Below ~0.10 a
 *  wide row of chips reads as a wonky line, not as an arc. */
const CHIP_ARC_RATIO = 0.12;
const CHIP_ARC_MAX = 44;
/* Signal-path control handles, as fractions of the path's own delta. Both y
   handles push the curve DOWN off the chord, so it hangs:
       midpoint = chord midpoint + (0.375·0.70 + 0.375·1.12 + 0.125 − 0.5)·dy
                = chord midpoint + 0.31·dy
   Zero sag is a spider's web. ~0.30 reads as a cable with weight on it, which
   is the world this scene is in — everything here hangs. */
const SIG_LEAD_Y = 0.7;
const SIG_OVERSHOOT_Y = 0.12;
/** x handles: keep the six paths bundled as they leave the mouth, then let
 *  them peel apart. */
const SIG_BUNDLE_X = 0.28;
const SIG_ARRIVE_X = 0.24;

/* ══════════════════════════════════════════════════════════════════════════
   BELL GEOMETRY  —  local units, origin (0,0) = where the thread attaches
   These MUST match the path data in index.html.
   ══════════════════════════════════════════════════════════════════════════ */
const BELL = {
  /** pivot → mouth. Used as "the height of the bell" everywhere. */
  H: 114,
  /** y of the rim, averaged across the sag. Ripple + signal paths start here. */
  MOUTH_Y: 113,
  /** half-width of the mouth */
  MOUTH_HALF: 50,
  /** the clapper's yoke — its rotation origin */
  CLAP_PIVOT_Y: 26,
  /** clapper ball centre — must match #c-ball in index.html */
  CLAP_BALL_CX: 0.3,
  CLAP_BALL_CY: 99,
  /** widest point of the silhouette, including the lip curls — for the hit box */
  BODY_HALF: 54,
  /** ripple radius at scale 1, in bell-local units */
  RIPPLE_R: 70,
} as const;

/* ══════════════════════════════════════════════════════════════════════════
   CHANNELS
   ══════════════════════════════════════════════════════════════════════════ */
const CHANNELS = ["email", "sms", "push", "in-app", "telegram", "slack"] as const;

const COLOR = {
  green: "#3dd68c",
  clapRest: "#d6d6d6",
  faint: "#6e6e6e",
  hairline: "#262626",
  hairlineStrong: "#3f3f3f",
} as const;

const SVG_NS = "http://www.w3.org/2000/svg";
const TAU = Math.PI * 2;

/* ── small helpers ─────────────────────────────────────────────────────────── */

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
const smoothstep = (t: number) => t * t * (3 - 2 * t);

function q<T extends Element>(root: ParentNode, sel: string): T {
  const el = root.querySelector<T>(sel);
  if (!el) throw new Error(`[bell] missing element: ${sel}`);
  return el;
}

/* ══════════════════════════════════════════════════════════════════════════
   SCENE
   ══════════════════════════════════════════════════════════════════════════ */

export interface BellSceneOptions {
  /** When true: no ticker, no physics, no travel. See DESIGN.md §3. */
  reducedMotion: boolean;
  /** The H1's per-word boxes, already split by the headline scene. The
   *  entrance tweens these; who owns them afterwards is not this file's
   *  business. Empty under reduced motion, where the copy cross-fades whole. */
  headlineWords?: readonly Element[];
  /** The entrance has landed (t = 1.30s). Whoever wants the headline back
   *  gets it here. */
  onEntranceComplete?: () => void;
  /** A ring is happening, and its pressure wave is leaving the mouth right
   *  now. The argument is the mouth's x in client pixels — the origin any
   *  downstream wave should radiate from. Fires for the auto-ring too, and
   *  never under reduced motion. */
  onRing?: (originClientX: number, originClientY?: number) => void;
}

export interface BellScene {
  playEntrance(): void;
  destroy(): void;
}

export function createBellScene(opts: BellSceneOptions): BellScene {
  const { reducedMotion } = opts;
  const doc = document;

  /* ── elements ──────────────────────────────────────────────────────────── */
  const hero = q<HTMLElement>(doc, "#hero");
  const nav = q<HTMLElement>(doc, ".nav");
  const copy = q<HTMLElement>(doc, "#copy");
  const headline = q<HTMLElement>(doc, "#headline");
  const subline = q<HTMLElement>(doc, ".subline");
  const actions = q<HTMLElement>(doc, ".actions");
  const hintWrap = q<HTMLElement>(doc, ".hint-wrap");
  const chipsLayer = q<HTMLElement>(doc, "#chips");
  const bellBtn = q<HTMLButtonElement>(doc, "#bell-btn");

  const scene = q<SVGSVGElement>(doc, "#scene");
  const signalsG = q<SVGGElement>(scene, "#signals");
  const ripple = q<SVGCircleElement>(scene, "#ripple");
  const thread = q<SVGPathElement>(scene, "#thread");
  const bellRoot = q<SVGGElement>(scene, "#bell-root");
  const bellSwing = q<SVGGElement>(scene, "#bell-swing");
  const bellFlex = q<SVGGElement>(scene, "#bell-flex");
  const clapper = q<SVGGElement>(scene, "#clapper");
  const clapBall = q<SVGCircleElement>(scene, "#c-ball");
  const glint = q<SVGPathElement>(scene, "#b-glint");
  /** The two foundry words cast on the outer skirt (index.html). Held once
   *  rather than re-selected per ring — and because the entrance has to hide
   *  them: they are type, not a stroke, so drawSVG cannot trace them, and left
   *  alone they sit in empty space for the second before the bell exists. */
  const foundry = Array.from(scene.querySelectorAll<SVGTextElement>(".foundry"));

  /** Draw order for the entrance trace. Reads like a hand: loop, cap, both
   *  shoulders, the rim, the lip flicks, then the guts. */
  const bellDrawOrder = [
    "#b-crown",
    "#b-side-l",
    "#b-side-r",
    "#b-mouth",
    "#b-lip-l",
    "#b-lip-r",
    "#b-yoke",
    "#c-shaft",
    "#c-ball",
  ].map((sel) => q<SVGGeometryElement>(scene, sel));

  /* ── generated DOM: 6 paths + 6 packets + 6 chip slots ─────────────────── */
  const sigEls: SVGPathElement[] = [];
  const pktEls: SVGCircleElement[] = [];
  const chipEls: HTMLElement[] = [];
  const dotEls: HTMLElement[] = [];
  const receiptEls: HTMLElement[] = [];
  const slotEls: HTMLElement[] = [];

  for (const name of CHANNELS) {
    const path = doc.createElementNS(SVG_NS, "path");
    path.setAttribute("class", "sig");
    path.setAttribute("d", "M 0 0");
    signalsG.appendChild(path);
    sigEls.push(path);

    const pkt = doc.createElementNS(SVG_NS, "circle");
    pkt.setAttribute("class", "pkt");
    pkt.setAttribute("r", "3");
    signalsG.appendChild(pkt);
    pktEls.push(pkt);

    const slot = doc.createElement("div");
    slot.className = "chip-slot";

    const chip = doc.createElement("div");
    chip.className = "chip";
    const dot = doc.createElement("span");
    dot.className = "chip-dot";
    const label = doc.createElement("span");
    label.className = "chip-label";
    label.textContent = name;
    chip.append(dot, label);

    const receipt = doc.createElement("div");
    receipt.className = "receipt";
    receipt.textContent = "delivered · 0ms";

    slot.append(chip, receipt);
    chipsLayer.appendChild(slot);

    slotEls.push(slot);
    chipEls.push(chip);
    dotEls.push(dot);
    receiptEls.push(receipt);
  }

  /* ── layout state (pixel space; the SVG viewBox equals the pixel size, so
        SVG user units and CSS pixels are the same number everywhere) ─────── */
  let heroRect = hero.getBoundingClientRect();
  let cx = 0;
  let pivotY = 0;
  let bellScale = 1;
  let mouthX = 0;
  let mouthY = 0;
  let bellPxH = 1;

  /* ── simulation state ──────────────────────────────────────────────────── */
  let bellAngle = 0;
  let bellVel = 0;
  let clapAngle = 0;
  let clapVel = 0;
  let elapsed = 0;
  /** Strike squash, owned by GSAP, applied in tick(). Origin is (0,0) — the
   *  thread pivot — so the mouth is what visibly widens, not the crown. */
  const flex = { sx: 1, sy: 1 };

  /* ── pointer state ─────────────────────────────────────────────────────── */
  /** Position and velocity come from the shared tracker (pointer.ts); only
   *  the bell's own proximity weighting is computed here. */
  let pointer: PointerHandle | null = null;
  let pointerProx = 0;

  /* ── drag state ────────────────────────────────────────────────────────── */
  let dragging = false;
  let dragStartX = 0;
  let dragStartAngle = 0;
  let dragAngle = 0;
  let dragMoved = 0;
  let suppressClick = false;

  /* ── timelines ─────────────────────────────────────────────────────────── */
  let ringTl: gsap.core.Timeline | null = null;
  let glintTl: gsap.core.Timeline | null = null;
  let entranceTl: gsap.core.Timeline | null = null;
  let userHasRung = false;
  let autoRingTimer = 0;




  function paintStamp(): void {
  }

  function bumpStamp(): void {
    try {
    } catch {
      /* non-fatal: the number still counts up for this session */
    }
    paintStamp();
  }

  paintStamp();

  /* ════════════════════════════════════════════════════════════════════════
     LAYOUT
     ════════════════════════════════════════════════════════════════════════ */

  function layout(): void {
    heroRect = hero.getBoundingClientRect();
    const W = heroRect.width;
    const H = heroRect.height;
    if (W < 2 || H < 2) return;

    scene.setAttribute("viewBox", `0 0 ${W} ${H}`);

    /* The band the scene may occupy: from the very top edge (the thread hangs
       off it) down to just above the copy block. Measured, not guessed, so
       the bell can never collide with the headline at any viewport. */
    const copyRect = copy.getBoundingClientRect();
    const bandBottom = Math.max(220, copyRect.top - heroRect.top - 24);
    const isMobile = W < 768;

    pivotY = clamp(bandBottom * PIVOT_BAND_SHARE, PIVOT_MIN_PX, PIVOT_MAX_PX);
    const targetH = isMobile
      ? clamp(bandBottom * 0.42, 118, 240)
      : clamp(bandBottom * BELL_BAND_SHARE, BELL_MIN_PX, BELL_MAX_PX);
    bellScale = targetH / BELL.H;
    bellPxH = targetH;
    cx = W / 2;
    mouthX = cx;
    mouthY = pivotY + BELL.MOUTH_Y * bellScale;

    bellRoot.setAttribute("transform", `translate(${cx} ${pivotY}) scale(${bellScale})`);
    thread.setAttribute("d", `M ${cx} 0 L ${cx} ${pivotY}`);


    ripple.setAttribute("cx", String(mouthX));
    ripple.setAttribute("cy", String(mouthY));
    ripple.setAttribute("r", String(BELL.RIPPLE_R * bellScale));
    // Explicit origin: the ripple grows out of the mouth, not out of nowhere.
    gsap.set(ripple, { svgOrigin: `${mouthX} ${mouthY}`, scale: 1, opacity: 0 });

    /* Bell hit target: the bounding box of the artwork plus 10px of slop. */
    const hitW = 2 * (BELL.BODY_HALF * bellScale + 10);
    const hitH = (BELL.H + 8) * bellScale + 14;
    bellBtn.style.width = `${hitW}px`;
    bellBtn.style.height = `${hitH}px`;
    bellBtn.style.transform = `translate(${cx - hitW / 2}px, ${pivotY - 10}px)`;

    /* ── chip positions ──────────────────────────────────────────────────── */
    const CHIP_H = 28;
    const CHIP_GAP = 8;
    const RECEIPT_H = 12;

    const pts: { x: number; y: number }[] = [];

    if (isMobile) {
      // Two rows of three, centred in whatever is left below the bell.
      const colHalf = Math.min(W * 0.34, 152);
      const rowGap = 56;
      const blockH = rowGap + CHIP_H + CHIP_GAP + RECEIPT_H;
      const centred = mouthY + (bandBottom - mouthY - blockH) / 2;
      const topY = clamp(centred, mouthY + 46, bandBottom - blockH);
      for (let i = 0; i < CHANNELS.length; i++) {
        const col = (i % 3) - 1; // -1, 0, 1
        const row = Math.floor(i / 3);
        pts.push({ x: cx + col * colHalf, y: topY + row * rowGap });
      }
    } else {
      /* One wide arc. It bows DOWN in the middle (a ∪, not a ∩) because the
         chips sit on a circle centred on the bell's mouth: the chip directly
         below the bell is the one furthest from it. That also keeps the six
         flight paths close to the same length, so the packets land together. */
      const fixedBlock = CHIP_H + CHIP_GAP + RECEIPT_H;
      const wantSpread = Math.min(W * CHIP_SPREAD_RATIO, CHIP_SPREAD_MAX);
      const wantArc = clamp(wantSpread * CHIP_ARC_RATIO, 16, CHIP_ARC_MAX);

      // How much vertical drop the outermost path will actually get, assuming
      // the full spread. If that makes the fan too flat to read as curves,
      // narrow the fan rather than shrink the bell.
      const provisionalDrop = bandBottom - fixedBlock - wantArc - mouthY;
      const halfSpread = Math.min(
        wantSpread,
        Math.max(FAN_MIN_SPREAD, provisionalDrop * FAN_MAX_ASPECT),
      );

      // Depth of the arc, then trimmed to whatever room is actually left
      // between the bell and the headline. Flatten the arc before crowding
      // either of them.
      const room = bandBottom - (mouthY + BELL_CHIP_CLEARANCE);
      const arcDrop = Math.min(
        clamp(halfSpread * CHIP_ARC_RATIO, 16, CHIP_ARC_MAX),
        Math.max(12, room - fixedBlock),
      );

      // Anchored to the bottom of the band — the chips sit directly above the
      // headline and the bell breathes into whatever is left — but never more
      // than CHIP_GAP_MAX below the mouth, so a tall monitor does not open a
      // void between the two.
      const outerY = Math.min(
        bandBottom - fixedBlock - arcDrop,
        mouthY + clamp(bandBottom * CHIP_GAP_MAX_SHARE, 96, CHIP_GAP_MAX_PX),
      );

      for (let i = 0; i < CHANNELS.length; i++) {
        const t = -1 + i * 0.4; // -1, -0.6, -0.2, 0.2, 0.6, 1
        pts.push({ x: cx + t * halfSpread, y: outerY + arcDrop * (1 - t * t) });
      }
    }

    for (let i = 0; i < CHANNELS.length; i++) {
      const p = pts[i]!;
      // translateX(-50%) centres the slot on its anchor; the anchor y IS the
      // top of the chip, which is exactly where its signal path terminates.
      slotEls[i]!.style.transform = `translate(${p.x}px, ${p.y}px) translateX(-50%)`;

      // Signal path: a cable with weight on it. See SIG_* above.
      const dx = p.x - mouthX;
      const dy = p.y - mouthY;
      const c1x = mouthX + dx * SIG_BUNDLE_X;
      const c1y = mouthY + dy * SIG_LEAD_Y;
      const c2x = p.x - dx * SIG_ARRIVE_X;
      const c2y = p.y + dy * SIG_OVERSHOOT_Y;
      sigEls[i]!.setAttribute(
        "d",
        `M ${mouthX} ${mouthY} C ${c1x} ${c1y} ${c2x} ${c2y} ${p.x} ${p.y}`,
      );
    }
  }

  /* ════════════════════════════════════════════════════════════════════════
     SIMULATION  (skipped entirely under reduced motion)
     ════════════════════════════════════════════════════════════════════════ */

  function tick(_time: number, deltaMs: number): void {
    // Clamp dt so a backgrounded tab does not resume with a 3-second step and
    // blow the integrator apart.
    const dt = Math.min(deltaMs, 50) / 1000;
    elapsed += dt;

    if (dragging) {
      bellAngle = dragAngle;
      bellVel = 0;
    } else {
      // Cursor momentum, applied as a rate so the result is independent of
      // mouse polling frequency. `vx` is already zero once the pointer has
      // been still for POINTER_STALE_MS — see pointer.ts.
      const vx = pointer ? pointer.vx : 0;
      if (vx !== 0 && pointerProx > 0) {
        bellVel += vx * pointerProx * POINTER_TRANSFER * dt;
      }
      // θ'' = −K·θ − D·θ'   (semi-implicit Euler: velocity first, then angle)
      bellVel += (-BELL_K * bellAngle - BELL_D * bellVel) * dt;
      bellVel = clamp(bellVel, -BELL_MAX_VEL, BELL_MAX_VEL);
      bellAngle += bellVel * dt;
      if (Math.abs(bellAngle) < BELL_REST_ANGLE && Math.abs(bellVel) < BELL_REST_VEL) {
        bellAngle = 0;
        bellVel = 0;
      }
    }

    // The clapper chases the bell's angle through its own, stiffer spring.
    clapVel += (CLAP_K * (bellAngle - clapAngle) - CLAP_D * clapVel) * dt;
    clapAngle += clapVel * dt;

    // Idle breath, additive on top of the physics.
    const phase = (elapsed / SWAY_PERIOD) * TAU;
    const sway = SWAY_DEG * Math.sin(phase);
    const swayClap =
      SWAY_DEG * SWAY_CLAP_GAIN * Math.sin(((elapsed - SWAY_CLAP_LAG) / SWAY_PERIOD) * TAU);

    const bellWorld = bellAngle + sway;
    const clapWorld = clapAngle + swayClap;

    // rotate(deg) with no centre = rotate about (0,0) = the thread pivot.
    bellSwing.setAttribute("transform", `rotate(${bellWorld.toFixed(3)})`);
    // The clapper is INSIDE the swing group, so it only needs the difference.
    clapper.setAttribute(
      "transform",
      `rotate(${(clapWorld - bellWorld).toFixed(3)} 0 ${BELL.CLAP_PIVOT_Y})`,
    );
    // scale() with no centre = scale about (0,0): the mouth flexes, not the crown.
    bellFlex.setAttribute("transform", `scale(${flex.sx.toFixed(4)} ${flex.sy.toFixed(4)})`);
  }

  /* ════════════════════════════════════════════════════════════════════════
     POINTER
     ════════════════════════════════════════════════════════════════════════ */

  function onPointerMove(): void {
    if (!pointer) return;

    // Proximity to the bell's visual centre-of-mass (~55% down the body).
    const px = pointer.clientX - heroRect.left;
    const py = pointer.clientY - heroRect.top;
    const bcx = cx;
    const bcy = pivotY + BELL.H * 0.55 * bellScale;
    const dist = Math.hypot(px - bcx, py - bcy);
    const radius = bellPxH * POINTER_RADIUS_K;
    pointerProx = smoothstep(clamp(1 - dist / radius, 0, 1));

    if (dragging) {
      const dxp = pointer.clientX - dragStartX;
      dragMoved = Math.max(dragMoved, Math.abs(dxp));
      dragAngle = clamp(dragStartAngle + dxp * DRAG_DEG_PER_PX, -DRAG_MAX_DEG, DRAG_MAX_DEG);
    }
  }

  function onPointerDown(e: PointerEvent): void {
    if (reducedMotion) return;
    // A drag that ended outside the button never fires a click, which would
    // otherwise leave this flag set and swallow the user's next real one.
    suppressClick = false;
    dragging = true;
    dragStartX = e.clientX;
    dragStartAngle = bellAngle;
    dragAngle = bellAngle;
    dragMoved = 0;
    // The samples from before the grab belong to the approach, not to the
    // gesture; handing them to the throw would fling the bell on contact.
    pointer?.reset();
    bellBtn.setPointerCapture(e.pointerId);
  }

  function onPointerUp(e: PointerEvent): void {
    if (!dragging) return;
    dragging = false;
    if (bellBtn.hasPointerCapture(e.pointerId)) bellBtn.releasePointerCapture(e.pointerId);

    if (dragMoved >= DRAG_CLICK_SLOP) {
      // Released mid-drag: hand the gesture's velocity to the sim so the bell
      // keeps going instead of stopping dead in the hand.
      suppressClick = true;
      const vx = pointer ? pointer.vx : 0;
      bellVel = clamp(vx * DRAG_DEG_PER_PX, -BELL_MAX_VEL, BELL_MAX_VEL);
    }
  }

  /* ════════════════════════════════════════════════════════════════════════
     RING  (BEAT 3)
     ════════════════════════════════════════════════════════════════════════ */

  /** Latency correlates with the packet's flight time, plus jitter — so a
   *  slow-arriving channel also reports a slower number. Mock data, by design. */
  function randomiseReceipts(): void {
    for (let i = 0; i < CHANNELS.length; i++) {
      const norm = (PKT_DUR[i]! - 0.55) / 0.2; // 0 → 1 across the duration range
      const ms = clamp(Math.round(90 + norm * 230 + (Math.random() * 80 - 40)), 80, 400);
      receiptEls[i]!.textContent = `delivered · ${ms}ms`;
    }
  }

  function resetSignals(): void {
    gsap.set(sigEls, { drawSVG: "0% 0%", opacity: 1 });
    gsap.set(pktEls, { opacity: 0 });
    gsap.set(receiptEls, { opacity: 0, y: 0 });
    gsap.set(dotEls, { backgroundColor: COLOR.faint, scale: 1 });
    gsap.set(chipEls, { borderColor: COLOR.hairline });
    gsap.set(ripple, { opacity: 0, scale: 1 });
    gsap.set(clapBall, {
      fill: COLOR.clapRest,
      stroke: COLOR.clapRest,
      scale: 1,
      svgOrigin: `${BELL.CLAP_BALL_CX} ${BELL.CLAP_BALL_CY}`,
    });
    flex.sx = 1;
    flex.sy = 1;
  }

  function ring(): void {
    if (autoRingTimer) {
      clearTimeout(autoRingTimer);
      autoRingTimer = 0;
    }
    ringTl?.kill();
    ringTl = null;
    resetSignals();
    randomiseReceipts();
    // One event, one number — user click, auto-ring and reduced motion alike.
    bumpStamp();

    if (reducedMotion) {
      ringStill();
      return;
    }

    const tl = gsap.timeline();
    ringTl = tl;

    /* 1 ── the strike. Two impulses into the two springs; the springs do the
           rest. No keyframed swing anywhere. */
    tl.call(
      () => {
        clapVel += CLAP_STRIKE_VEL;
        bellVel += RING_BELL_KICK;
      },
      undefined,
      0,
    );

    /* 1b ── squash-flex, starting the frame the clapper reaches the wall
            (~55ms into a 200 deg/s throw). 1.02/0.98 → 0.99/1.01 → 1 over
            180ms: the bell widens at the mouth, rebounds narrow, settles. */
    tl.to(flex, { sx: 1.02, sy: 0.98, duration: 0.06, ease: "power2.out" }, 0.055)
      .to(flex, { sx: 0.99, sy: 1.01, duration: 0.06, ease: "power2.inOut" }, 0.115)
      .to(flex, { sx: 1, sy: 1, duration: 0.06, ease: "power2.out" }, 0.175);

    /* 1c ── the ball flashes pure white on contact with a 1.3× pop, then
            settles back to its resting neutral — the strike as light, no color. Origin is the ball's
            own centre in bell-local space. */
    tl.to(
      clapBall,
      {
        fill: "#ffffff",
        stroke: "#ffffff",
        scale: 1.3,
        duration: 0.09,
        ease: "power2.out",
        svgOrigin: `${BELL.CLAP_BALL_CX} ${BELL.CLAP_BALL_CY}`,
      },
      0.055,
    )
      .to(clapBall, { scale: 1, duration: 0.16, ease: "power2.inOut" }, 0.145)
      .to(
        clapBall,
        { fill: COLOR.clapRest, stroke: COLOR.clapRest, duration: 0.5, ease: "power1.inOut" },
        0.34,
      );

    /* 1d ── the same instant, told again in type: the pressure wave leaves
             the mouth and crosses the headline. The bell knows only where its
             mouth is; what resonates with it is not its problem. */
    tl.call(
      () => {
        // The inscription catches light as the bell sounds.
        gsap.fromTo(
          foundry,
          { opacity: 0.4 },
          { opacity: 1, duration: 0.28, yoyo: true, repeat: 1, ease: "power1.inOut" },
        );
        opts.onRing?.(heroRect.left + mouthX, heroRect.top + mouthY);
      },
      undefined,
      RESONANCE_LEAD,
    );

    /* 2 ── one green ring out of the mouth. Non-scaling-stroke keeps it a
           1.25px hairline the whole way out, which is the difference between
           a ripple and a bubble. */
    tl.fromTo(
      ripple,
      { scale: RIPPLE_FROM, opacity: 0.8 },
      { scale: RIPPLE_TO, opacity: 0, duration: RIPPLE_DUR, ease: "expo.out" },
      0.09,
    );

    /* 3+4 ── six paths draw outward; a packet runs each one. */
    let lastArrival = 0;

    PKT_ORDER.forEach((idx, k) => {
      const t = 0.1 + k * PATH_STAGGER;
      const sig = sigEls[idx]!;
      const pkt = pktEls[idx]!;
      const dot = dotEls[idx]!;
      const chip = chipEls[idx]!;
      const receipt = receiptEls[idx]!;
      const dur = PKT_DUR[idx]!;
      const launch = t + 0.06;
      const arrive = launch + dur;
      lastArrival = Math.max(lastArrival, arrive);

      tl.fromTo(
        sig,
        { drawSVG: "0% 0%" },
        { drawSVG: "0% 100%", duration: PATH_DRAW_DUR, ease: "power2.out" },
        t,
      );

      tl.fromTo(pkt, { opacity: 0 }, { opacity: 1, duration: 0.1, ease: "none" }, launch);
      tl.to(
        pkt,
        {
          motionPath: { path: sig, align: sig, alignOrigin: [0.5, 0.5] },
          duration: dur,
          ease: "power1.inOut",
          immediateRender: false,
        },
        launch,
      );
      tl.set(pkt, { opacity: 0 }, arrive);

      /* 5 ── delivered. Dot flips green with a 1.4× pop-settle (two power2
             tweens, never an elastic ease — see DESIGN.md §3). */
      tl.to(dot, { backgroundColor: COLOR.green, duration: 0.08, ease: "none" }, arrive);
      tl.to(dot, { scale: 1.4, duration: 0.09, ease: "power2.out" }, arrive)
        .to(dot, { scale: 1, duration: 0.09, ease: "power2.inOut" }, arrive + 0.09);
      tl.to(chip, { borderColor: COLOR.hairlineStrong, duration: 0.2, ease: "none" }, arrive);
      tl.fromTo(
        receipt,
        { opacity: 0, y: 4 },
        { opacity: 1, y: 0, duration: 0.22, ease: "power2.out" },
        arrive + 0.02,
      );
    });

    /* 6 ── hold, then take it all back down. Paths drain toward the bell
           (drawSVG end retreats to the start), so the frame empties in the
           opposite direction to how it filled. */
    const out = lastArrival + 0.28 + HOLD_AFTER_LAST;
    tl.to(receiptEls, { opacity: 0, duration: 0.24, stagger: 0.03, ease: "power2.in" }, out);
    tl.to(
      sigEls,
      { drawSVG: "0% 0%", duration: 0.42, stagger: 0.04, ease: "power2.inOut" },
      out + 0.06,
    );
    tl.to(dotEls, { backgroundColor: COLOR.faint, duration: 0.3, stagger: 0.03 }, out + 0.1);
    tl.to(chipEls, { borderColor: COLOR.hairline, duration: 0.3, stagger: 0.03 }, out + 0.1);
  }

  /** Reduced-motion ring: the same information, delivered by opacity only. */
  function ringStill(): void {
    const tl = gsap.timeline();
    ringTl = tl;
    tl.set(sigEls, { drawSVG: "0% 100%", opacity: 0 })
      .to(sigEls, { opacity: 1, duration: 0.2, ease: "none" }, 0)
      // The delivered-dot still fires — colour only, no pop, no scale.
      .to(clapBall, { fill: "#ffffff", stroke: "#ffffff", duration: 0.2, ease: "none" }, 0)
      .to(
        clapBall,
        { fill: COLOR.clapRest, stroke: COLOR.clapRest, duration: 0.4, ease: "none" },
        1.1,
      )
      .to(dotEls, { backgroundColor: COLOR.green, duration: 0.2, ease: "none" }, 0)
      .to(chipEls, { borderColor: COLOR.hairlineStrong, duration: 0.2, ease: "none" }, 0)
      .to(receiptEls, { opacity: 1, duration: 0.2, ease: "none" }, 0.05)
      .to([...receiptEls, ...sigEls], { opacity: 0, duration: 0.3, ease: "none" }, 2.1)
      .to(dotEls, { backgroundColor: COLOR.faint, duration: 0.3, ease: "none" }, 2.1)
      .to(chipEls, { borderColor: COLOR.hairline, duration: 0.3, ease: "none" }, 2.1);
  }

  /* ════════════════════════════════════════════════════════════════════════
     RIM GLINT  (BEAT 1)
     ════════════════════════════════════════════════════════════════════════ */

  function startGlint(): void {
    glintTl?.kill();
    // A 12%-long lit segment travels the rim arc, with an opacity envelope so
    // it does not pop in and out at the ends of the path.
    glintTl = gsap
      .timeline({ repeat: -1, repeatDelay: 5.2 })
      .fromTo(
        glint,
        { drawSVG: "0% 12%" },
        { drawSVG: "88% 100%", duration: 1.9, ease: "sine.inOut" },
        0,
      )
      .fromTo(glint, { opacity: 0 }, { opacity: 0.85, duration: 0.5, ease: "power1.out" }, 0)
      .to(glint, { opacity: 0, duration: 0.6, ease: "power1.in" }, 1.3);
  }

  /* ════════════════════════════════════════════════════════════════════════
     ENTRANCE  (BEAT 0)
     ════════════════════════════════════════════════════════════════════════ */

  function playEntrance(): void {
    layout();
    resetSignals();

    if (reducedMotion) {
      // Designed still state: no trace, no rise — one calm cross-fade.
      gsap.set(bellRoot, { opacity: 0 });
      gsap.set(thread, { opacity: 0 });
      gsap.to([nav, thread, bellRoot, copy, chipsLayer, hintWrap], {
        opacity: 1,
        duration: 0.4,
        ease: "power1.out",
        stagger: 0.05,
      });
      scheduleAutoRing();
      return;
    }

    // Hide what the timeline is about to draw, before the first paint of it.
    gsap.set(thread, { drawSVG: "0% 0%" });
    gsap.set(bellDrawOrder, { drawSVG: "0% 0%" });
    gsap.set(glint, { drawSVG: "0% 0%", opacity: 0 });
    // Nothing is cast into metal that has not been poured yet.
    gsap.set(foundry, { opacity: 0 });
    // The dot's outline is traced by the stagger below; its fill arrives after,
    // so the bell is a line drawing first and gains its one solid last.
    gsap.set(clapBall, { fillOpacity: 0 });

    /* The headline arrived pre-split (see headline.ts): the entrance borrows
       the same word boxes the physics will own from 1.30s on, so nothing is
       created or destroyed under the reader mid-sentence. Fall back to the
       whole H1 if nobody split it — the rise still reads, just as one block. */
    const heroWords: readonly Element[] =
      opts.headlineWords && opts.headlineWords.length > 0 ? opts.headlineWords : [headline];

    const tl = gsap.timeline();
    entranceTl = tl;

    tl.to(nav, { opacity: 1, duration: 0.5, ease: "power2.out" }, 0.05);

    // thread draws down from the top edge
    tl.to(thread, { drawSVG: "0% 100%", duration: 0.35, ease: "power2.out" }, 0);

    // the bell traces itself
    tl.to(
      bellDrawOrder,
      { drawSVG: "0% 100%", duration: 0.42, stagger: 0.032, ease: "expo.out" },
      0.3,
    );

    // never told about.
    tl.to(clapBall, { fillOpacity: 1, duration: 0.34, ease: "power2.out" }, 0.86);

    /* The foundry mark surfaces once both flares have finished tracing (the
       sides land at ~0.78s), at the same low 0.4 the CSS holds it at. It is the
       last thing the drawing gains and the quietest — which is how you find an
       inscription on a real bell: only after you have seen the bell. */
    tl.to(foundry, { opacity: 0.4, duration: 0.5, ease: "power2.out" }, 0.82);

    // headline, word by word: 12px rise + fade, 40ms apart
    tl.set(copy, { opacity: 1 }, 0.55);
    tl.fromTo(
      heroWords,
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.55, stagger: 0.04, ease: "expo.out" },
      0.55,
    );
    tl.fromTo(
      subline,
      { y: 8, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
      0.78,
    );
    tl.fromTo(
      actions,
      { y: 8, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
      0.86,
    );
    tl.to(chipsLayer, { opacity: 1, duration: 0.5, ease: "power2.out" }, 0.8);
    tl.to(hintWrap, { opacity: 1, duration: 0.6, ease: "power2.out" }, 1.0);

    // 1.30s: last word has landed. Hand the words over to their own physics
    // and the rim over to the idle glint loop. The entrance owns nothing from
    // here.
    tl.call(
      () => {
        opts.onEntranceComplete?.();
        startGlint();
      },
      undefined,
      1.3,
    );

    scheduleAutoRing();
  }

  /** Ring once, unprompted, so a passive visitor still sees the story — but
   *  never if they already discovered it themselves. */
  function scheduleAutoRing(): void {
    autoRingTimer = window.setTimeout(() => {
      autoRingTimer = 0;
      if (!userHasRung) ring();
    }, AUTO_RING_DELAY_MS);
  }

  /* ════════════════════════════════════════════════════════════════════════
     WIRING
     ════════════════════════════════════════════════════════════════════════ */

  function onClick(): void {
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    userHasRung = true;
    ring();
  }

  function onScroll(): void {
    heroRect = hero.getBoundingClientRect();
  }

  let resizeRaf = 0;
  function onResize(): void {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      // Geometry is about to change under the sequence's feet; take it down
      // cleanly rather than leave half-drawn paths pointing at old positions.
      ringTl?.kill();
      ringTl = null;
      layout();
      resetSignals();
    });
  }

  const ro = new ResizeObserver(onResize);
  ro.observe(hero);
  window.addEventListener("scroll", onScroll, { passive: true });
  bellBtn.addEventListener("click", onClick);

  if (!reducedMotion) {
    // One shared window listener for the whole page; the handle is what makes
    // it possible to drop it again in destroy().
    pointer = acquirePointer(onPointerMove);
    bellBtn.addEventListener("pointerdown", onPointerDown);
    bellBtn.addEventListener("pointerup", onPointerUp);
    bellBtn.addEventListener("pointercancel", onPointerUp);
    gsap.ticker.add(tick);
  }

  // Web fonts change the copy block's height, which moves the band the scene
  // is laid out in. Re-measure once they land.
  if (doc.fonts?.ready) void doc.fonts.ready.then(() => onResize());

  layout();

  function destroy(): void {
    ro.disconnect();
    window.removeEventListener("scroll", onScroll);
    pointer?.release();
    pointer = null;
    bellBtn.removeEventListener("click", onClick);
    bellBtn.removeEventListener("pointerdown", onPointerDown);
    bellBtn.removeEventListener("pointerup", onPointerUp);
    bellBtn.removeEventListener("pointercancel", onPointerUp);
    gsap.ticker.remove(tick);
    if (autoRingTimer) clearTimeout(autoRingTimer);
    cancelAnimationFrame(resizeRaf);
    ringTl?.kill();
    glintTl?.kill();
    entranceTl?.kill();
  }

  return { playEntrance, destroy };
}
