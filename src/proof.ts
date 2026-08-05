/* ══════════════════════════════════════════════════════════════════════════
   SCENE 5 — PROOF + CTA
   ──────────────────────────────────────────────────────────────────────────
   The last scene, and the only one on the page that is NOT pinned. Four
   scenes have taken the scrollbar away from the reader; before the page asks
   for anything it gives the scrollbar back. Normal scroll, one scrub, about a
   screen and a half, in four moves:

     1  THE TABLE ARRIVES   a hairline drops out of the section's top — scene
                            4's story still running downward — levels out, and
                            runs into the tabletop's own top edge, which then
                            traces itself all the way round. Wire and border
                            are ONE path and ONE stroke, not two objects timed
                            to look continuous.
     2  THE RECEIPTS PRINT  four documents, in reading order, on overlapping
                            staggers. The reader's scroll IS the print speed:
                            an opaque cover slides down off each card on a
                            transform, revealing the paper top-first, with a
                            bright line riding its edge as the print head.
                            Scrolling up un-prints them, exactly.
     3  THEY TEAR OFF       each finished receipt drops three pixels and lands
                            at its own resting angle, and only then does its
                            corner tick draw. Below 6° and above nothing: this
                            is paper settling, not a card animating.
     4  THE BILL, THEN THE ASK   a narrower fifth strip prints last and settles
                            harder, the finished table travels up out of frame,
                            and then thirty viewport-percent of nothing before
                            the one green button on this site.

   It obeys the four rules scenes 2–4 do — one scrubbed timeline with no .set()
   or .call() in it, every tween a fromTo with immediateRender:false, CSS
   painting the finished frame and restState() inverting it, and
   transform / opacity / colour only, never layout. Four things about this
   scene are worth naming up front:

     · THE MECHANISM IS A COVER, NOT A MASK. The obvious way to make paper
       emerge is to animate a clip-path or a height. Both are banned for good
       reasons — one is a per-frame path recomputation, the other is layout —
       and both would also reflow the card's text as it appeared. So every
       receipt is laid out at full size from the first frame and never moves,
       and an opaque --canvas panel over it slides DOWN on a translate. The
       only clipping anywhere in the scene is a static `overflow: hidden` on
       the sheet, which is the printer's aperture: a hole in a machine, never
       animated.

     · THE INK COOLS. The line the cover's edge has just uncovered arrives at
       --text and settles to its own rung of the ladder over the next couple of
       units. That is thermal paper, and it is also the honest way to make a
       reveal read as PRINTING rather than as fading in — a fade says "this was
       always here"; a cool says "this was just made".

     · TWO TRANSFORM OWNERS, TWO ELEMENTS. The scrub owns .prf-rcpt (the
       tear-off drop and the resting angle). The pointer owns .prf-sheet inside
       it (Draggable's x/y, the hover lift, the post-toss rotation drift).
       Neither ever writes to the other's matrix, which is what lets a tossed
       receipt keep sliding while the page scrolls underneath it — the hero
       bell's two-regime pattern, one scene later.

     · THE TABLE'S PATH IS A PROXY, NOT A TWEEN. A responsive box has no
       author-time coordinates, so the outline's `d` is written from the
       measured table and rewritten on resize. A drawSVG tween caches its
       path length at init and would be measuring a table that no longer
       exists; instead one number is tweened and the outline is RENDERED from
       it on every frame — turn.ts's and agents.ts's "pure function of one
       number" discipline, applied to geometry that can change underneath it.

   Constants first, with the arithmetic, same as engine.ts, turn.ts and
   agents.ts.
   ══════════════════════════════════════════════════════════════════════════ */

/* Draggable is the only plugin this file names. ScrollTrigger and
   InertiaPlugin are registered once in main.ts and reached through the tween
   vars (`scrollTrigger:`, `inertia: true`), exactly as scenes 2–4 reach
   ScrollTrigger — importing them here would put a second reference to the same
   module in this file for no behaviour. */
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";

/* ══════════════════════════════════════════════════════════════════════════
   TUNING CONSTANTS  —  change these, not the code below
   ══════════════════════════════════════════════════════════════════════════ */

/* ── the scrub window ──────────────────────────────────────────────────────
   NO PIN. Every other scene on this page holds the viewport still and moves
   the picture; this one lets the page scroll normally and hangs a scrub on the
   table's own travel. The reason is structural rather than aesthetic: a pin is
   a promise that something is going to happen in place, and what happens here
   is a reader being handed documents and then being asked. A fifth consecutive
   hijacked scroll would be the page refusing to let go on the exact screen it
   wants a click on.

   AND THAT CHOICE PUTS A HARD CEILING ON THE PRINTING, which is worth writing
   out because it is the one place this scene knowingly falls short of its
   storyboard (~1.2 screens of print). Let H be the table's height, vh the
   viewport, and write the window as `top bottom` → `bottom E%`:

       range              = H + (1 − E)·vh
       top of table at p  = vh − p·range
       fully in frame for = p ∈ [ H/range , vh/range ]

   The table is completely visible from the moment its bottom clears the fold
   until its top leaves — and the scroll between those two moments is exactly
   vh, ONE screen, whatever H and E are. So without a pin you may have more
   than a screen of printing, or a finished table the reader can see all of,
   but not both. This scene takes the second: the payoff of four receipts is a
   TABLE of four receipts, and a last frame that cannot be seen whole is not a
   payoff. Everything the timeline builds therefore lands inside that window
   (HOLD_FROM below is the number that enforces it), and the printing itself
   comes out at about a screen rather than 1.2 of one.

   E = 0.45 buys the held ending its own scroll: range is H + 0.55·vh, so
   after the table is complete there is still a third of the window left for it
   to stand finished and travel up out of frame before the finale. */
const START = "top bottom";
const END = "bottom 45%";

/** Scrub catch-up, in seconds. Matched to scenes 2–4 on purpose: four scenes
 *  read in one continuous scroll, and a fifth that lagged differently would
 *  read as the page changing hands. */
const SCRUB = 0.55;

/** The timeline's length in units. Everything below is a position on it. */
const TL_END = 100;

/* ── the table's entrance ──────────────────────────────────────────────────
   One stroke: down, level out, and round the tabletop counter-clockwise. The
   wire lives at NEGATIVE y on an overflow-visible svg, which is why it needs
   no element of its own — it is literally the first segment of the border.

   WIRE_H has to stay under the masthead's bottom margin (styles.css clamps it
   to 112px at its narrowest) or the wire starts behind the head it hangs
   under. WIRE_RUN is how far right of the table's top-left corner the wire
   comes down, and it exists so the levelling curve has room to arrive
   HORIZONTAL — a wire that turned a corner into the border would read as two
   lines meeting, and the whole point is that it is one. */
const TABLE_R = 16; // --r-card, and the table is the only 16px radius in the scene
const WIRE_H = 104;
const WIRE_ELBOW = 44; // where the straight drop ends and the levelling curve begins
/* 280, up from 96. The wire used to come down 112px in from the table's left
   corner, which is exactly where the notary seal now sits — the drop would
   have run straight through the stamp. It enters further along the top edge
   instead and takes a longer, lazier sweep into the corner, and the assert
   below is what keeps it clear of the seal's ink whatever either of them
   is edited to. */
const WIRE_RUN = 280; // horizontal runway for that curve
const WIRE_EASE = 0.35; // first control point, as a fraction of the elbow's depth

const TABLE_AT = 2;
const TABLE_DUR = 10;
/** The slots the paper will come out of, listed before any paper does — the
 *  same construction scene 4's checklist uses for its five empty boxes. Four
 *  hairlines on an empty table say "four things are coming" without the scene
 *  having to say it. */
const SLOTS_AT = 10;
const SLOTS_DUR = 2.5;

/* ── the printing ──────────────────────────────────────────────────────────
   Reading order — top-left, top-right, bottom-left, bottom-right — on a
   12-unit stagger against a 20-unit print, so each receipt is a little over
   half done when the next one starts. That overlap is the difference between a
   printer working and four printers taking turns.

   20 units at this scene's density is roughly a fifth of the whole scrub per
   card, and four of them plus the bill is 76 of the 100 units. The rest is the
   table arriving at one end and the reader being left with a finished table at
   the other. */
const PRINT_AT: readonly number[] = [13, 22, 31, 40];
const PRINT_DUR = 14;
/** The print head fades in with the first line and is gone before the last —
 *  a head that was still lit when the paper stopped moving would be a printer
 *  that never finished. */
const HEAD_IN = 1.0;
const HEAD_OUT_LEAD = 1.9; // how far before the end of the print the head leaves
const HEAD_OUT = 1.3;

/** How long a freshly-printed line takes to cool from --text to its own rung.
 *  Long enough to read as a settle rather than a flicker; short enough that a
 *  line is at its resting ink well before the receipt tears off. */
const COOL_DUR = 2.1;
/** Where inside its row-slot a line is considered uncovered. 0.85 rather than
 *  0.5 because the cover's edge has to clear the line's descenders before the
 *  ink is really "out" — cooling a line the reader can only half see is a
 *  colour change happening off screen. */
