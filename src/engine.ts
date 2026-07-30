/* ══════════════════════════════════════════════════════════════════════════
   SCENE 2 — THE ENGINE
   ──────────────────────────────────────────────────────────────────────────
   One schematic, pinned, scrubbed over three and a half viewport heights, in
   four phases:

     A  THE PROBLEM    fire-and-forget. Fourteen requests arrive at one
                       provider as a clump, with TOO MANY REQUESTS riding above
                       them the whole way; the provider answers 429 and they
                       fall off the wire and die. Then the wire itself fails:
                       a segment of the push link flickers, dissolves into a
                       gap with frayed ends, and the next packet teeters on the
                       broken edge and tumbles through it. Nothing retries,
                       because there is nothing to retry with.
     B  THE ABSORBER   the engine draws itself between the app and the
                       providers. The same burst is accepted in 8ms, BUFFERS
                       in a six-slot queue — entering at the tail, stepping
                       forward a slot every time the head departs — and is
                       metered out on an even beat. Ragged in, rhythmic out;
                       that is the whole argument, and the slots are what
                       make it countable.
                       Then a duplicate arrives and is stamped, not sent.
     C  THE ASSURANCE  a 429 on a paced packet loops onto the retry rail and
                       waits, visibly, at 1s · 4s · 16s. A provider goes dark
                       and the next packet takes the secondary wire. A packet
                       that exhausts its retries parks on a dead-letter
                       siding, in plain sight, still there.
     D  THE SCALE      the queue splits into three slotted rails, p0/p1/p2,
                       and one otp overtakes a flood of marketing. Seven
                       events collapse into one envelope. One event fans out
                       to six channels — the junction where it does so is
                       engraved with the name of the pattern — receipts
                       cascade, the camera pulls back, and the receipts travel
                       back up the wires onto a timeline.

   THE RULES THIS FILE OBEYS
   ─────────────────────────
   1. ONE timeline, scrubbed. Every beat is a tween of a number. There is not
      a single .call(), .set() or Math.random() inside the scrubbed range, so
      scrolling backwards is scrolling forwards with the sign flipped — the
      scene has no memory and therefore nothing to get wrong.
   2. Every tween is a fromTo with immediateRender:false. A plain .to() records
      its start value the first time it renders, which under a scrub is
      whenever the reader happens to arrive; a fromTo knows both ends before
      anyone scrolls.
   3. CSS paints the FINISHED diagram; restState() pushes it back to the start.
      That inversion is what makes the still fallbacks free — a clone of the
      markup with no JS on it already is the finished figure.
   4. transform, opacity, stroke and drawSVG only. The camera scales geometry;
      every stroke is non-scaling, so no hairline ever gets fat.

   Constants first, with the arithmetic, same as bell.ts.
   ══════════════════════════════════════════════════════════════════════════ */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/* ══════════════════════════════════════════════════════════════════════════
   TUNING CONSTANTS  —  change these, not the code below
   ══════════════════════════════════════════════════════════════════════════ */

/* ── The scrub window ──────────────────────────────────────────────────────
   The pin consumes PIN_HEIGHTS extra viewport heights of scroll on top of the
   100dvh the section already occupies. 3.5 puts the four phases at roughly
   0.63 / 0.84 / 0.91 / 1.12 viewport-heights of scroll each: enough that a
   trackpad flick does not skip a micro-beat, short enough that a reader who
   is not sold by phase B can get out in two flicks. Below ~2.5 the dedupe and
   digest beats read as glitches; above ~5 the section overstays. */
const PIN_HEIGHTS = 3.5;

/** Scrub catch-up, in seconds. 0.55 is enough to smooth a notched mouse wheel
 *  into continuous motion without the schematic feeling like it is on elastic.
 *  `true` (no smoothing) makes every wheel notch a visible step; above ~1.0 the
 *  diagram keeps moving after the reader has stopped, which reads as lag. */
const SCRUB = 0.55;

/* Phase boundaries, in timeline units. The timeline is exactly 100 units long,
   so a unit IS a percent of the pinned scroll and every beat time below can be
   read straight off the storyboard. */
const PHASE_A = 0;
const PHASE_B = 18;
const PHASE_C = 42;
const PHASE_D = 68;
const TL_END = 100;

/* ── The request flood (phase A — the abuse) ───────────────────────────────
   Three packets in a line is traffic. FLOOD_A_N is the count at which a
   provider stops reading a wire as "requests" and starts reading it as abuse,
   and 14 is where that flips at this scale: too many to count at a glance,
   few enough that at FLOOD_A_R they stay individual dots instead of smearing
   into one amber smudge.

   The shape is doing the work, not the number. A stream of evenly spaced dots
   is a picture of traffic no matter how long it is; a CLUMP is a picture of a
   flood. So the spread comes from FLOOD_A_CLUMP — a one-behind-the-other convoy (11u pitch, ±2u jitter)
   applied as each circle's OWN cx/cy, which survives the flight because these
   packets run their motionPath with `raw` (path coordinates straight into
   x/y, the circle's own offset riding on top). Nearest neighbours sit ~8.5u
   apart against a 7.6u diameter, so the clump reads as touching without
   fusing.

   The launch stagger is deliberately tiny. 0.003 units over a ~900u wire
   covered in FLOOD_A_DUR is ~2u of separation per packet — 26u across the
   whole clump — which is just enough that it stretches as it accelerates
   instead of moving like a plate, and not enough to turn it back into a
   queue. Arrivals therefore span 10.00 → 10.04: they hit as one event. */
const FLOOD_A_N = 14;
const FLOOD_A_R = 3.8;
const FLOOD_A_T0 = 8.0;
const FLOOD_A_DUR = 2.0;
const FLOOD_A_STAGGER = 0.003;
/** When the clump reaches the provider. Everything in the exchange — the
 *  amber box, the 429, the label leaving — is written against this. */
const FLOOD_A_HIT = FLOOD_A_T0 + FLOOD_A_DUR;
/** Offsets from the packet's point on the wire, in scene units. Authored, not
 *  rolled: a flood whose shape changes when you scroll back up is a flood
 *  nobody believes (same rule as RECEIPT_MS). */
const FLOOD_A_CLUMP: readonly (readonly [number, number])[] = [
  [-71, 0],
  [-60, 2],
  [-49, -2],
  [-38, 0],
  [-27, -2],
  [-16, 2],
  [-5, 0],
  [6, 2],
  [17, -2],
  [28, 0],
  [39, -2],
  [50, 2],
  [61, 0],
  [72, 2],
];
/** How far a refused packet drops before it is gone. Each packet's own clump
 *  offset is added, so the front of the clump falls furthest and the fourteen
 *  do not come off the wire like one plate. */
const FLOOD_A_FALL = 96;

/* ── The traveling label ───────────────────────────────────────────────────
   "TOO MANY REQUESTS" is not written on the packets and it is not parked at
   the provider waiting for them: it RIDES the clump. It runs its own lane —
   the email wire's curve, lifted clear of it — at exactly the clump's pace,
   so it hangs above the flood for the whole flight and arrives with it.

   Where it lands is the whole beat, and it took two tries. The label is ~148u
   wide and the 429 stamp's own left edge is at ~959, so landing it at 875 put
   85u of its own body inside the stamp's approach and the two rendered as ONE
   line of amber text: "TOO MANY REQUESTS 429 Too Many Requests". They are not
   one line. They are a call and an answer, and an answer has to arrive from
   somewhere else. 800 leaves 85u of black between them — call on the left,
   answer over the provider — at the cost of the label finishing 160u behind
   the clump, which is the right thing to pay: a banner trails the mob. */
const FLAG_FLOOD_AT: readonly [number, number] = [800, 100];
const FLAG_FLOOD_LANE: readonly (readonly [number, number])[] = [
  [146, 276],
  [430, 272],
  [640, 104],
  [800, 100],
];
/** Where the break's label settles once it has finished stuttering. Matches
 *  `.eng-flag-settled` in styles.css, which is what the still cards show. */
const FLAG_SETTLE = 0.62;

/* ── The network drop (phase A — the wire itself) ──────────────────────────
   The push wire is authored ONCE, as the four control points of its own
   cubic, because four different things have to agree about it: the route the
   packet flies (#g-direct-2), the two pieces of line that survive, the piece
   that dissolves, and the two frayed ends. Splitting a cubic is exact — de
   Casteljau, below — so every piece lies ON the route rather than near it.

   MUST match the wire this replaced: `M 146 310 C 420 310 620 470 960 470`.

   BREAK_T is in the cubic's OWN parameter, not in arc length: the split is a
   de Casteljau split, and "75.5% of the length" would need an inversion
   nobody would ever be able to read off the source. In scene units these two
   values put the severed ends at (732,446) and (787,456) — a 56u gap, seven
   times the packet's diameter. Narrower than ~40u and the packet looks like
   it could still make it, which is a different (and wrong) sentence. */
const W_PUSH: readonly (readonly [number, number])[] = [
  [146, 310],
  [420, 310],
  [620, 470],
  [960, 470],
];
const BREAK_T = [0.755, 0.818] as const;
/** How much line on each side of the gap stops being line and becomes dashes.
 *  0.034 of the curve ≈ 30u, which is four dashes at the 2.5/5 pattern in
 *  styles.css. Sized off the PACKET, not off the wire: the packet teeters with
 *  its centre on the severed edge, so a 9u-wide dot parks on the last 9u of
 *  the fray and eats it. At 19u (the first try) that left three dashes, two of
 *  them under the packet, and the break read as "the line stops here" instead
 *  of "the line came apart here". */
const FRAY_T = 0.034;

/* ── The metering rhythm (phase B — the load-bearing beat) ─────────────────
   Six events are fired at the API in two ragged clumps and released on a
   metronome. The gap between BURST_OFFSETS and METER_PERIOD is the argument
   the whole scene exists to make, so it has to be visible: the arrivals span
   1.26 units and the departures span 5 × 0.85 = 4.25. Four times longer, and
   perfectly even. */
const BURST_OFFSETS = [0, 0.24, 0.4, 1.02, 1.16, 1.26];
/** Timeline units between two releases. Even, always. */
const METER_PERIOD = 0.85;

/* ── The queue, as a queue ────────────────────────────────────────────────
   A lane with dots parked on it is a picture of six things waiting. A BOX
   WITH CELLS is a picture of a queue: the reader can count the free slots,
   see a message take one, and see the whole column step forward when the head
   leaves. That last part is the buffering argument — ragged in, rhythmic out
   — and it only reads if the slots are drawn.

   The box runs from QUEUE_X0 (the tail, where the approach lane ends) to
   QUEUE_X1 (the head, which is exactly the meter's x — the queue's mouth and
   the thing that opens it are the same line). QUEUE_SLOTS cells of QUEUE_SLOT
   each fill it exactly, so QUEUE_X1 − QUEUE_X0 === QUEUE_SLOTS · QUEUE_SLOT
   is not a coincidence to be maintained by hand: it is asserted below.

   Six slots for six burst packets: the queue fills to the brim and no
   further, which is the most a buffer can say for itself in one picture. */
const QUEUE_SLOTS = 6;
const QUEUE_SLOT = 34;
const QUEUE_X0 = 586;
const QUEUE_X1 = 790;
/** Cell height, and how far the dividers stop short of the walls. A hairline
 *  that touches both walls cuts the box into six boxes; a hairline inset 5u
 *  reads as ruling inside one box, which is what a queue is. */
const QUEUE_H = 28;
const QUEUE_INSET = 5;
/** The three lanes' centre lines. p1 alone in phases B–C; all three from D. */
const QUEUE_Y = [250, 310, 370];
/** The head of the queue — the centre of the rightmost cell, and the point
 *  every departure guide (#g-dep-*) starts from. */
const QUEUE_HEAD_X = QUEUE_X1 - QUEUE_SLOT / 2;

/* ── The backoff (phase C) ────────────────────────────────────────────────
   Tick positions are given in scene x, not in path fractions: the rail's
   straight section runs right-to-left, so the first tick a packet meets is the
   rightmost. engine.ts finds the fraction for each x at build time, which is
   also what places the tick marks — the label and the wait are guaranteed to
   be the same point on the rail.

   The holds are NOT to scale with the labels (1s · 4s · 16s would need a 16×
   spread and the reader would leave). They are ordered and clearly growing,
   which is the information: each wait is longer than the last. */
const BACKOFF_X = [880, 800, 720];
const BACKOFF_LABEL = ["1s", "4s", "16s"];
const BACKOFF_HOLD = [0.7, 1.0, 1.4];
/** Where the dead-letter siding leaves the retry rail: past the last tick,
 *  because a packet only reaches it having spent every backoff it had. */
const DLQ_BRANCH_X = 700;

/** How far along the primary wire the failover crossover leaves it. 0.72 is
 *  past the point where the packet has visibly committed to the email
 *  provider — a reroute at 0.2 reads as routing, at 0.72 it reads as rescue.
 *  It also matters geometrically: earlier than ~0.65 the split point is still
 *  left of the provider column, and a curve from there down to the sms box
 *  doubles back on itself into a hook. */
const FAILOVER_SPLIT = 0.72;

/* ── The flood (phase D) ──────────────────────────────────────────────────
   FLOOD_N faint packets pour down p2 with a FLOOD_GAP head start each, taking
   FLOOD_DUR to clear. The otp leaves at FLOOD_T0 + 3.0 and takes OTP_DUR.

   The overtake has to happen IN THE LANES, not at the finish line. Both routes
   are ~940u long, so the otp catches the leader when
       (t − 74.2)/2.4 = (t − 71.2)/8.2   ⇒  t ≈ 75.4
   which is 50% of the way along — mid-lane, in open view, with a third of the
   run left to pull clear in. Tuned the other way (a fast flood and a marginal
   otp) the pass happens on the last 40 units of wire and reads as a photo
   finish, which is not the claim: p0 is not slightly better, it is first.

   Arrivals: otp 76.6, first flood 79.4. */
const FLOOD_N = 11;
const FLOOD_T0 = 71.2;
const FLOOD_GAP = 0.32;
const FLOOD_DUR = 8.2;
const FLOOD_OPACITY = 0.28;
const OTP_T0 = 74.2;
const OTP_DUR = 2.4;

/** How many events collapse into one digest, and the aside that says so. */
const DIGEST_N = 7;

/* ── The camera ───────────────────────────────────────────────────────────
   Each keyframe is "put scene point (fx,fy) in the middle of the frame at
   zoom z". The zoom range is deliberately narrow: 0.92–1.22. A schematic that
   pushes in hard stops being a schematic and becomes a slideshow, and the
   reader loses the map. The one big move is the last one — pulling back under
   1 is what makes the finale read as "and here is all of it at once".
   fy is measured against the frame centre (310), fx against (600). */
const CAM: { at: number; dur: number; z: number; fx: number; fy: number }[] = [
  { at: 18.0, dur: 3.0, z: 1.08, fx: 590, fy: 302 }, // B — the engine assembling
  { at: 42.0, dur: 3.0, z: 0.98, fx: 634, fy: 384 }, // C1 — the retry rail
  { at: 58.4, dur: 2.2, z: 1.22, fx: 900, fy: 244 }, // C2 — the failover crossover
  { at: 63.0, dur: 2.4, z: 0.98, fx: 720, fy: 430 }, // C3 — the dead-letter siding
  { at: 68.0, dur: 2.4, z: 1.14, fx: 640, fy: 318 }, // D1 — the three lanes
  { at: 81.0, dur: 2.2, z: 1.22, fx: 620, fy: 306 }, // D2 — the digest
  { at: 87.6, dur: 2.4, z: 1.06, fx: 820, fy: 310 }, // D3 — the fan-out
  { at: 95.2, dur: 2.4, z: 0.92, fx: 606, fy: 306 }, // D4 — the whole anatomy
];
const CAM_START = { z: 1, fx: 600, fy: 310 };

/* ── Caption swaps ───────────────────────────────────────────────────────
   Timeline unit each caption owns the rail from. The last two are both inside
   phase D: the priority-lane beat and the bridge are different sentences. */
const CAP_AT = [0, PHASE_B, PHASE_C, PHASE_D, 95.5];
const CAP_FADE = 1.6;

/* ══════════════════════════════════════════════════════════════════════════
   SCENE GEOMETRY  —  scene units. These MUST match the markup in index.html.
   ══════════════════════════════════════════════════════════════════════════ */

/** viewBox centre — the point the camera puts things at. */
const FRAME_CX = 600;
const FRAME_CY = 310;

/** The spine every node sits on. */
const SPINE_Y = 310;
/** x of the app's outlet and the api's inlet. */
const APP_OUT_X = 146;
const API_CX = 338;
/** Where the fan leaves the chassis. */
const FAN_X = 840;

/** Provider column: left edge, and the y of each box's centre. */
const PROV_X = 960;
const PROV_Y = [150, 310, 470];

/** Channel terminals (generated). Six rows, 90u apart, centred on the spine. */
const TERM_X = 990;
const TERM_W = 130;
const TERM_H = 30;
const TERM_Y = [85, 175, 265, 355, 445, 535];
const CHANNELS = ["email", "sms", "push", "in-app", "telegram", "slack"] as const;
/** Mock latencies, fixed rather than rolled: a number that changes when you
 *  scroll back up is a number nobody believes. Ordered to match the arrival
 *  stagger, so the slower channels also report the slower numbers. */
const RECEIPT_MS = [118, 96, 143, 88, 207, 164];

/** The timeline strip and its six ticks (generated). */
const STRIP_Y = 58;
const STRIP_TICK_X = [340, 430, 520, 610, 700, 790];

/** Dead-letter box: right edge and centre y, for the siding's landing point. */
const DLQ_RIGHT = 532;
const DLQ_CY = 576;

/** Where the retry rail meets the provider column: the sms box's bottom-RIGHT
 *  corner. Right, not left, and this is not a style choice — the rail has to
 *  get from the provider column down to the siding below the chassis, and the
 *  only lane clear of the push-provider box is outside the column's right
 *  edge. A refused packet therefore crosses its provider and drops out of the
 *  far corner, which also happens to be what a request that was accepted and
 *  then rejected looks like. MUST match the head of #retry-rail. */
const RAIL_ENTRY_X = 1150;
const RAIL_ENTRY_Y = 333;
/** Where the retry rail lets a packet back out: on the approach lane, just
 *  short of the queue's tail wall. MUST match the tail of #retry-rail. A retry
 *  goes to the BACK of the queue — it is a re-enqueue, not a queue-jump — so
 *  the packet then slides the whole length of the box to the head, which is
 *  also the only way the reader sees that it went back in at all. */
const RAIL_EXIT_X = 574;

/** The gate's drawSVG range in its short state. The path is 164u tall and the
 *  gate is 52u in phases B–C, so 26u each side of centre = 50% ± 15.9%. 52
 *  and not 44: the queue box's head wall now sits on exactly this x, and a
 *  gate shorter than QUEUE_H + ~20 disappears behind it. It has to overhang
 *  the mouth it meters by enough to read as a separate thing. */
const GATE_SHORT = "34% 66%";
const GATE_FULL = "0% 100%";

/** Packet radius. 4.5u ≈ 4px on screen: the hero's delivered-dot, same size. */
const DOT_R = 4.5;
const FLOOD_R = 3.4;

/* Windows the still cards look through: "x y w h" in scene units, plus which
   caption belongs to each. `phase` is the CSS key that decides which layers
   the card shows; two cards may share one.

   These are cut for LEGIBILITY, not for coverage. A card is ~420px wide on a
   phone, so a 14u label only clears 10px once the window is under ~590u —
   showing the whole 1200u schematic four times would be four illegible
   thumbnails. Each card is therefore a close-up of the one mechanism its
   caption is about, and the captions carry the thread between them. */
const CARD_VIEW = [
  { phase: "a", cap: 0, box: "690 70 510 470" }, // the providers, refusing
  { phase: "b", cap: 1, box: "240 160 620 310" }, // the engine: api, queue, meter
  { phase: "c", cap: 2, box: "360 498 600 134" }, // the backoff rail and the siding
  { phase: "d", cap: 3, box: "700 20 500 592" }, // the six channels, delivered
  { phase: "e", cap: 4, box: "280 22 560 118" }, // the timeline the receipts land on
] as const;

const COLOR = {
  green: "#3dd68c",
  greenDim: "#2ba36c",
  amber: "#ffb224",
  faint: "#6e6e6e",
  dim: "#a1a1a1",
  hairline: "#262626",
  hairlineStrong: "#3f3f3f",
} as const;

const SVG_NS = "http://www.w3.org/2000/svg";

/* ══════════════════════════════════════════════════════════════════════════
   IMPLEMENTATION
   ══════════════════════════════════════════════════════════════════════════ */

function q<T extends Element>(root: ParentNode, sel: string): T {
  const el = root.querySelector<T>(sel);
  if (!el) throw new Error(`[engine] missing element: ${sel}`);
  return el;
}

function svgEl<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number>,
): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, tag);
  for (const k in attrs) el.setAttribute(k, String(attrs[k]));
  return el;
}

/** The fraction of `path` whose point is nearest x = `targetX`, considering
 *  only the part of the path below y = `minY`. Used to put the backoff ticks
 *  and the dead-letter junction exactly on the retry rail rather than near it:
 *  the rail is one hand-authored curve, and nothing else should have to know
 *  its control points. 400 samples over a ~750u path is sub-2u accuracy. */
function fracNearX(path: SVGPathElement, targetX: number, minY: number): number {
  const total = path.getTotalLength();
  const STEPS = 400;
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i <= STEPS; i++) {
    const f = i / STEPS;
    const p = path.getPointAtLength(total * f);
    if (p.y < minY) continue;
    const d = Math.abs(p.x - targetX);
    if (d < bestD) {
      bestD = d;
      best = f;
    }
  }
  return best;
}

function pointAt(path: SVGPathElement, frac: number): { x: number; y: number } {
  const p = path.getPointAtLength(path.getTotalLength() * frac);
  return { x: p.x, y: p.y };
}

/* ── cutting a cubic into pieces ─────────────────────────────────────────
   The push wire breaks in phase A, which means the one line the reader sees
   has to become three paths that still lie on one curve. Approximating the
   pieces (sampling the path, re-fitting) would put them near the route the
   packet flies; de Casteljau puts them ON it, exactly, and it is nine lerps.

   Everything here is in the cubic's own parameter t, never in arc length. */