const REVEAL_BIAS = 0.85;

/* ── the tear-off ──────────────────────────────────────────────────────────
   A receipt that has finished printing drops three pixels and lands at an
   angle. Three, not ten: this is a strip of paper separating along a
   perforation, and the give in that gesture is millimetres. */
const TEAR_LAG = 0.4; // after the print ends
const TEAR_DUR = 1.2;
const TEAR_DROP = 3; // px

/** THE RESTING ANGLES, authored rather than random. Four different values so
 *  the table does not read as a grid of aligned boxes, all under a degree so it
 *  does not read as a mess — and constants rather than Math.random() because a
 *  scene that looked different on every reload could not be reviewed, and
 *  because a scrub has to be a pure function of its position. */
const REST_ANGLE: readonly number[] = [-0.55, 0.42, 0.66, -0.31];
/** The floor those four are held to, and the number the assert below refuses
 *  an edit past. */
const REST_MAX = 0.7;

/** The bill settles harder than the receipts do: a little further down and a
 *  lot straighter. A total that landed at the same jaunty angle as the items
 *  above it would be a fifth item. */
const TOTAL_REST = 0.12;
const TOTAL_DROP = 4;

/* The corner tick, after the tear. The order is the argument: the paper is off
   the roll, and THEN it is marked as done. A tick that drew while the receipt
   was still printing would be the scene checking its own homework early. */
const TICK_LAG = 0.2; // after the tear settles
const TICK_DUR = 0.9;

/* ── the cost chart ────────────────────────────────────────────────────────
   The bars grow as the fourth receipt prints, and they start at the point the
   cover's edge has cleared the chart's own band: 0.525 of the print, measured
   off the row-slot model below (the chart occupies slots 2–4 of that card's
   seven). Growing them under an opaque panel would be eight tweens nobody
   sees, and growing them after the print would make the chart a second event. */
const BAR_START = 0.525; // as a fraction of PRINT_DUR, from that card's print start
const BAR_STEP = 0.40;
const BAR_DUR = 1.1;
/** Bars grow from 0.08, never from 0 (DESIGN §3). On an 88px chart that is a
 *  7px mark sitting on the axis — a tick on a chart that has not been filled
 *  in yet, which is a thing, rather than nothing at all, which is the case the
 *  law is written about. */
const BAR_MIN = 0.08;
const CHART_BARS = 8;
/** How much the four post-fold bars are allowed to differ from each other, in
 *  percentage points of the tallest bar. The card's whole claim is "flat", and
 *  a spread wider than this would make it a claim the picture does not support. */
const FLAT_SPREAD = 4;

/* ── the bill ──────────────────────────────────────────────────────────────
   Last, and after everything: the assert below refuses a schedule where it
   starts before the fourth receipt has finished. */
const TOTAL_AT = 55;
const TOTAL_DUR = 8;
const TOTAL_TEAR_LAG = 0.6;

/** Where the scene stops building. Everything past this is the finished table
 *  standing still and travelling up out of frame — the payoff the window
 *  arithmetic at the top of this file exists to protect.
 *
 *  65, AND THE NUMBER IS DERIVED RATHER THAN FELT. The table is fully in frame
 *  for p ∈ [H/range, vh/range]; with E = 0.45 that upper bound is
 *  vh / (H + 0.55·vh), which for today's 617px table is 0.682 at a 674px
 *  viewport, 0.83 at 900px and 0.96 at 1200px. HOLD_FROM has to sit UNDER the
 *  worst of those — the short laptop BRAND §3 sizes the whole site against —
 *  or the bill tears off after the table's top has already left the screen.
 *
 *  It moved from 70 to 67 when the total strip grew a second line of ticks:
 *  the seven pillars took the strip from 79px to 112px, the table from 576 to
 *  609, and 609 pushed that upper bound from 0.712 down to 0.688. The whole
 *  schedule below came in with it rather than being squeezed at the end — a
 *  scene that hurried its last beat to make room would be paying for the
 *  strip's extra line with the bill's own moment. The thirty-odd units left
 *  over are not padding: they are the finished table crossing the viewport
 *  with nothing left to do. */
const HOLD_FROM = 65;

/* ── the interaction (desktop pointer only) ────────────────────────────────
   A torn-off receipt is paper: you can pick it up, throw it, and it slides to
   a stop somewhere on the table. Nothing escapes the table (Draggable bounds),
   and nothing ends up unreadable (the angle cap below).

   These are the ONLY random-looking numbers in the scene and none of them is
   random. Both cycles are authored sequences advanced per card, so the second
   time you put a receipt down it lands differently from the first — which is
   what paper does — while the whole thing stays a function of how many times
   you have touched it. */
const HOVER_SCALE = 1.015;
const HOVER_IN = 0.24;
const HOVER_OUT = 0.34;
/** Where a receipt settles after a hover, as an offset from its own resting
 *  angle. Three values, cycled: leave it, come back, and it has moved. */
const HOVER_CYCLE: readonly number[] = [0.9, -1.3, 0.5];
/** The rotation a toss leaves behind, same construction. Runs alongside the
 *  inertia rather than after it: paper rotates while it slides, not once it
 *  has stopped. */
const DRIFT_CYCLE: readonly number[] = [1.8, -2.6, 3.2, -1.5];
const DRIFT_DUR = 0.9;
/** THE CAP. A receipt has to stay legible wherever it ends up, and past about
 *  six degrees a block of 11.5px mono stops being something you read and
 *  becomes something you tilt your head at. Asserted against the worst case
 *  the two cycles above can produce on top of the widest resting angle. */
const MAX_ANGLE = 6;
const DRAG_EDGE_RESIST = 0.86;
/** The table's own padding, in px. MUST match styles.css `.prf-table`, for the
 *  same reason the ink map must: a stylesheet cannot tell this file what it
 *  chose. It is load-bearing here rather than decorative — see below. */
const TABLE_PAD = 24;
/** And the TOP padding, which is larger. It is the budget the seal's dip is
 *  spent out of: receipt 1's slot sits exactly on it, so the difference between
 *  this and how far the stamp comes down is the clearance between them. MUST
 *  match `.prf-table` in styles.css. */
const TABLE_PAD_TOP = 32;
/** The widest a receipt can get: half the page column, which is what the 2×2
 *  grid gives it. Used only by the assert below. */
const CARD_W_MAX = 540;

/* ── the notarized sentence ────────────────────────────────────────────────
   A line of testimony, and then a notary seal pressed over its tail. Its own
   scrub, on its own trigger, because it sits ABOVE the table and has to have
   happened before the table's timeline starts — the reader reads the claim,
   watches it get certified, and only then does the printer start.

   Two beats and a hold. The sentence rises the way every quiet entrance on
   this site rises; the seal then STAMPS: 1.15 → 1 with the opacity, one fast
   settle. Down rather than up, because a stamp is a thing being pressed onto
   paper, and DESIGN §3's "never from scale(0)" is about things appearing out
   of nothing — this one arrives bigger than it lands, which is the same
   gesture the hero's clapper makes when it strikes. */
const OATH_AT = 1;
const OATH_DUR = 5;
const OATH_RISE = 18; // px
/** The press. Explicit-from at both ends like everything else here, so
 *  scrolling back un-stamps it — the seal grows and lifts off the paper. */
const SEAL_AT = 9;
const SEAL_DUR = 3.2;
const SEAL_PRESS = 1.15;
const TESTIMONY_END = 20;

/* ── the seal's own geometry ───────────────────────────────────────────────
   Everything here is authored in index.html and CHECKED here, the same way the
   cost chart's bar heights are: the markup is the drawing, this file is the
   arithmetic that says the drawing is possible. Nothing below is measured —
   the seal is built before the fonts resolve, so every fit check is mono
   advance times a character count, never a text box. */
const SEAL_BOX = 168; // the viewBox, in user units
const SEAL_CX = 84;
const SEAL_CY = 84;
/** The three rings, outermost first. Radii only; the stroke weights and the
 *  ink live in the stylesheet. */
const SEAL_RINGS: readonly number[] = [80, 74, 50];
/** The radius the lettering sits on, and the two arcs cut from it. Spans are
 *  in degrees of bearing measured clockwise from 12 o'clock. */
const SEAL_TEXT_R = 64;
const SEAL_ARC_TOP_SPAN = 236; // β −118° → +118°, clockwise over the top
const SEAL_ARC_BOT_SPAN = 68; // β 214° → 146°, counter-clockwise under the bottom
/** Geist Mono's advance at 1em plus the arc run's own tracking. MUST match
 *  .prf-seal-arc in styles.css — a stylesheet cannot tell this file what it
 *  chose (scene 4's rule, and this file already keeps it for the ink ladder). */
const MONO_ADVANCE = 0.61;
const SEAL_ARC_SIZE = 7.5;
const SEAL_ARC_TRACK = 0.1; // em
/** How much arc a drawn star occupies, and the smallest gap that may sit
 *  between any two things on the ring. Below this the lettering stops reading
 *  as separate phrases and becomes one texture. */
const SEAL_STAR_SPAN = 12;
const SEAL_GAP_MIN = 7;
/** How close a dasharray's sum has to come to its ring's circumference. The
 *  point of the ink-skip is that the pattern completes exactly ONCE around; a
 *  pattern that tiles reads as a dashed circle, which is a different object. */
const SEAL_DASH_TOL = 2.5;
/** Where the arc phrases live, so the fit check reads the same strings the
 *  markup renders rather than a copy of them. */
const SEAL_ARC_TOP_IDS = "#prf-arc-top";
const SEAL_ARC_BOT_IDS = "#prf-arc-bot";

/** The two tilts, in degrees. The wrap carries the first and never moves; the
 *  seal adds the second, so a stamp lands at their sum. Bounded because a
 *  sentence past about fifteen degrees stops being a tilted line and starts
 *  being a diagonal. */
const OATH_TILT = -4;
const SEAL_TILT = -8;
const TILT_MAX = 15;

/** The testimony block's bottom margin at its narrowest, from styles.css.
 *  Duplicated here for one reason: the entrance wire drops WIRE_H above the
 *  table, and if that runway ever grew past this gap the wire would start
 *  behind the seal. Asserted below. */
/* ── where the slip lies on the table ──────────────────────────────────────
   The testimony is absolutely positioned against .prf-table and anchored at its
   top-left, so every number below is in TABLE-RELATIVE pixels with the table's
   own top-left corner at (0, 0). Negative is above the top edge or left of the
   left edge. All four MUST match styles.css.

   The point of having them here is that "straddles the corner" then stops being
   a look and becomes two inequalities the scene refuses to boot without: the
   seal's ink must reach past the left edge, and it must come down past the top
   edge onto the tabletop. The two clearances that could go wrong — the masthead
   above and receipt 1's slot below — are checked against the same arithmetic. */
const TESTIMONY_LEFT = 112;
const TESTIMONY_TOP = -22;
const SEAL_LEFT_OFF = -126;
const SEAL_TOP_OFF = -130;
/** How much daylight the sentence has to keep from the seal's BOTTOM arc.
 *  This is the one clearance that cannot be bought vertically: the seal has to
 *  dip onto the tabletop and the sentence has to sit just above the same edge,
 *  so their y-bands necessarily overlap, and `ASYNCIFY` at 7.5px underneath
 *  `Don't trust` at 19px — both at --text-dim — is mush rather than a stamp.
 *  The sentence therefore starts to the RIGHT of that arc, and the outermost
 *  ring is what crosses its first letter. */
const SEAL_ARC_BOT_CLEAR = 6;
/** The seal's CSS box, against its 168-unit viewBox. */
const SEAL_RENDER = 160;
/** The wrap's half-height, bounded rather than measured: it is one line of
 *  17–19px type at line-height 1.3, so 11–13px, and the asserts take whichever
 *  end of that range is the worse case for the clearance they are checking. A
 *  measured value here would be a fallback-font value, because this scene is
 *  built before the fonts resolve. */
const OATH_HALF_MIN = 10;
const OATH_HALF_MAX = 14;
/** How much daylight the entrance wire has to keep from the seal's ink. */
const WIRE_SEAL_CLEAR = 24;

/** The masthead's bottom margin at its narrowest, from styles.css. It is the
 *  only clearance above the seal now that the testimony has left the flow, and
 *  it has to cover both the stamp and the wire's runway. */
const MASTHEAD_GAP_MIN = 176;

/* ── the finale ────────────────────────────────────────────────────────────
   Not a scrub. The page has finished arguing; this is the site's ordinary
   entrance grammar — a staggered rise, expo-out, under DESIGN §3's 1.3s
   ceiling — played once when the block comes up. Anything scrubbed here would
   make the reader's own scroll responsible for the button appearing, and the
   button is the one thing on this page that should simply be there. */
const FIN_RISE = 14; // px
const FIN_DUR = 0.7;
const FIN_STAGGER = 0.055;

/* ── the ink ladder ────────────────────────────────────────────────────────
   Three rungs, and the map from a line's data-ink to the hex it rests at.
   These MUST agree with styles.css; a stylesheet cannot tell this file what it
   chose, so the two agree here or the scene refuses to boot — scene 4's rule
   for its type ladder, applied to a colour ladder.

   HOT is where every line arrives, whatever it rests at. One value, not a
   per-rung offset: freshly printed thermal ink is one temperature, and lines
   that already rest at --text simply have nothing to cool from, which is
   correct — they are the ones the reader was meant to read first anyway. */
const INK: Readonly<Record<string, string>> = {
  text: "#ededed",
  dim: "#a1a1a1",
  faint: "#6e6e6e",
};
/** One rung up, for the hover lift. --text has no rung above it on the ladder
 *  and BRAND §1 forbids inventing one, so it lifts to itself: the lift is
 *  carried by the lines that had somewhere to go. */
const INK_UP: Readonly<Record<string, string>> = {
  text: "#ededed",
  dim: "#ededed",
  faint: "#a1a1a1",
};
const HOT = INK.text!;
const HAIRLINE = "#262626";
const HAIRLINE_STRONG = "#3f3f3f";

/* ── the receipts, as data ─────────────────────────────────────────────────
   LINES is how many .prf-line elements each card carries, and ROWS is how many
   row-slots tall it is. Both are declared here and checked against the markup
   at boot, by COUNTING — never by measuring. A boot assert that read getBBox()
   or offsetTop would be reading FALLBACK-FONT metrics, because the scene is
   built before document.fonts has resolved, and would fail on a slow
   connection for a card that is perfectly fine. agents.ts states the rule and
   was burned by exactly this; this file inherits both.

   ROWS is the model that tells a line WHEN the cover's edge reaches it: a
   line on slot r of R is uncovered at (r + 0.85) / (R + 1) of the print. It is
   an approximation of a real vertical position, and the two places it would be
   badly wrong are paid for in slots — the cost chart takes three of card 4's
   seven, and the handoff's wrapping last line takes card 3 to six. */
const REC_LINES: readonly number[] = [7, 9, 10, 6, 2];
/** The bill went from two slots to three when its tick row became the seven
 *  pillars over two lines: one slot for the total line, two for the ticks. */
const REC_ROWS: readonly number[] = [5, 6, 6, 7, 3];

/** THE SEVEN PILLARS, verified in the platform docs rather than written from
 *  memory: notification-system/docs/ASYNCIFY-AGENTS-GUIDE.md:42-88,
 *  "Production-ready, not demo-ready: the seven pillars". In the doc's own
 *  order, shortened only where its heading carries a parenthetical
 *  ("Knowledge with citations" → knowledge, "Cost control" → cost). The strip
 *  is the one place on this page that names all seven, because the four
 *  receipts above it only demonstrate four — and the doc's whole claim is that
 *  an agent needs every one of them before it goes in front of a customer.
 *
 *  Declared here and checked against the markup at boot by COUNTING and by
 *  string equality, so a pillar cannot be renamed on one side only. */
const PILLARS: readonly string[] = [
  "observability",
  "evals",
  "guardrails",
  "knowledge",
  "memory",
  "cost",
  "human handoff",
];
/** Where the authored row break goes, so the seven read 4 + 3 the way the
 *  guide lists them instead of the 5 + 2 the strip's width would produce. */
const PILLAR_BREAK_AFTER = 4;
/** How far the declared row count may run past the highest data-row actually
 *  used. Slack is what buys a tall element its extra slots; unbounded slack
 *  would let a card claim any height at all. */
const ROW_SLACK = 2;

/* ══════════════════════════════════════════════════════════════════════════
   IMPLEMENTATION
   ══════════════════════════════════════════════════════════════════════════ */

function q<T extends Element>(root: ParentNode, sel: string): T {
  const el = root.querySelector<T>(sel);
  if (!el) throw new Error(`[proof] missing element: ${sel}`);
  return el;
}

function all<T extends Element>(root: ParentNode, sel: string): T[] {
  return Array.from(root.querySelectorAll<T>(sel));
}

/** A css custom property read off an element's own style attribute — the
 *  markup's number, not the browser's computed layout. Used only by the boot
 *  asserts, which is why it must never touch getComputedStyle. */
function styleVar(el: HTMLElement, name: string): number {
  const raw = el.style.getPropertyValue(name).trim();
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n)) throw new Error(`[proof] ${name} is not a number on ${el.className}`);
  return n;
}

interface Card {
  root: HTMLElement;
  sheet: HTMLElement;
  paper: HTMLElement;
  cover: HTMLElement;
  head: HTMLElement;
  slot: HTMLElement;
  tick: SVGPathElement | null;
  lines: HTMLElement[];
  rows: number;
  /** The bill behaves like a receipt in every way but three — it prints last,
   *  it settles harder, and it waits a beat longer before it tears — so it is
   *  the same object with different numbers rather than a special case. */
  isTotal: boolean;
  /** The print's own window on the timeline, so the schedule is derived once
   *  and every beat below reads the same two numbers. */
  at: number;
  dur: number;
  rest: number;
  drop: number;
}

export interface ProofScene {
  destroy(): void;
}