type Pt = readonly [number, number];

const lerpPt = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

/** The two halves of a cubic split at `t`, each as its own four control
 *  points. The classic construction: three lerps, then two, then one. */
function splitCubic(c: readonly Pt[], t: number): [Pt[], Pt[]] {
  const [p0, p1, p2, p3] = c as [Pt, Pt, Pt, Pt];
  const a = lerpPt(p0, p1, t);
  const b = lerpPt(p1, p2, t);
  const d = lerpPt(p2, p3, t);
  const e = lerpPt(a, b, t);
  const f = lerpPt(b, d, t);
  const g = lerpPt(e, f, t);
  return [
    [p0, a, e, g],
    [g, f, d, p3],
  ];
}

/** The sub-curve between two parameters. The first cut re-parameterises what
 *  is left — the tail's t runs 0→1 over the original's t0→1 — so the second
 *  cut has to be rescaled or the piece comes out short. */
function subCubic(c: readonly Pt[], t0: number, t1: number): Pt[] {
  const tail = splitCubic(c, t0)[1];
  return splitCubic(tail, (t1 - t0) / (1 - t0))[0];
}

const n2 = (v: number): string => String(Math.round(v * 100) / 100);

const cubicD = (c: readonly Pt[]): string =>
  `M ${n2(c[0]![0])} ${n2(c[0]![1])} C ${n2(c[1]![0])} ${n2(c[1]![1])} ` +
  `${n2(c[2]![0])} ${n2(c[2]![1])} ${n2(c[3]![0])} ${n2(c[3]![1])}`;

export interface EngineScene {
  destroy(): void;
}

/**
 * Scene 2. Owns its own media gating: gsap.matchMedia() decides between the
 * pinned scrub and the still fallback, and re-decides for free if the reader
 * crosses 768px or turns reduced motion on mid-visit.
 */