/**
 * Scene 5. Owns its own media gating: gsap.matchMedia() decides between the
 * scrub, the finale reveal and the pointer physics independently, because the
 * three answer different questions — is there motion, is there width, is there
 * a real pointer — and any of the three can change after boot.
 */
export function createProofScene(): ProofScene {
  const doc = document;

  const section = q<HTMLElement>(doc, "#scene-proof");
  const table = q<HTMLElement>(doc, "#prf-table");
  const edge = q<SVGPathElement>(doc, "#prf-edge");
  const finale = q<HTMLElement>(section, ".prf-finale");
  const finaleParts = all<HTMLElement>(finale, ".prf-fin");

  const cards: Card[] = all<HTMLElement>(section, ".prf-rcpt").map((root, i) => {
    const isTotal = root.classList.contains("prf-total");
    return {
      root,
      sheet: q<HTMLElement>(root, ".prf-sheet"),
      paper: q<HTMLElement>(root, ".prf-paper"),
      cover: q<HTMLElement>(root, ".prf-cover"),
      head: q<HTMLElement>(root, ".prf-printhead"),
      slot: q<HTMLElement>(root, ".prf-slot"),
      tick: root.querySelector<SVGPathElement>(".prf-tick-mark"),
      lines: all<HTMLElement>(root, ".prf-line"),
      rows: REC_ROWS[i] ?? 0,
      isTotal,
      at: isTotal ? TOTAL_AT : PRINT_AT[i]!,
      dur: isTotal ? TOTAL_DUR : PRINT_DUR,
      rest: isTotal ? TOTAL_REST : REST_ANGLE[i]!,
      drop: isTotal ? TOTAL_DROP : TEAR_DROP,
    };
  });

  const bars = all<HTMLElement>(section, ".prf-bar");
  const chart = q<HTMLElement>(section, ".prf-chart");
  /* THE TRAY, and the thing a dragged receipt is actually bounded by. See the
     lean assert above: bounding the drag by the tabletop itself puts a tilted
     receipt's corner outside the line it is supposed to stay inside, because
     Draggable constrains the untransformed box. The grid is the tabletop inset
     by its own padding, so the padding becomes the margin the tilt leans into
     and the traced edge is never crossed. */
  const tray = q<HTMLElement>(section, ".prf-grid");

  /* The notarized sentence and the thing that certifies it. The WRAP is never
     queried for animation on purpose — it carries the tilt in CSS and nothing
     touches it, which is what keeps the seal glued to the sentence's tail. */
  const testimony = q<HTMLElement>(section, ".prf-testimony");
  const oath = q<HTMLElement>(section, ".prf-oath");
  const seal = q<SVGSVGElement>(section, "#prf-seal");

  /** When a card stops being a print job and becomes an object. Derived from
   *  the schedule rather than typed twice — the tear and the drag permission
   *  are the same event. */
  const tearAt = (c: Card): number => c.at + c.dur + (c.isTotal ? TOTAL_TEAR_LAG : TEAR_LAG);
  const liveAt = (c: Card): number => tearAt(c) + TEAR_DUR;

  /* ════════════════════════════════════════════════════════════════════════
     BOOT ASSERTS
     Inside the init function, never at module top level: a throw evaluated at
     import time once let esbuild tree-shake a whole scene away in silence.
     Every one of these is pure arithmetic or an element count — nothing here
     measures anything the web font could still change.
     ════════════════════════════════════════════════════════════════════════ */

  /* ── the schedule ───────────────────────────────────────────────────────
     The print order IS the reading order, and a stagger that stopped being
     strictly increasing would make the table print in an order nobody reads
     in. Checked as a sequence rather than four times, so an edit to one number
     is caught by its neighbours. */
  for (const [i, at] of PRINT_AT.entries()) {
    const prev = PRINT_AT[i - 1];
    if (prev !== undefined && at <= prev) {
      throw new Error(`[proof] receipt ${i + 1} starts printing before the one before it`);
    }
    if (at <= TABLE_AT + TABLE_DUR) {
      throw new Error(`[proof] receipt ${i + 1} prints before the table it prints onto is drawn`);
    }
  }
  /* The bill is the bill: it may not begin until every item on it has been
     produced. */
  const lastItemEnd = Math.max(...PRINT_AT.map((a) => a + PRINT_DUR));
  if (TOTAL_AT < lastItemEnd) {
    throw new Error("[proof] the total prints before the receipts it totals");
  }
  /* The print head has to be a thing that passes: lit inside the print, gone
     before it ends. */
  if (HEAD_IN + HEAD_OUT_LEAD >= PRINT_DUR || HEAD_OUT_LEAD < HEAD_OUT) {
    throw new Error("[proof] the print head has no window to travel in");
  }
  /* And the whole scene has to fit its own timeline, with a still frame left
     at the end of it. */
  for (const [i, c] of cards.entries()) {
    /* The bill carries no corner tick — it is the thing the ticks add up to —
       so its last event is its settle. Everything else has to have been marked
       done before the held ending starts, because the held ending IS the
       finished table. */
    const done = liveAt(c) + (c.tick ? TICK_LAG + TICK_DUR : 0);
    if (done > HOLD_FROM) {
      throw new Error(`[proof] receipt ${i + 1} is still tearing off inside the held ending`);
    }
  }
  if (TL_END - HOLD_FROM < 4) {
    throw new Error("[proof] the held ending is too short to be an ending");
  }

  /* ── the resting angles ─────────────────────────────────────────────────
     Four values, all different, all under a degree, and — the load-bearing one
     — no combination of a resting angle with the pointer's two cycles may put
     a block of mono past MAX_ANGLE. That is not a taste bound, it is a
     legibility one: the whole point of the drag is that the receipt is still a
     document wherever it lands. */
  if (REST_ANGLE.length !== PRINT_AT.length) {
    throw new Error("[proof] there is not one resting angle per receipt");
  }
  for (const [i, a] of REST_ANGLE.entries()) {
    if (Math.abs(a) > REST_MAX) {
      throw new Error(`[proof] receipt ${i + 1} rests past the tear-settle's own bound`);
    }
    if (REST_ANGLE.indexOf(a) !== i) {
      throw new Error(`[proof] receipt ${i + 1} rests at exactly the angle of another one`);
    }
  }
  if (Math.abs(TOTAL_REST) >= Math.min(...REST_ANGLE.map(Math.abs))) {
    throw new Error("[proof] the total does not settle firmer than the receipts above it");
  }
  {
    const swing = Math.max(
      ...HOVER_CYCLE.map(Math.abs),
      ...DRIFT_CYCLE.map(Math.abs),
    );
    if (REST_MAX + swing > MAX_ANGLE) {
      throw new Error("[proof] a tossed receipt can end up past the angle it stays readable at");
    }
    /* ── AND NOTHING ESCAPES THE TABLE, WHICH IS NOT THE SAME CHECK ────────
       Draggable's bounds constrain an element's UNTRANSFORMED box. A receipt
       that has been tossed is also rotated, and a rotated rectangle's
       axis-aligned box is bigger than the rectangle: a card of width w tilted
       by θ pokes (w/2)·sin θ further up and down than its own edges do. At
       3.9° on a 540px card that is 18px — which is exactly how a first pass
       ended up with a receipt's corner sitting 6px outside the tabletop it was
       supposedly bounded by.

       The fix is that the bounds are the GRID, not the table: the tray the
       receipts are laid out in, inset from the tabletop by the table's own
       padding. That padding is then the margin the tilt eats into, and it has
       to be big enough to absorb the worst case. This is the assert that says
       so, and it is why TABLE_PAD is duplicated from the stylesheet. */
    const lean = (CARD_W_MAX / 2) * Math.sin(((REST_MAX + swing) * Math.PI) / 180);
    if (lean > TABLE_PAD) {
      throw new Error("[proof] a tossed receipt's corner can lean out past the tabletop's edge");
    }
  }

  /* ── the markup, counted ────────────────────────────────────────────────
     Every card's line count and row height are declared above and checked here
     against what is actually in the document. Counting, never measuring: this
     scene is built before the fonts resolve, and an assert that read a text
     box would be asserting about Arial. */
  if (cards.length !== REC_LINES.length) {
    throw new Error("[proof] the table does not hold the receipts this file was written for");
  }
  for (const [i, c] of cards.entries()) {
    if (c.lines.length !== REC_LINES[i]) {
      throw new Error(
        `[proof] receipt ${i + 1} has ${c.lines.length} lines and this file expects ${REC_LINES[i]}`,
      );
    }
    let maxRow = -1;
    for (const line of c.lines) {
      const ink = line.dataset.ink ?? "";
      if (!(ink in INK)) {
        throw new Error(`[proof] a line on receipt ${i + 1} rests at an ink that is not on the ladder: "${ink}"`);
      }
      const row = Number(line.dataset.row);
      if (!Number.isInteger(row) || row < 0 || row >= c.rows) {
        throw new Error(`[proof] a line on receipt ${i + 1} sits on a row-slot the card does not have`);
      }
      if (row > maxRow) maxRow = row;
    }
    if (maxRow < 0) {
      throw new Error(`[proof] receipt ${i + 1} has no printable line`);
    }
    /* Slack is how a tall element (a chart, a wrapping sentence) pays for the
       vertical space it takes. Unbounded slack would let a card claim any
       height it liked and cool its ink long before the cover reached it. */
    if (c.rows - 1 - maxRow > ROW_SLACK) {
      throw new Error(`[proof] receipt ${i + 1} claims more row-slots than its lines account for`);
    }
  }

  /* ── the cost chart, as an argument ─────────────────────────────────────
     The card claims two things — that the first four turns climbed and that
     the last four are flat — and both of them are in the markup as numbers.
     If an edit ever made the picture stop saying what the kicker says, this is
     what catches it. The fold has to sit between the two halves, because a
     fold drawn anywhere else would be marking a moment that did not happen. */
  if (bars.length !== CHART_BARS) {
    throw new Error("[proof] the cost chart is not eight turns wide");
  }
  {
    const h = bars.map((b) => styleVar(b, "--h"));
    for (let i = 1; i < CHART_BARS / 2; i++) {
      if (h[i]! <= h[i - 1]!) {
        throw new Error("[proof] the cost chart's first half does not climb");
      }
    }
    const flat = h.slice(CHART_BARS / 2);
    if (Math.max(...flat) - Math.min(...flat) > FLAT_SPREAD) {
      throw new Error("[proof] the cost chart's second half is not flat enough to be called flat");
    }
    if (Math.max(...flat) >= Math.max(...h.slice(0, CHART_BARS / 2))) {
      throw new Error("[proof] the cost chart's second half is not lower than its first");
    }
    /* The fold's position, read off the DOM order rather than off a class:
       the mark has to be the element immediately after the fourth bar. */
    const kids = Array.from(chart.children);
    const fold = kids.findIndex((el) => el.classList.contains("prf-fold"));
    if (fold !== CHART_BARS / 2) {
      throw new Error("[proof] the rolling fold is not marked between the two halves");
    }
  }

  /* ── the turn's waterfall ───────────────────────────────────────────────
     The spans are the turn's real timings as percentages, so they have to
     behave like timings: in order, and inside the turn they belong to. A
     waterfall whose spans overran its own total would be a picture of a
     measurement that never happened. */
  {
    let prev = -1;
    for (const wf of all<HTMLElement>(section, ".prf-wf")) {
      const o = styleVar(wf, "--o");
      const w = styleVar(wf, "--w");
      if (o < prev) throw new Error("[proof] a turn's spans are out of order");
      if (o + w > 100.01) throw new Error("[proof] a span runs past the end of the turn it is in");
      prev = o;
    }
  }

  /* ── the entrance wire ──────────────────────────────────────────────────
     The drop has to have a straight part and the levelling curve has to have
     somewhere to level out over, or the "one stroke" is a corner. */
  if (WIRE_ELBOW <= 0 || WIRE_ELBOW >= WIRE_H) {
    throw new Error("[proof] the entrance wire has no straight run before it levels out");
  }
  if (WIRE_RUN < TABLE_R * 2) {
    throw new Error("[proof] the entrance wire turns a corner instead of levelling into the table");
  }
  /* And it has to start below the masthead. The wire drops out of empty page
     and runs into the tabletop; a runway longer than the gap the stylesheet
     leaves would have it starting behind the head above it. */
  if (WIRE_H >= MASTHEAD_GAP_MIN) {
    throw new Error("[proof] the entrance wire starts behind the masthead");
  }

  /* ── the slip on the corner ─────────────────────────────────────────────
     The seal's ink, in table-relative pixels. Its radius is the outer ring plus
     half that ring's stroke, scaled from the viewBox to the rendered box; the
     inset is what is left of the square around it. Everything below is
     arithmetic on the offsets in styles.css — nothing here measures anything,
     because this runs before the fonts resolve. */
  {
    const k = SEAL_RENDER / SEAL_BOX;
    const inkR = (SEAL_RINGS[0]! + 0.75) * k; // 0.75 = half the 1.5 outer stroke
    const inkInset = SEAL_RENDER / 2 - inkR;

    const boxLeft = TESTIMONY_LEFT + SEAL_LEFT_OFF;
    const inkLeft = boxLeft + inkInset;
    const inkRight = boxLeft + SEAL_RENDER - inkInset;
    /* Worst case at each end: the shallowest wrap puts the seal highest, the
       deepest wrap puts it lowest. */
    const inkTop = TESTIMONY_TOP + OATH_HALF_MIN + SEAL_TOP_OFF + inkInset;
    const inkBottom = TESTIMONY_TOP + OATH_HALF_MAX + SEAL_TOP_OFF + SEAL_RENDER - inkInset;

    /* IT STRADDLES, and these two lines are what that word means. A seal that
       cleared the left edge would be a seal sitting beside the table; one that
       stopped short of the top edge would be a seal floating above it. It has
       to be over the corner, in both directions, or it is not a stamp pressed
       half onto the tip of the desk. */
    if (inkLeft >= 0) {
      throw new Error("[proof] the seal does not reach past the table's left edge");
    }
    if (inkBottom <= 0) {
      throw new Error("[proof] the seal never comes down onto the tabletop");
    }

    /* And the two things it must not touch. Receipt 1's slot sits exactly on
       the table's top padding, so that padding IS the budget the dip is spent
       out of; the masthead is the only thing above the seal now. */
    if (inkBottom >= TABLE_PAD_TOP) {
      throw new Error("[proof] the seal's dip reaches receipt 1's print slot");
    }
    if (-inkTop >= MASTHEAD_GAP_MIN) {
      throw new Error("[proof] the seal runs up into the masthead");
    }

    /* The entrance wire comes down TABLE_R + WIRE_RUN in from the left corner.
       It used to come down at 112, which is inside this ink — the drop ran
       straight through the stamp. */
    if (TABLE_R + WIRE_RUN < inkRight + WIRE_SEAL_CLEAR) {
      throw new Error("[proof] the entrance wire drops through the seal");
    }

    /* The sentence itself never leaves the page column: only the seal is
       allowed to hang off, and the column's own margin at the narrowest
       desktop width is --page-pad, 32px. */
    if (TESTIMONY_LEFT < 0 || -inkLeft > 32) {
      throw new Error("[proof] the slip hangs further off the table than the page's own margin");
    }

    /* AND THE SENTENCE CLEARS THE SEAL'S BOTTOM ARC. The bottom lettering runs
       from β 214° to 146° on the lettering radius, so its rightmost point is
       84 + SEAL_TEXT_R·sin(146°) in viewBox units. The sentence has to start
       past it — see SEAL_ARC_BOT_CLEAR for why this one is horizontal. */
    const arcBotRight = boxLeft + (SEAL_CX + SEAL_TEXT_R * Math.sin((146 * Math.PI) / 180)) * k;
    if (TESTIMONY_LEFT < arcBotRight + SEAL_ARC_BOT_CLEAR) {
      throw new Error("[proof] the sentence starts on top of the seal's own lettering");
    }
  }

  /* ── the seal ───────────────────────────────────────────────────────────
     The markup is the drawing; this is the arithmetic that says the drawing is
     possible. Everything here is a character count times a mono advance or a
     number parsed out of an attribute — nothing measures a text box, because
     the seal is built before the fonts resolve and an assert that read one
     would be asserting about the fallback face. */

  /* The sentence and its stamp have to arrive in that order: a seal that
     landed on a line the reader had not read yet would be certifying nothing. */
  if (SEAL_AT < OATH_AT + OATH_DUR) {
    throw new Error("[proof] the seal stamps before the sentence it certifies has arrived");
  }
  if (SEAL_AT + SEAL_DUR > TESTIMONY_END) {
    throw new Error("[proof] the seal is still pressing when its own timeline ends");
  }
  if (SEAL_PRESS <= 1) {
    throw new Error("[proof] the seal does not press — it grows into place");
  }
  if (Math.abs(OATH_TILT) + Math.abs(SEAL_TILT) > TILT_MAX) {
    throw new Error("[proof] the notarized sentence is a diagonal rather than a tilted line");
  }

  /* Concentric, ordered, and inside their own box. Three rings that crossed
     would not be a double ring with an inner field, they would be a target. */
  {
    for (const [i, r] of SEAL_RINGS.entries()) {
      const prev = SEAL_RINGS[i - 1];
      if (prev !== undefined && r >= prev) {
        throw new Error(`[proof] the seal's ring ${i + 1} is not inside the one outside it`);
      }
      if (SEAL_CX - r < 0 || SEAL_CX + r > SEAL_BOX || SEAL_CY - r < 0 || SEAL_CY + r > SEAL_BOX) {
        throw new Error(`[proof] the seal's ring ${i + 1} runs outside its own viewBox`);
      }
    }
    /* The lettering has to sit between the second ring and the inner one, or
       it crosses the ink it is supposed to sit between. */
    if (SEAL_TEXT_R >= SEAL_RINGS[1]! || SEAL_TEXT_R <= SEAL_RINGS[2]!) {
      throw new Error("[proof] the seal's lettering does not sit between its rings");
    }
  }

  /* THE INK-SKIP. Each ring's dasharray has to sum to that ring's own
     circumference: the pattern then completes exactly once around and reads as
     a stamp that did not take ink evenly. A pattern that tiled would read as a
     dashed circle, which is a different object entirely — and it is the kind
     of thing an edit to one number does silently. */
  {
    const ringEls = all<SVGCircleElement>(seal, ".prf-seal-ring");
    if (ringEls.length !== SEAL_RINGS.length) {
      throw new Error("[proof] the seal does not have the rings this file was written for");
    }
    for (const [i, el] of ringEls.entries()) {
      const r = Number(el.getAttribute("r"));
      if (r !== SEAL_RINGS[i]) {
        throw new Error(`[proof] the seal's ring ${i + 1} disagrees with SEAL_RINGS`);
      }
      const dash = (el.getAttribute("stroke-dasharray") ?? "")
        .split(/[\s,]+/)
        .filter(Boolean)
        .map(Number);
      if (dash.length < 4 || dash.length % 2 !== 0 || dash.some((n) => !Number.isFinite(n) || n <= 0)) {
        throw new Error(`[proof] the seal's ring ${i + 1} has no usable ink-skip pattern`);
      }
      const sum = dash.reduce((a, b) => a + b, 0);
      const circumference = 2 * Math.PI * r;
      if (Math.abs(sum - circumference) > SEAL_DASH_TOL) {
        throw new Error(
          `[proof] the seal's ring ${i + 1} ink-skip tiles instead of completing once around`,
        );
      }
    }
  }

  /* THE LETTERING FITS ITS ARC. Two arcs, three phrases, three ornaments, and
     the check is the one that would actually fail in practice: somebody
     lengthens a phrase and the ring silently overlaps itself. Character counts
     and a mono advance — never a measured box. */
  {
    const advance = SEAL_ARC_SIZE * MONO_ADVANCE + SEAL_ARC_SIZE * SEAL_ARC_TRACK;
    const arcs: readonly { sel: string; span: number; stars: number }[] = [
      { sel: SEAL_ARC_TOP_IDS, span: SEAL_ARC_TOP_SPAN, stars: 2 },
      { sel: SEAL_ARC_BOT_IDS, span: SEAL_ARC_BOT_SPAN, stars: 1 },
    ];
    let phrases = 0;
    for (const arc of arcs) {
      const runs = all<SVGTextPathElement>(seal, `textPath[href="${arc.sel}"]`);
      if (!runs.length) {
        throw new Error(`[proof] the seal has no lettering on ${arc.sel}`);
      }
      phrases += runs.length;
      const ink = runs.reduce((acc, t) => acc + (t.textContent ?? "").length * advance, 0);
      const ornament = arc.stars * SEAL_STAR_SPAN;
      /* One gap before and after every object on the arc. */
      const gaps = (runs.length + arc.stars + 1) * SEAL_GAP_MIN;
      const length = (arc.span / 360) * 2 * Math.PI * SEAL_TEXT_R;
      if (ink + ornament + gaps > length) {
        throw new Error(`[proof] the seal's lettering on ${arc.sel} is longer than the arc it is set on`);
      }
      /* And every run has to start inside the arc it is set on. */
      for (const t of runs) {
        const off = Number.parseFloat(t.getAttribute("startOffset") ?? "");
        if (!Number.isFinite(off) || off < 0 || off > 100) {
          throw new Error(`[proof] a run of the seal's lettering starts off its own arc`);
        }
      }
    }
    if (phrases !== 3) {
      throw new Error("[proof] the seal does not carry its three phrases");
    }
  }

  /* The three ornaments have to sit ON the lettering radius. They are placed by
     a translate in the markup and the arc positions they came from are
     arithmetic here; nothing else in the system would notice them drifting off
     the ring into the empty field. */
  {
    const stars = all<SVGPathElement>(seal, ".prf-seal-star");
    if (stars.length !== 3) {
      throw new Error("[proof] the seal does not carry its three ornaments");
    }
    for (const [i, s] of stars.entries()) {
      const m = /translate\(\s*(-?[\d.]+)[\s,]+(-?[\d.]+)\s*\)/.exec(s.getAttribute("transform") ?? "");
      if (!m) {
        throw new Error(`[proof] the seal's ornament ${i + 1} is not placed by a translate`);
      }
      const d = Math.hypot(Number(m[1]) - SEAL_CX, Number(m[2]) - SEAL_CY);
      if (Math.abs(d - SEAL_TEXT_R) > 1) {
        throw new Error(`[proof] the seal's ornament ${i + 1} has drifted off the lettering ring`);
      }
    }
  }

  /* ── the seven pillars ──────────────────────────────────────────────────
     The strip's tick row is a quotation from the customer guide, and a
     quotation that drifts is worse than no quotation. Names checked one by one
     against PILLARS, count checked, and the authored row break checked to be
     where the guide's own 4 + 3 reading needs it. */
  {
    const sum = q<HTMLElement>(section, ".prf-totsum");
    const items = all<HTMLElement>(sum, ".prf-sumitem");
    if (items.length !== PILLARS.length) {
      throw new Error(`[proof] the total lists ${items.length} pillars and the guide has ${PILLARS.length}`);
    }
    for (const [i, el] of items.entries()) {
      /* The tick is an svg inside the item, so the name is the text content
         with whitespace collapsed — the same string the guide's heading gives. */
      const name = (el.textContent ?? "").replace(/\s+/g, " ").trim();
      if (name !== PILLARS[i]) {
        throw new Error(`[proof] pillar ${i + 1} reads "${name}" and the guide says "${PILLARS[i]}"`);
      }
      if (!el.querySelector(".prf-mark-tick")) {
        throw new Error(`[proof] pillar ${i + 1} has no drawn tick`);
      }
    }
    const kids = Array.from(sum.children);
    const brk = kids.findIndex((el) => el.classList.contains("prf-sumbreak"));
    if (brk !== PILLAR_BREAK_AFTER) {
      throw new Error("[proof] the pillars do not break where the guide's list breaks");
    }
  }

  /* ════════════════════════════════════════════════════════════════════════
     THE TABLE'S OUTLINE
     One path: the wire down, the level-out, and the tabletop counter-clockwise
     from its own top-left corner. Written from the measured box, because a
     responsive table has no author-time coordinates, and RE-written on resize.
     ════════════════════════════════════════════════════════════════════════ */

  /** The wire comes down WIRE_RUN to the right of the top-left corner and the
   *  levelling curve's second control point sits on the table's own top edge,
   *  so the stroke arrives horizontal — already flowing along the border it is
   *  about to draw. Then counter-clockwise: top-left corner, down the left
   *  wall, along the foot, up the right wall, and back along the top to where
   *  the wire landed. The sweep flag is 0 on all four corners because in
   *  SVG's y-down space that is the counter-clockwise direction. */
  function tablePath(w: number, h: number): string {
    const r = TABLE_R;
    const cx = r + WIRE_RUN;
    return [
      `M ${cx} ${-WIRE_H}`,
      `L ${cx} ${-WIRE_ELBOW}`,
      `C ${cx} ${(-WIRE_ELBOW * WIRE_EASE).toFixed(2)} ${cx} 0 ${r} 0`,
      `A ${r} ${r} 0 0 0 0 ${r}`,
      `L 0 ${(h - r).toFixed(2)}`,
      `A ${r} ${r} 0 0 0 ${r} ${h.toFixed(2)}`,
      `L ${(w - r).toFixed(2)} ${h.toFixed(2)}`,
      `A ${r} ${r} 0 0 0 ${w.toFixed(2)} ${(h - r).toFixed(2)}`,
      `L ${w.toFixed(2)} ${r}`,
      `A ${r} ${r} 0 0 0 ${(w - r).toFixed(2)} 0`,
      `L ${r} 0`,
    ].join(" ");
  }

  /** The stroke's progress, as one number. The timeline tweens THIS and the
   *  outline is rendered from it every frame — so the path may be rewritten
   *  underneath at any moment (a resize) without a cached tween length going
   *  stale. Same discipline as the bridge's traveller in agents.ts. */
  const edgeState = { p: 0 };
  const renderEdge = (): void => {
    gsap.set(edge, { drawSVG: `0% ${edgeState.p.toFixed(3)}%` });
  };

  const measure = (): void => {
    const r = table.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return;
    edge.setAttribute("d", tablePath(r.width, r.height));
    renderEdge();
  };
  measure();

  const ro = new ResizeObserver(() => measure());
  ro.observe(table);

  /* ════════════════════════════════════════════════════════════════════════
     THE INTERACTION LAYER
     Pointer physics on the sheet, gated to real pointers by the matchMedia
     below. It is wired up as a set of closures the scrub can call, rather than
     as something the scrub owns, because the two have different lifetimes:
     a reader can turn reduced motion on and keep their mouse.
     ════════════════════════════════════════════════════════════════════════ */

  /** Set by buildInteraction, and a no-op the rest of the time — the scrub
   *  calls it on every frame and must not care whether anyone is listening. */
  let applyLive: (i: number, on: boolean) => void = () => {};

  function buildInteraction(): () => void {
    const draggables: Draggable[] = [];
    const hovered = cards.map(() => false);
    const live = cards.map(() => false);
    /* Two independent counters per card, so hovering a receipt does not
       advance the angle its next toss will settle at, and vice versa. Each is
       a position in an authored cycle — the sequence is fixed, which is what
       makes "it lands differently every time" reviewable. */
    const hoverN = cards.map(() => 0);
    const driftN = cards.map(() => 0);
    const cleanups: (() => void)[] = [];

    /** Next value in an authored cycle, and the counter moves on. This is the
     *  whole of the scene's "randomness": a fixed sequence read in order, so a
     *  reviewer can predict every angle the table will ever show and a scrub
     *  can still be a pure function of its own position. */
    const step = (counter: number[], i: number, cycle: readonly number[]): number => {
      const v = cycle[counter[i]! % cycle.length]!;
      counter[i] = counter[i]! + 1;
      return v;
    };

    cards.forEach((c, i) => {
      const d = Draggable.create(c.sheet, {
        type: "x,y",
        /* Nothing escapes the table. edgeResistance under 1 means the paper
           pushes back near the rim rather than stopping dead against it,
           which is the difference between a bounded object and a blocked one. */
        bounds: tray,
        edgeResistance: DRAG_EDGE_RESIST,
        inertia: true,
        cursor: "grab",
        activeCursor: "grabbing",
        allowContextMenu: true,
        onPressInit() {
          /* Whatever you are holding is the top sheet on the table. */
          gsap.set(c.root, { zIndex: 6 });
        },
        onRelease() {
          gsap.set(c.root, { zIndex: 1 });
        },
        onDragEnd() {
          /* The toss's rotation drift runs ALONGSIDE the inertia, not after
             it: paper turns while it slides. Skipped while the pointer is
             still on the card, because the hover is already holding it
             straight and the leave will hand it its next angle. */
          if (hovered[i]) return;
          const a = step(driftN, i, DRIFT_CYCLE);
          gsap.to(c.sheet, { rotation: a, duration: DRIFT_DUR, ease: "power2.out", overwrite: "auto" });
        },
      })[0]!;
      /* Created disabled. Draggable clears its own cursor styling on disable
         and restores it on enable, which is exactly the affordance rule this
         scene wants: a card that is still printing is not an object yet. */
      d.disable();
      draggables.push(d);

      const enter = (): void => {
        if (!live[i]) return;
        hovered[i] = true;
        /* The lift is scale, stroke and ink — never a shadow (BRAND §4). It
           STRAIGHTENS: the sheet's rotation cancels the outer element's
           resting angle exactly, so a receipt you are reading is square to
           the page and one you are not is not. */
        gsap.to(c.sheet, {
          rotation: -c.rest,
          scale: HOVER_SCALE,
          duration: HOVER_IN,
          ease: "power2.out",
          overwrite: "auto",
        });
        gsap.to(c.paper, { borderColor: HAIRLINE_STRONG, duration: 0.2 });
        gsap.to(c.lines, {
          color: (_j: number, el: Element) => INK_UP[(el as HTMLElement).dataset.ink ?? "dim"]!,
          duration: 0.2,
        });
      };

      const leave = (): void => {
        if (!hovered[i]) return;
        hovered[i] = false;
        if (!live[i]) return;
        /* And it does NOT go back where it was. Next value in the cycle, so
           putting a receipt down twice puts it down two different ways. */
        const a = step(hoverN, i, HOVER_CYCLE);
        gsap.to(c.sheet, {
          rotation: a,
          scale: 1,
          duration: HOVER_OUT,
          ease: "power2.out",
          overwrite: "auto",
        });
        gsap.to(c.paper, { borderColor: HAIRLINE, duration: 0.2 });
        gsap.to(c.lines, {
          color: (_j: number, el: Element) => INK[(el as HTMLElement).dataset.ink ?? "dim"]!,
          duration: 0.2,
        });
      };

      c.sheet.addEventListener("pointerenter", enter);
      c.sheet.addEventListener("pointerleave", leave);
      cleanups.push(() => {
        c.sheet.removeEventListener("pointerenter", enter);
        c.sheet.removeEventListener("pointerleave", leave);
      });
    });

    applyLive = (i, on) => {
      if (live[i] === on) return;
      live[i] = on;
      toggleLive(i, on);
    };

    function toggleLive(i: number, on: boolean): void {
      const c = cards[i]!;
      c.sheet.classList.toggle("prf-live", on);
      const d = draggables[i]!;
      if (on) {
        d.enable();
        return;
      }
      /* Un-printing puts the paper back in its slot. Every transform the
         pointer layer ever wrote is cleared here, which is also why the two
         layers can be as free as they are: the scrub owns the outer element
         and this is the inner one's complete inverse. */
      d.disable();
      hovered[i] = false;
      gsap.killTweensOf(c.sheet);
      gsap.set(c.sheet, { x: 0, y: 0, rotation: 0, scale: 1 });
      gsap.set(c.root, { zIndex: 1 });
      gsap.set(c.paper, { borderColor: HAIRLINE });
    }

    return () => {
      applyLive = () => {};
      for (const fn of cleanups) fn();
      for (const d of draggables) d.kill();
      for (const c of cards) {
        gsap.set(c.sheet, { clearProps: "transform,cursor" });
        c.sheet.classList.remove("prf-live");
      }
    };
  }

  /* ════════════════════════════════════════════════════════════════════════
     REST STATE — the inverse of the stylesheet
     ════════════════════════════════════════════════════════════════════════ */

  function restState(): void {
    edgeState.p = 0;
    renderEdge();
    for (const c of cards) {
      gsap.set(c.slot, { opacity: 0 });
      /* yPercent, not y: the stylesheet's finished state is translateY(100%)
         and the cover's travel is exactly its own height, so a percentage is
         the only unit that stays true when a card's height changes with the
         viewport — and the two grid rows here are already different heights.

         y IS ALSO RESET, and that is not belt-and-braces. GSAP parses an
         element's EXISTING transform out of the computed style, where
         translateY(100%) has already been resolved to pixels — so it arrives
         believing the cover has `y: 188.275`, and setting yPercent alone
         leaves that px offset underneath it. The card then prints from a
         cover that was never over it. Both units, once, and the cover's whole
         travel is expressed in the one that scales. */
      gsap.set(c.cover, { y: 0, yPercent: 0 });
      gsap.set(c.head, { opacity: 0 });
      gsap.set(c.root, { y: 0, rotation: 0, transformOrigin: "50% 50%" });
      gsap.set(c.lines, { color: HOT });
      if (c.tick) gsap.set(c.tick, { drawSVG: "0% 0%" });
    }
    gsap.set(bars, { scaleY: BAR_MIN, opacity: 0, transformOrigin: "50% 100%" });
  }

  /* ════════════════════════════════════════════════════════════════════════
     THE SCRUB
     ════════════════════════════════════════════════════════════════════════ */

  function buildScrub(): void {
    restState();

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      onUpdate: () => {
        renderEdge();
        /* A receipt becomes an object at its own tear, and stops being one if
           the reader scrolls back past it. Derived from the timeline's
           position rather than from a callback baked into it, so the whole
           scene stays a pure function of where the page is. */
        const t = tl.time();
        for (const [i, c] of cards.entries()) applyLive(i, t >= liveAt(c));
      },
      scrollTrigger: {
        trigger: table,
        start: START,
        end: END,
        scrub: SCRUB,
        invalidateOnRefresh: true,
      },
    });

    /* ── the helpers every beat is built from ───────────────────────────
       All fromTo with immediateRender:false, so the timeline can be rendered
       at any progress, in any order, and every element knows both ends of
       every tween it is in. The same set scenes 2–4 are built from. */

    function ft(t: gsap.TweenTarget, from: gsap.TweenVars, to: gsap.TweenVars, at: number): void {
      tl.fromTo(t, from, { ...to, immediateRender: false }, at);
    }

    const fadeIn = (t: gsap.TweenTarget, at: number, dur: number): void =>
      ft(t, { opacity: 0 }, { opacity: 1, duration: dur }, at);

    const fadeOut = (t: gsap.TweenTarget, at: number, dur: number): void =>
      ft(t, { opacity: 1 }, { opacity: 0, duration: dur }, at);

    /* ── THE TABLE ───────────────────────────────────────────────────────
       One stroke, at the reader's own pace: ease "none", because this is a
       line being drawn by the scroll and any curve on it would be the page
       pretending to draw faster than the reader is scrolling. Then the four
       slots, listed empty before any paper comes out of them. */
    ft(edgeState, { p: 0 }, { p: 100, duration: TABLE_DUR }, TABLE_AT);
    fadeIn(
      cards.map((c) => c.slot),
      SLOTS_AT,
      SLOTS_DUR,
    );

    /* ── THE PRINTING ────────────────────────────────────────────────────
       Written as one block over all five cards rather than scattered per
       receipt, because the whole of what this table does is one mechanism
       repeated — a reader of this file should be able to see the mechanism
       once and the schedule beside it. */
    for (const c of cards) {
      /* THE COVER. The one tween the entire scene is built on: an opaque
         panel travelling exactly its own height, linear, so the paper comes
         out at the scroll's speed and goes back in at it too. */
      ft(c.cover, { y: 0, yPercent: 0 }, { yPercent: 100, duration: c.dur }, c.at);

      /* THE PRINT HEAD, riding that panel's top edge. It only has to arrive
         and leave; the cover's transform does the travelling. */
      fadeIn(c.head, c.at, HEAD_IN);
      fadeOut(c.head, c.at + c.dur - HEAD_OUT_LEAD, HEAD_OUT);

      /* THE INK COOLS. Each line arrives at --text as the cover's edge clears
         it and settles to its own rung over the next couple of units. The
         slot model is what turns "where is this line on the card" into "when
         is it uncovered", and it is arithmetic on data-row so it does not
         depend on the web font having loaded when the scene booted. */
      for (const line of c.lines) {
        const row = Number(line.dataset.row);
        const rest = INK[line.dataset.ink ?? "dim"]!;
        const at = c.at + (c.dur * (row + REVEAL_BIAS)) / (c.rows + 1);
        ft(line, { color: HOT }, { color: rest, duration: COOL_DUR, ease: "power1.out" }, at);
      }

      /* THE TEAR-OFF. Three pixels down and a fraction of a degree over,
         about the card's own middle — a strip of paper coming off a
         perforation, which is a gesture with millimetres in it. Both values
         explicit at both ends, so scrubbing back lifts it straight again. */
      const tear = tearAt(c);
      ft(
        c.root,
        { y: 0, rotation: 0 },
        {
          y: c.drop,
          rotation: c.rest,
          duration: TEAR_DUR,
          ease: "power2.out",
          transformOrigin: "50% 50%",
        },
        tear,
      );

      /* AND THEN IT IS MARKED. Scene 4's checkmark, drawn rather than typed —
         U+2713 is not in the self-hosted latin subset, the same trap that
         scene's checklist documents — and it rests at zero length, which is
         what the butt cap in styles.css is for. */
      if (c.tick) {
        ft(
          c.tick,
          { drawSVG: "0% 0%" },
          { drawSVG: "0% 100%", duration: TICK_DUR, ease: "power2.out" },
          tear + TEAR_DUR + TICK_LAG,
        );
      }
    }

    /* ── THE COST CURVE ──────────────────────────────────────────────────
       Eight bars rising once the cover has cleared the chart's own band, left
       to right, each one its own explicit fromTo so a reverse scrub takes them
       down in the order they went up. A `stagger` shorthand would be one tween
       with an internal offset, and this scene has to be a pure function of
       timeline position. */
    {
      const c = cards[3]!;
      const start = c.at + c.dur * BAR_START;
      bars.forEach((bar, j) => {
        ft(
          bar,
          { scaleY: BAR_MIN, opacity: 0 },
          {
            scaleY: 1,
            opacity: 1,
            duration: BAR_DUR,
            ease: "power2.out",
            transformOrigin: "50% 100%",
          },
          start + j * BAR_STEP,
        );
      });
    }

    /* ── THE HELD ENDING, AS A LENGTH ────────────────────────────────────
       A gsap timeline is exactly as long as its last tween, and ScrollTrigger
       maps the whole scrub onto that length — so a scene whose last build
       finishes at 93 does not get 100 units of scroll with seven of nothing at
       the end. It gets 93, stretched, and the finished table is handed back to
       the scrollbar the instant it stops assembling. This inert tween on a
       throwaway object is those units, made explicit. */
    const built = tl.duration();
    if (built > TL_END) {
      throw new Error("[proof] the scene's last build runs past its own timeline");
    }
    if (TL_END - built < 4) {
      throw new Error("[proof] there is no still frame left at the end of the scene");
    }
    tl.to({}, { duration: TL_END - built, ease: "none" }, built);
  }

  /* ════════════════════════════════════════════════════════════════════════
     THE NOTARIZED SENTENCE
     Its own scrub on its own trigger, because it happens ABOVE the table and
     has to be over before the printer starts: the reader is shown the claim,
     watches it certified, and only then does the paper come out. Scrubbed
     rather than played, so scrolling back lifts the seal off the page again —
     which is the same contract every other stroke in this scene keeps.
     ════════════════════════════════════════════════════════════════════════ */

  function buildTestimony(): void {
    /* Rest is the inverse of the stylesheet, exactly as everywhere else here.
       The WRAP's tilt is not in this list and never will be: it is the one
       transform in the scene that belongs to the layout rather than to a
       timeline, and it is what keeps the seal on the sentence's tail. */
    gsap.set(oath, { opacity: 0, y: OATH_RISE });
    gsap.set(seal, { opacity: 0, scale: SEAL_PRESS, rotation: SEAL_TILT, transformOrigin: "50% 50%" });

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: testimony,
        start: "top 85%",
        end: "top 34%",
        scrub: SCRUB,
        invalidateOnRefresh: true,
      },
    });

    /* The sentence, in the site's own quiet entrance grammar. */
    tl.fromTo(
      oath,
      { opacity: 0, y: OATH_RISE },
      { opacity: 1, y: 0, duration: OATH_DUR, ease: "power2.out", immediateRender: false },
      OATH_AT,
    );

    /* THE PRESS. Explicit at both ends and rotation stated on both, so the
       seal never borrows an angle from whatever the matrix happened to hold —
       the same lesson the covers taught about yPercent. power3.out is a hand
       coming down hard and stopping: fast at the head, nothing at the tail,
       which is what a stamp does and is why this is not an overshoot ease
       (DESIGN §3 bans those outright). */
    tl.fromTo(
      seal,
      { opacity: 0, scale: SEAL_PRESS, rotation: SEAL_TILT },
      {
        opacity: 1,
        scale: 1,
        rotation: SEAL_TILT,
        duration: SEAL_DUR,
        ease: "power3.out",
        transformOrigin: "50% 50%",
        immediateRender: false,
      },
      SEAL_AT,
    );

    /* The hold, made explicit for the same reason the table's is: a timeline is
       as long as its last tween, and without this the certified sentence would
       be handed back to the scrollbar the instant the seal landed. */
    const built = tl.duration();
    if (TESTIMONY_END - built < 2) {
      throw new Error("[proof] there is no still frame left after the seal lands");
    }
    tl.to({}, { duration: TESTIMONY_END - built, ease: "none" }, built);
  }

  /* ════════════════════════════════════════════════════════════════════════
     THE FINALE
     Not a scrub, and deliberately not: the page has finished arguing. This is
     the site's ordinary entrance grammar — a rise, expo-out, staggered inside
     DESIGN §3's 1.3s ceiling — played once when the block comes up.
     ════════════════════════════════════════════════════════════════════════ */

  function buildFinale(): void {
    gsap.set(finaleParts, { opacity: 0, y: FIN_RISE });
    gsap.to(finaleParts, {
      opacity: 1,
      y: 0,
      duration: FIN_DUR,
      ease: "power3.out",
      stagger: FIN_STAGGER,
      scrollTrigger: { trigger: finale, start: "top 82%", once: true },
    });
  }

  /* ════════════════════════════════════════════════════════════════════════
     MEDIA GATING
     Three questions, three contexts, because they are genuinely independent:
     is there motion, is there width, and is there a real pointer. The
     interaction context is added FIRST so that applyLive exists by the time
     the scrub's first frame calls it.
     ════════════════════════════════════════════════════════════════════════ */

  const mm = gsap.matchMedia();

  /* The pointer physics. Same gate as the hero bell's: a fine pointer, real
     hover, motion allowed — and a desktop width, because the drag's bounds are
     the table and a single-column table has nowhere to drag to. */
  mm.add(
    "(min-width: 768px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    () => buildInteraction(),
  );

  mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => buildScrub());

  /* The testimony is a rise and a press; both work at any width, so it is
     gated on the motion preference alone — same call the bridge in agents.ts
     makes about its own fade. Under reduced motion the stylesheet's finished
     state stands: the sentence is there, tilted, with the seal already
     stamped on it, which is every piece of information the motion carried. */
  mm.add("(prefers-reduced-motion: no-preference)", () => buildTestimony());

  /* The finale is a fade and a 14px rise; it works at any width. Under reduced
     motion it does not run at all and the stylesheet's finished state stands,
     which carries every word of it — DESIGN §3's rule is that the still
     delivers the information, and a button that is simply there delivers more
     of it than a button that arrives. */
  mm.add("(prefers-reduced-motion: no-preference)", () => buildFinale());

  /* Mobile and reduced motion get no context of their own, and that is the
     whole still state: styles.css already paints this scene finished — covers
     slid away, ticks drawn, bars at full height — so "no scrub" IS the still.
     Unlike scenes 2–4 there are no clones here, which is why the id-stripping
     trap those files document cannot arise in this one. */

  function destroy(): void {
    ro.disconnect();
    mm.revert();
  }

  return { destroy };
}