export function createEngineScene(): EngineScene {
  const doc = document;

  const section = q<HTMLElement>(doc, "#scene-engine");
  const pin = q<HTMLElement>(doc, "#eng-pin");
  const still = q<HTMLElement>(doc, "#eng-still");
  const capsWrap = q<HTMLElement>(doc, "#eng-caps");
  const caps = Array.from(capsWrap.querySelectorAll<HTMLElement>(".eng-cap"));
  const stat = q<HTMLElement>(doc, "#eng-stat");
  const progressFill = q<HTMLElement>(doc, "#eng-progress-fill");

  const svg = q<SVGSVGElement>(doc, "#eng-svg");
  const cam = q<SVGGElement>(svg, "#eng-cam");
  const dotsG = q<SVGGElement>(svg, "#eng-dots");
  const termG = q<SVGGElement>(svg, "#eng-terminals");
  const ticksG = q<SVGGElement>(svg, "#retry-ticks");
  const stripTicksG = q<SVGGElement>(svg, "#strip-ticks");

  /* ════════════════════════════════════════════════════════════════════════
     GENERATED DOM
     Six terminals, six fan wires, six return guides, six timeline ticks,
     three backoff ticks and three sets of queue-slot dividers. All parametric
     — the channel list lives in exactly one place, same as the hero's chips,
     and the queue's cell pitch lives only in QUEUE_SLOT.
     ════════════════════════════════════════════════════════════════════════ */

  /* The box in index.html and the slot arithmetic here have to agree, and the
     cheapest way to guarantee that is to refuse to boot if they do not. */
  if (QUEUE_X1 - QUEUE_X0 !== QUEUE_SLOTS * QUEUE_SLOT) {
    throw new Error("[engine] queue box width does not divide into QUEUE_SLOTS");
  }

  /* Same contract, one phase earlier: the flood's count and the flood's shape
     are two constants that describe one thing, and a fifteenth clump offset
     with FLOOD_A_N left at 14 would silently drop a packet. */
  if (FLOOD_A_CLUMP.length !== FLOOD_A_N) {
    throw new Error("[engine] FLOOD_A_CLUMP does not have FLOOD_A_N entries");
  }

  /** The QUEUE_SLOTS − 1 dividers of one lane, ruled between its walls. */
  const slotLines: SVGLineElement[][] = QUEUE_Y.map((cy, lane) => {
    const g = q<SVGGElement>(svg, `#slots-p${lane}`);
    const lines: SVGLineElement[] = [];
    for (let k = 1; k < QUEUE_SLOTS; k++) {
      const x = QUEUE_X0 + k * QUEUE_SLOT;
      const line = svgEl("line", {
        class: "eng-slot",
        x1: x,
        y1: cy - QUEUE_H / 2 + QUEUE_INSET,
        x2: x,
        y2: cy + QUEUE_H / 2 - QUEUE_INSET,
      });
      g.appendChild(line);
      lines.push(line);
    }
    return lines;
  });

  const termRects: SVGRectElement[] = [];
  const termDots: SVGCircleElement[] = [];
  const termLabels: SVGTextElement[] = [];
  const termReceipts: SVGTextElement[] = [];
  const fanWires: SVGPathElement[] = [];
  const backGuides: SVGPathElement[] = [];
  const stripTicks: SVGLineElement[] = [];
  const stripDots: SVGCircleElement[] = [];

  const guidesG = q<SVGGElement>(svg, "#eng-guides");

  CHANNELS.forEach((name, i) => {
    const ty = TERM_Y[i]!;

    // The wire out to this terminal. Both handles sit on the fan junction's
    // own horizontal so all six leave the chassis as one bundle and only then
    // peel apart — the hero's SIG_BUNDLE_X, in a straighter world.
    const wire = svgEl("path", {
      class: "eng-wire",
      d: `M ${FAN_X} ${SPINE_Y} C ${FAN_X + 60} ${SPINE_Y} ${TERM_X - 70} ${ty} ${TERM_X} ${ty}`,
    });
    termG.appendChild(wire);
    fanWires.push(wire);

    const g = svgEl("g", { class: "eng-term" });
    const rect = svgEl("rect", {
      class: "eng-box",
      x: TERM_X,
      y: ty - TERM_H / 2,
      width: TERM_W,
      height: TERM_H,
      rx: 6,
    });
    const dot = svgEl("circle", { class: "eng-term-dot", cx: TERM_X + 18, cy: ty, r: 3.5 });
    const label = svgEl("text", {
      class: "eng-label",
      x: TERM_X + 32,
      y: ty,
      "dominant-baseline": "central",
    });
    label.textContent = name;
    const receipt = svgEl("text", {
      class: "eng-receipt",
      x: TERM_X + TERM_W / 2,
      y: ty + 30,
      "text-anchor": "middle",
    });
    receipt.textContent = `delivered · ${RECEIPT_MS[i]}ms`;

    g.append(rect, dot, label, receipt);
    termG.appendChild(g);

    termRects.push(rect);
    termDots.push(dot);
    termLabels.push(label);
    termReceipts.push(receipt);

    // The return journey. Back down the fan to the junction, then up to this
    // channel's own tick on the timeline strip.
    const tx = STRIP_TICK_X[i]!;
    const back = svgEl("path", {
      id: `g-back-${i}`,
      d:
        `M ${TERM_X} ${ty} C ${TERM_X - 70} ${ty} ${FAN_X + 60} ${SPINE_Y} ${FAN_X} ${SPINE_Y} ` +
        `C ${FAN_X - 90} ${SPINE_Y} ${tx} ${SPINE_Y - 130} ${tx} ${STRIP_Y}`,
    });
    guidesG.appendChild(back);
    backGuides.push(back);

    const stripTick = svgEl("line", {
      class: "eng-strip-tick",
      x1: tx,
      y1: STRIP_Y - 6,
      x2: tx,
      y2: STRIP_Y + 6,
    });
    stripTicksG.appendChild(stripTick);
    stripTicks.push(stripTick);

    /* The receipt, once it has landed. A separate mark from the packet that
       carried it, so the strip is a permanent record rather than six travelling
       dots that happened to stop — and so the still cards have something to
       show, which six mid-flight packets never would. */
    const landed = svgEl("circle", { class: "eng-strip-dot", cx: tx, cy: STRIP_Y, r: 3.5 });
    stripTicksG.appendChild(landed);
    stripDots.push(landed);
  });

  /* ── geometry measured off the hand-authored rails ─────────────────────── */

  const retryRail = q<SVGPathElement>(svg, "#retry-rail");
  const dlqRail = q<SVGPathElement>(svg, "#dlq-rail");
  const failWire = q<SVGPathElement>(svg, "#w-failover");
  const dep0 = q<SVGPathElement>(svg, "#g-dep-0");

  /* Backoff ticks. Only the part of the rail below y 510 is the siding, so the
     search is fenced to it — otherwise the swing down from the provider, which
     passes through the same x values, wins. */
  const backoffFrac = BACKOFF_X.map((x) => fracNearX(retryRail, x, 524));
  const backoffTicks: SVGLineElement[] = [];
  const backoffLabels: SVGTextElement[] = [];

  backoffFrac.forEach((f, i) => {
    const p = pointAt(retryRail, f);
    const tick = svgEl("line", {
      class: "eng-tick",
      x1: p.x,
      y1: p.y - 7,
      x2: p.x,
      y2: p.y + 7,
    });
    const label = svgEl("text", {
      class: "eng-tick-label",
      x: p.x,
      y: p.y + 26,
      "text-anchor": "middle",
    });
    label.textContent = BACKOFF_LABEL[i]!;
    ticksG.append(tick, label);
    backoffTicks.push(tick);
    backoffLabels.push(label);
  });

  /* The dead-letter siding starts exactly on the rail, past the last tick. */
  const dlqFrac = fracNearX(retryRail, DLQ_BRANCH_X, 524);
  {
    const s = pointAt(retryRail, dlqFrac);
    dlqRail.setAttribute(
      "d",
      `M ${s.x} ${s.y} C ${s.x - 40} ${s.y} ${s.x - 56} ${DLQ_CY} ${s.x - 96} ${DLQ_CY} ` +
        `L ${DLQ_RIGHT} ${DLQ_CY}`,
    );
  }

  /* The secondary wire leaves the primary along the primary's OWN tangent —
     which is what makes the reroute read as peeling off a road rather than
     teleporting onto a new one — and lands on the top edge of the sms box
     rather than its inlet. The inlet is already taken by the primary sms wire,
     and a second line arriving at the same point reads as one line. */
  const FAILOVER_LAND_X = PROV_X + 40;
  const FAILOVER_LAND_Y = PROV_Y[1]! - 23; // the box's top edge
  {
    const a = pointAt(dep0, FAILOVER_SPLIT);
    const b = pointAt(dep0, Math.min(FAILOVER_SPLIT + 0.04, 1));
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    // 26u of tangent: long enough to read as "still heading for email",
    // short enough that the turn does not become a loop.
    const c1x = a.x + ((b.x - a.x) / len) * 26;
    const c1y = a.y + ((b.y - a.y) / len) * 26;
    failWire.setAttribute(
      "d",
      `M ${a.x} ${a.y} C ${c1x} ${c1y} ${FAILOVER_LAND_X} ${FAILOVER_LAND_Y - 47} ` +
        `${FAILOVER_LAND_X} ${FAILOVER_LAND_Y}`,
    );
  }

  /* ── the push wire, cut into the pieces that break ──────────────────────
     One curve (W_PUSH), five paths off it, and one guide that is still the
     whole thing because a ROUTE does not break — only the line does. Setting
     the guide's own `d` from the same constants is what guarantees the
     packet's flight and the drawn wire cannot drift apart. */
  const gDirect2 = q<SVGPathElement>(svg, "#g-direct-2");
  const frayA = q<SVGPathElement>(svg, "#fray-a");
  const frayB = q<SVGPathElement>(svg, "#fray-b");

  /** The five cuts, in order along the wire. Every boundary is shared, so the
   *  pieces abut exactly and there is no seam to see. */
  const pushCuts: readonly [number, number][] = [
    [0, BREAK_T[0] - FRAY_T],
    [BREAK_T[0] - FRAY_T, BREAK_T[0]],
    [BREAK_T[0], BREAK_T[1]],
    [BREAK_T[1], BREAK_T[1] + FRAY_T],
    [BREAK_T[1] + FRAY_T, 1],
  ];

  gDirect2.setAttribute("d", cubicD(W_PUSH));

  /** The five solid pieces, indexed the same way as pushCuts. */
  const pushPieces = pushCuts.map(([a, b], i) => {
    const p = q<SVGPathElement>(svg, `#w-push-${i}`);
    p.setAttribute("d", cubicD(subCubic(W_PUSH, a, b)));
    return p;
  });

  /* The two dashed ends sit on the same two curves as pieces 1 and 3 — same
     `d`, different stroke — so the cross-fade at the break swaps one for the
     other without anything moving. */
  frayA.setAttribute("d", pushPieces[1]!.getAttribute("d")!);
  frayB.setAttribute("d", pushPieces[3]!.getAttribute("d")!);

  /** The two pieces that stop being line and become dashes. */
  const pushEdges = [pushPieces[1]!, pushPieces[3]!];
  /** The one that goes entirely. */
  const pushSeg = pushPieces[2]!;

  /** The share of the wire's draw each piece owns. Phase A draws them back to
   *  back at a constant rate, which is the only way five paths add up to one
   *  continuous line — see the draw call itself. */
  const pushShare = ((): number[] => {
    const l = pushPieces.map((p) => p.getTotalLength());
    const total = l.reduce((a, b) => a + b, 0);
    return l.map((v) => v / total);
  })();

  /** The broken edge — where the near fray ends — and its fraction along the
   *  route, in ARC LENGTH, which is what motionPath counts in. The packet
   *  flies to exactly here and stops. */
  const breakEdge = splitCubic(W_PUSH, BREAK_T[0])[0][3]!;
  const breakEdgeF = fracNearX(gDirect2, breakEdge[0], 0);

  /* ── the traveling label's lane ─────────────────────────────────────────
     Written as offsets from where the label is authored, so the scrub only
     ever moves it BY something and the still frame — which no scrub touches —
     is already correct. */
  q<SVGPathElement>(svg, "#g-flood-label").setAttribute(
    "d",
    cubicD(
      FLAG_FLOOD_LANE.map(
        (p) => [p[0] - FLAG_FLOOD_AT[0], p[1] - FLAG_FLOOD_AT[1]] as Pt,
      ),
    ),
  );

  /* ── the packet pool ───────────────────────────────────────────────────── */

  const allDots: SVGCircleElement[] = [];

  /** One packet. At the origin by default, so that a motionPath's align lands
   *  its centre exactly on the path point and a later `x` tween can move it in
   *  scene coordinates without any offset arithmetic.
   *
   *  `ox`/`oy` are the one exception: the phase-A flood's clump shape lives in
   *  the circles themselves, and those packets fly with `raw` motionPaths
   *  (no align) so the offset rides along instead of being normalised away —
   *  which is exactly what `alignOrigin` would do to it. */
  function newDot(r = DOT_R, ox = 0, oy = 0): SVGCircleElement {
    const c = svgEl("circle", { class: "eng-dot", cx: ox, cy: oy, r });
    dotsG.appendChild(c);
    allDots.push(c);
    return c;
  }

  const dA = {
    solo: newDot(),
    flood: FLOOD_A_CLUMP.map(([ox, oy]) => newDot(FLOOD_A_R, ox, oy)),
    lost: newDot(),
  };
  const dB = { queue: Array.from({ length: 6 }, () => newDot()), dupe: newDot() };
  const dC = { retry: newDot(), fail: newDot(), dlq: newDot() };
  const dD = {
    flood: Array.from({ length: FLOOD_N }, () => newDot(FLOOD_R)),
    otp: newDot(5),
    digest: Array.from({ length: DIGEST_N }, () => newDot(3.4)),
    fanIn: newDot(),
    fan: Array.from({ length: 6 }, () => newDot()),
    back: Array.from({ length: 6 }, () => newDot(3.4)),
  };

  /* ── the pristine clone ────────────────────────────────────────────────
     Captured now: the anatomy is complete and no gsap.set has touched it, so
     this node IS the finished diagram. The still fallbacks are clones of it.
     Ids are stripped (a document may only have one of each) and the packet
     layer emptied (nothing is in flight in a still frame). */
  const pristine = svg.cloneNode(true) as SVGSVGElement;
  pristine.removeAttribute("id");
  for (const el of Array.from(pristine.querySelectorAll("[id]"))) el.removeAttribute("id");
  pristine.querySelector(".eng-l-dots")?.replaceChildren();

  /* ════════════════════════════════════════════════════════════════════════
     ELEMENT HANDLES
     ════════════════════════════════════════════════════════════════════════ */

  const appBox = q<SVGRectElement>(svg, "#app-box");
  const appLabel = q<SVGTextElement>(svg, "#app-label");

  /* The two direct wires that stay whole. The third one is `pushPieces` — it
     comes apart in phase A and every beat that touches it has to know which
     piece it means. */
  const wEmail = q<SVGPathElement>(svg, "#w-direct-0");
  const wSms = q<SVGPathElement>(svg, "#w-direct-1");

  const flagFlood = q<SVGTextElement>(svg, "#flag-flood");
  const flagDrop = q<SVGTextElement>(svg, "#flag-drop");
  const gFloodLabel = q<SVGPathElement>(svg, "#g-flood-label");

  const chassis = q<SVGRectElement>(svg, "#chassis");
  const chassisLabel = q<SVGTextElement>(svg, "#chassis-label");
  const wAppApi = q<SVGPathElement>(svg, "#w-app-api");
  const apiBox = q<SVGRectElement>(svg, "#api-box");
  const apiLabel = q<SVGTextElement>(svg, "#api-label");
  const wApiSplit = q<SVGPathElement>(svg, "#w-api-split");
  const spP1 = q<SVGPathElement>(svg, "#sp-p1");
  const laneP1 = q<SVGPathElement>(svg, "#lane-p1");
  const gate = q<SVGPathElement>(svg, "#gate");
  const gateLabel = q<SVGTextElement>(svg, "#gate-label");
  const wGateWall = q<SVGPathElement>(svg, "#w-gate-wall");
  const lblQueue = q<SVGTextElement>(svg, "#lbl-queue");

  /** The three slotted boxes, indexed the same way as QUEUE_Y / slotLines. */
  const queueBoxes = [0, 1, 2].map((i) => q<SVGRectElement>(svg, `#queue-p${i}`));

  const spP0 = q<SVGPathElement>(svg, "#sp-p0");
  const laneP0 = q<SVGPathElement>(svg, "#lane-p0");
  const spP2 = q<SVGPathElement>(svg, "#sp-p2");
  const laneP2 = q<SVGPathElement>(svg, "#lane-p2");
  const lblP0 = q<SVGTextElement>(svg, "#lbl-p0");
  const lblP1 = q<SVGTextElement>(svg, "#lbl-p1");
  const lblP2 = q<SVGTextElement>(svg, "#lbl-p2");

  const provWires = [0, 1, 2].map((i) => q<SVGPathElement>(svg, `#w-prov-${i}`));
  const provGroups = [0, 1, 2].map((i) => q<SVGGElement>(svg, `#prov-${i}`));
  const provRects = provGroups.map((g) => q<SVGRectElement>(g, "rect"));

  const dlqBox = q<SVGRectElement>(svg, "#dlq-box");
  const dlqLabel = q<SVGTextElement>(svg, "#dlq-label");
  const dlqAside = q<SVGTextElement>(svg, "#dlq-aside");
  const dlqMark = q<SVGCircleElement>(svg, "#dlq-mark");

  const stripLine = q<SVGPathElement>(svg, "#strip-line");
  const stripLabel = q<SVGTextElement>(svg, "#strip-label");
  const stripLegend = q<SVGTextElement>(svg, "#strip-legend");

  const stamp429 = q<SVGTextElement>(svg, "#stamp-429");
  const stamp202 = q<SVGTextElement>(svg, "#stamp-202");
  const stampDupe = q<SVGTextElement>(svg, "#stamp-dupe");
  const stampRetry = q<SVGTextElement>(svg, "#stamp-retry");
  const asideFailover = q<SVGTextElement>(svg, "#aside-failover");
  const asideDigest = q<SVGTextElement>(svg, "#aside-digest");
  const asideEda = q<SVGTextElement>(svg, "#aside-eda");
  const digestEnv = q<SVGGElement>(svg, "#digest-env");

  const dep1 = q<SVGPathElement>(svg, "#g-dep-1");
  const dep2 = q<SVGPathElement>(svg, "#g-dep-2");
  const gLaneP0 = q<SVGPathElement>(svg, "#g-lane-p0");
  const gLaneP2 = q<SVGPathElement>(svg, "#g-lane-p2");
  const gFanIn = q<SVGPathElement>(svg, "#g-fan-in");

  /** Every filled box. DrawSVG traces an outline; it knows nothing about the
   *  fill, so a --surface rectangle would sit on the canvas fully painted
   *  while its own border is still being drawn. The fill fades in behind the
   *  trace instead — same move the bell makes with the clapper ball, and the
   *  same reason: the drawing is a line drawing first. */
  const boxRects: SVGRectElement[] = [appBox, apiBox, ...provRects, dlqBox, ...termRects];

  /** Everything that gets traced rather than faded in. */
  const strokeParts: SVGGeometryElement[] = [
    appBox,
    wEmail,
    wSms,
    ...pushPieces,
    chassis,
    wAppApi,
    apiBox,
    wApiSplit,
    spP1,
    laneP1,
    ...queueBoxes,
    ...slotLines.flat(),
    wGateWall,
    spP0,
    laneP0,
    spP2,
    laneP2,
    ...provWires,
    ...provRects,
    failWire,
    retryRail,
    dlqRail,
    dlqBox,
    stripLine,
    ...fanWires,
    ...termRects,
  ];

  /** Everything that only ever fades. */
  const fadeParts: SVGElement[] = [
    appLabel,
    chassisLabel,
    apiLabel,
    gateLabel,
    lblQueue,
    lblP0,
    lblP1,
    lblP2,
    ...provGroups.map((g) => q<SVGTextElement>(g, "text")),
    ...backoffTicks,
    ...backoffLabels,
    dlqLabel,
    dlqAside,
    dlqMark,
    stripLabel,
    stripLegend,
    ...stripTicks,
    ...stripDots,
    ...termLabels,
    ...termDots,
    ...termReceipts,
    stamp429,
    stamp202,
    stampDupe,
    stampRetry,
    asideFailover,
    asideDigest,
    asideEda,
    digestEnv,
    /* Phase A's two flags and the two frayed ends. All four are marks the
       stylesheet paints in their finished state and restState hides, same as
       every other fade — which is also why the still cards get them free. */
    flagFlood,
    flagDrop,
    frayA,
    frayB,
  ];

  /* ════════════════════════════════════════════════════════════════════════
     REST STATE — the inverse of the stylesheet
     ════════════════════════════════════════════════════════════════════════ */

  /* ── the camera ──────────────────────────────────────────────────────────
     Three numbers — zoom, and the scene point to centre — tweened as a plain
     object and written out as one transform attribute. Not as gsap `scale`/
     `x`/`y` on the group, and that is load-bearing: gsap resolves an SVG
     element's transform origin against its own bbox unless `svgOrigin` sticks,
     re-derives it whenever the transform cache is rebuilt, and applies
     smoothOrigin compensation when it thinks the origin moved. A camera whose
     pivot silently becomes "wherever the drawing happens to be widest" drifts
     a little further off with every keyframe. Owning the matrix costs one
     setAttribute per frame and cannot be wrong.

     The mapping is: scene point p renders at z·p + t, and t is chosen so that
     (fx,fy) lands on the frame centre. */
  const camState = { z: CAM_START.z, fx: CAM_START.fx, fy: CAM_START.fy };

  function applyCam(): void {
    const { z, fx, fy } = camState;
    cam.setAttribute(
      "transform",
      `translate(${(FRAME_CX - z * fx).toFixed(3)} ${(FRAME_CY - z * fy).toFixed(3)}) scale(${z.toFixed(5)})`,
    );
  }

  function restState(): void {
    gsap.set(pin, { opacity: 0 });
    gsap.set(caps, { opacity: 0, y: 10 });
    gsap.set(stat, { opacity: 0 });
    gsap.set(progressFill, { scaleY: 0 });

    gsap.set(strokeParts, { drawSVG: "0% 0%" });
    gsap.set(gate, { drawSVG: "50% 50%" });
    gsap.set(boxRects, { fillOpacity: 0 });
    gsap.set(fadeParts, { opacity: 0 });
    gsap.set(provGroups, { opacity: 1 });
    gsap.set(termDots, { fill: COLOR.faint });
    gsap.set(provRects, { stroke: COLOR.hairline });
    /* Packets are invisible at rest, and PARKED ON THE APP'S OUTLET rather
       than left at the scene origin. The opacity is what actually hides them;
       the position is the insurance. A circle authored at cx/cy 0 (which they
       must be, so motionPath's align needs no offset arithmetic) sits at the
       viewBox's top-left corner until something moves it — so the failure mode
       of ANY future beat that forgets to place a packet before showing it is a
       green dot floating above the schematic, attached to nothing. Parked on
       the outlet, the same mistake puts it on the wire, where it belongs. */
    gsap.set(allDots, {
      opacity: 0,
      fill: COLOR.greenDim,
      scale: 1,
      x: APP_OUT_X,
      y: SPINE_Y,
      transformOrigin: "50% 50%",
    });
    gsap.set(digestEnv, { x: QUEUE_HEAD_X, y: SPINE_Y, scale: 1, transformOrigin: "50% 50%" });
    /* The traveling label is the one piece of TEXT the scrub moves. Its lane
       is written in offsets from where the markup already puts it, so zero is
       its home and rest means "not moved". */
    gsap.set(flagFlood, { x: 0, y: 0 });
    /* The push wire's middle three pieces are hidden by drawSVG above, but the
       break drives their OPACITY as well — the segment flickers, the two edges
       hand over to their dashed twins. Rest has to put that back or a rewind
       past the break leaves a dimmed or missing piece of wire. */
    gsap.set([pushSeg, ...pushEdges], { opacity: 1 });
    camState.z = CAM_START.z;
    camState.fx = CAM_START.fx;
    camState.fy = CAM_START.fy;
    applyCam();
  }

  /* ════════════════════════════════════════════════════════════════════════
     THE STILL STATE  (< 768px, and prefers-reduced-motion)
     ════════════════════════════════════════════════════════════════════════ */

  function buildStill(reduced: boolean): () => void {
    const frag = doc.createDocumentFragment();

    function figure(phase: string, box: string): HTMLElement {
      const wrap = doc.createElement("div");
      wrap.className = "eng-card-figure";
      wrap.dataset["phase"] = phase;
      const clone = pristine.cloneNode(true) as SVGSVGElement;
      clone.setAttribute("viewBox", box);
      // The card is exactly as tall as its own window is deep, so nothing
      // letterboxes and no two cards share an arbitrary aspect ratio.
      const n = box.split(" ");
      clone.style.aspectRatio = `${n[2]} / ${n[3]}`;
      wrap.appendChild(clone);
      return wrap;
    }

    function copyStat(): HTMLElement {
      const el = stat.cloneNode(true) as HTMLElement;
      el.removeAttribute("id");
      return el;
    }

    if (reduced) {
      /* One finished figure, then the argument as a list. The reader gets
         every piece of information the motion carried; none of it moves. */
      const lede = doc.createElement("p");
      lede.className = "eng-still-lede";
      lede.textContent = "One API call in. Every provider paced, retried and accounted for.";
      frag.appendChild(lede);
      frag.appendChild(figure("all", "0 24 1200 592"));
      for (const [i, capNode] of caps.entries()) {
        const card = doc.createElement("div");
        card.className = "eng-card";
        card.append(...Array.from(capNode.children).map((n) => n.cloneNode(true)));
        /* Phase A is the one phase whose mechanism is ERASED from the finished
           anatomy: the direct wires retract the moment the engine arrives, so
           the whole-drawing figure above has no flood, no broken wire, and
           nowhere to hang the two things phase A says out loud. It gets its
           own close-up, or a reduced-motion reader never learns what the
           engine was built to answer (DESIGN §3 — same information, delivered
           by layout instead of by time). No other caption needs one; every
           other mechanism is still in the finished picture. */
        if (i === 0) card.appendChild(figure(CARD_VIEW[0].phase, CARD_VIEW[0].box));
        frag.appendChild(card);
      }
      frag.appendChild(copyStat());
    } else {
      /* One card per caption, each a close-up of the mechanism it describes. */
      for (const view of CARD_VIEW) {
        const card = doc.createElement("div");
        card.className = "eng-card";
        const cap = caps[view.cap];
        if (cap) card.append(...Array.from(cap.children).map((n) => n.cloneNode(true)));
        card.appendChild(figure(view.phase, view.box));
        frag.appendChild(card);
      }
      frag.appendChild(copyStat());
    }

    still.replaceChildren(frag);
    still.hidden = false;
    pin.hidden = true;

    return () => {
      still.replaceChildren();
      still.hidden = true;
      pin.hidden = false;
    };
  }

  /* ════════════════════════════════════════════════════════════════════════
     THE SCRUB
     ════════════════════════════════════════════════════════════════════════ */

  function buildScrub(): void {
    restState();

    /* The scene materialises on the way in. Its own trigger, because the pin's
       timeline does not start until the section is already at the top. */
    gsap.fromTo(
      pin,
      { opacity: 0 },
      {
        opacity: 1,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top 85%",
          end: "top 12%",
          scrub: true,
        },
      },
    );

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      /* The camera's three numbers are tweened; this is what paints them. Pure
         function of camState, so it is as rewindable as the tweens are. */
      onUpdate: applyCam,
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: `+=${PIN_HEIGHTS * 100}%`,
        pin,
        pinSpacing: true,
        anticipatePin: 1,
        scrub: SCRUB,
        invalidateOnRefresh: true,
      },
    });

    /* ── the five helpers every beat is built from ───────────────────────
       All of them are fromTo with immediateRender:false, which is the whole
       trick: the timeline can be rendered at any progress, in any order, and
       every element knows both ends of every tween it is in. */

    function ft(t: gsap.TweenTarget, from: gsap.TweenVars, to: gsap.TweenVars, at: number): void {
      tl.fromTo(t, from, { ...to, immediateRender: false }, at);
    }

    const fadeIn = (t: gsap.TweenTarget, at: number, dur = 1.2, to = 1, stagger = 0): void =>
      ft(t, { opacity: 0 }, { opacity: to, duration: dur, stagger }, at);

    const fadeOut = (t: gsap.TweenTarget, at: number, dur = 1.2, from = 1): void =>
      ft(t, { opacity: from }, { opacity: 0, duration: dur }, at);

    const draw = (t: gsap.TweenTarget, at: number, dur: number, stagger = 0): void =>
      ft(t, { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: dur, stagger, ease: "power2.out" }, at);

    /** A box: outline traced, fill brought up behind it at the halfway mark so
     *  the rectangle is a line before it is a surface. */
    const drawBox = (t: gsap.TweenTarget, at: number, dur: number, stagger = 0): void => {
      draw(t, at, dur, stagger);
      ft(t, { fillOpacity: 0 }, { fillOpacity: 1, duration: dur * 0.8, stagger }, at + dur * 0.45);
    };

    /** A packet running a route. Always explicit about both ends of the path
     *  so the tween is a pure function of progress and never of whatever
     *  transform the element happened to be carrying.
     *
     *  `raw` drops `align`/`alignOrigin` and lets the path's own coordinates
     *  land straight in x/y. Every guide and every packet lives inside
     *  #eng-cam with no transform of its own, so the two forms put a centred
     *  element in exactly the same place — but `alignOrigin` measures the
     *  target's bounding box and centres THAT on the path, which silently
     *  cancels any offset the element was authored with. The phase-A flood's
     *  clump lives in its circles' cx/cy, and the traveling label is authored
     *  at its landing point; both need the offset to survive the flight. */
    function run(
      dot: Element,
      path: SVGPathElement,
      at: number,
      dur: number,
      o: { start?: number; end?: number; ease?: string; raw?: boolean } = {},
    ): void {
      const span = { start: o.start ?? 0, end: o.end ?? 1 };
      tl.to(
        dot,
        {
          motionPath: o.raw
            ? { path, ...span }
            : { path, align: path, alignOrigin: [0.5, 0.5], ...span },
          duration: dur,
          ease: o.ease ?? "none",
          immediateRender: false,
        },
        at,
      );
    }

    /** The delivered-dot's moment: dim green to full green, 1.45× pop, settle,
     *  then out. Two power2 tweens, never an elastic ease (DESIGN §3). */
    function deliver(dot: Element, at: number, fade = true): void {
      ft(dot, { fill: COLOR.greenDim }, { fill: COLOR.green, duration: 0.14 }, at);
      ft(dot, { scale: 1 }, { scale: 1.45, duration: 0.26, ease: "power2.out" }, at);
      ft(dot, { scale: 1.45 }, { scale: 1, duration: 0.3, ease: "power2.inOut" }, at + 0.26);
      if (fade) fadeOut(dot, at + 0.7, 0.8);
    }

    /* ── the camera ──────────────────────────────────────────────────────── */
    {
      let prev = CAM_START;
      for (const k of CAM) {
        ft(
          camState,
          { z: prev.z, fx: prev.fx, fy: prev.fy },
          { z: k.z, fx: k.fx, fy: k.fy, duration: k.dur, ease: "power2.inOut" },
          k.at,
        );
        prev = k;
      }
    }

    /* ── the rail ────────────────────────────────────────────────────────── */
    ft(progressFill, { scaleY: 0 }, { scaleY: 1, duration: TL_END }, 0);

    caps.forEach((capEl, i) => {
      const at = CAP_AT[i]!;
      const next = CAP_AT[i + 1];
      ft(capEl, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: CAP_FADE, ease: "power2.out" }, at);
      if (next !== undefined) {
        ft(
          capEl,
          { opacity: 1, y: 0 },
          { opacity: 0, y: -10, duration: CAP_FADE, ease: "power2.in" },
          next - CAP_FADE,
        );
      }
    });

    /* ══════════════════════════════════════════════════════════════════════
       PHASE A — THE PROBLEM   (0 → 18)
       ══════════════════════════════════════════════════════════════════════ */

    drawBox(appBox, PHASE_A, 2.0);
    fadeIn(appLabel, 1.2, 1.2);
    drawBox(provRects, 1.0, 2.0, 0.5);
    fadeIn(
      provGroups.map((g) => q<SVGTextElement>(g, "text")),
      2.4,
      1.2,
      1,
      0.5,
    );
    /** How long a direct wire takes to draw, and the gap between the three of
     *  them. The push wire is drawn last, which is why its pieces begin at
     *  2.6 + 2 · 0.35. */
    const WIRE_DUR = 2.6;
    const WIRE_GAP = 0.35;
    draw([wEmail, wSms], 2.6, WIRE_DUR, WIRE_GAP);

    /* The push wire is five paths and has to draw as ONE line, so each piece
       takes exactly the share of WIRE_DUR that its own length is, back to
       back. Ease "none" and not draw()'s power2.out, and that is the whole
       reason this is written out rather than being a draw() call: an eased
       sweep cannot be cut into pieces and reassembled — five power2.out curves
       laid end to end is a line that lurches five times. A linear
       concatenation is exact. Over 2.6 units, against two neighbours easing
       out beside it, the constant rate is not readable. */
    {
      let at = 2.6 + 2 * WIRE_GAP;
      pushPieces.forEach((piece, i) => {
        const dur = WIRE_DUR * pushShare[i]!;
        ft(piece, { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: dur }, at);
        at += dur;
      });
    }

    /* One packet gets through, so the reader learns what an arrival looks
       like before being shown fourteen that do not. */
    fadeIn(dA.solo, 5.4, 0.4);
    run(dA.solo, wSms, 5.4, 2.4, { ease: "power1.inOut" });
    deliver(dA.solo, 7.8);

    /* ── the flood ─────────────────────────────────────────────────────────
       Fourteen at the same provider, arriving as one clump. `raw` because the
       clump's shape is the circles' own cx/cy — see run(). */
    dA.flood.forEach((dot, i) => {
      const t = FLOOD_A_T0 + i * FLOOD_A_STAGGER;
      const [ox, oy] = FLOOD_A_CLUMP[i]!;

      fadeIn(dot, t, 0.35);
      run(dot, wEmail, t, FLOOD_A_DUR, { ease: "power1.in", raw: true });

      /* It refuses. The packet goes amber, then falls off the wire under
         gravity — power2.in, because that is what falling is. The distance
         and the duration are read off the packet's own place in the clump, so
         fourteen packets come off the wire as fourteen packets: the ones at
         the front of the clump fall furthest, and no two take the same time
         to do it. Derived rather than rolled, for the same reason the clump
         itself is authored — a scroll back up must find the same fall. */
      const hit = t + FLOOD_A_DUR;
      ft(dot, { fill: COLOR.greenDim }, { fill: COLOR.amber, duration: 0.2 }, hit);
      ft(
        dot,
        { y: PROV_Y[0]! },
        { y: PROV_Y[0]! + FLOOD_A_FALL + ox, duration: 1.9 + oy * 0.02, ease: "power2.in" },
        hit + 0.18,
      );
      fadeOut(dot, hit + 0.5, 1.5);
    });

    /* The complaint, riding the clump. Same start, same duration, same ease
       as the packets under it, on a lane that is their wire lifted clear —
       so it is not following them, it is one of them. */
    run(flagFlood, gFloodLabel, FLOOD_A_T0, FLOOD_A_DUR, { ease: "power1.in", raw: true });
    fadeIn(flagFlood, FLOOD_A_T0 + 0.3, 0.5);

    /* And the provider answers. 0.35 units after the label lands, not with
       it: call, beat, response. Three sentences in a row would be noise. */
    ft(provRects[0]!, { stroke: COLOR.hairline }, { stroke: COLOR.amber, duration: 0.5 }, FLOOD_A_HIT);
    fadeIn(stamp429, FLOOD_A_HIT + 0.35, 0.9);
    /* The label leaves once it has been answered. The 429 stays, because the
       provider's word is the one that counts. */
    fadeOut(flagFlood, FLOOD_A_HIT + 0.95, 0.85);
    fadeOut(stamp429, 13.6, 1.4);
    ft(provRects[0]!, { stroke: COLOR.amber }, { stroke: COLOR.hairline, duration: 1.4 }, 13.6);

    /* ══════════════════════════════════════════════════════════════════════
       PHASE A — THE NETWORK DROP   (12.6 → 18)
       ──────────────────────────────────────────────────────────────────────
       The second half of the phase is a different accusation. The flood was
       the PROVIDER refusing; this is nobody refusing. The wire fails, and the
       packet on it has nowhere to be.

       It is staged on the push link because that link is otherwise idle: the
       flood owns the top wire and the one delivery owned the middle, so the
       bottom of the frame is clear and the two failures never share a beat.
       ══════════════════════════════════════════════════════════════════════ */

    /** When the segment starts arguing. Everything below is written against
     *  it, so the whole break moves as one if the phase is retimed. */
    const DROP_T0 = 12.6;

    /* Two stutters. A link does not go down cleanly, it flickers first — and
       the flicker is what makes the reader look at the wire instead of at the
       packet, which is the point: the wire is the subject now. */
    ft(pushSeg, { opacity: 1 }, { opacity: 0.12, duration: 0.12 }, DROP_T0);
    ft(pushSeg, { opacity: 0.12 }, { opacity: 1, duration: 0.14 }, DROP_T0 + 0.12);
    ft(pushSeg, { opacity: 1 }, { opacity: 0.18, duration: 0.12 }, DROP_T0 + 0.34);
    ft(pushSeg, { opacity: 0.18 }, { opacity: 1, duration: 0.14 }, DROP_T0 + 0.46);

    /* Then it dissolves. drawSVG collapses the segment onto its own middle,
       so the gap opens outward from a point rather than being erased from one
       end — a line coming apart, not a line being rubbed out. It lands on a
       ZERO-LENGTH dash, which with `stroke-linecap: butt` (DESIGN §3, and
       styles.css says it again) is nothing at all. With a round cap it would
       be a 1px dot sitting in the middle of the gap, which is the exact bug
       this scene has already paid for once. */
    ft(pushSeg, { drawSVG: "0% 100%" }, { drawSVG: "50% 50%", duration: 0.7, ease: "power2.in" }, DROP_T0 + 0.7);

    /* The ends fray: the two edge pieces hand over to their dashed twins, which
       lie on exactly the same curve. A cross-fade and not a retraction — see
       index.html for why a retraction cannot work on a non-scaling stroke.
       The dashes come up 0.1 behind the solid going down, so there is a frame
       where the edge is neither, which is the fray happening. */
    fadeOut(pushEdges, DROP_T0 + 1.0, 0.5);
    fadeIn([frayA, frayB], DROP_T0 + 1.1, 0.5, 0.9);

    /* It is not dead, it is intermittent, which is worse. Three dips, unevenly
       spaced so they never read as a pulse. Authored as tweens rather than a
       repeating one: an infinite loop has no place on a timeline that can run
       backwards, and this one has to rewind like everything else. */
    ([
      [14.9, 0.34],
      [15.9, 0.5],
      [17.0, 0.28],
    ] as const).forEach(([at, lo]) => {
      ft([frayA, frayB], { opacity: 0.9 }, { opacity: lo, duration: 0.18 }, at);
      ft([frayA, frayB], { opacity: lo }, { opacity: 0.9, duration: 0.22 }, at + 0.18);
    });

    /* ── the packet that finds it ──────────────────────────────────────────
       It leaves before the segment has finished dissolving and arrives after
       — so the reader watches it commit to a wire that is already failing,
       which is the whole feeling of a network drop. The route is the WHOLE
       curve (#g-direct-2): a route does not break, only the line does. */
    const DROP_PKT_T0 = 12.9;
    const DROP_PKT_DUR = 1.5;
    /** When it reaches the severed edge, and where. */
    const DROP_EDGE_AT = DROP_PKT_T0 + DROP_PKT_DUR;
    const [edgeX, edgeY] = breakEdge;

    fadeIn(dA.lost, DROP_PKT_T0, 0.4);
    run(dA.lost, gDirect2, DROP_PKT_T0, DROP_PKT_DUR, {
      end: breakEdgeF,
      ease: "power1.inOut",
    });

    /* The teeter. Lean, pull back, lean again — three tweens, none of them
       more than 5u, which on a 1200u schematic is nothing and is meant to be:
       it has to read as hesitation, not as a second journey. sine.inOut on the
       first two because a rock is a rock; sine.in on the third because that
       one does not come back. */
    ft(
      dA.lost,
      { x: edgeX, y: edgeY },
      { x: edgeX + 4, y: edgeY + 2.5, duration: 0.3, ease: "sine.inOut" },
      DROP_EDGE_AT,
    );
    ft(
      dA.lost,
      { x: edgeX + 4, y: edgeY + 2.5 },
      { x: edgeX - 2, y: edgeY - 1, duration: 0.28, ease: "sine.inOut" },
      DROP_EDGE_AT + 0.3,
    );
    ft(
      dA.lost,
      { x: edgeX - 2, y: edgeY - 1 },
      { x: edgeX + 5, y: edgeY + 3, duration: 0.26, ease: "sine.in" },
      DROP_EDGE_AT + 0.58,
    );

    /* And through. Gravity down (power2.in), a little forward drift because it
       was still moving when the wire stopped, and a tumble.

       THE TUMBLE: a circle cannot show rotation — spin a disc about its own
       centre and nothing on screen changes. So it is squashed onto its edge
       and back while it turns, which is what a coin going end over end
       actually looks like. Two tweens on scaleY plus one on rotation, and the
       rotation only becomes visible BECAUSE of the squash. */
    const DROP_FALL_AT = DROP_EDGE_AT + 0.84;
    const DROP_FALL_DUR = 2.0;
    ft(
      dA.lost,
      { y: edgeY + 3 },
      { y: edgeY + 3 + 210, duration: DROP_FALL_DUR, ease: "power2.in" },
      DROP_FALL_AT,
    );
    ft(dA.lost, { x: edgeX + 5 }, { x: edgeX + 19, duration: DROP_FALL_DUR }, DROP_FALL_AT);
    ft(dA.lost, { rotation: 0 }, { rotation: 214, duration: DROP_FALL_DUR }, DROP_FALL_AT);
    ft(
      dA.lost,
      { scaleY: 1 },
      { scaleY: 0.42, duration: DROP_FALL_DUR * 0.42, ease: "sine.inOut" },
      DROP_FALL_AT,
    );
    ft(
      dA.lost,
      { scaleY: 0.42 },
      { scaleY: 1, duration: DROP_FALL_DUR * 0.58, ease: "sine.inOut" },
      DROP_FALL_AT + DROP_FALL_DUR * 0.42,
    );
    /* Gone before it reaches the bottom of the frame, so it reads as falling
       out of the drawing rather than as landing on its edge — but not before.
       power2.in means the first half of the fall covers a quarter of the
       distance, so a fade that starts at +0.7 spends itself while the packet
       has barely moved and the tumble never gets seen. +1.0 puts the whole
       fade in the part of the drop that is actually moving. */
    fadeOut(dA.lost, DROP_FALL_AT + 1.0, 0.95);

    /* ── and the name of it ────────────────────────────────────────────────
       Struck in where it happened, with the same double-blink the segment made
       on its way out — so the label reads as the wire's own last word rather
       than as a caption somebody added afterwards. Then it settles faint and
       stays for the rest of the phase, because unlike the 429 nobody is going
       to tell you about this one twice. */
    const DROP_LBL_AT = 15.3;
    ft(flagDrop, { opacity: 0 }, { opacity: 0.95, duration: 0.1 }, DROP_LBL_AT);
    ft(flagDrop, { opacity: 0.95 }, { opacity: 0, duration: 0.12 }, DROP_LBL_AT + 0.1);
    ft(flagDrop, { opacity: 0 }, { opacity: 1, duration: 0.1 }, DROP_LBL_AT + 0.32);
    ft(flagDrop, { opacity: 1 }, { opacity: 0, duration: 0.12 }, DROP_LBL_AT + 0.42);
    ft(flagDrop, { opacity: 0 }, { opacity: FLAG_SETTLE, duration: 0.5 }, DROP_LBL_AT + 0.64);

    /* ══════════════════════════════════════════════════════════════════════
       PHASE B — THE ABSORBER   (18 → 42)
       ══════════════════════════════════════════════════════════════════════ */

    /* The direct wires retract toward the providers as the engine takes the
       middle of the line. Nothing is deleted; the route is re-cut. */
    ft(
      [wEmail, wSms],
      { drawSVG: "0% 100%" },
      { drawSVG: "100% 100%", duration: 2.6, stagger: 0.3, ease: "power2.inOut" },
      PHASE_B,
    );

    /* The broken wire leaves as it stands, on the third beat of the stagger:
       the two surviving pieces retract to their own far ends, the frayed ends
       and the label fade, and the three pieces in the middle are already
       nothing — two at opacity 0 since the break, one dissolved. */
    ft(
      [pushPieces[0]!, pushPieces[4]!],
      { drawSVG: "0% 100%" },
      { drawSVG: "100% 100%", duration: 2.6, ease: "power2.inOut" },
      PHASE_B + 0.6,
    );
    fadeOut([frayA, frayB], PHASE_B + 0.6, 1.6, 0.9);
    fadeOut(flagDrop, PHASE_B - 0.6, 1.4, FLAG_SETTLE);

    draw(chassis, 19.4, 3.0);
    fadeIn(chassisLabel, 21.6, 1.2);
    drawBox(apiBox, 21.0, 1.6);
    fadeIn(apiLabel, 22.4, 1.0);
    draw(wAppApi, 22.2, 1.2);
    draw([wApiSplit, spP1], 23.0, 0.8);
    draw(laneP1, 23.4, 1.0);

    /* The queue builds in the order it would be read: the box first, then the
       cells ruled into it left to right, so the reader watches six places to
       stand appear before anything arrives to stand in them. Both are done by
       25.9, and the first packet does not reach a slot until 29.3. */
    draw(queueBoxes[1]!, 24.1, 1.4);
    draw(slotLines[1]!, 24.9, 0.6, 0.1);

    ft(gate, { drawSVG: "50% 50%" }, { drawSVG: GATE_SHORT, duration: 1.0, ease: "power2.out" }, 25.2);
    draw(wGateWall, 25.6, 0.8);
    draw(provWires, 26.0, 2.0, 0.4);
    fadeIn([lblQueue, gateLabel], 26.2, 1.0, 1, 0.15);

    /* The same burst, absorbed. Arrivals are ragged (BURST_OFFSETS, two
       clumps); departures are a metronome (METER_PERIOD). The queue advances
       one slot every time the head leaves. */
    const BURST_T0 = 27.4;
    const LEG_APP_API = 0.85;
    /** api → the TAIL cell, then tail → the deepest cell still free. Two legs
     *  and not one, because a message that materialises in the middle of the
     *  box has not joined a queue — it has to come in at the back and walk
     *  forward past the cells that are already taken. The first burst arrives
     *  at an empty queue, so packet 0 walks the whole box; packet 5 stops
     *  where it entered. Everything is settled by 30.6, and the meter does not
     *  release until 31.2. */
    const LEG_API_TAIL = 0.62;
    const LEG_TAIL_SLOT = 0.45;
    const QUEUE_TAIL_X = QUEUE_X0 + QUEUE_SLOT / 2;
    const DEPART_T0 = 31.2;
    const LEG_DEPART = 2.05;

    fadeIn(stamp202, BURST_T0 + LEG_APP_API - 0.05, 0.8);
    fadeOut(stamp202, 33.0, 1.0);

    dB.queue.forEach((dot, i) => {
      const t = BURST_T0 + BURST_OFFSETS[i]!;
      const slotX = QUEUE_HEAD_X - i * QUEUE_SLOT;

      fadeIn(dot, t, 0.3);
      ft(dot, { x: APP_OUT_X, y: SPINE_Y }, { x: API_CX, duration: LEG_APP_API }, t);
      ft(
        dot,
        { x: API_CX },
        { x: QUEUE_TAIL_X, duration: LEG_API_TAIL, ease: "power2.out" },
        t + LEG_APP_API,
      );
      ft(
        dot,
        { x: QUEUE_TAIL_X },
        { x: slotX, duration: LEG_TAIL_SLOT, ease: "power2.inOut" },
        t + LEG_APP_API + LEG_API_TAIL,
      );

      /* Every packet ahead of it that leaves moves it one slot forward. This
         is the buffering — six dots standing still on a rail is a picture of
         a queue, six dots shuffling up a cell at a time as the head departs
         is a queue. */
      for (let d = 0; d < i; d++) {
        const from = QUEUE_HEAD_X - (i - d) * QUEUE_SLOT;
        ft(
          dot,
          { x: from },
          { x: from + QUEUE_SLOT, duration: 0.4, ease: "power2.inOut" },
          DEPART_T0 + d * METER_PERIOD,
        );
      }

      const depart = DEPART_T0 + i * METER_PERIOD;
      const guide = [dep0, dep1, dep2][i % 3]!;
      run(dot, guide, depart, LEG_DEPART, { ease: "power1.inOut" });
      deliver(dot, depart + LEG_DEPART);
    });

    /* Send twice, deliver once. The duplicate reaches the api, is recognised,
       and dissolves — it never touches a provider, which is the point. */
    const DUPE_T = 37.6;
    /* It stops at the api's outlet, not on top of the api's label: the packet
       reached the engine and went no further, and you have to be able to see
       both facts at once. */
    const DUPE_STOP_X = 406;
    fadeIn(dB.dupe, DUPE_T, 0.3);
    ft(dB.dupe, { x: APP_OUT_X, y: SPINE_Y }, { x: DUPE_STOP_X, duration: 1.1 }, DUPE_T);
    fadeIn(stampDupe, DUPE_T + 1.2, 0.9);
    ft(dB.dupe, { scale: 1 }, { scale: 0.5, duration: 1.4, ease: "power2.in" }, DUPE_T + 1.3);
    ft(dB.dupe, { fill: COLOR.greenDim }, { fill: COLOR.faint, duration: 0.8 }, DUPE_T + 1.3);
    fadeOut(dB.dupe, DUPE_T + 1.4, 1.2);
    fadeOut(stampDupe, 40.6, 1.2);

    /* ══════════════════════════════════════════════════════════════════════
       PHASE C — THE ASSURANCE   (42 → 68)
       ══════════════════════════════════════════════════════════════════════ */

    /* ── C1: retry with backoff ──────────────────────────────────────────── */
    draw(retryRail, PHASE_C, 3.2);
    fadeIn(backoffTicks, 44.2, 0.9, 0.85, 0.2);
    fadeIn(backoffLabels, 44.4, 0.9, 1, 0.2);

    const R = dC.retry;
    fadeIn(R, 43.2, 0.3);
    ft(R, { x: APP_OUT_X, y: SPINE_Y }, { x: API_CX, duration: 0.9 }, 43.2);
    ft(R, { x: API_CX }, { x: QUEUE_HEAD_X, duration: 1.2, ease: "power2.out" }, 44.1);
    run(R, dep1, 45.8, 2.2, { ease: "power1.inOut" });

    /* Refused. Amber, stamped, and onto the rail. */
    ft(provRects[1]!, { stroke: COLOR.hairline }, { stroke: COLOR.amber, duration: 0.4 }, 48.0);
    fadeIn(stampRetry, 48.1, 0.9);
    ft(R, { fill: COLOR.greenDim }, { fill: COLOR.amber, duration: 0.3 }, 48.2);

    /* The waits. Each hold is longer than the last (BACKOFF_HOLD), and the
       tick the packet is sitting on lights up while it waits — otherwise the
       reader sees a dot that stopped, not a dot that is waiting. */
    /* The rail begins at the provider's bottom-left corner, not at its inlet:
       a refused packet drops out of the bottom of the box onto the siding. */
    ft(R, { x: PROV_X, y: SPINE_Y }, { x: RAIL_ENTRY_X, y: RAIL_ENTRY_Y, duration: 0.5, ease: "power1.inOut" }, 48.3);

    let cursor = 48.8;
    let segFrom = 0;
    backoffFrac.forEach((f, i) => {
      const leg = i === 0 ? 1.2 : 0.62;
      run(R, retryRail, cursor, leg, { start: segFrom, end: f, ease: "power1.inOut" });
      cursor += leg;
      const hold = BACKOFF_HOLD[i]!;
      ft(backoffTicks[i]!, { opacity: 0.85 }, { opacity: 1, duration: 0.2 }, cursor);
      ft(backoffTicks[i]!, { opacity: 1 }, { opacity: 0.85, duration: 0.3 }, cursor + hold - 0.3);
      cursor += hold;
      segFrom = f;
    });

    /* Back into the queue, re-metered, delivered. */
    run(R, retryRail, cursor, 1.5, { start: segFrom, end: 1, ease: "power2.out" });
    ft(R, { fill: COLOR.amber }, { fill: COLOR.greenDim, duration: 0.6 }, cursor + 1.1);
    ft(R, { x: RAIL_EXIT_X, y: SPINE_Y }, { x: QUEUE_HEAD_X, duration: 1.0 }, cursor + 1.5);
    run(R, dep1, cursor + 2.5, 2.0, { ease: "power1.inOut" });
    deliver(R, cursor + 4.5);

    fadeOut(stampRetry, cursor + 1.6, 1.0);
    ft(provRects[1]!, { stroke: COLOR.amber }, { stroke: COLOR.hairline, duration: 1.0 }, cursor + 1.6);

    /* ── C2: failover ────────────────────────────────────────────────────── */
    draw(failWire, 56.6, 1.6);

    /* The email provider goes dark. Three quick steps, not a fade: an outage
       is not a dimmer switch. */
    ft(provGroups[0]!, { opacity: 1 }, { opacity: 0.2, duration: 0.14 }, 58.6);
    ft(provGroups[0]!, { opacity: 0.2 }, { opacity: 0.85, duration: 0.12 }, 58.8);
    ft(provGroups[0]!, { opacity: 0.85 }, { opacity: 0.16, duration: 0.16 }, 59.0);
    ft(provGroups[0]!, { opacity: 0.16 }, { opacity: 0.26, duration: 0.5 }, 59.3);

    const F = dC.fail;
    fadeIn(F, 58.8, 0.3);
    ft(F, { x: APP_OUT_X, y: SPINE_Y }, { x: API_CX, duration: 0.7 }, 58.8);
    ft(F, { x: API_CX }, { x: QUEUE_HEAD_X, duration: 0.9, ease: "power2.out" }, 59.5);
    run(F, dep0, 60.6, 1.2, { end: FAILOVER_SPLIT, ease: "power1.in" });
    fadeIn(asideFailover, 61.0, 1.0);
    run(F, failWire, 61.8, 1.1, { ease: "power1.out" });
    deliver(F, 62.9);
    fadeOut(asideFailover, 65.4, 1.2);

    /* The provider comes back. It was their outage, not a deletion. */
    ft(provGroups[0]!, { opacity: 0.26 }, { opacity: 1, duration: 1.4 }, 66.0);

    /* ── C3: the dead-letter siding ──────────────────────────────────────── */
    draw(dlqRail, 62.4, 2.0);
    drawBox(dlqBox, 62.7, 2.0);

    /* Same provider, because there is only one retry rail and it starts where
       it starts. This packet does not survive its backoffs — it runs the rail
       straight past all three ticks and rolls off the far end. */
    const L = dC.dlq;
    fadeIn(L, 61.4, 0.3);
    ft(L, { x: APP_OUT_X, y: SPINE_Y }, { x: API_CX, duration: 0.7 }, 61.4);
    ft(L, { x: API_CX }, { x: QUEUE_HEAD_X, duration: 0.9, ease: "power2.out" }, 62.1);
    run(L, dep1, 63.2, 1.5, { ease: "power1.inOut" });
    ft(provRects[1]!, { stroke: COLOR.hairline }, { stroke: COLOR.amber, duration: 0.4 }, 64.7);
    ft(L, { fill: COLOR.greenDim }, { fill: COLOR.amber, duration: 0.3 }, 64.8);
    ft(L, { x: PROV_X, y: SPINE_Y }, { x: RAIL_ENTRY_X, y: RAIL_ENTRY_Y, duration: 0.5, ease: "power1.inOut" }, 64.8);
    run(L, retryRail, 65.3, 1.5, { end: dlqFrac, ease: "power1.inOut" });
    run(L, dlqRail, 66.8, 1.1, { ease: "power2.out" });
    /* And parks inside the box, clear of its own label. No fade-out anywhere
       for this packet: it is still on screen at the end of the scene, which is
       the entire claim being made. */
    ft(L, { x: DLQ_RIGHT, y: DLQ_CY }, { x: DLQ_RIGHT - 16, duration: 0.6, ease: "power2.out" }, 67.9);
    ft(provRects[1]!, { stroke: COLOR.amber }, { stroke: COLOR.hairline, duration: 1.2 }, 66.4);
    fadeIn([dlqLabel, dlqAside], 66.4, 1.1, 1, 0.2);
    /* The packet hands over to a permanent mark, same as the receipts do on
       the timeline strip. Nothing on this siding depends on having watched. */
    fadeIn(dlqMark, 68.5, 0.5);
    fadeOut(L, 68.6, 0.4);

    /* ══════════════════════════════════════════════════════════════════════
       PHASE D — THE SCALE   (68 → 100)
       ══════════════════════════════════════════════════════════════════════ */

    /* ── D1: priority lanes ──────────────────────────────────────────────── */
    /* The split inherits the queue's own vocabulary: two more slotted boxes,
       same cell pitch, same ruling, above and below the one already there. A
       priority lane that looked like a plain rail would be claiming to be a
       different kind of thing, and it is not — it is the same queue, three
       times, with a meter that now spans all three. */
    draw([spP0, laneP0, spP2, laneP2], PHASE_D, 1.6, 0.3);
    draw([queueBoxes[0]!, queueBoxes[2]!], 69.0, 1.4, 0.2);
    draw([...slotLines[0]!, ...slotLines[2]!], 69.4, 0.6, 0.06);
    ft(gate, { drawSVG: GATE_SHORT }, { drawSVG: GATE_FULL, duration: 1.4, ease: "power2.out" }, 69.6);
    fadeOut(lblQueue, 70.0, 1.0);
    fadeIn([lblP1, lblP0, lblP2], 70.4, 1.0, 1, 0.16);

    dD.flood.forEach((dot, i) => {
      const t = FLOOD_T0 + i * FLOOD_GAP;
      fadeIn(dot, t, 0.4, FLOOD_OPACITY);
      run(dot, gLaneP2, t, FLOOD_DUR, { ease: "none" });
      fadeOut(dot, t + FLOOD_DUR, 0.5, FLOOD_OPACITY);
    });

    /* One login code, entering last and arriving first. Linear, like the flood:
       an eased otp would be doing the overtaking with an ease curve rather than
       with its lane, and the lane is the point. */
    fadeIn(dD.otp, OTP_T0, 0.4);
    run(dD.otp, gLaneP0, OTP_T0, OTP_DUR, { ease: "none" });
    deliver(dD.otp, OTP_T0 + OTP_DUR);

    /* ── D2: digest ──────────────────────────────────────────────────────── */
    dD.digest.forEach((dot, i) => {
      const x0 = 470 + i * 30;
      ft(dot, { opacity: 0, x: x0, y: SPINE_Y }, { opacity: 1, duration: 0.5 }, 81.0 + i * 0.08);
      ft(dot, { x: x0 }, { x: QUEUE_HEAD_X, duration: 1.5, ease: "power2.in" }, 82.0 + i * 0.06);
      fadeOut(dot, 83.2 + i * 0.05, 0.4);
    });
    ft(digestEnv, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" }, 83.2);
    fadeIn(asideDigest, 83.6, 0.9);
    run(digestEnv, dep0, 84.8, 1.9, { ease: "power1.inOut" });
    ft(digestEnv, { stroke: COLOR.greenDim }, { stroke: COLOR.green, duration: 0.2 }, 86.7);
    fadeOut(digestEnv, 87.0, 0.8);
    fadeOut(asideDigest, 87.0, 1.0);

    /* ── D3: the fan-out ─────────────────────────────────────────────────── */
    /* The providers hand over to the channels they exist to reach. They leave
       before the terminals arrive rather than crossfading with them — the two
       columns share x, and half a box on top of half a box is mush. */
    fadeOut([...provGroups, ...provWires, failWire], 87.8, 1.3);

    draw(fanWires, 89.2, 1.6, 0.14);
    drawBox(termRects, 89.4, 1.4, 0.18);
    fadeIn(termLabels, 90.0, 0.9, 1, 0.14);
    fadeIn(termDots, 90.0, 0.9, 1, 0.14);

    /* The junction gets its name the moment it does the thing the name is for.
       It does not leave again: by the end of the scene the reader is looking at
       the whole anatomy, and this is the word for the shape of it. 0.9 rather
       than 1 keeps it engraved rather than printed. */
    fadeIn(asideEda, 89.8, 1.4, 0.9);

    fadeIn(dD.fanIn, 91.0, 0.3);
    run(dD.fanIn, gFanIn, 91.0, 2.2, { ease: "power1.inOut" });
    fadeOut(dD.fanIn, 93.1, 0.2);

    dD.fan.forEach((dot, i) => {
      const t = 93.2 + i * 0.09;
      fadeIn(dot, t, 0.2);
      run(dot, fanWires[i]!, t, 1.35, { ease: "power1.inOut" });
      const arrive = t + 1.35;
      deliver(dot, arrive);
      ft(termDots[i]!, { fill: COLOR.faint }, { fill: COLOR.green, duration: 0.14 }, arrive);
      ft(termDots[i]!, { scale: 1 }, { scale: 1.4, duration: 0.22, ease: "power2.out" }, arrive);
      ft(termDots[i]!, { scale: 1.4 }, { scale: 1, duration: 0.26, ease: "power2.inOut" }, arrive + 0.22);
      ft(
        termRects[i]!,
        { stroke: COLOR.hairline },
        { stroke: COLOR.hairlineStrong, duration: 0.4 },
        arrive,
      );
      ft(
        termReceipts[i]!,
        { opacity: 0, y: 4 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
        arrive + 0.1,
      );
    });

    /* ── D4: the bridge ──────────────────────────────────────────────────── */
    draw(stripLine, 95.0, 1.5);
    fadeIn(stripLabel, 95.4, 0.9);
    fadeIn(stripTicks, 95.6, 0.8, 1, 0.1);

    dD.back.forEach((dot, i) => {
      const t = 96.6 + i * 0.16;
      ft(dot, { opacity: 0, fill: COLOR.green }, { opacity: 1, duration: 0.3 }, t);
      run(dot, backGuides[i]!, t, 1.6, { ease: "power2.inOut" });
      /* The packet hands its receipt to the strip and goes; the mark it leaves
         stays. A record you have to have been watching for is not a record. */
      fadeIn(stripDots[i]!, t + 1.5, 0.3);
      fadeOut(dot, t + 1.6, 0.3);
    });

    fadeIn(stripLegend, 98.6, 0.9);
    fadeIn(stat, 97.4, 1.4);
  }

  /* ════════════════════════════════════════════════════════════════════════
     MEDIA GATING
     One matchMedia owns the choice. Crossing 768px, or turning reduced motion
     on, reverts one context and builds the other — no listeners of our own,
     no half-torn-down ScrollTrigger.
     ════════════════════════════════════════════════════════════════════════ */

  const mm = gsap.matchMedia();

  mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
    buildScrub();
  });

  mm.add("(max-width: 767.98px) and (prefers-reduced-motion: no-preference)", () =>
    buildStill(false),
  );

  mm.add("(prefers-reduced-motion: reduce)", () => buildStill(true));

  /* The hero's copy block changes height when the web fonts land, which moves
     every trigger below it. One refresh, guarded so a slow font cannot poke a
     scene that has already been torn down. */
  let alive = true;
  if (doc.fonts?.ready) {
    void doc.fonts.ready.then(() => {
      if (alive) ScrollTrigger.refresh();
    });
  }

  function destroy(): void {
    alive = false;
    mm.revert();
  }

  return { destroy };
}
