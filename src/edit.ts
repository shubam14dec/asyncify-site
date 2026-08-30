/* ══════════════════════════════════════════════════════════════════════════
   SCENE 5 — THE EDIT
   ──────────────────────────────────────────────────────────────────────────
   One prompt edit, told as a journey. The quality ladder is not a list of
   features on this page; it is eight stations that ONE object travels
   through, and the reader watches it survive each one.

   SLICE A built the skeleton and stations 1–3; SLICE B fills the five bays
   that were already reserved for it (4–8) and adds the one thing on this page
   a reader may operate — the canary's switch. The stations:

     1  THE DIFF     six lines of Acme's support prompt, in the log voice. A
                     proofreader's caret — the same wedge the `agentic` bridge
                     inserts a word with — walks under one line, and that line
                     is rewritten. The new line LIFTS OFF the panel as a chip,
                     and the chip is what travels for the rest of the scene.
     2  JUDGED EVALS the test bench. Three scenarios print in; two are settled
                     by the trace alone (a tool was called, a tick is drawn).
                     The third cannot be: `tone` is a judgment, so a judge card
                     slides in, a score ROLLS up to 4 / 5, and only THEN is the
                     threshold rule drawn and the tick landed under it. That
                     order is the doctrine — the model supplies a number, the
                     runner compares it to `min` and decides (guide §10).
     3  CI GATE      a turnstile. The chip is now a commit; the required-check
                     row runs; one scenario fails and the bar stays shut, so
                     the chip is pushed back. A torn ticket falls into the
                     frame's margin naming what was caught, and it never
                     leaves. The second run is clean, the bar clears, the chip
                     rolls through.

     4  PRE-SAVE     the customer's own dashboard, in miniature. Save is
                     pressed, a check unfolds, three evals run — and every
                     control in the panel dims EXCEPT `save anyway`. The
                     lighting is the argument: the check warns, it never
                     blocks.
     5  CANARY       thirty conversations past a switch; three peel into a
                     second lane, both arms are judged, and the new version
                     is promoted on the evidence. THE SWITCH IS REAL: once
                     the beat settles it belongs to the reader's hand, and a
                     click moves the split from 10% to 50%.
     6  ROUTING      a fork. The cheap model answers a greeting and reaches
                     for a refund tool; a drawn barrier stops it, the cost
                     ticker stalls, and the turn rises to the big model.
     7  TWO GATES    scene 4's agent box with two doors cut into its hairline.
                     An order question walks in; homework knocks and gets a
                     note under the door; a reply carrying a phone number is
                     redacted block by block on its way out.
     8  LIMITS       five customer lanes. One floods, one valve turns amber,
                     four green receipts land — and the ghost of the other
                     design (a strike across all five) is drawn and taken
                     away.

   The landing receipt and the tear-away door are slice C; the stills are
   slice D, whose eight windows are already authored and asserted here
   (STILL_VIEW). Nothing in this file has to be re-timed when they land: the
   only constant that moves is SLICE_END.

   THE ONE INTERACTIVE OBJECT, and why it is safe. Station 5's switch is a
   REAL control in the middle of a scrubbed scene, which is normally a
   contradiction — a scrub owns every number, and a hand cannot share one.
   The way out is scene 4's ticket, generalised: ownership is per NUMBER, not
   per element, and the two regimes are never allowed to write the same one.
   Three dots peel under the scrub for ever; twelve peel under the hand for
   ever; the counter is two nested columns, outer scrub and inner hand; the
   bands' fill is the scrub's and their scaleY is the hand's. The window in
   which the hand is allowed is derived from the timeline's own time, so it
   is a function of scroll position and not a memory of having scrolled, and
   leaving it puts every number back exactly where the scrub expects it. All
   of that is asserted at boot.

   THE THREE PERSISTENT DEVICES, and why each one is where it is:

     · THE VERSION RAIL is FRAME FURNITURE, not world. It is the flight
       recorder for the whole journey — a hairline across the top of the stage
       that each station stamps as the chip passes it — so it must not travel
       with the camera. All eight stamps now have moments, which is why slice
       B is the first slice that can assert the recorder records IN ORDER, and
       that each stamp lands inside its own station's dwell. Two of the eight
       ticks are VERSION notches and point up out of the rail rather than
       across it: v6 where the story was already standing, v7 where the
       pre-save check let the save commit.
     · THE CLOCK is one line in the caption rail, and it is how the scene says
       that scroll is TIME. It is built as a stack of crossfaded spans rather
       than as one element whose text is rewritten, because a .call() inside a
       scrubbed range is a scene with memory (see THE RULES below).
     · THE CHIP is one group, one journey. Its lettering changes at station 3
       (a prompt line becomes a commit) but its body never does — same rect,
       same size, two texts crossfaded — because the argument of the whole
       scene is that this is the SAME object all the way down.

   THE RULES THIS FILE OBEYS  (scenes 2–4's, unchanged)
   ────────────────────────────────────────────────────
   1. ONE timeline, scrubbed. No .call(), .set() or Math.random() inside the
      scrubbed range, so scrolling backwards is scrolling forwards with the
      sign flipped.
   2. Every tween is a fromTo with immediateRender:false.
   3. CSS paints the FINISHED frame; restState() pushes it back to the start.
   4. transform, opacity, stroke and drawSVG only. Every stroke is
      non-scaling, and every drawSVG value is one of the three a non-scaling
      stroke can actually express (DESIGN §3): "0% 0%", "0% 100%", "50% 50%".

   Constants first, with the arithmetic, same as engine.ts and agents.ts.
   ══════════════════════════════════════════════════════════════════════════ */

import { gsap } from "gsap";

/* ══════════════════════════════════════════════════════════════════════════
   TUNING CONSTANTS  —  change these, not the code below
   ══════════════════════════════════════════════════════════════════════════ */

/* ── The scrub window ──────────────────────────────────────────────────────
   PIN_HEIGHTS is the FINISHED scene's budget (user call: ~3.5 screens for
   eight stations plus the landing). Against TL_END that is

       3.5 / 166 = 0.0211 viewport heights per timeline unit,

   which is scene 2's settled density (2.5 / 124 = 0.0202) rather than scene
   4's looser 0.0375 — this scene has nine acts to get through and scene 2 is
   the closest thing on the page to it in shape.

   SLICE_END is scaffolding and the ONLY number in this block that moves as
   later slices land. The pin reserves PIN_HEIGHTS × SLICE_END / TL_END, so a
   unit of timeline costs exactly the scroll it will cost in the finished
   scene — every beat below is already in its final position — while the
   reader is not asked to scroll two and a half empty screens past the last
   station this slice actually builds. When station 8 lands, SLICE_END becomes
   TL_END and this paragraph goes with it. */
const PIN_HEIGHTS = 3.5;
const TL_END = 166;

/** Scrub catch-up, in seconds. Matched to scenes 2, 3 and 4 on purpose: three
 *  pinned scenes in a row that caught up at different rates would read as the
 *  page changing weight. */
const SCRUB = 0.55;

/* ── The eight stations, in timeline units ─────────────────────────────────
   Widths are the argument, not a grid. The diff is short (one line changes,
   and the reader already knows what a prompt is); judged evals is longer
   because the tone beat has to be watched in the right ORDER or it says the
   wrong thing; the CI gate is the longest in the slice because it happens
   TWICE and the second run only means something if the first one was let to
   fail properly. */
const STATION_AT = [
  2, //   1 · the diff
  18, //  2 · judged evals
  38, //  3 · ci gate
  62, //  4 · the pre-save check      (slice B)
  78, //  5 · the canary              (slice B)
  98, //  6 · routing                 (slice B)
  114, // 7 · the two gates           (slice B)
  132, // 8 · per-customer lanes      (slice B)
] as const;
/** Where the rail prints itself as a receipt (slice C). */
const LANDING_AT = 148;
/** The finished scene's held ending: nothing arrives or leaves after this. */
const HOLD_FROM = 160;

/** This slice's own held ending, and the end of the scroll it reserves.
 *
 *  SLICE B MOVED IT FROM STATION_AT[3] TO LANDING_AT, and that is the only
 *  number in this block that moved: every beat slice A authored sits on the
 *  same unit it always did, and the eight stations now play in full. Slice C
 *  moves it once more, to TL_END, when the landing receipt and the door land.
 *  The invariant asserted below moves with it — a slice always hands over on
 *  the exact unit the next one begins on, so nothing is ever re-timed. */
const SLICE_HOLD_FROM = 142;
const SLICE_END = LANDING_AT;

/** What the pin actually reserves today, in viewport heights, and the number
 *  main.ts's PIN_SHARES_VH has to agree with. Exported rather than copied:
 *  the scroll reservation and the pin are the same measurement written once. */
export const EDIT_PIN_VH = Math.round((PIN_HEIGHTS * SLICE_END) / TL_END * 100);

/* ══════════════════════════════════════════════════════════════════════════
   THE FRAME, THE CAMERA, AND THE WORLD
   ══════════════════════════════════════════════════════════════════════════ */

/** The stage's viewBox. 1080 × 634 — scene 4's frame exactly, because the two
 *  scenes are read back to back and a stage that changed size between them
 *  would read as the page resizing. MUST match #edt-svg. */
const FRAME_W = 1080;
const FRAME_H = 634;
const FRAME_CX = FRAME_W / 2;
const FRAME_CY = 317;

/* ── The bays ──────────────────────────────────────────────────────────────
   Eight stations laid out left to right in a single wide world, one BAY each,
   and the camera pans from bay to bay. This is scene 2's camera construction
   (three numbers tweened, one transform attribute written) applied to a strip
   instead of to a schematic.

   BAY === FRAME_W and the camera's resting zoom is 1, so a bay is EXACTLY a
   frame: at any station the neighbouring bays are off-screen by construction
   rather than by a margin someone has to remember to keep.

   CONTENT_HALF is the real invariant and it is exactly BAY/2 − 40. The
   arithmetic: parked on bay i the frame shows ±540 of its centre, and bay
   i+1's content starts at 1080 − CONTENT_HALF from the same point, so the
   neighbour is off-screen for any CONTENT_HALF ≤ 540 and clears the frame
   edge by 40u at 500. It was 380 for one draft and that was a guess that
   quietly cost the CI gate its bounce: the commit chip is 344u wide, and a
   ±380 band cannot hold a chip that stops at a gate, is pushed BACK off it,
   and then rolls through — the assert below is what said so. */
const BAY = FRAME_W;
const CONTENT_HALF = BAY / 2 - 40;
/** Bay i's centre, in world units. */
const bayCx = (i: number): number => BAY / 2 + i * BAY;

/** The vertical framing, and it never changes: every station hangs off one
 *  horizontal, so a camera that also moved up and down would be inventing a
 *  second axis of attention the scene does not have. */
const CAM_FY = 340;

/** The band a station's content may occupy, in world y. The top is fenced by
 *  the version rail (frame furniture, see RAIL_*) and the bottom by the torn
 *  ticket's margin — both asserted, because both are frame-space objects that
 *  a world-space edit cannot see itself colliding with. */
const CONTENT_Y0 = 250;
const CONTENT_Y1 = 520;

/** The chip's road. Above every station's composition and below the version
 *  rail: the chip is the one thing that crosses the whole scene, so it gets a
 *  latitude nothing else is allowed to use. */
const CHIP_LANE_Y = 200;

/* ── The camera ────────────────────────────────────────────────────────────
   One keyframe per station, plus exactly one push-in: the judge. The score is
   the only thing in this slice that is unreadable at the wide shot — a 30u
   digit rolling inside a 30u aperture is the beat, and at z 1 the reader is
   watching a smudge change. 1.14 is a lean-in and not a cut: at that zoom the
   frame still holds all of bay 1's content (x 1226…2174 against content
   1240…2000), so nothing the reader was reading leaves the screen. */
const CAM: { at: number; dur: number; z: number; fx: number; fy: number }[] = [
  { at: 18.0, dur: 3.0, z: 1.0, fx: bayCx(1), fy: CAM_FY }, // station 2
  { at: 26.6, dur: 2.4, z: 1.14, fx: bayCx(1) + 80, fy: CAM_FY + 8 }, // the judge
  { at: 33.6, dur: 2.2, z: 1.0, fx: bayCx(1), fy: CAM_FY }, // back out
  { at: 38.0, dur: 3.0, z: 1.0, fx: bayCx(2), fy: CAM_FY }, // station 3
  /* Slice B's five pans, and NOT one more push-in between them. The judge's
     lean-in is the scene's only close-up on purpose: a camera that pushed in
     at every station would stop meaning "look closer at this" and start
     meaning "a station started". Station 5 in particular must stay at the
     resting zoom for its whole dwell — the toggle's hit box is placed from a
     fixed frame-space point, and a moving camera would slide the control out
     from under the reader's pointer. */
  { at: 62.0, dur: 3.0, z: 1.0, fx: bayCx(3), fy: CAM_FY }, // station 4
  { at: 78.0, dur: 3.0, z: 1.0, fx: bayCx(4), fy: CAM_FY }, // station 5
  { at: 98.0, dur: 3.0, z: 1.0, fx: bayCx(5), fy: CAM_FY }, // station 6
  { at: 114.0, dur: 3.0, z: 1.0, fx: bayCx(6), fy: CAM_FY }, // station 7
  { at: 132.0, dur: 3.0, z: 1.0, fx: bayCx(7), fy: CAM_FY }, // station 8
];
const CAM_START = { z: 1, fx: bayCx(0), fy: CAM_FY };

/* ══════════════════════════════════════════════════════════════════════════
   THE VERSION RAIL  —  frame furniture
   ══════════════════════════════════════════════════════════════════════════ */

/* A hairline across the top of the stage with one tick per station event. It
   is a flight recorder: the reader can stop anywhere in the scene and read
   what has already happened to this version, in mono, in the measurement
   register.

   ALL EIGHT POSITIONS ARE AUTHORED NOW. The rail is the one object in this
   scene whose layout cannot be worked out one station at a time — eight
   labels sharing 960u either fit or they do not — so slice A places all of
   them and asserts every neighbouring pair clears, and slice B fills in the
   six `at` values it earns. A stamp with `at: null` has no DOM and no tween.

   The origin tick at RAIL_X0 is the version the scene starts on. It is not a
   stamp: nothing happened there, it is where the story was already standing. */
const RAIL_Y = 58;
const RAIL_X0 = 60;
const RAIL_X1 = 1020;
/** Half the tick's height, and the label's baseline under the rail. */
const RAIL_TICK_H = 6;
const RAIL_LBL_Y = 82;
const RAIL_LBL_SIZE = 10.5;
/** The starting version, written under the rail's own origin. */
const RAIL_ORIGIN_LABEL = "v6";
/** Minimum daylight between two neighbouring stamp labels. Below ~12u two
 *  mono strings at this size stop reading as two stamps and start reading as
 *  one long one; 16 is the assert's floor. */
const RAIL_LBL_GAP = 16;

/** The drawn checkmark a PASS stamp carries, in an 11u box. The rail never
 *  gets a ✓ glyph — it is not in the self-hosted latin subset, the same trap
 *  the star, the block and U+2116 hit elsewhere on this page — so a tick here
 *  is always a drawn path. */
const RAIL_MARK = 11;
const RAIL_MARK_GAP = 5;

/* The eight stamps, in the order the chip earns them. `at` is null for the
   ones later slices own; their x and their label are already load-bearing,
   because the assert below measures all eight. */
const STAMPS: readonly { label: string; mark: boolean; at: number | null }[] = [
  { label: "judged 4.6", mark: false, at: 34.6 }, // station 2 — a score, not a verdict
  { label: "ci · green", mark: true, at: 52.4 }, // station 3 — the word, never the colour
  { label: "saved · v7", mark: false, at: 75.4 }, // station 4 — the save commits
  { label: "canary 10%", mark: false, at: 81.0 }, // station 5 — the canary opens
  { label: "promoted", mark: true, at: 93.6 }, // station 5 — and closes on evidence
  { label: "routed", mark: false, at: 112.6 }, // station 6
  { label: "gated", mark: true, at: 129.8 }, // station 7
  { label: "throttled 1", mark: false, at: 139.6 }, // station 8
];
/** Even pitch across the rail, so the recorder reads as a clock rather than
 *  as eight labels that happened to fit. */
const RAIL_PITCH = (RAIL_X1 - RAIL_X0) / STAMPS.length;
const stampX = (i: number): number => RAIL_X0 + (i + 0.5) * RAIL_PITCH;

/* ── the version notches ───────────────────────────────────────────────────
   The rail records eight EVENTS but only two VERSIONS, and the difference is
   worth a mark: an event tick crosses the rail, a version notch points UP out
   of it. Two of them — v6 where the story was already standing, v7 where the
   pre-save check let the save commit — and a reader can then find the two
   boundaries in the recorder without being told what a tick is.

   Above the rail is empty frame (the labels hang below at RAIL_LBL_Y), so the
   notch costs nothing and collides with nothing; both facts are asserted. */
const RAIL_NOTCH_TOP = 44;
/** Which stamp the v7 notch stands on: the one that says the save committed. */
const NOTCH_V7_STAMP = 2;

/* ══════════════════════════════════════════════════════════════════════════
   THE TORN TICKET  —  frame furniture, and it stays
   ══════════════════════════════════════════════════════════════════════════ */

/* What the CI gate CAUGHT, written on a piece of paper in the frame's bottom
   margin. It is frame furniture and not world for one reason: "and it stays
   for the rest of the scene" is not something a world object can promise once
   the camera pans off its bay.

   The bottom edge is torn rather than cut — the tear is generated from a
   fixed depth cycle below, never rolled, so a reader scrolling back up finds
   the same piece of paper (scene 2's RECEIPT_MS rule). */
const TKT_X0 = 26;
const TKT_X1 = 212;
const TKT_Y0 = 512;
/** Where the paper stops being paper. */
const TKT_TEAR = 570;
const TKT_PAD = 12;
const TKT_TOOTH = 7;
const TKT_SIZE = 11;
const TKT_HEAD = "caught · refund-path";
const TKT_SUB = "silently broken 31 days";

/* ══════════════════════════════════════════════════════════════════════════
   STATION 1 — THE DIFF
   ══════════════════════════════════════════════════════════════════════════ */

/* Acme's system prompt, as a panel. One box, one hairline, 16u corner (BRAND
   §4's panel step — this is a document, not a chip), a file label and a rule
   under it, then six numbered lines in the log voice.

   The gutter is what makes it a FILE rather than a paragraph: six numbers in
   the measurement register, one rung down in size and ink, so the reader
   knows what kind of object is being edited before anything moves. */
const PANEL_X = 200;
const PANEL_Y = 254;
const PANEL_W = 640;
const PANEL_H = 244;
const PANEL_PAD = 16;
/** The gutter's right edge (numbers are end-anchored on it) and the text's
 *  left edge. 26u apart: a two-digit gutter would still clear. */
const NUM_X = 236;
const LINE_X = 246;
const LINE_Y0 = 326;
const LINE_PITCH = 30;
const LINE_SIZE = 12;
const NUM_SIZE = 10.5;
const FILE_SIZE = 11;
const FILE_LABEL = "acme · system prompt";
/** Which line the edit lands on. Line 4 of 6 — inside the block rather than
 *  at either end, so the caret has file above it and file below it and the
 *  change reads as an edit rather than as an append. */
const EDIT_LINE = 3;
/** The prompt, before and after. Plain, plausible, present tense: this is the
 *  product's own register (BRAND §6), and a prompt written in marketing voice
 *  would be the one string on the page nobody believed. */
const PROMPT_LINES: readonly string[] = [
  "You are Acme's support agent.",
  "Answer in two sentences or fewer.",
  "Look the order up before you answer.",
  "Confirm the order number before any refund.",
  "Never promise a delivery date.",
  "Hand off to a human when unsure.",
];
/** What line 4 said before the edit. The change is the whole scene: an
 *  unconditional refund becomes a refund that has to be checked, which is
 *  also why the CI gate two stations later catches a refund-path regression. */
const PROMPT_OLD = "Refund anything under $50.";

/** The proofreader's caret, authored at its own origin and placed by
 *  transform. Two hairline strokes meeting in a wedge — the same mark the
 *  `agentic` bridge inserts a word with (.agt-era-caret), drawn here because
 *  this one lives inside an svg. Same idiom, same reading: something is being
 *  inserted at this exact point. */
const CARET_D = "M -5 5 L 0 0 L 5 5";
/** How far under the baseline the caret sits, and the two x it walks between:
 *  the start of the old line and its last glyph. A caret that stopped short
 *  of the end would be pointing at a place the edit did not happen. */
const CARET_DY = 9;

/* ══════════════════════════════════════════════════════════════════════════
   THE CHIP  —  one object, one journey
   ══════════════════════════════════════════════════════════════════════════ */

/* The changed line, lifted off the page. Authored at its own origin (like
   every packet on this site) and moved in world coordinates, so nothing in
   the scene has to do offset arithmetic to know where it is.

   ONE BODY, TWO TEXTS. At station 3 the chip stops being a prompt line and
   becomes a commit, and the honest way to say that is to change the lettering
   and NOT the object: same rect, same size, the two strings crossfaded. A
   card that also resized would read as a second card arriving, which is the
   one thing this scene may not say. The rect is therefore sized for the
   LONGER of the two strings, and that is asserted. */
const CHIP_W = 344;
const CHIP_H = 30;
const CHIP_PAD = 11;
const CHIP_SIZE = 12;
const CHIP_LINE = PROMPT_LINES[EDIT_LINE]!;
const CHIP_COMMIT = "a4f2c1 · prompt v7";

/* ══════════════════════════════════════════════════════════════════════════
   STATION 2 — JUDGED EVALS
   ══════════════════════════════════════════════════════════════════════════ */

/* Three scenarios down the left of the bay, the judge card up the right.

   THE SPLIT IS THE POINT. Two of these are settled by the TRACE — a tool was
   called or it was not, and a tick is the whole verdict. The third cannot be:
   `tone` is not in any trace, so it needs a second instrument, and the judge
   card is that instrument standing visibly apart from the bench. Putting it
   in the same column would say the three scenarios were graded the same way,
   which is the misunderstanding the whole beat exists to prevent. */
const SCN_X = 1250;
const SCN_W = 350;
const SCN_Y0 = 280;
const SCN_H = 54;
const SCN_PITCH = 68;
/** Inside a scenario card: the mark box's origin, and where the two text rows
 *  start. The mark is 12u — the same box the checkmarks and the failure mark
 *  are drawn in everywhere in this scene. */
const MARK = 12;
const SCN_MARK_DX = 14;
const SCN_MARK_DY = 10;
const SCN_TEXT_DX = 36;
const SCN_TITLE_DY = 22;
const SCN_LINE_DY = 42;
const CARD_TITLE_SIZE = 12;
const CARD_LINE_SIZE = 11;

/* The scenarios. `search_knowledge` is the platform's own built-in grounding
   tool (guide §10); `orders_lookup` is the custom tool scene 4's fictional
   customer registered, so the two scenes are talking about one agent. The
   third row's result is a judgment rather than a call, which is why it names
   the dimension instead of a tool. */
const SCENARIOS: readonly { title: string; line: string; judged: boolean }[] = [
  { title: "order-status", line: "orders_lookup · called", judged: false },
  { title: "refund-window", line: "search_knowledge · called", judged: false },
  { title: "angry-customer", line: "tone · judged", judged: true },
];

/** The bench's own name, over the three cards. */
const BENCH_LABEL = "eval run · 3 scenarios";
const BENCH_SIZE = 11;

/* ── the live tally ────────────────────────────────────────────────────────
   The header counts the results IN as they land: 0 of 3 → 3 of 3. A header
   that stated the total and never moved was a LABEL; this is a run, and a run
   has a number that moves (user call after slice A).

   It is the judge's own mechanism — a column of digits behind a static
   aperture, moved by a transform — for the reason that mechanism exists: a
   text rewritten on a frame is a .call() inside a scrubbed range, and this
   scene has no memory by construction. The judge's `4 / 5` deliberately does
   NOT get one of these: it is a grade, not a count, and it stays a rolled
   verdict exactly as slice A built it. */
const TALLY_AP_X = 1440;
const TALLY_AP_Y = 251;
const TALLY_AP_W = 8;
const TALLY_AP_H = 14;
const TALLY_PITCH = TALLY_AP_H;
/** The column's baseline IS the bench label's, so the count sits on the line
 *  the header is written on rather than near it. */
const TALLY_BASE_Y = 262;
const TALLY_DEN_X = 1451;
const TALLY_DEN = `of ${SCENARIOS.length}`;

/* ── the judge card ────────────────────────────────────────────────────────
   The ORDER of this beat is the doctrine and it is the only reason the beat
   is worth 6 units: the score rolls FIRST, the threshold rule is drawn
   SECOND, and the tick lands THIRD. Draw the rule first and the picture says
   the bar was known and the model was asked to clear it, which is a model
   being trusted with a pass/fail. What actually happens is that the model
   supplies a number and the runner compares it to `min` (guide §10 — "the
   model only supplies the number: the runner decides pass/fail"), and that is
   a rule arriving AFTER a score.

   The threshold reads `min 4` rather than "≥ 4" for two reasons and both are
   good: `min` is the real key in the eval format, and U+2265 is not in the
   self-hosted latin subset (the checkmark trap again). */
const JUDGE_X = 1650;
const JUDGE_Y = 300;
const JUDGE_W = 340;
const JUDGE_H = 190;
const JUDGE_TITLE = "judge · tone";
const JUDGE_RUBRIC = "warm, never blames the customer";
const RUBRIC_SIZE = 10.5;
/** The score. It ROLLS: a column of digits behind a static aperture, moved by
 *  a transform. Not a counter whose text is rewritten on every frame — that
 *  would be a .call() inside the scrubbed range, and this scene has no memory
 *  by construction. A physical roll is also the better picture: a number that
 *  was arrived at, on a wheel, rather than a number that was typed. */
const SCORE_BASE_Y = 406;
const SCORE_PITCH = 34;
const SCORE_SIZE = 30;
const SCORE_MAX = 5;
const SCORE_VALUE = 4;
/** The aperture. A static hole in a machine — it never animates (scene 5's
 *  printer law) — sized to exactly one glyph's cell. */
const SCORE_AP_X = 1670;
const SCORE_AP_Y = 380;
const SCORE_AP_W = 30;
const SCORE_AP_H = SCORE_PITCH;
const SCORE_DEN_X = 1706;
const SCORE_DEN_SIZE = 18;
/** The threshold rule and its label, then where the tick lands under it. */
const THRESH_Y = 432;
const THRESH_X0 = 1670;
const THRESH_X1 = 1830;
const THRESH_LBL_X = 1840;
const THRESH_LABEL = "min 4";
const JUDGE_TICK_X = 1670;
const JUDGE_TICK_Y = 444;
const JUDGE_VERDICT = "tone · passed";

/* ══════════════════════════════════════════════════════════════════════════
   STATION 3 — THE CI GATE
   ══════════════════════════════════════════════════════════════════════════ */

/* A turnstile on the chip's own road. The bar rests across the lane; the
   required-check row underneath is what decides whether it clears.

   THE BAR IS A drawSVG AND NOT A ROTATION, which is worth stating because a
   boom barrier swinging up is the more obvious picture. Two things ruled it
   out: it would swing into the lane the chip is standing in, and this site
   already has a gate vocabulary — scene 2's meter and its workflow gate both
   rest collapsed on their own middle and snap out to their jambs. A third
   dialect for the same idea would be a new thing to learn for no new meaning.
   So: the bar draws SHUT, and clears by retracting into its own centre,
   between two jamb ticks that stay. All three states ("0% 0%", "0% 100%",
   "50% 50%") survive the non-scaling-stroke dash law (DESIGN §3).

   NO RED, NO GREEN. A failing check here is the gray ladder plus a drawn
   ×-style mark: green is rationed to three uses on this site and CI is not
   one of them (BRAND §2), and a red that only ever appears once would be a
   fourth accent introduced for a single frame. */
const GATE_X = 2700;
const GATE_HALF = 32;
const JAMB_HALF = 6;
/** The road runs the whole width of the bay's content band, because the chip
 *  uses all of it: it enters from the left, backs UP when the gate holds, and
 *  leaves at the right. A road that stopped short of either would be a chip
 *  travelling over nothing, which is the bug scene 2 wrote three paragraphs
 *  about. Asserted against the chip's own extremes below. */
const LANE_X0 = 2260;
const LANE_X1 = 3100;

/** The required-check row: a rule, the check's name, three marks, a status. */
const CHECK_RULE_Y = 268;
const CHECK_RULE_X0 = 2400;
const CHECK_RULE_X1 = 3000;
const CHECK_LBL_X = 2400;
const CHECK_ROW_Y = 300;
const CHECK_NAME = "agent-evals";
const CHECK_MARK_X0 = 2560;
const CHECK_MARK_PITCH = 32;
const CHECK_MARK_Y = 289;
const CHECK_STATUS_X = 2680;
/** The three things the row says, in order. Crossfaded in place — one row,
 *  three states, never three rows. */
const CHECK_STATUS: readonly string[] = ["running…", "1 failing", "3 passing"];
/** Which mark fails the first run. The third, so the reader has watched two
 *  pass and knows what a pass looks like before being shown a failure. */
const FAIL_MARK = 2;

/** Where the chip stands at each moment of the turnstile, in world x.
 *  `stop` leaves 14u of daylight between the chip's nose and the bar — close
 *  enough to read as arriving at it, never touching it. */
const CHIP_GATE_STOP = GATE_X - CHIP_W / 2 - 14;
const CHIP_GATE_BACK = CHIP_GATE_STOP - 60;
const CHIP_GATE_THROUGH = 2900;

/* ══════════════════════════════════════════════════════════════════════════
   STATION 4 — THE PRE-SAVE CHECK   (bay 3)
   ══════════════════════════════════════════════════════════════════════════ */

/* A miniature of the CUSTOMER's dashboard, at true proportions: a settings
   panel with a system-prompt field and a control row, and the check that
   unfolds out of the Save button.

   THE BEAT IS A LIGHTING CHOICE AND NOT A SENTENCE. While three evals run,
   every control in the panel dims — and `save anyway` does not. That is A4's
   entire posture (the check WARNS, it never blocks) said by four opacities.
   A caption claiming it would be a claim; watching one control stay lit while
   the others go out is the thing itself. */
const DASH_X = 3320;
const DASH_Y = 264;
const DASH_W = 440;
const DASH_H = 232;
const DASH_LABEL = "acme · agent settings";
const FIELD_LABEL = "system prompt";
/** The field. Its centre is where the chip comes to rest, which is the whole
 *  reason it is 392 wide: the chip is 344 and a field that only just held it
 *  would read as a chip jammed into a slot. */
const FIELD_X = 3344;
const FIELD_Y = 332;
const FIELD_W = 392;
const FIELD_H = 56;
const FIELD_CX = FIELD_X + FIELD_W / 2;
const FIELD_CY = FIELD_Y + FIELD_H / 2;
/** The control row. Three buttons, and the three of them plus the field are
 *  exactly the set that dims. */
const BTN_Y = 424;
const BTN_H = 30;
const BTN_SIZE = 11;
const BTN_LABELS = ["history", "discard", "save"] as const;
const BTN_BOXES: readonly (readonly [number, number])[] = [
  [3344, 78],
  [3430, 78],
  [3652, 84],
];
/** How far down the dim goes. 0.28 is dark enough to be unmistakably OFF and
 *  light enough that the reader can still see there are controls there — a
 *  control that vanished would be a control that was removed, which is the
 *  opposite of what a warning does. */
const DIM_TO = 0.28;

const CHK_X = 3800;
const CHK_Y = 288;
const CHK_W = 440;
const CHK_H = 208;
const CHK_TITLE = "pre-save check";
const CHK_RUN = "running 3 evals against the edited prompt…";
const CHK_RESULTS: readonly string[] = [
  "order-status · pass",
  "refund-window · pass",
  "angry-customer · 4.7",
];
const CHK_VERDICT = "nothing regressed";
const CHK_LINE_SIZE = 11;
const ANYWAY_LABEL = "save anyway";
const ANYWAY_X = 4100;
const ANYWAY_W = 116;

/* ══════════════════════════════════════════════════════════════════════════
   STATION 5 — VERSIONING + CANARY   (bay 4)
   ══════════════════════════════════════════════════════════════════════════ */

/* One stream of conversations arrives at a switch and two lanes leave it.

   THE LANES ARE BANDS AND THEIR THICKNESS IS THE SHARE. Eighteen units
   against two is nine to one, which is the 10% split drawn rather than
   written; the toggle makes them ten and ten. Both bands are CENTRED on the
   latitude their dots ride, so changing the share never moves a dot — and
   that is what lets the share belong to the reader's hand while every dot in
   the picture still belongs to the scrub. Two owners, zero shared elements
   (agents.ts's wireTicket, same law). */
const CN_IN_X0 = 4400;
const SW_X = 4620;
const CN_MID_Y = 366;
const LANE_A_Y = 336;
const LANE_B_Y = 396;
const BAND_X0 = 4640;
const BAND_W = 520;
/** The two thicknesses at 10%, and the one they both become at 50%. The sum
 *  is constant on purpose: this is a split, not a growth. */
const BAND_A_H = 18;
const BAND_B_H = 2;
const BAND_EVEN_H = 10;

const CANARY_N = 30;
const CN_X0 = 4664;
const CN_PITCH = 16.4;
const CN_R = 4;
/** Which conversations the switch peels, and it is authored rather than
 *  rolled — a reader scrolling back up must find the same three (scene 2's
 *  RECEIPT_MS rule). THE TWO SETS NEVER OVERLAP, and that is the whole
 *  construction: the three ALWAYS peel and belong to the scrub; the twelve
 *  peel only at 50% and belong to the pointer. No dot has two owners. */
const CN_ALWAYS_B: readonly number[] = [6, 15, 24];
const CN_SWITCH_B: readonly number[] = [1, 3, 8, 10, 12, 17, 19, 21, 22, 26, 28, 29];

/** The switch itself: a 40u control the reader can actually press, and the
 *  percentage is ITS lettering rather than part of the lane's label — the
 *  hand owns the number and the scrub owns the label, and two owners must
 *  never share an element. */
const SW_BOX_X = 4592;
const SW_BOX_Y = 348;
const SW_BOX_W = 40;
const SW_BOX_H = 34;
const SW_LABEL_A = "10%";
const SW_LABEL_B = "50%";
const SW_HINT = "click to switch";

/** The counter, and it is TWO NESTED COLUMNS behind one aperture. The outer
 *  group rolls blank → 3 under the scrub; the inner group flips 3 → 15 under
 *  the pointer. Same digit-column mechanism as the judge's score (a .call()
 *  inside a scrubbed range is a scene with memory), nested so that the two
 *  regimes move two different transforms. */
const CNT_AP_X = 4620;
const CNT_AP_Y = 440;
const CNT_AP_W = 18;
const CNT_AP_H = 20;
const CNT_PITCH = CNT_AP_H;
const CNT_BASE_Y = 456;
const CNT_SIZE = 14;
/** Cell 1 is the untransformed one: the finished frame is the scrub's end
 *  state, exactly as the judge's column is authored. */
const CNT_CELLS: readonly string[] = ["", "3", "15"];
const CNT_REST_CELL = 0;
const CNT_SCRUB_CELL = 1;
const CNT_FLIP_CELL = 2;
const CNT_DEN = "/ 30";
const CNT_CAP = "routed to the canary";

/** Both arms judged. An unjudged control arm is not a control (A5's own
 *  line), which is why there are two marks here and not one, and why the
 *  count under them says `each`. */
const JM_X = 5200.5;
const JM_A_Y = 330.5;
const JM_B_Y = 390.5;
const BAR_X0 = 5220;
const BAR_LEN = 120;
const SCORE_A = 4.4;
const SCORE_B = 4.7;
const BAR_A_LBL = "v6 4.4";
const BAR_B_LBL = "v7 4.7";
const JUDGED_EACH = "20 judged each";
const LANE_A_LBL = "v6 · live";
const LANE_A_LBL2 = "v6 · retired";
const LANE_B_LBL = "v7 · canary";
const LANE_B_LBL2 = "v7 · live";

/* ── the toggle's live window ──────────────────────────────────────────────
   The pointer takes the switch once the beat has settled — the dots have
   landed, the counter has stopped, both arms have been judged — and gives it
   back the instant the camera starts leaving the bay. Inside that window the
   camera is at rest on bay 4 at z 1, which is what makes a fixed frame-space
   hit box correct; outside it the control is `hidden`, so it is not a focus
   stop for a keyboard user reading a scene that has moved on.

   The promote beat plays INSIDE this window on purpose and touches nothing
   the hand owns: it draws a curve and crossfades two labels. A reader who has
   flipped the switch to 50% watches the merge happen at 50%, which is true. */
const TOGGLE_FROM = 90.2;
const TOGGLE_TO = STATION_AT[5];
/** How much bigger the hit box is than the switch it operates, in frame units
 *  per side. At the stage's ~0.83 render scale a 40u control is ~33px, under
 *  DESIGN §5's 40px floor; +8 each way puts it at ~46px. */
const HIT_PAD = 8;
/** The pointer's own durations, in seconds — wall clock, not scroll. */
const FLIP_DUR = 0.4;
const HOVER_DUR = 0.18;

/* ══════════════════════════════════════════════════════════════════════════
   STATION 6 — MODEL ROUTING   (bay 5)
   ══════════════════════════════════════════════════════════════════════════ */

/* A fork, two model chips at two different SIZES, and one barrier.

   THE CHEAP MODEL IS PHYSICALLY SMALLER, because that is the only honest way
   to draw "cheaper" without printing a price on it. The barrier goes across
   ITS lane to the refund tool and not across the tool: the rule is about who
   may act, not about what may be called (A6 — trusted to talk, never to act;
   escalation is law, not judgment).

   THE REACH IS CUT AT THE BARRIER RATHER THAN DRAWN THROUGH IT. A non-scaling
   stroke cannot express a partial drawSVG range (DESIGN §3), so the path
   simply ENDS where the rule stops it, and the picture is exactly as true. */
const RT_IN_X0 = 5480;
const RT_FORK_X = 5620;
const RT_MID_Y = 366;
const BIG_X = 5700;
const BIG_Y = 270;
const BIG_W = 180;
const BIG_H = 60;
const BIG_LABEL = "main model";
const SM_X = 5700;
const SM_Y = 410;
const SM_W = 120;
const SM_H = 40;
const SM_LABEL = "cheap model";
const BARRIER_X = 5990;
/** Where the reach ENDS, which is also where the barrier crosses it. One
 *  number for both, so a rule that moved could not leave the line it stops
 *  hanging in mid-air. */
const BARRIER_Y = 400;
const BARRIER_HALF = 22;
const BARRIER_LABEL = "not allowed to act";
const TOOL_X = 6120;
const TOOL_Y = 350;
const TOOL_W = 170;
const TOOL_H = 46;
const TOOL_NAME = "refund_customer";
const TOOL_DONE = "refund · done";
/** The ticker. Object lettering — mono, lowercase, printed a reading at a
 *  time on a strip — and the fourth reading is a dash. The dash IS the beat:
 *  the escalated turn cost the cheap model nothing, because the cheap model
 *  never ran it. */
const TICK_LABEL = "cost · cheap model";
const TICK_X0 = 5480;
const TICK_PITCH = 66;
const TICK_Y = 502;
const TICK_READS: readonly string[] = ["$0.0009", "· $0.0011", "· $0.0008", "· —"];
const RMSG_T1 = "hi, what can you help with?";
const RMSG_T2 = "refund my order";
const RMSG_W = 210;
/** Where the one message body stands at each moment of the two turns. */
const RMSG_START: readonly [number, number] = [5560, 340];
const RMSG_SMALL: readonly [number, number] = [5760, 386];
const RMSG_BIG: readonly [number, number] = [5790, 356];

/* ══════════════════════════════════════════════════════════════════════════
   STATION 7 — TWO GATES   (bay 6)
   ══════════════════════════════════════════════════════════════════════════ */

/* Scene 4's agent box, re-drawn, with two doors cut into its hairline — one
   each side, because there are exactly two gates and they face opposite ways:
   what may come IN and be discussed, and what may go OUT in a reply.

   THE WALLS ARE A PATH AND THE SURFACE IS A RECT. A rect cannot have a hole
   cut in its outline, and a filled path with gaps closes each subpath across
   the gap. Two objects, one job each.

   THE CLASSIFIER AND THE POLICY ARE TWO BOXES WITH A LINE BETWEEN THEM. The
   classifier names the topic from a closed set and is NEVER told what the
   policy says (A7's own doctrine) — a classifier that knew the answer could
   be argued into it, which is precisely the thing a gate exists to be immune
   to. The line is labelled, because a wall nobody can see is not evidence. */
const GB_X = 6900;
const GB_Y = 292;
const GB_W = 240;
const GB_H = 140;
const GB_CX = GB_X + GB_W / 2;
const GB_LABEL = "your agent";
const GB_ROWS: readonly string[] = ["conversations · history", "workflows · audit trail"];
/** The doors, in world y. 32u is exactly the message chips' 26u body plus 3u
 *  of daylight each side: a door a message could not fit through would be a
 *  wall with a decoration on it. */
const DOOR_Y0 = 346;
const DOOR_Y1 = 378;
const GB_MID_Y = 362;
const GT_IN_X0 = 6560;
const GT_OUT_X1 = 7480;
const CLS_X = 6540;
const POL_X = 6760;
const GATE_CARD_Y = 452;
const GATE_CARD_W = 180;
const GATE_CARD_H = 48;
const NX_X = 6740;
const NX_LABEL = "never crosses";
const CLS_STAMP = "topic: homework";
const POL_STAMP = "deny";
const ASK_TEXT = "where is my order?";
const KNOCK_TEXT = "solve my math homework";
const NOTE_TEXT = "orders only — redirected";
const MSG_W = 190;
const NOTE_W = 170;
/** Where each object stands. The knock STOPS outside the wall — 15u of
 *  daylight, the same distance the commit chip stops off the CI bar with — so
 *  it reads as arriving at a door rather than as being inside one. */
const ASK_START = 6660;
const KNOCK_AT = GB_X - MSG_W / 2 - 15;
const NOTE_FROM = GB_X;
const NOTE_TO = KNOCK_AT;
const NOTE_Y = 396;
/** The drafted reply. Its number is FOUR runs and not one string, because the
 *  redaction lands block by block and a block is a run. */
const REPLY_W = 130;
const REPLY_PREFIX = "+1 ";
const REPLY_BLOCKS: readonly string[] = ["415", "555", "0132"];
/** Local x of each run inside the chip, and the rect that comes down over it.
 *  Authored together so a block and its bar cannot drift apart. */
const REPLY_RUNS: readonly { x: number; w: number }[] = [
  { x: -32, w: 21 },
  { x: -8, w: 21 },
  { x: 16, w: 27 },
];
const REPLY_PREFIX_X = -54;
const REPLY_DRAFT_X = GB_CX;
const REPLY_DOOR_X = GB_X + GB_W - REPLY_W / 2;
const REPLY_OUT_X = 7280;
const GT_RECEIPT = "fallback sent · number removed";

/* ══════════════════════════════════════════════════════════════════════════
   STATION 8 — PER-CUSTOMER LIMITS   (bay 7)
   ══════════════════════════════════════════════════════════════════════════ */

/* Five lanes, one valve.

   THE VALVE IS THE SCENE'S ONLY AMBER AND THE FOUR RECEIPTS ARE ITS ONLY
   GREEN. Amber is backoff and green is a message that arrived (BRAND §2), and
   eight stations of gray ladder is exactly what makes those two frames mean
   something. The valve goes amber by having an amber copy of itself drawn
   OVER the closed gray one, so no hex ever leaves the stylesheet.

   THE GHOST IS THE ARGUMENT. A strike across all five lanes labelled `daily
   budget · muted` is what the other design does — and it fades, because it is
   not what happens here. Drawing the alternative and taking it away says more
   than any caption claiming a difference could. */
const LANE_N = 5;
const LANE_Y0 = 286;
const LANE_PITCH = 44;
const LANE8_X0 = 7720;
const LANE8_X1 = 8380;
const LANE8_LBL_X = 7620;
const LANE8_LBL_SIZE = 10.5;
/** Which lane floods. The middle one, so the reader can see two untouched
 *  lanes above it and two below — a valve on the top lane would read as an
 *  edge case rather than as one customer among five. */
const FLOOD_LANE = 2;
const REPLY_DOT_X = 8360;
const DELIVERED_X = 8396;
const DELIVERED = "delivered";
const DELIVERED_SIZE = 11;
const VALVE_X = 8180;
const VALVE_HALF = 12;
const FLOOD_N = 9;
const FLOOD_R = 3.4;
/** Where the burst stands before the valve shuts, and where it queues after.
 *  A queue is a spacing, so the two pitches are the whole picture. */
const FLOOD_SPREAD_X0 = 7760;
const FLOOD_SPREAD_PITCH = 47.5;
const FLOOD_QUEUE_X0 = 8036;
const FLOOD_QUEUE_PITCH = 17;
const NOTICE_TEXT = "notice sent once";
const NOTICE_W = 150;
const NOTICE_FROM = 7940;
const NOTICE_TO = 7810;
const GHOST_LABEL = "daily budget · muted";

/* ══════════════════════════════════════════════════════════════════════════
   THE STILL'S WINDOWS  —  authored now, cloned by slice D
   ══════════════════════════════════════════════════════════════════════════ */

/* "x y w h" in WORLD units, one or two per caption: the close-ups a phone and
   a reduced-motion reader get instead of the pan. They are authored here, a
   slice before the still is built, for the same reason the rail's eight stamp
   positions were: a window is geometry, and geometry that only exists in the
   slice that renders it is geometry nothing can check.

   470u IS THE LEGIBILITY CEILING and it is scene 2's, measured rather than
   guessed: a card is ~343px wide on a 375px phone, so a window wider than
   that renders 10.5u lettering under 8px. A mechanism wider than the ceiling
   gets TWO windows stacked, never one sliver — which is why five of the eight
   stations have two. All of it is asserted at boot: every window inside its
   own station's bay, inside the content band, and inside the ceiling. */
const STILL_VIEW: readonly { cap: number; boxes: readonly string[] }[] = [
  { cap: 0, boxes: ["196 250 460 252"] },
  { cap: 1, boxes: ["1240 264 380 226", "1640 292 364 208"] },
  { cap: 2, boxes: ["2380 178 460 140", "2390 258 440 60"] },
  { cap: 3, boxes: ["3310 256 460 248", "3790 280 460 224"] },
  { cap: 4, boxes: ["4560 300 420 190", "4980 300 380 190"] },
  { cap: 5, boxes: ["5460 260 460 250", "5960 264 460 250"] },
  { cap: 6, boxes: ["6520 340 440 170", "6880 272 460 240"] },
  { cap: 7, boxes: ["7600 268 460 250", "8000 268 460 250"] },
];
/** The widest a still window may be before its lettering stops being legible
 *  on a phone. Scene 2's number, and its reasoning. */
const STILL_VIEW_MAX_W = 470;

/* ══════════════════════════════════════════════════════════════════════════
   THE MARKS
   ══════════════════════════════════════════════════════════════════════════ */

/** The checkmark, as offsets inside a MARK-sized box. Scene 4's tick,
 *  re-proportioned for a 12u box rather than scaled off the 13u one — a tick
 *  is a gesture and its proportions are not linear in its size. */
const TICK: readonly (readonly [number, number])[] = [
  [3.1, 6.6],
  [5.2, 9.3],
  [9.4, 3.6],
];
/** The failure mark: two strokes, drawn, in the same box. Two paths and not
 *  one, so the mark is struck rather than swept — and so a reverse scrub
 *  un-draws it in the order it arrived. */
const CROSS: readonly string[] = ["M 3.2 3.2 L 8.8 8.8", "M 8.8 3.2 L 3.2 8.8"];

/* ══════════════════════════════════════════════════════════════════════════
   THE CAPTION RAIL
   ══════════════════════════════════════════════════════════════════════════ */

/** Which unit each caption owns the rail from. One per station, so the rail
 *  and the stage change subject on the same frame. */
const CAP_AT: readonly number[] = STATION_AT;
const CAP_FADE = 1.6;

/* ── the clock ─────────────────────────────────────────────────────────────
   Scroll is time. The clock is the only place the scene says so out loud, and
   it says it in the measurement register — a mono timestamp that has moved on
   by the time the chip reaches the next station.

   The first four are minutes apart because they are minutes apart: an edit, a
   suite run, a CI round trip, a customer's own Save. Then the unit CHANGES —
   `day 3`, `day 5`, `day 6`, `day 9` — because a canary that promoted in
   fourteen minutes would be a canary nobody watched. The mechanism is one
   text per beat, crossfaded, so a beat measured in days costs exactly what a
   beat measured in minutes costs.

   `ord` IS THE ASSERT'S HANDLE. "14:07" and "day 3" are both strings and
   neither string comparison nor Date.parse can tell you which came first, so
   monotonicity is carried by an explicit ordinal that a future edit has to
   type deliberately. Station 7 has no reading of its own: the gates happen on
   the same day the routing does, and a clock that "changed" from day 6 to day
   6 would be a crossfade between two identical strings — a beat that costs
   scroll and says nothing. */
const CLOCK: readonly { at: number; label: string; ord: number }[] = [
  { at: 1.0, label: "14:02", ord: 0 }, // the edit
  { at: STATION_AT[1], label: "14:03", ord: 1 }, // judged
  { at: STATION_AT[2], label: "14:06", ord: 2 }, // ci
  { at: STATION_AT[3], label: "14:07", ord: 3 }, // the customer's own Save
  { at: STATION_AT[4], label: "day 3", ord: 4 }, // the canary has been running
  { at: 93.0, label: "day 5", ord: 5 }, // promoted on evidence
  { at: STATION_AT[5], label: "day 6", ord: 6 }, // routing (and station 7's gates)
  { at: STATION_AT[7], label: "day 9", ord: 7 }, // a flood, a week and a bit in
];
const CLOCK_FADE = 1.0;

/* ══════════════════════════════════════════════════════════════════════════
   THE SCENE'S NAME  —  one place, two renderings
   MUST match #edt-title in index.html; the still fallback rebuilds it.
   ══════════════════════════════════════════════════════════════════════════ */
const TITLE_NUM = "05";
const TITLE_NAME = "the edit";
const TITLE_HEAD = "Prompt edits are deploys.";
const TITLE_SUB = "Watch one travel.";

/** Geist Mono's advance at 1em plus the 0.01em tracking every mono run on this
 *  site carries. Every width assert below is this number times a length —
 *  arithmetic, never getBBox(), because the scene is built before
 *  document.fonts resolves and a measurement then is the fallback font's. */
const MONO_ADVANCE = 0.61;
const monoWidth = (s: string, size: number): number => s.length * size * MONO_ADVANCE;

const SVG_NS = "http://www.w3.org/2000/svg";

/* ══════════════════════════════════════════════════════════════════════════
   IMPLEMENTATION
   ══════════════════════════════════════════════════════════════════════════ */

function q<T extends Element>(root: ParentNode, sel: string): T {
  const el = root.querySelector<T>(sel);
  if (!el) throw new Error(`[edit] missing element: ${sel}`);
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

/** The checkmark's `d` for a box whose origin is (x, y). One place, so a tick
 *  in the rail, a tick in a scenario card and a tick in the check row are the
 *  same tick. */
function tickPath(x: number, y: number): string {
  return TICK.map(
    ([dx, dy], i) => `${i === 0 ? "M" : "L"} ${(x + dx).toFixed(2)} ${(y + dy).toFixed(2)}`,
  ).join(" ");
}

/** The two strokes of the failure mark, translated to a box's origin. */
function crossPaths(x: number, y: number): string[] {
  return CROSS.map((d) =>
    d.replace(/([ML]) ([\d.]+) ([\d.]+)/g, (_m, cmd: string, px: string, py: string) =>
      `${cmd} ${(x + Number(px)).toFixed(2)} ${(y + Number(py)).toFixed(2)}`,
    ),
  );
}

/** The torn ticket's outline: three clean sides and one that came apart. The
 *  tooth depths cycle through a fixed list rather than being rolled, so the
 *  same piece of paper is there on the way back up. */
function ticketPath(): string {
  const depths = [3, -2, 4, -3, 2, -4, 3, -2];
  const parts = [`M ${TKT_X0} ${TKT_Y0}`, `L ${TKT_X1} ${TKT_Y0}`, `L ${TKT_X1} ${TKT_TEAR}`];
  let x = TKT_X1;
  let i = 0;
  while (x > TKT_X0) {
    x = Math.max(TKT_X0, x - TKT_TOOTH);
    const y = x === TKT_X0 ? TKT_TEAR : TKT_TEAR + depths[i % depths.length]!;
    parts.push(`L ${x} ${y}`);
    i++;
  }
  parts.push("Z");
  return parts.join(" ");
}

export interface EditScene {
  destroy(): void;
}

/**
 * Scene 5. Owns its own media gating: gsap.matchMedia() decides between the
 * pinned scrub and the still fallback, exactly as scenes 2–4 do.
 */
export function createEditScene(): EditScene {
  const doc = document;

  const section = q<HTMLElement>(doc, "#scene-edit");
  const pin = q<HTMLElement>(doc, "#edt-pin");
  const still = q<HTMLElement>(doc, "#edt-still");
  const capsWrap = q<HTMLElement>(doc, "#edt-caps");
  const caps = Array.from(capsWrap.querySelectorAll<HTMLElement>(".eng-cap"));
  const clockWrap = q<HTMLElement>(doc, "#edt-clock");
  const progressFill = q<HTMLElement>(doc, "#edt-progress-fill");

  const svg = q<SVGSVGElement>(doc, "#edt-svg");
  const cam = q<SVGGElement>(svg, "#edt-cam");

  /* ════════════════════════════════════════════════════════════════════════
     BOOT ASSERTS — schedule
     Inside the init function, never at module top level: a throw evaluated at
     import time once let esbuild tree-shake a whole scene away in silence.
     ════════════════════════════════════════════════════════════════════════ */

  for (let i = 1; i < STATION_AT.length; i++) {
    if (STATION_AT[i]! <= STATION_AT[i - 1]!) {
      throw new Error(`[edit] station ${i + 1} starts before the one before it`);
    }
  }
  if (
    STATION_AT[STATION_AT.length - 1]! >= LANDING_AT ||
    LANDING_AT >= HOLD_FROM ||
    HOLD_FROM >= TL_END
  ) {
    throw new Error("[edit] the landing and the held ending are out of order");
  }
  /* The slice's own contract. SLICE_END has to land ON the unit the NEXT
     slice begins on, or that slice has to re-time the beats this one authored
     — the single thing this scaffolding exists to prevent. Slice A handed over
     on STATION_AT[3]; slice B hands over on LANDING_AT, where the rail starts
     printing itself; slice C will hand over on TL_END. */
  if (SLICE_END !== LANDING_AT) {
    throw new Error("[edit] SLICE_END is not the unit the landing begins on");
  }
  /* And the held ending has to be long enough to be an ending. Scene 4's
     floor: six units is 0.13 of a viewport height with nothing happening. */
  if (SLICE_END - SLICE_HOLD_FROM < 6) {
    throw new Error("[edit] the held ending is too short to be an ending");
  }
  for (let i = 1; i < CAP_AT.length; i++) {
    if (CAP_AT[i]! <= CAP_AT[i - 1]!) throw new Error("[edit] captions are out of order");
  }
  /* The clock has to run forwards in BOTH of its senses: later on the
     timeline, and later in the story. The second one cannot be read off the
     labels — "14:07" and "day 3" are strings, and neither string order nor
     Date.parse can rank them — so the ordinal carries it, and a future edit
     that inserts a reading has to say where in the story it goes. */
  for (let i = 1; i < CLOCK.length; i++) {
    if (CLOCK[i]!.at <= CLOCK[i - 1]!.at) throw new Error("[edit] the clock runs backwards");
    if (CLOCK[i]!.ord <= CLOCK[i - 1]!.ord) {
      throw new Error(`[edit] clock reading "${CLOCK[i]!.label}" is not later than the one before it`);
    }
  }
  if (CLOCK[CLOCK.length - 1]!.at >= SLICE_END) {
    throw new Error("[edit] a clock reading arrives after the slice has ended");
  }
  /* One caption per station, and the same count as the markup carries: a rail
     that ran out of sentences would leave the last station narrated by the
     one before it. */
  if (CAP_AT.length !== STATION_AT.length || caps.length !== STATION_AT.length) {
    throw new Error("[edit] there is not exactly one caption per station");
  }
  /* The toggle's live window has to be inside station 5's dwell AND has to
     end where the camera starts leaving the bay — a control the reader can
     press while the stage is sliding is a control that moves under the
     pointer. */
  if (TOGGLE_FROM <= STATION_AT[4]! || TOGGLE_TO !== STATION_AT[5]) {
    throw new Error("[edit] the toggle is live outside the canary's own bay");
  }
  if (TOGGLE_TO - TOGGLE_FROM < 6) {
    throw new Error("[edit] the toggle's live window is too short to find");
  }

  /* ════════════════════════════════════════════════════════════════════════
     BOOT ASSERTS — the version rail
     Eight labels sharing 960u either fit or they do not, and the failure mode
     is two mono strings reading as one. Measured with the arithmetic above,
     for all eight, including the six no tween touches yet — that is the whole
     reason their x and their text are authored a slice early.
     ════════════════════════════════════════════════════════════════════════ */

  /** How wide a stamp's block is, mark included. */
  const stampWidth = (i: number): number => {
    const s = STAMPS[i]!;
    return monoWidth(s.label, RAIL_LBL_SIZE) + (s.mark ? RAIL_MARK + RAIL_MARK_GAP : 0);
  };
  for (let i = 0; i < STAMPS.length; i++) {
    const half = stampWidth(i) / 2;
    if (stampX(i) - half < 0 || stampX(i) + half > FRAME_W) {
      throw new Error(`[edit] rail stamp ${i} (${STAMPS[i]!.label}) runs off the frame`);
    }
    if (i > 0 && stampX(i) - half - (stampX(i - 1) + stampWidth(i - 1) / 2) < RAIL_LBL_GAP) {
      throw new Error(`[edit] rail stamps ${i - 1} and ${i} collide`);
    }
  }
  {
    /* The origin label is not a stamp and is not in the loop above, so it gets
       its own clearance check against the first stamp that is. */
    const originHalf = monoWidth(RAIL_ORIGIN_LABEL, RAIL_LBL_SIZE) / 2;
    if (RAIL_X0 + originHalf + RAIL_LBL_GAP > stampX(0) - stampWidth(0) / 2) {
      throw new Error("[edit] the rail's origin label collides with the first stamp");
    }
  }
  /* Every stamp with a moment has to earn it inside the slice, and the ones
     without a moment must have no moment at all — a stamp half-wired would
     draw itself out of nowhere. */
  for (const [i, s] of STAMPS.entries()) {
    if (s.at !== null && (s.at <= 0 || s.at >= SLICE_HOLD_FROM)) {
      throw new Error(`[edit] rail stamp ${i} (${s.label}) is stamped outside the slice`);
    }
  }
  /* THE RECORDER HAS TO RECORD IN ORDER. The rail's x runs left to right and
     so does its time; a stamp that landed out of sequence would draw a
     flight recorder that lies about what happened when, and nothing else in
     the scene would notice. Slice B is the first slice where all eight have
     moments, so this is the first slice that can check it. */
  {
    let prev = 0;
    for (const [i, s] of STAMPS.entries()) {
      if (s.at === null) continue;
      if (s.at <= prev) {
        throw new Error(`[edit] rail stamp ${i} (${s.label}) is stamped before the one to its left`);
      }
      prev = s.at;
    }
  }
  /* Each stamp lands at the x this file reserved for it and nowhere else, and
     each station's stamp belongs to that station's own dwell. Station 5 owns
     two of them (the canary opens, and it closes on evidence), which is why
     this reads the station index off a written list rather than off the
     stamp's own position. */
  {
    const stampStation = [1, 2, 3, 4, 4, 5, 6, 7];
    for (const [i, s] of STAMPS.entries()) {
      if (s.at === null) continue;
      const st = stampStation[i]!;
      const from = STATION_AT[st]!;
      const to = st + 1 < STATION_AT.length ? STATION_AT[st + 1]! : LANDING_AT;
      if (s.at < from || s.at >= to) {
        throw new Error(`[edit] rail stamp ${i} (${s.label}) is stamped outside station ${st + 1}`);
      }
    }
  }
  /* The version notches. They point UP out of the rail into empty frame — the
     labels hang below it — so the only two things they can collide with are
     the frame's own top edge and each other. */
  if (RAIL_NOTCH_TOP <= 0 || RAIL_NOTCH_TOP >= RAIL_Y - RAIL_TICK_H) {
    throw new Error("[edit] a version notch does not stand clear above the rail");
  }
  if (NOTCH_V7_STAMP < 0 || NOTCH_V7_STAMP >= STAMPS.length || STAMPS[NOTCH_V7_STAMP]!.at === null) {
    throw new Error("[edit] the v7 notch stands on a stamp that never happens");
  }
  if (!STAMPS[NOTCH_V7_STAMP]!.label.includes("v7")) {
    throw new Error("[edit] the v7 notch stands on a stamp that is not about v7");
  }

  /* ════════════════════════════════════════════════════════════════════════
     BOOT ASSERTS — the world's geometry
     ════════════════════════════════════════════════════════════════════════ */

  if (svg.viewBox.baseVal.width !== FRAME_W || svg.viewBox.baseVal.height !== FRAME_H) {
    throw new Error("[edit] #edt-svg's viewBox disagrees with FRAME_W / FRAME_H");
  }
  /* A bay must be exactly a frame, or the neighbouring station is on screen
     during the beat before it. */
  if (BAY !== FRAME_W || CONTENT_HALF > BAY / 2 - 40) {
    throw new Error("[edit] a bay is not a frame, or its content leaves no dark margin");
  }
  /* And the camera's own keyframes have to sit on bay centres. A station
     framed 40u off its bay would put the neighbour's margin on screen and
     nothing else would notice. */
  for (const k of CAM) {
    if (k.z === 1 && (k.fx - BAY / 2) % BAY !== 0) {
      throw new Error(`[edit] a resting camera keyframe at ${k.at} is not on a bay's centre`);
    }
  }
  /* The two frame-space objects the world cannot see itself colliding with.
     World y maps to frame y as (y - CAM_FY + FRAME_CY) at the resting zoom. */
  {
    const toFrame = (y: number): number => y - CAM_FY + FRAME_CY;
    if (toFrame(CHIP_LANE_Y) - CHIP_H / 2 < RAIL_LBL_Y + 10) {
      throw new Error("[edit] the chip's lane runs under the version rail's labels");
    }
    if (toFrame(CONTENT_Y1) > TKT_Y0 - 10) {
      throw new Error("[edit] a station's content reaches into the torn ticket's margin");
    }
    if (toFrame(CONTENT_Y0) < RAIL_LBL_Y + 10) {
      throw new Error("[edit] a station's content reaches into the version rail");
    }
  }
  /* The prompt panel has to hold the prompt. The longest line is the EDITED
     one, which is also the only string in the scene that has to fit twice —
     here and in the chip. */
  {
    const widest = Math.max(
      ...PROMPT_LINES.map((l) => monoWidth(l, LINE_SIZE)),
      monoWidth(PROMPT_OLD, LINE_SIZE),
    );
    if (LINE_X + widest > PANEL_X + PANEL_W - PANEL_PAD) {
      throw new Error("[edit] a prompt line runs out of the panel it is written in");
    }
    if (LINE_Y0 + (PROMPT_LINES.length - 1) * LINE_PITCH > PANEL_Y + PANEL_H - PANEL_PAD) {
      throw new Error("[edit] the prompt has more lines than the panel is tall");
    }
    if (EDIT_LINE <= 0 || EDIT_LINE >= PROMPT_LINES.length - 1) {
      throw new Error("[edit] the edit is on the first or last line — that reads as an append");
    }
  }
  /* One body, two texts: the rect is sized for the longer string or the chip
     silently clips the thing the whole scene is about. */
  {
    const widest = Math.max(monoWidth(CHIP_LINE, CHIP_SIZE), monoWidth(CHIP_COMMIT, CHIP_SIZE));
    if (widest > CHIP_W - 2 * CHIP_PAD) {
      throw new Error("[edit] the chip is too narrow for its own lettering");
    }
  }
  /* The turnstile. The chip has to STOP short of the bar and END past it, and
     both of those are one edited constant away from being the opposite. */
  if (CHIP_GATE_STOP + CHIP_W / 2 >= GATE_X) {
    throw new Error("[edit] the chip is already through the gate when it stops at it");
  }
  if (CHIP_GATE_THROUGH - CHIP_W / 2 <= GATE_X) {
    throw new Error("[edit] the chip never clears the gate it rolled through");
  }
  if (
    CHIP_GATE_THROUGH + CHIP_W / 2 > bayCx(2) + CONTENT_HALF ||
    CHIP_GATE_BACK - CHIP_W / 2 < bayCx(2) - CONTENT_HALF
  ) {
    throw new Error("[edit] the chip leaves the ci gate's own bay");
  }
  /* The judge's aperture is one glyph cell, and the rolled value has to be a
     glyph the column actually carries. A roll that stopped between two digits
     would still animate perfectly. */
  if (SCORE_AP_H !== SCORE_PITCH || SCORE_VALUE < 0 || SCORE_VALUE > SCORE_MAX) {
    throw new Error("[edit] the score's aperture and its column disagree");
  }
  /* And the judge card has to hold everything written inside it. */
  {
    const inner = JUDGE_X + JUDGE_W - PANEL_PAD;
    if (
      JUDGE_X + PANEL_PAD + monoWidth(JUDGE_RUBRIC, RUBRIC_SIZE) > inner ||
      THRESH_LBL_X + monoWidth(THRESH_LABEL, CARD_LINE_SIZE) > inner ||
      JUDGE_TICK_Y + MARK > JUDGE_Y + JUDGE_H
    ) {
      throw new Error("[edit] the judge card cannot hold what is written on it");
    }
  }
  /* A scenario card's result line is the longest string in its column. */
  for (const s of SCENARIOS) {
    if (SCN_TEXT_DX + monoWidth(s.line, CARD_LINE_SIZE) > SCN_W - 10) {
      throw new Error(`[edit] scenario "${s.title}" has a result line wider than its card`);
    }
  }
  if (FAIL_MARK < 0 || FAIL_MARK >= SCENARIOS.length) {
    throw new Error("[edit] the failing check has no scenario behind it");
  }
  /* The torn ticket has to hold its own lettering. */
  for (const line of [TKT_HEAD, TKT_SUB]) {
    if (monoWidth(line, TKT_SIZE) > TKT_X1 - TKT_X0 - 2 * TKT_PAD) {
      throw new Error("[edit] the torn ticket is narrower than what is printed on it");
    }
  }
  /* The masthead is written twice — in the markup and here, for the still —
     and a title that said two different things would be a title nobody could
     quote. */
  {
    const head = q<HTMLElement>(doc, "#edt-title .edt-head");
    if (head.textContent?.trim() !== TITLE_HEAD) {
      throw new Error("[edit] TITLE_HEAD disagrees with #edt-title in the markup");
    }
  }

  /* ════════════════════════════════════════════════════════════════════════
     GENERATED DOM
     Everything that is a repeat: the clock's readings, the version rail's
     stamps, the prompt's numbered lines, the three scenario cards, the score
     column and the check row's marks. Each family's geometry lives in exactly
     one place, so a pitch cannot be typed in twice and disagree with itself.
     ════════════════════════════════════════════════════════════════════════ */

  /* ── the clock ─────────────────────────────────────────────────────────── */
  const clockEls: HTMLElement[] = CLOCK.map((c) => {
    const el = doc.createElement("span");
    el.className = "edt-clock-read";
    el.textContent = c.label;
    clockWrap.appendChild(el);
    return el;
  });

  /* ── the version rail ──────────────────────────────────────────────────── */
  const stampsG = q<SVGGElement>(svg, "#edt-stamps");
  /** Per stamp: its tick, its label, and its mark if it has one. Null for the
   *  slots later slices own — no DOM at all, so nothing can fade in by
   *  accident. */
  const stamps = STAMPS.map((s, i) => {
    if (s.at === null) return null;
    const x = stampX(i);
    const w = stampWidth(i);
    const tick = svgEl("path", {
      class: "edt-rail-tick",
      d: `M ${x} ${RAIL_Y - RAIL_TICK_H} L ${x} ${RAIL_Y + RAIL_TICK_H}`,
    });
    const label = svgEl("text", {
      class: "edt-rail-lbl",
      x: s.mark ? x - w / 2 + RAIL_MARK + RAIL_MARK_GAP : x,
      y: RAIL_LBL_Y,
      "text-anchor": s.mark ? "start" : "middle",
    });
    label.textContent = s.label;
    stampsG.append(tick, label);
    let mark: SVGPathElement | null = null;
    if (s.mark) {
      mark = svgEl("path", {
        class: "edt-tick",
        d: tickPath(x - w / 2, RAIL_LBL_Y - RAIL_MARK + 1),
      });
      stampsG.appendChild(mark);
    }
    return { at: s.at, tick, label, mark };
  });

  /* ── the prompt ────────────────────────────────────────────────────────── */
  const numsG = q<SVGGElement>(svg, "#edt-nums");
  const linesG = q<SVGGElement>(svg, "#edt-lines");
  const lineY = (i: number): number => LINE_Y0 + i * LINE_PITCH;
  const nums: SVGTextElement[] = [];
  const lines: SVGTextElement[] = [];
  PROMPT_LINES.forEach((text, i) => {
    const n = svgEl("text", { class: "edt-num", x: NUM_X, y: lineY(i), "text-anchor": "end" });
    n.textContent = String(i + 1);
    numsG.appendChild(n);
    nums.push(n);
    const l = svgEl("text", { class: "edt-line", x: LINE_X, y: lineY(i) });
    l.textContent = text;
    linesG.appendChild(l);
    lines.push(l);
  });

  /* ── the scenario cards ────────────────────────────────────────────────── */
  const scnG = q<SVGGElement>(svg, "#edt-scenarios");
  const scnY = (i: number): number => SCN_Y0 + i * SCN_PITCH;
  const scnRects: SVGRectElement[] = [];
  const scnTitles: SVGTextElement[] = [];
  const scnLines: SVGTextElement[] = [];
  const scnBoxes: SVGRectElement[] = [];
  const scnTicks: SVGPathElement[] = [];
  SCENARIOS.forEach((s, i) => {
    const y = scnY(i);
    const rect = svgEl("rect", {
      class: "edt-card",
      x: SCN_X,
      y,
      width: SCN_W,
      height: SCN_H,
      rx: 6,
    });
    const box = svgEl("rect", {
      class: "edt-mark",
      x: SCN_X + SCN_MARK_DX + 0.5,
      y: y + SCN_MARK_DY + 0.5,
      width: MARK,
      height: MARK,
      rx: 1,
    });
    const tick = svgEl("path", {
      class: "edt-tick",
      d: tickPath(SCN_X + SCN_MARK_DX + 0.5, y + SCN_MARK_DY + 0.5),
    });
    const title = svgEl("text", {
      class: "edt-card-title",
      x: SCN_X + SCN_TEXT_DX,
      y: y + SCN_TITLE_DY,
    });
    title.textContent = s.title;
    const line = svgEl("text", {
      class: "edt-card-line",
      x: SCN_X + SCN_TEXT_DX,
      y: y + SCN_LINE_DY,
    });
    line.textContent = s.line;
    scnG.append(rect, box, tick, title, line);
    scnRects.push(rect);
    scnBoxes.push(box);
    scnTicks.push(tick);
    scnTitles.push(title);
    scnLines.push(line);
  });

  /* ── the score column ──────────────────────────────────────────────────
     Glyph k is authored at (k − SCORE_VALUE) cells from the aperture, so the
     column's UNTRANSFORMED state is the FINISHED one — the 4 is in the window
     with no transform on the group at all. That inversion is the same one the
     whole file runs on (CSS paints the end, restState winds it back), and it
     is what keeps the still clone correct for free. */
  const scoreCol = q<SVGGElement>(svg, "#edt-score-col");
  for (let k = 0; k <= SCORE_MAX; k++) {
    const t = svgEl("text", {
      class: "edt-score",
      x: SCORE_AP_X + SCORE_AP_W / 2,
      y: SCORE_BASE_Y + (k - SCORE_VALUE) * SCORE_PITCH,
      "text-anchor": "middle",
    });
    t.textContent = String(k);
    scoreCol.appendChild(t);
  }

  /* ── the bench's tally column ──────────────────────────────────────────
     One cell per possible count, 0…3, authored so that the LAST one sits in
     the aperture with no transform: the finished frame is the untransformed
     one, the same inversion the judge's score column and the canary's counter
     both run on. */
  const tallyCol = q<SVGGElement>(svg, "#edt-tally-col");
  for (let k = 0; k <= SCENARIOS.length; k++) {
    const t = svgEl("text", {
      class: "edt-bench",
      x: TALLY_AP_X + TALLY_AP_W / 2,
      y: TALLY_BASE_Y + (k - SCENARIOS.length) * TALLY_PITCH,
      "text-anchor": "middle",
    });
    t.textContent = String(k);
    tallyCol.appendChild(t);
  }

  /* ── the check row's marks ─────────────────────────────────────────────── */
  const marksG = q<SVGGElement>(svg, "#edt-marks");
  const checkBoxes: SVGRectElement[] = [];
  const checkTicks: SVGPathElement[] = [];
  let failCross: SVGPathElement[] = [];
  SCENARIOS.forEach((_s, i) => {
    const x = CHECK_MARK_X0 + i * CHECK_MARK_PITCH;
    const box = svgEl("rect", {
      class: "edt-mark",
      x: x + 0.5,
      y: CHECK_MARK_Y + 0.5,
      width: MARK,
      height: MARK,
      rx: 1,
    });
    const tick = svgEl("path", { class: "edt-tick", d: tickPath(x + 0.5, CHECK_MARK_Y + 0.5) });
    marksG.append(box, tick);
    checkBoxes.push(box);
    checkTicks.push(tick);
    if (i === FAIL_MARK) {
      failCross = crossPaths(x + 0.5, CHECK_MARK_Y + 0.5).map((d) => {
        const p = svgEl("path", { class: "edt-cross", d });
        marksG.appendChild(p);
        return p;
      });
    }
  });

  /* ── station 5's thirty conversations ──────────────────────────────────
     One slot per conversation, on one pitch, in arrival order — so the only
     thing the picture is about is which lane a slot ends in.

     Each dot is TWO nested groups and a circle, and the nesting IS the
     ownership rule. The outer group carries the entry (x and opacity, the
     scrub's); the inner carries the peel (y). A dot in CN_ALWAYS_B has its
     inner y written by the SCRUB and never by the pointer; a dot in
     CN_SWITCH_B has it written by the POINTER and never by the scrub. No dot
     is in both lists (asserted above), so no transform in this station has
     two owners — which is what lets the reader flip the switch in the middle
     of a scrub without the two regimes fighting over a single number. */
  const cnDotsG = q<SVGGElement>(svg, "#edt-canary-dots");
  const cnEntry: SVGGElement[] = [];
  const cnPeelScrub: SVGGElement[] = [];
  const cnPeelPointer: SVGGElement[] = [];
  const CN_PEEL_DY = LANE_B_Y - LANE_A_Y;
  for (let i = 0; i < CANARY_N; i++) {
    const outer = svgEl("g", {});
    const inner = svgEl("g", {});
    /* Authored where the dot FINISHES, like everything else in this file: the
       three the scrub peels are drawn in the v7 lane and pushed back up to v6
       by restState, and the twenty-seven that stay are drawn in v6. The twelve
       the pointer can peel are among those twenty-seven, so their untouched
       state and their authored state are the same thing. */
    const c = svgEl("circle", {
      class: "edt-dot",
      cx: CN_X0 + i * CN_PITCH,
      cy: CN_ALWAYS_B.includes(i) ? LANE_B_Y : LANE_A_Y,
      r: CN_R,
    });
    inner.appendChild(c);
    outer.appendChild(inner);
    cnDotsG.appendChild(outer);
    cnEntry.push(outer);
    if (CN_ALWAYS_B.includes(i)) cnPeelScrub.push(inner);
    else if (CN_SWITCH_B.includes(i)) cnPeelPointer.push(inner);
  }

  /* ── the canary counter's column ───────────────────────────────────────
     Three cells, right-anchored on the aperture's own wall so that 3 and 15
     share a units place — a mechanical counter, not two strings that happen
     to be near each other. Cell CNT_SCRUB_CELL is authored with NO transform,
     because the finished frame is the untransformed one (the same inversion
     the judge's score column runs on). */
  const cntFlip = q<SVGGElement>(svg, "#edt-cnt-flip");
  CNT_CELLS.forEach((text, k) => {
    const t = svgEl("text", {
      class: "edt-cnt",
      x: CNT_AP_X + CNT_AP_W - 1,
      y: CNT_BASE_Y + (k - CNT_SCRUB_CELL) * CNT_PITCH,
      "text-anchor": "end",
    });
    t.textContent = text;
    cntFlip.appendChild(t);
  });

  /* ── station 8's five customers ───────────────────────────────────────── */
  const lanes8G = q<SVGGElement>(svg, "#edt-lanes8");
  const laneY = (i: number): number => LANE_Y0 + i * LANE_PITCH;
  const laneRules: SVGPathElement[] = [];
  const laneLabels: SVGTextElement[] = [];
  const replyDots: SVGCircleElement[] = [];
  const delivereds: SVGTextElement[] = [];
  for (let i = 0; i < LANE_N; i++) {
    const y = laneY(i);
    const rule = svgEl("path", { class: "edt-lane", d: `M ${LANE8_X0} ${y} L ${LANE8_X1} ${y}` });
    const lbl = svgEl("text", { class: "edt-judge-rubric", x: LANE8_LBL_X, y: y + 4 });
    lbl.textContent = `customer ${i + 1}`;
    lanes8G.append(rule, lbl);
    laneRules.push(rule);
    laneLabels.push(lbl);
    /* The four who never notice get a reply and a receipt. The flooding lane
       gets neither: what comes back to it is a notice, and a notice is not a
       delivery. */
    if (i === FLOOD_LANE) continue;
    const dot = svgEl("circle", { class: "edt-dot", cx: REPLY_DOT_X, cy: y, r: CN_R });
    const rcpt = svgEl("text", { class: "edt-delivered", x: DELIVERED_X, y: y + 4 });
    rcpt.textContent = DELIVERED;
    lanes8G.append(dot, rcpt);
    replyDots.push(dot);
    delivereds.push(rcpt);
  }

  /* ── the flood ─────────────────────────────────────────────────────────
     Nine messages from one customer, authored where they QUEUE (the finished
     frame) and pushed back out to where they arrived by restState. */
  const floodG = q<SVGGElement>(svg, "#edt-flood");
  const floodDots: SVGCircleElement[] = [];
  for (let i = 0; i < FLOOD_N; i++) {
    const c = svgEl("circle", {
      class: "edt-dot",
      cx: FLOOD_QUEUE_X0 + i * FLOOD_QUEUE_PITCH,
      cy: laneY(FLOOD_LANE),
      r: FLOOD_R,
    });
    floodG.appendChild(c);
    floodDots.push(c);
  }
  /** Where dot i came in from, relative to where it now stands. Written once,
   *  read by the entry tween and by the queue tween, so the two can never
   *  disagree about which dot is which. */
  const floodSpreadDx = (i: number): number =>
    FLOOD_SPREAD_X0 + i * FLOOD_SPREAD_PITCH - (FLOOD_QUEUE_X0 + i * FLOOD_QUEUE_PITCH);

  /* ── the torn ticket's outline ─────────────────────────────────────────── */
  const tktBody = q<SVGPathElement>(svg, "#edt-tkt-body");
  tktBody.setAttribute("d", ticketPath());

  /* ════════════════════════════════════════════════════════════════════════
     ELEMENT HANDLES
     ════════════════════════════════════════════════════════════════════════ */

  const railLine = q<SVGPathElement>(svg, "#edt-rail-line");
  const railOriginTick = q<SVGPathElement>(svg, "#edt-rail-origin");
  const railOriginLbl = q<SVGTextElement>(svg, "#edt-rail-v0");
  const ticket = q<SVGGElement>(svg, "#edt-ticket");

  const panel = q<SVGRectElement>(svg, "#edt-panel");
  const panelRule = q<SVGPathElement>(svg, "#edt-panel-rule");
  const fileLbl = q<SVGTextElement>(svg, "#edt-file");
  const lineOld = q<SVGTextElement>(svg, "#edt-line-old");
  const caret = q<SVGPathElement>(svg, "#edt-caret");

  const bench = q<SVGTextElement>(svg, "#edt-bench");
  const tallyDen = q<SVGTextElement>(svg, "#edt-tally-den");
  const judge = q<SVGRectElement>(svg, "#edt-judge");
  const judgeTitle = q<SVGTextElement>(svg, "#edt-judge-title");
  const judgeRubric = q<SVGTextElement>(svg, "#edt-judge-rubric");
  const scoreDen = q<SVGTextElement>(svg, "#edt-score-den");
  const thresh = q<SVGPathElement>(svg, "#edt-thresh");
  const threshLbl = q<SVGTextElement>(svg, "#edt-thresh-lbl");
  const judgeTick = q<SVGPathElement>(svg, "#edt-judge-tick");
  const judgeVerdict = q<SVGTextElement>(svg, "#edt-judge-verdict");

  const lane = q<SVGPathElement>(svg, "#edt-lane");
  const gate = q<SVGPathElement>(svg, "#edt-gate");
  const jambs = [q<SVGPathElement>(svg, "#edt-jamb-a"), q<SVGPathElement>(svg, "#edt-jamb-b")];
  const checkRule = q<SVGPathElement>(svg, "#edt-check-rule");
  const checkLbl = q<SVGTextElement>(svg, "#edt-check-lbl");
  const statuses = [
    q<SVGTextElement>(svg, "#edt-status-run"),
    q<SVGTextElement>(svg, "#edt-status-fail"),
    q<SVGTextElement>(svg, "#edt-status-pass"),
  ];

  const chip = q<SVGGElement>(svg, "#edt-chip");
  const chipBody = q<SVGRectElement>(svg, "#edt-chip-body");
  const chipLine = q<SVGTextElement>(svg, "#edt-chip-line");
  const chipCommit = q<SVGTextElement>(svg, "#edt-chip-commit");

  /* ── stations 4 to 8 ───────────────────────────────────────────────────── */

  const notchV6 = q<SVGPathElement>(svg, "#edt-notch-v6");
  const notchV7 = q<SVGPathElement>(svg, "#edt-notch-v7");

  const dash = q<SVGRectElement>(svg, "#edt-dash");
  const dashLbl = q<SVGTextElement>(svg, "#edt-dash-lbl");
  const dashRule = q<SVGPathElement>(svg, "#edt-dash-rule");
  const fieldLbl = q<SVGTextElement>(svg, "#edt-field-lbl");
  const field = q<SVGRectElement>(svg, "#edt-field");
  const btnRects = ["hist", "disc", "save"].map((k) => q<SVGRectElement>(svg, `#edt-btn-${k}`));
  const btnLbls = ["hist", "disc", "save"].map((k) => q<SVGTextElement>(svg, `#edt-btn-${k}-lbl`));
  const saveWire = q<SVGPathElement>(svg, "#edt-save-wire");
  const chkPanel = q<SVGRectElement>(svg, "#edt-chk");
  const chkTitle = q<SVGTextElement>(svg, "#edt-chk-title");
  const chkRun = q<SVGTextElement>(svg, "#edt-chk-run");
  const chkRows = [0, 1, 2].map((i) => q<SVGTextElement>(svg, `#edt-chk-r${i}`));
  const chkVerdict = q<SVGTextElement>(svg, "#edt-chk-verdict");
  const anywayRect = q<SVGRectElement>(svg, "#edt-btn-anyway");
  const anywayLbl = q<SVGTextElement>(svg, "#edt-btn-anyway-lbl");

  const cnIn = q<SVGPathElement>(svg, "#edt-cn-in");
  const cnUp = q<SVGPathElement>(svg, "#edt-cn-up");
  const cnDn = q<SVGPathElement>(svg, "#edt-cn-dn");
  const bandA = q<SVGRectElement>(svg, "#edt-band-a");
  const bandB = q<SVGRectElement>(svg, "#edt-band-b");
  const laneALbl = q<SVGTextElement>(svg, "#edt-lane-a-lbl");
  const laneALbl2 = q<SVGTextElement>(svg, "#edt-lane-a-lbl2");
  const laneBLbl = q<SVGTextElement>(svg, "#edt-lane-b-lbl");
  const laneBLbl2 = q<SVGTextElement>(svg, "#edt-lane-b-lbl2");
  const swBox = q<SVGRectElement>(svg, "#edt-switch");
  const swRead = q<SVGGElement>(svg, "#edt-switch-read");
  const sw10 = q<SVGTextElement>(svg, "#edt-switch-10");
  const sw50 = q<SVGTextElement>(svg, "#edt-switch-50");
  const swHint = q<SVGTextElement>(svg, "#edt-switch-hint");
  const cntRoll = q<SVGGElement>(svg, "#edt-cnt-roll");
  const cntDen = q<SVGTextElement>(svg, "#edt-cnt-den");
  const cntCap = q<SVGTextElement>(svg, "#edt-cnt-cap");
  const jmBoxes = [q<SVGRectElement>(svg, "#edt-jm-a"), q<SVGRectElement>(svg, "#edt-jm-b")];
  const jmTicks = [q<SVGPathElement>(svg, "#edt-jm-a-tick"), q<SVGPathElement>(svg, "#edt-jm-b-tick")];
  const bars = [q<SVGPathElement>(svg, "#edt-bar-a"), q<SVGPathElement>(svg, "#edt-bar-b")];
  const barLbls = [q<SVGTextElement>(svg, "#edt-bar-a-lbl"), q<SVGTextElement>(svg, "#edt-bar-b-lbl")];
  const judgedEach = q<SVGTextElement>(svg, "#edt-judged-each");
  const merge = q<SVGPathElement>(svg, "#edt-merge");

  const rtIn = q<SVGPathElement>(svg, "#edt-rt-in");
  const rtUp = q<SVGPathElement>(svg, "#edt-rt-up");
  const rtDn = q<SVGPathElement>(svg, "#edt-rt-dn");
  const bigChip = q<SVGRectElement>(svg, "#edt-big");
  const bigLbl = q<SVGTextElement>(svg, "#edt-big-lbl");
  const smallChip = q<SVGRectElement>(svg, "#edt-small");
  const smallLbl = q<SVGTextElement>(svg, "#edt-small-lbl");
  const reachSm = q<SVGPathElement>(svg, "#edt-reach-sm");
  const barrier = q<SVGPathElement>(svg, "#edt-barrier");
  const barrierJambs = [
    q<SVGPathElement>(svg, "#edt-barrier-a"),
    q<SVGPathElement>(svg, "#edt-barrier-b"),
  ];
  const barrierLbl = q<SVGTextElement>(svg, "#edt-barrier-lbl");
  const reachBg = q<SVGPathElement>(svg, "#edt-reach-bg");
  const tool = q<SVGRectElement>(svg, "#edt-tool");
  const toolLbl = q<SVGTextElement>(svg, "#edt-tool-lbl");
  const toolDone = q<SVGTextElement>(svg, "#edt-tool-done");
  const tickLbl = q<SVGTextElement>(svg, "#edt-tick-lbl");
  const tickReads = [0, 1, 2, 3].map((i) => q<SVGTextElement>(svg, `#edt-tick-${i}`));
  const rmsg = q<SVGGElement>(svg, "#edt-rmsg");
  const rmsgBody = q<SVGRectElement>(svg, "#edt-rmsg-body");
  const rmsgT1 = q<SVGTextElement>(svg, "#edt-rmsg-t1");
  const rmsgT2 = q<SVGTextElement>(svg, "#edt-rmsg-t2");

  const gbFill = q<SVGRectElement>(svg, "#edt-gb-fill");
  const gbWall = q<SVGPathElement>(svg, "#edt-gb-wall");
  const doorJambs = ["la", "lb", "ra", "rb"].map((k) => q<SVGPathElement>(svg, `#edt-door-${k}`));
  const gbLbl = q<SVGTextElement>(svg, "#edt-gb-lbl");
  const gbRows = [0, 1].map((i) => q<SVGTextElement>(svg, `#edt-gb-r${i}`));
  const gtIn = q<SVGPathElement>(svg, "#edt-gt-in");
  const gtOut = q<SVGPathElement>(svg, "#edt-gt-out");
  const clsCard = q<SVGRectElement>(svg, "#edt-cls");
  const clsTitle = q<SVGTextElement>(svg, "#edt-cls-title");
  const clsStamp = q<SVGTextElement>(svg, "#edt-cls-stamp");
  const polCard = q<SVGRectElement>(svg, "#edt-pol");
  const polTitle = q<SVGTextElement>(svg, "#edt-pol-title");
  const polStamp = q<SVGTextElement>(svg, "#edt-pol-stamp");
  const nx = q<SVGPathElement>(svg, "#edt-nx");
  const nxLbl = q<SVGTextElement>(svg, "#edt-nx-lbl");
  const ask = q<SVGGElement>(svg, "#edt-ask");
  const askBody = q<SVGRectElement>(svg, "#edt-ask-body");
  const askT = q<SVGTextElement>(svg, "#edt-ask-t");
  const knock = q<SVGGElement>(svg, "#edt-knock");
  const knockBody = q<SVGRectElement>(svg, "#edt-knock-body");
  const knockT = q<SVGTextElement>(svg, "#edt-knock-t");
  const note = q<SVGGElement>(svg, "#edt-note");
  const noteBody = q<SVGRectElement>(svg, "#edt-note-body");
  const noteT = q<SVGTextElement>(svg, "#edt-note-t");
  const reply = q<SVGGElement>(svg, "#edt-reply");
  const replyBody = q<SVGRectElement>(svg, "#edt-reply-body");
  const replyPrefix = q<SVGTextElement>(svg, "#edt-reply-p");
  const replyRuns = [0, 1, 2].map((i) => q<SVGTextElement>(svg, `#edt-reply-b${i}`));
  const redacts = [0, 1, 2].map((i) => q<SVGRectElement>(svg, `#edt-redact-${i}`));
  const gtReceipt = q<SVGTextElement>(svg, "#edt-gt-receipt");

  const valve = q<SVGPathElement>(svg, "#edt-valve");
  const valveAmber = q<SVGPathElement>(svg, "#edt-valve-amber");
  const valveJambs = [q<SVGPathElement>(svg, "#edt-valve-a"), q<SVGPathElement>(svg, "#edt-valve-b")];
  const notice = q<SVGGElement>(svg, "#edt-notice");
  const noticeBody = q<SVGRectElement>(svg, "#edt-notice-body");
  const noticeT = q<SVGTextElement>(svg, "#edt-notice-t");
  const ghost = q<SVGPathElement>(svg, "#edt-ghost");
  const ghostLbl = q<SVGTextElement>(svg, "#edt-ghost-lbl");

  const stage = q<HTMLElement>(doc, ".edt-stage");
  const toggle = q<HTMLButtonElement>(doc, "#edt-toggle");
  const toggleName = q<HTMLElement>(doc, "#edt-toggle-name");

  /* ── the markup and the constants have to agree ─────────────────────────
     Two kinds of agreement, and the difference between them is deliberate.

     WRITTEN, not asserted: every geometry that is a straight line between two
     numbers this file already owns — the lane, the bar, its two jambs, the
     check row's rule and its three text anchors, the judge's tick. Those are
     SET from the constants below, because a line that exists in two files is
     a line that will drift, and the drift is invisible in a diff.

     ASSERTED, not written: the boxes and the strings. A rect the stylesheet
     fills and a sentence a reader reads both belong in the markup — that is
     what makes a clone of the markup the finished frame — so here they are
     only checked against the numbers the beats are written against. */

  if (
    Number(panel.getAttribute("x")) !== PANEL_X ||
    Number(panel.getAttribute("y")) !== PANEL_Y ||
    Number(panel.getAttribute("width")) !== PANEL_W ||
    Number(panel.getAttribute("height")) !== PANEL_H
  ) {
    throw new Error("[edit] #edt-panel disagrees with PANEL_X / PANEL_Y / PANEL_W / PANEL_H");
  }
  if (
    Number(judge.getAttribute("x")) !== JUDGE_X ||
    Number(judge.getAttribute("y")) !== JUDGE_Y ||
    Number(judge.getAttribute("width")) !== JUDGE_W ||
    Number(judge.getAttribute("height")) !== JUDGE_H
  ) {
    throw new Error("[edit] #edt-judge disagrees with JUDGE_X / JUDGE_Y / JUDGE_W / JUDGE_H");
  }
  if (
    Number(chipBody.getAttribute("width")) !== CHIP_W ||
    Number(chipBody.getAttribute("height")) !== CHIP_H
  ) {
    throw new Error("[edit] #edt-chip-body disagrees with CHIP_W / CHIP_H");
  }
  /* The aperture is the one rect in the scene that must NEVER be animated and
     must be exactly one glyph cell (scene 5's printer law). If it drifts, the
     roll stops half a digit short and reads as a rendering fault. */
  {
    const ap = q<SVGRectElement>(svg, "#edt-score-clip rect");
    if (
      Number(ap.getAttribute("x")) !== SCORE_AP_X ||
      Number(ap.getAttribute("y")) !== SCORE_AP_Y ||
      Number(ap.getAttribute("width")) !== SCORE_AP_W ||
      Number(ap.getAttribute("height")) !== SCORE_AP_H
    ) {
      throw new Error("[edit] the score's aperture is not one glyph cell of the column behind it");
    }
  }
  /* The caret is the bridge's own mark, redrawn in svg. Its wedge is authored
     in the markup so a still clone carries it; the shape is checked here so a
     future edit cannot quietly turn it into an arrow. */
  if (caret.getAttribute("d") !== CARET_D) {
    throw new Error("[edit] #edt-caret is not the proofreader's wedge CARET_D describes");
  }
  /* Strings. Each of these is quoted somewhere else in this file — in an
     assert, in the still, or in a comment that cites the guide — so the two
     have to be the same words or the scene is saying one thing and this file
     is measuring another. */
  {
    const strings: readonly [Element, string][] = [
      [fileLbl, FILE_LABEL],
      [lineOld, PROMPT_OLD],
      [bench, BENCH_LABEL],
      [judgeTitle, JUDGE_TITLE],
      [judgeRubric, JUDGE_RUBRIC],
      [threshLbl, THRESH_LABEL],
      [judgeVerdict, JUDGE_VERDICT],
      [checkLbl, CHECK_NAME],
      [statuses[0]!, CHECK_STATUS[0]!],
      [statuses[1]!, CHECK_STATUS[1]!],
      [statuses[2]!, CHECK_STATUS[2]!],
      [chipLine, CHIP_LINE],
      [chipCommit, CHIP_COMMIT],
      [railOriginLbl, RAIL_ORIGIN_LABEL],
    ];
    for (const [el, want] of strings) {
      if (el.textContent !== want) {
        throw new Error(`[edit] the markup says "${el.textContent}" where this file says "${want}"`);
      }
    }
  }
  /* Widths, in the arithmetic rather than in getBBox(): the scene is built
     before document.fonts resolves, so a measurement here would be the
     fallback font's and the assert would be a coin toss (agents.ts's rule). */
  if (LINE_X + monoWidth(FILE_LABEL, FILE_SIZE) > PANEL_X + PANEL_W - PANEL_PAD) {
    throw new Error("[edit] the file label runs off the panel");
  }
  if (NUM_X - monoWidth(String(PROMPT_LINES.length), NUM_SIZE) < PANEL_X + PANEL_PAD) {
    throw new Error("[edit] the gutter's numbers run out of the panel");
  }
  if (SCN_X + monoWidth(BENCH_LABEL, BENCH_SIZE) > SCN_X + SCN_W) {
    throw new Error("[edit] the bench's own label is wider than the column it names");
  }
  /* The tally. Its aperture is one glyph cell of the column behind it, it
     clears the header it belongs to, and its denominator counts the same
     scenarios the bench does — a header that said `of 3` over four cards
     would be the one string on the stage a reader could catch out. */
  {
    if (TALLY_AP_H !== TALLY_PITCH) {
      throw new Error("[edit] the tally's aperture is not one cell of its own column");
    }
    if (monoWidth(String(SCENARIOS.length), BENCH_SIZE) > TALLY_AP_W) {
      throw new Error("[edit] the tally's aperture is narrower than the count it shows");
    }
    if (TALLY_AP_X < SCN_X + monoWidth(BENCH_LABEL, BENCH_SIZE) + 16) {
      throw new Error("[edit] the tally collides with the bench header it counts for");
    }
    if (TALLY_DEN_X < TALLY_AP_X + TALLY_AP_W || TALLY_DEN_X + monoWidth(TALLY_DEN, BENCH_SIZE) > SCN_X + SCN_W) {
      throw new Error("[edit] the tally's denominator sits inside its aperture, or off the bench");
    }
    if (TALLY_BASE_Y <= TALLY_AP_Y || TALLY_BASE_Y > TALLY_AP_Y + TALLY_AP_H) {
      throw new Error("[edit] the tally's digits do not sit inside their own aperture");
    }
    if (TALLY_DEN !== `of ${SCENARIOS.length}`) {
      throw new Error("[edit] the tally counts a different suite than the bench runs");
    }
  }
  for (const s of SCENARIOS) {
    if (SCN_TEXT_DX + monoWidth(s.title, CARD_TITLE_SIZE) > SCN_W - 10) {
      throw new Error(`[edit] scenario "${s.title}" has a title wider than its card`);
    }
  }
  /* The score and its denominator are one reading and must not overlap: the
     digit is centred in the aperture, so the denominator's own left edge has
     to clear the aperture's right wall. */
  if (SCORE_DEN_X < SCORE_AP_X + SCORE_AP_W || SCORE_SIZE > SCORE_PITCH) {
    throw new Error("[edit] the score's denominator sits inside its aperture, or the glyph is taller than its cell");
  }
  if (SCORE_DEN_X + monoWidth("/ 5", SCORE_DEN_SIZE) > JUDGE_X + JUDGE_W - PANEL_PAD) {
    throw new Error("[edit] the score's denominator runs off the judge card");
  }
  if (CHECK_STATUS_X < CHECK_MARK_X0 + SCENARIOS.length * CHECK_MARK_PITCH) {
    throw new Error("[edit] the check row's status is printed over its own marks");
  }
  if (CHECK_LBL_X + monoWidth(CHECK_NAME, CARD_TITLE_SIZE) > CHECK_MARK_X0) {
    throw new Error("[edit] the check's name runs into its marks");
  }

  /* ════════════════════════════════════════════════════════════════════════
     BOOT ASSERTS — stations 4 to 8
     Same discipline as stations 1–3: every width is monoWidth arithmetic and
     never getBBox (the scene is built before document.fonts resolves, so a
     measurement here would be the fallback font's), and every station's
     content is checked against its own bay rather than against the frame —
     a bay is a frame, so a station that fits its bay cannot be on screen
     beside its neighbour.
     ════════════════════════════════════════════════════════════════════════ */

  /** Is [x0, x1] inside bay i's content band? */
  const inBay = (i: number, x0: number, x1: number): boolean =>
    x0 >= bayCx(i) - CONTENT_HALF && x1 <= bayCx(i) + CONTENT_HALF;
  /** Is [y0, y1] inside the latitude a station may occupy? */
  const inBand = (y0: number, y1: number): boolean => y0 >= CONTENT_Y0 && y1 <= CONTENT_Y1;

  /* ── station 4 ─────────────────────────────────────────────────────────── */
  {
    if (!inBay(3, DASH_X, CHK_X + CHK_W) || !inBand(DASH_Y, DASH_Y + DASH_H)) {
      throw new Error("[edit] the mini dashboard leaves the pre-save check's bay");
    }
    if (!inBand(CHK_Y, CHK_Y + CHK_H)) {
      throw new Error("[edit] the check panel leaves the content band");
    }
    /* The field has to HOLD the chip with daylight round it. A field the chip
       only just fitted would read as a chip jammed into a slot, and the beat
       is a prompt sitting in an input. */
    if (FIELD_W - CHIP_W < 32 || FIELD_H - CHIP_H < 16) {
      throw new Error("[edit] the prompt field cannot hold the chip that lands in it");
    }
    if (FIELD_X < DASH_X + PANEL_PAD || FIELD_X + FIELD_W > DASH_X + DASH_W - PANEL_PAD) {
      throw new Error("[edit] the prompt field runs out of the panel it is cut into");
    }
    /* Three controls, side by side, each holding its own word, none of them
       overlapping and all of them inside the panel. */
    for (const [i, [bx, bw]] of BTN_BOXES.entries()) {
      if (monoWidth(BTN_LABELS[i]!, BTN_SIZE) > bw - 16) {
        throw new Error(`[edit] the "${BTN_LABELS[i]}" control is narrower than its own word`);
      }
      if (bx < DASH_X + PANEL_PAD || bx + bw > DASH_X + DASH_W - PANEL_PAD) {
        throw new Error(`[edit] the "${BTN_LABELS[i]}" control runs out of the mini dashboard`);
      }
      if (i > 0) {
        const prev = BTN_BOXES[i - 1]!;
        if (bx < prev[0] + prev[1] + 8) {
          throw new Error(`[edit] the "${BTN_LABELS[i]}" control collides with the one before it`);
        }
      }
    }
    if (BTN_Y + BTN_H > DASH_Y + DASH_H - PANEL_PAD || BTN_Y < FIELD_Y + FIELD_H + 8) {
      throw new Error("[edit] the control row does not sit between the field and the panel's floor");
    }
    /* Everything printed on the check panel has to fit on it. */
    const chkInner = CHK_X + CHK_W - PANEL_PAD;
    for (const line of [CHK_TITLE, CHK_RUN, ...CHK_RESULTS]) {
      if (CHK_X + 24 + monoWidth(line, CHK_LINE_SIZE) > chkInner) {
        throw new Error(`[edit] the check panel is narrower than "${line}"`);
      }
    }
    if (CHK_X + 24 + monoWidth(CHK_VERDICT, CARD_TITLE_SIZE) > chkInner) {
      throw new Error("[edit] the check panel is narrower than its own verdict");
    }
    /* The one control that stays lit. It is a control, so it obeys the same
       rules the three dimmed ones do. */
    if (monoWidth(ANYWAY_LABEL, BTN_SIZE) > ANYWAY_W - 16 || ANYWAY_X + ANYWAY_W > chkInner) {
      throw new Error("[edit] `save anyway` does not fit the panel that offers it");
    }
    /* And the dim has to be a dim: dark enough to read as OFF, light enough
       that the reader can still see a control is there. A control that
       vanished would be a control that was REMOVED, which is the opposite of
       what a warning does. */
    if (DIM_TO <= 0.12 || DIM_TO >= 0.55) {
      throw new Error("[edit] the pre-save dim either hides the controls or does not read as off");
    }
    /* There are exactly three evals in the check because there are exactly
       three scenarios on the bench — the same suite, two stations apart. */
    if (CHK_RESULTS.length !== SCENARIOS.length) {
      throw new Error("[edit] the pre-save check runs a different suite than the bench did");
    }
  }

  /* ── station 5 ─────────────────────────────────────────────────────────── */
  {
    const rightMost = BAR_X0 + (BAR_LEN * Math.max(SCORE_A, SCORE_B)) / SCORE_MAX;
    if (!inBay(4, CN_IN_X0, rightMost)) {
      throw new Error("[edit] the canary's flow leaves its own bay");
    }
    if (!inBand(LANE_A_Y - BAND_A_H, CNT_BASE_Y + 24)) {
      throw new Error("[edit] the canary's lanes leave the content band");
    }
    /* A SPLIT, NOT A GROWTH: the two bands' thicknesses always sum to the same
       number, so the picture says 90/10 becomes 50/50 rather than "the canary
       got bigger". */
    if (BAND_A_H + BAND_B_H !== 2 * BAND_EVEN_H) {
      throw new Error("[edit] the two lanes' widths do not add up to one stream");
    }
    /* Thirty dots on one pitch, all of them on the band they ride. */
    if (CN_X0 - CN_R < BAND_X0 || CN_X0 + (CANARY_N - 1) * CN_PITCH + CN_R > BAND_X0 + BAND_W) {
      throw new Error("[edit] a conversation stands off the end of its own lane");
    }
    /* THE TWO SETS NEVER OVERLAP, and that is the whole construction: three
       dots belong to the scrub for ever, twelve belong to the pointer for
       ever, and fifteen never move at all. A dot in both sets would be a dot
       with two owners, which is the exact bug this station is built to make
       impossible. */
    {
      const seen = new Set<number>();
      for (const k of [...CN_ALWAYS_B, ...CN_SWITCH_B]) {
        if (k < 0 || k >= CANARY_N) throw new Error(`[edit] canary dot ${k} does not exist`);
        if (seen.has(k)) throw new Error(`[edit] canary dot ${k} is owned by both the scrub and the pointer`);
        seen.add(k);
      }
      if (CN_ALWAYS_B.length * 10 !== CANARY_N) {
        throw new Error("[edit] the peeled dots are not a tenth of the stream");
      }
      if (seen.size * 2 !== CANARY_N) {
        throw new Error("[edit] the flipped stream is not half of the stream");
      }
    }
    /* The counter's aperture is one two-glyph cell of the column behind it,
       and the column has to carry both readings the two regimes can select. */
    if (CNT_AP_H !== CNT_PITCH || monoWidth(CNT_CELLS[CNT_FLIP_CELL]!, CNT_SIZE) > CNT_AP_W) {
      throw new Error("[edit] the counter's aperture and its column disagree");
    }
    if (
      CNT_CELLS.length !== 3 ||
      CNT_CELLS[CNT_SCRUB_CELL] !== String(CN_ALWAYS_B.length) ||
      CNT_CELLS[CNT_FLIP_CELL] !== String(CN_ALWAYS_B.length + CN_SWITCH_B.length) ||
      CNT_CELLS[CNT_REST_CELL] !== ""
    ) {
      throw new Error("[edit] the counter does not read the number of dots that actually peel");
    }
    /* The switch has to hold both of its readings, and its box has to sit on
       the stream it splits. */
    for (const s of [SW_LABEL_A, SW_LABEL_B]) {
      if (monoWidth(s, 11) > SW_BOX_W - 8) {
        throw new Error(`[edit] the switch is narrower than "${s}"`);
      }
    }
    if (SW_BOX_X + SW_BOX_W > BAND_X0 || Math.abs(SW_BOX_Y + SW_BOX_H / 2 - CN_MID_Y) > 2) {
      throw new Error("[edit] the switch does not sit on the stream it splits");
    }
    /* Both arms judged, and the count under them says so. */
    if (SCORE_A > SCORE_MAX || SCORE_B > SCORE_MAX || SCORE_A <= 0 || SCORE_B <= 0) {
      throw new Error("[edit] an arm scored outside the rubric it was judged against");
    }
    if (JM_X + MARK > BAR_X0) {
      throw new Error("[edit] a judge mark is printed over the score it belongs to");
    }
    if (BAR_X0 + monoWidth(JUDGED_EACH, RUBRIC_SIZE) > bayCx(4) + CONTENT_HALF) {
      throw new Error("[edit] the judged count runs out of the canary's bay");
    }
  }

  /* ── station 6 ─────────────────────────────────────────────────────────── */
  {
    if (!inBay(5, RT_IN_X0, TOOL_X + TOOL_W) || !inBand(BIG_Y, TICK_Y + 4)) {
      throw new Error("[edit] the routing fork leaves its own bay");
    }
    /* The cheap model is PHYSICALLY smaller. It is the only honest way to
       draw "cheaper" without printing a price on it, so it is asserted rather
       than left to a future edit's eye. */
    if (SM_W >= BIG_W || SM_H >= BIG_H) {
      throw new Error("[edit] the cheap model is not drawn smaller than the main one");
    }
    if (monoWidth(SM_LABEL, RUBRIC_SIZE) > SM_W - 16 || monoWidth(BIG_LABEL, CARD_LINE_SIZE) > BIG_W - 16) {
      throw new Error("[edit] a model chip is narrower than its own name");
    }
    /* The barrier stands between the small model and the tool it reached for
       — not on the tool. The rule is about who may act, not about what may be
       called. */
    if (BARRIER_X <= SM_X + SM_W || BARRIER_X >= TOOL_X) {
      throw new Error("[edit] the barrier is not between the cheap model and the tool");
    }
    if (monoWidth(TOOL_NAME, CARD_LINE_SIZE) > TOOL_W - 32) {
      throw new Error("[edit] the tool card is narrower than the tool's name");
    }
    /* One body, two texts, again: the two turns are the same customer on the
       same thread, and a second card arriving would say they were not. */
    if (Math.max(monoWidth(RMSG_T1, CARD_LINE_SIZE), monoWidth(RMSG_T2, CARD_LINE_SIZE)) > RMSG_W - 22) {
      throw new Error("[edit] the routing message is narrower than what is written on it");
    }
    for (const [px] of [RMSG_START, RMSG_SMALL, RMSG_BIG]) {
      if (!inBay(5, px - RMSG_W / 2, px + RMSG_W / 2)) {
        throw new Error("[edit] the routing message leaves its own bay");
      }
    }
    /* The ticker's last reading is the stall, and it has to fit on the strip
       like the three that paid for something. */
    const tickEnd = TICK_X0 + (TICK_READS.length - 1) * TICK_PITCH + monoWidth(TICK_READS[TICK_READS.length - 1]!, CARD_LINE_SIZE);
    if (tickEnd > bayCx(5) + CONTENT_HALF) {
      throw new Error("[edit] the cost ticker runs out of its own bay");
    }
    for (let i = 1; i < TICK_READS.length; i++) {
      if (monoWidth(TICK_READS[i - 1]!, CARD_LINE_SIZE) > TICK_PITCH) {
        throw new Error("[edit] two cost readings are printed over each other");
      }
    }
  }

  /* ── station 7 ─────────────────────────────────────────────────────────── */
  {
    if (!inBay(6, GT_IN_X0, GT_OUT_X1) || !inBand(GB_Y, GATE_CARD_Y + GATE_CARD_H)) {
      throw new Error("[edit] the two gates leave their own bay");
    }
    /* A door a message could not fit through is a wall with a decoration on
       it, and a door off the box's own centre line would make the traffic
       swerve for no reason. */
    if (DOOR_Y1 - DOOR_Y0 < CHIP_H) {
      throw new Error("[edit] a door is narrower than the messages that pass through it");
    }
    if ((DOOR_Y0 + DOOR_Y1) / 2 !== GB_MID_Y) {
      throw new Error("[edit] the doors are not on the box's own centre line");
    }
    if (DOOR_Y0 <= GB_Y || DOOR_Y1 >= GB_Y + GB_H) {
      throw new Error("[edit] a door is cut through a corner of the box");
    }
    for (const row of GB_ROWS) {
      if (monoWidth(row, RUBRIC_SIZE) > GB_W - 32) {
        throw new Error(`[edit] the agent box is narrower than "${row}"`);
      }
    }
    /* The knock STOPS outside the wall. That daylight is the beat: something
       arrived at a door and was not let through. */
    if (KNOCK_AT + MSG_W / 2 >= GB_X) {
      throw new Error("[edit] the off-topic message is already inside the box when it knocks");
    }
    if (!inBay(6, ASK_START - MSG_W / 2, GB_CX + MSG_W / 2)) {
      throw new Error("[edit] the inbound question leaves its own bay");
    }
    if (Math.max(monoWidth(ASK_TEXT, CARD_LINE_SIZE), monoWidth(KNOCK_TEXT, CARD_LINE_SIZE)) > MSG_W - 22) {
      throw new Error("[edit] an inbound message is narrower than what is written on it");
    }
    if (monoWidth(NOTE_TEXT, 10) > NOTE_W - 20) {
      throw new Error("[edit] the note is narrower than the decline written on it");
    }
    /* The classifier and the policy are two boxes with a wall between them,
       and the wall has to be BETWEEN them or the picture says nothing. */
    if (NX_X <= CLS_X + GATE_CARD_W || NX_X >= POL_X) {
      throw new Error("[edit] `never crosses` is not drawn between the classifier and the policy");
    }
    if (POL_X < CLS_X + GATE_CARD_W + 16) {
      throw new Error("[edit] the classifier and the policy are drawn as one card");
    }
    for (const [x, s] of [[CLS_X, CLS_STAMP], [POL_X, POL_STAMP]] as const) {
      if (monoWidth(s, RUBRIC_SIZE) > GATE_CARD_W - 32 || x + GATE_CARD_W > bayCx(6) + CONTENT_HALF) {
        throw new Error(`[edit] the "${s}" stamp does not fit the box that carries it`);
      }
    }
    /* The reply's runs and the bars that come down over them. A bar narrower
       than its own run would redact three of four digits, which is worse than
       redacting none. */
    if (REPLY_RUNS.length !== REPLY_BLOCKS.length) {
      throw new Error("[edit] there is not one redaction bar per block of the number");
    }
    for (const [i, r] of REPLY_RUNS.entries()) {
      const need = monoWidth(REPLY_BLOCKS[i]!, CARD_LINE_SIZE);
      if (r.w < need) {
        throw new Error(`[edit] the bar over "${REPLY_BLOCKS[i]}" is narrower than the digits it hides`);
      }
      if (r.x < -REPLY_W / 2 + 11 || r.x + r.w > REPLY_W / 2 - 11) {
        throw new Error(`[edit] the block "${REPLY_BLOCKS[i]}" runs out of the reply it is written in`);
      }
      if (i > 0 && r.x < REPLY_RUNS[i - 1]!.x + REPLY_RUNS[i - 1]!.w) {
        throw new Error("[edit] two redaction bars overlap");
      }
    }
    if (REPLY_PREFIX_X < -REPLY_W / 2 + 11 || REPLY_PREFIX_X + monoWidth(REPLY_PREFIX, CARD_LINE_SIZE) > REPLY_RUNS[0]!.x) {
      throw new Error("[edit] the reply's country code runs into the first redacted block");
    }
    if (REPLY_DOOR_X + REPLY_W / 2 !== GB_X + GB_W) {
      throw new Error("[edit] the reply does not stop at the door it is checked by");
    }
    if (REPLY_OUT_X + REPLY_W / 2 > GT_OUT_X1) {
      throw new Error("[edit] the reply leaves the road it ships on");
    }
    if (7160 + monoWidth(GT_RECEIPT, RUBRIC_SIZE) > GT_OUT_X1) {
      throw new Error("[edit] the outbound receipt runs off the end of its own lane");
    }
  }

  /* ── station 8 ─────────────────────────────────────────────────────────── */
  {
    const lastLaneY = LANE_Y0 + (LANE_N - 1) * LANE_PITCH;
    if (
      !inBay(7, LANE8_LBL_X, DELIVERED_X + monoWidth(DELIVERED, DELIVERED_SIZE)) ||
      !inBand(LANE_Y0 - 12, lastLaneY + 12)
    ) {
      throw new Error("[edit] the five customer lanes leave their own bay");
    }
    if (FLOOD_LANE <= 0 || FLOOD_LANE >= LANE_N - 1) {
      throw new Error("[edit] the flooding customer is on an edge lane, which reads as an edge case");
    }
    if (LANE8_LBL_X + monoWidth(`customer ${LANE_N}`, LANE8_LBL_SIZE) > LANE8_X0 - 8) {
      throw new Error("[edit] a customer's name runs into its own lane");
    }
    /* The valve is on the flooding lane, on the road, with the queue behind
       it and the receipts past it. */
    if (VALVE_X <= LANE8_X0 || VALVE_X >= LANE8_X1) {
      throw new Error("[edit] the valve is not on the lane it throttles");
    }
    if (DELIVERED_X < LANE8_X1) {
      throw new Error("[edit] a delivered receipt is printed over the lane it belongs to");
    }
    if (REPLY_DOT_X >= LANE8_X1 || REPLY_DOT_X <= VALVE_X) {
      throw new Error("[edit] the four untouched replies do not land past the valve");
    }
    /* A QUEUE IS A SPACING. If the two pitches were the same the valve would
       have closed and nothing would have happened. */
    if (FLOOD_QUEUE_PITCH >= FLOOD_SPREAD_PITCH) {
      throw new Error("[edit] the throttled burst does not actually queue up");
    }
    if (FLOOD_QUEUE_X0 + (FLOOD_N - 1) * FLOOD_QUEUE_PITCH + FLOOD_R >= VALVE_X) {
      throw new Error("[edit] the queue runs through the valve that is holding it");
    }
    if (FLOOD_SPREAD_X0 - FLOOD_R < LANE8_X0) {
      throw new Error("[edit] the burst starts off the end of its own lane");
    }
    /* The notice goes back to the customer without driving through the queue
       it caused. */
    if (NOTICE_FROM + NOTICE_W / 2 > FLOOD_QUEUE_X0 || NOTICE_TO - NOTICE_W / 2 < LANE8_X0) {
      throw new Error("[edit] the throttle notice collides with the queue it is about");
    }
    if (monoWidth(NOTICE_TEXT, 10) > NOTICE_W - 20) {
      throw new Error("[edit] the notice is narrower than what is printed on it");
    }
    if (monoWidth(GHOST_LABEL, RUBRIC_SIZE) / 2 + 8265 > bayCx(7) + CONTENT_HALF) {
      throw new Error("[edit] the ghost's label runs out of its own bay");
    }
  }

  /* ════════════════════════════════════════════════════════════════════════
     BOOT ASSERTS — the still's windows  (authored now, cloned by slice D)
     A window is geometry, and geometry that only exists in the slice that
     renders it is geometry nothing can check. All eight are measured here,
     three slices before anything looks through them.
     ════════════════════════════════════════════════════════════════════════ */

  if (STILL_VIEW.length !== STATION_AT.length) {
    throw new Error("[edit] there is not one still window set per station");
  }
  for (const [i, v] of STILL_VIEW.entries()) {
    if (v.cap !== i) throw new Error(`[edit] still window ${i} names the wrong caption`);
    if (v.boxes.length < 1 || v.boxes.length > 2) {
      throw new Error(`[edit] still window ${i} is neither one close-up nor two`);
    }
    for (const box of v.boxes) {
      const n = box.split(" ").map(Number);
      if (n.length !== 4 || n.some((k) => !Number.isFinite(k))) {
        throw new Error(`[edit] still window "${box}" is not four numbers`);
      }
      const [x, y, w, h] = n as [number, number, number, number];
      /* The legibility ceiling, and it is measured rather than guessed: a
         card is ~343px wide on a 375px phone, so a window wider than this
         renders 10.5u lettering under 8px. A mechanism wider than the ceiling
         gets two windows stacked, never one sliver. */
      if (w > STILL_VIEW_MAX_W || w <= 0 || h <= 0) {
        throw new Error(`[edit] still window "${box}" is wider than a phone can read`);
      }
      if (!inBay(i, x, x + w)) {
        throw new Error(`[edit] still window "${box}" looks outside station ${i + 1}'s own bay`);
      }
      if (y < CHIP_LANE_Y - CHIP_H || y + h > CONTENT_Y1 + 8) {
        throw new Error(`[edit] still window "${box}" looks outside the world`);
      }
    }
  }

  /* ── geometry WRITTEN from the constants ────────────────────────────────
     One source for every line whose two endpoints this file already knows. */
  lane.setAttribute("d", `M ${LANE_X0} ${CHIP_LANE_Y} L ${LANE_X1} ${CHIP_LANE_Y}`);
  gate.setAttribute("d", `M ${GATE_X} ${CHIP_LANE_Y - GATE_HALF} L ${GATE_X} ${CHIP_LANE_Y + GATE_HALF}`);
  jambs.forEach((j, i) => {
    const y = CHIP_LANE_Y + (i === 0 ? -GATE_HALF : GATE_HALF);
    j.setAttribute("d", `M ${GATE_X - JAMB_HALF} ${y} L ${GATE_X + JAMB_HALF} ${y}`);
  });
  checkRule.setAttribute("d", `M ${CHECK_RULE_X0} ${CHECK_RULE_Y} L ${CHECK_RULE_X1} ${CHECK_RULE_Y}`);
  checkLbl.setAttribute("x", String(CHECK_LBL_X));
  checkLbl.setAttribute("y", String(CHECK_ROW_Y));
  for (const s of statuses) {
    s.setAttribute("x", String(CHECK_STATUS_X));
    s.setAttribute("y", String(CHECK_ROW_Y));
  }
  thresh.setAttribute("d", `M ${THRESH_X0} ${THRESH_Y} L ${THRESH_X1} ${THRESH_Y}`);
  judgeTick.setAttribute("d", tickPath(JUDGE_TICK_X, JUDGE_TICK_Y));
  /* The lane has to run under the whole turnstile, gate and marks included,
     or the chip is travelling on a road that stops before the thing it is
     travelling to. */
  if (LANE_X0 > CHIP_GATE_BACK - CHIP_W / 2 || LANE_X1 < CHIP_GATE_THROUGH + CHIP_W / 2) {
    throw new Error("[edit] the chip runs off the end of its own road at the ci gate");
  }

  /* ── stations 4–8: written, then asserted ──────────────────────────────
     Same split as above. Every line whose two endpoints this file already
     owns is SET from the constants (a line that exists in two files drifts,
     and the drift is invisible in a diff); every box and every sentence is
     left in the markup and only checked here. */

  notchV6.setAttribute("d", `M ${RAIL_X0} ${RAIL_Y} L ${RAIL_X0} ${RAIL_NOTCH_TOP}`);
  {
    const x = stampX(NOTCH_V7_STAMP);
    notchV7.setAttribute("d", `M ${x} ${RAIL_Y} L ${x} ${RAIL_NOTCH_TOP}`);
  }

  saveWire.setAttribute(
    "d",
    `M ${DASH_X + DASH_W} ${BTN_Y + BTN_H / 2} L ${CHK_X} ${BTN_Y + BTN_H / 2}`,
  );

  cnIn.setAttribute("d", `M ${CN_IN_X0} ${CN_MID_Y} L ${SW_X} ${CN_MID_Y}`);
  cnUp.setAttribute("d", `M ${SW_X} ${CN_MID_Y} C ${SW_X + 10} ${CN_MID_Y} ${SW_X + 10} ${LANE_A_Y} ${BAND_X0} ${LANE_A_Y}`);
  cnDn.setAttribute("d", `M ${SW_X} ${CN_MID_Y} C ${SW_X + 10} ${CN_MID_Y} ${SW_X + 10} ${LANE_B_Y} ${BAND_X0} ${LANE_B_Y}`);
  /* The bands are centred on the latitude their dots ride — that is what lets
     the share change without a single dot moving — so their y is derived and
     never typed. */
  for (const [rect, cy, h] of [
    [bandA, LANE_A_Y, BAND_A_H],
    [bandB, LANE_B_Y, BAND_B_H],
  ] as const) {
    rect.setAttribute("x", String(BAND_X0));
    rect.setAttribute("y", String(cy - h / 2));
    rect.setAttribute("width", String(BAND_W));
    rect.setAttribute("height", String(h));
  }
  jmTicks[0]!.setAttribute("d", tickPath(JM_X, JM_A_Y));
  jmTicks[1]!.setAttribute("d", tickPath(JM_X, JM_B_Y));
  bars[0]!.setAttribute("d", `M ${BAR_X0} ${LANE_A_Y} L ${BAR_X0 + (BAR_LEN * SCORE_A) / SCORE_MAX} ${LANE_A_Y}`);
  bars[1]!.setAttribute("d", `M ${BAR_X0} ${LANE_B_Y} L ${BAR_X0 + (BAR_LEN * SCORE_B) / SCORE_MAX} ${LANE_B_Y}`);
  merge.setAttribute(
    "d",
    `M ${BAND_X0 + BAND_W} ${LANE_A_Y} C ${BAND_X0 + BAND_W + 16} ${LANE_A_Y} ${BAND_X0 + BAND_W + 20} ${LANE_B_Y} ${BAND_X0 + BAND_W + 36} ${LANE_B_Y}`,
  );

  rtIn.setAttribute("d", `M ${RT_IN_X0} ${RT_MID_Y} L ${RT_FORK_X} ${RT_MID_Y}`);
  rtUp.setAttribute("d", `M ${RT_FORK_X} ${RT_MID_Y} C ${RT_FORK_X + 40} ${RT_MID_Y} ${RT_FORK_X + 40} ${BIG_Y + BIG_H / 2} ${BIG_X} ${BIG_Y + BIG_H / 2}`);
  rtDn.setAttribute("d", `M ${RT_FORK_X} ${RT_MID_Y} C ${RT_FORK_X + 40} ${RT_MID_Y} ${RT_FORK_X + 40} ${SM_Y + SM_H / 2} ${SM_X} ${SM_Y + SM_H / 2}`);
  /* The reach ENDS at the barrier. A non-scaling stroke cannot hold a partial
     drawSVG range, so the line is authored to stop rather than tweened to
     (DESIGN §3 — the same trap scene 2's severed wire fell into). */
  reachSm.setAttribute(
    "d",
    `M ${SM_X + SM_W} ${SM_Y + SM_H / 2} C ${SM_X + SM_W + 70} ${SM_Y + SM_H / 2} ${BARRIER_X - 60} ${BARRIER_Y} ${BARRIER_X} ${BARRIER_Y}`,
  );
  barrier.setAttribute("d", `M ${BARRIER_X} ${BARRIER_Y - BARRIER_HALF} L ${BARRIER_X} ${BARRIER_Y + BARRIER_HALF}`);
  barrierJambs.forEach((j, i) => {
    const y = BARRIER_Y + (i === 0 ? -BARRIER_HALF : BARRIER_HALF);
    j.setAttribute("d", `M ${BARRIER_X - 6} ${y} L ${BARRIER_X + 6} ${y}`);
  });
  reachBg.setAttribute(
    "d",
    `M ${BIG_X + BIG_W} ${BIG_Y + BIG_H / 2} C ${BIG_X + BIG_W + 120} ${BIG_Y + BIG_H / 2} ${TOOL_X - 100} ${TOOL_Y + TOOL_H / 2} ${TOOL_X} ${TOOL_Y + TOOL_H / 2}`,
  );

  /* The agent box's walls, with two doors cut in them. Four runs, two
     subpaths: the top-left corner round to the left door's upper jamb, and
     the mirror of it from the right door's lower jamb round to the left
     door's lower jamb. */
  gbWall.setAttribute(
    "d",
    `M ${GB_X} ${DOOR_Y0} L ${GB_X} ${GB_Y} L ${GB_X + GB_W} ${GB_Y} L ${GB_X + GB_W} ${DOOR_Y0}` +
      ` M ${GB_X + GB_W} ${DOOR_Y1} L ${GB_X + GB_W} ${GB_Y + GB_H} L ${GB_X} ${GB_Y + GB_H} L ${GB_X} ${DOOR_Y1}`,
  );
  doorJambs.forEach((j, i) => {
    const x = i < 2 ? GB_X : GB_X + GB_W;
    const y = i % 2 === 0 ? DOOR_Y0 : DOOR_Y1;
    j.setAttribute("d", `M ${x - 10} ${y} L ${x + 10} ${y}`);
  });
  gtIn.setAttribute("d", `M ${GT_IN_X0} ${GB_MID_Y} L ${GB_X} ${GB_MID_Y}`);
  gtOut.setAttribute("d", `M ${GB_X + GB_W} ${GB_MID_Y} L ${GT_OUT_X1} ${GB_MID_Y}`);
  nx.setAttribute("d", `M ${NX_X} ${GATE_CARD_Y - 4} L ${NX_X} ${GATE_CARD_Y + GATE_CARD_H + 4}`);

  {
    const y = laneY(FLOOD_LANE);
    const d = `M ${VALVE_X} ${y - VALVE_HALF} L ${VALVE_X} ${y + VALVE_HALF}`;
    valve.setAttribute("d", d);
    valveAmber.setAttribute("d", d);
    valveJambs.forEach((j, i) => {
      const jy = y + (i === 0 ? -VALVE_HALF : VALVE_HALF);
      j.setAttribute("d", `M ${VALVE_X - 6} ${jy} L ${VALVE_X + 6} ${jy}`);
    });
  }

  /* The boxes and the sentences stay in the markup and are only checked here
     — that is what makes a clone of the markup the finished frame. */
  {
    const boxes: readonly [SVGRectElement, number, number, number, number, string][] = [
      [dash, DASH_X, DASH_Y, DASH_W, DASH_H, "#edt-dash"],
      [field, FIELD_X, FIELD_Y, FIELD_W, FIELD_H, "#edt-field"],
      [chkPanel, CHK_X, CHK_Y, CHK_W, CHK_H, "#edt-chk"],
      [bigChip, BIG_X, BIG_Y, BIG_W, BIG_H, "#edt-big"],
      [smallChip, SM_X, SM_Y, SM_W, SM_H, "#edt-small"],
      [tool, TOOL_X, TOOL_Y, TOOL_W, TOOL_H, "#edt-tool"],
      [gbFill, GB_X, GB_Y, GB_W, GB_H, "#edt-gb-fill"],
      [clsCard, CLS_X, GATE_CARD_Y, GATE_CARD_W, GATE_CARD_H, "#edt-cls"],
      [polCard, POL_X, GATE_CARD_Y, GATE_CARD_W, GATE_CARD_H, "#edt-pol"],
      [rmsgBody, -RMSG_W / 2, -13, RMSG_W, 26, "#edt-rmsg-body"],
      [askBody, -MSG_W / 2, -13, MSG_W, 26, "#edt-ask-body"],
      [knockBody, -MSG_W / 2, -13, MSG_W, 26, "#edt-knock-body"],
      [noteBody, -NOTE_W / 2, -11, NOTE_W, 22, "#edt-note-body"],
      [replyBody, -REPLY_W / 2, -13, REPLY_W, 26, "#edt-reply-body"],
      [noticeBody, -NOTICE_W / 2, -11, NOTICE_W, 22, "#edt-notice-body"],
      [anywayRect, ANYWAY_X, 452, ANYWAY_W, 28, "#edt-btn-anyway"],
    ];
    for (const [el, x, y, w, h, name] of boxes) {
      if (
        Number(el.getAttribute("x")) !== x ||
        Number(el.getAttribute("y")) !== y ||
        Number(el.getAttribute("width")) !== w ||
        Number(el.getAttribute("height")) !== h
      ) {
        throw new Error(`[edit] ${name} disagrees with the constants the beats are written against`);
      }
    }
    for (const [i, [bx, bw]] of BTN_BOXES.entries()) {
      const r = btnRects[i]!;
      if (
        Number(r.getAttribute("x")) !== bx ||
        Number(r.getAttribute("width")) !== bw ||
        Number(r.getAttribute("y")) !== BTN_Y ||
        Number(r.getAttribute("height")) !== BTN_H
      ) {
        throw new Error(`[edit] the "${BTN_LABELS[i]}" control disagrees with BTN_BOXES`);
      }
    }
    /* The redaction bars sit exactly over the runs they hide, in the chip's
       own local coordinates. Two numbers in two files is how a bar ends up
       half a glyph off a digit. */
    for (const [i, r] of REPLY_RUNS.entries()) {
      if (
        Number(replyRuns[i]!.getAttribute("x")) !== r.x ||
        Number(redacts[i]!.getAttribute("x")) !== r.x ||
        Number(redacts[i]!.getAttribute("width")) !== r.w
      ) {
        throw new Error(`[edit] the bar over "${REPLY_BLOCKS[i]}" is not over the digits it hides`);
      }
    }
    const strings: readonly [Element, string][] = [
      [dashLbl, DASH_LABEL],
      [fieldLbl, FIELD_LABEL],
      [chkTitle, CHK_TITLE],
      [chkRun, CHK_RUN],
      [chkRows[0]!, CHK_RESULTS[0]!],
      [chkRows[1]!, CHK_RESULTS[1]!],
      [chkRows[2]!, CHK_RESULTS[2]!],
      [chkVerdict, CHK_VERDICT],
      [anywayLbl, ANYWAY_LABEL],
      [btnLbls[0]!, BTN_LABELS[0]!],
      [btnLbls[1]!, BTN_LABELS[1]!],
      [btnLbls[2]!, BTN_LABELS[2]!],
      [laneALbl, LANE_A_LBL],
      [laneALbl2, LANE_A_LBL2],
      [laneBLbl, LANE_B_LBL],
      [laneBLbl2, LANE_B_LBL2],
      [sw10, SW_LABEL_A],
      [sw50, SW_LABEL_B],
      [swHint, SW_HINT],
      [cntDen, CNT_DEN],
      [cntCap, CNT_CAP],
      [barLbls[0]!, BAR_A_LBL],
      [barLbls[1]!, BAR_B_LBL],
      [judgedEach, JUDGED_EACH],
      [bigLbl, BIG_LABEL],
      [smallLbl, SM_LABEL],
      [barrierLbl, BARRIER_LABEL],
      [toolLbl, TOOL_NAME],
      [toolDone, TOOL_DONE],
      [tickLbl, TICK_LABEL],
      [tickReads[0]!, TICK_READS[0]!],
      [tickReads[1]!, TICK_READS[1]!],
      [tickReads[2]!, TICK_READS[2]!],
      [tickReads[3]!, TICK_READS[3]!],
      [rmsgT1, RMSG_T1],
      [rmsgT2, RMSG_T2],
      [gbLbl, GB_LABEL],
      [gbRows[0]!, GB_ROWS[0]!],
      [gbRows[1]!, GB_ROWS[1]!],
      [clsStamp, CLS_STAMP],
      [polStamp, POL_STAMP],
      [nxLbl, NX_LABEL],
      [askT, ASK_TEXT],
      [knockT, KNOCK_TEXT],
      [noteT, NOTE_TEXT],
      [replyPrefix, REPLY_PREFIX],
      [replyRuns[0]!, REPLY_BLOCKS[0]!],
      [replyRuns[1]!, REPLY_BLOCKS[1]!],
      [replyRuns[2]!, REPLY_BLOCKS[2]!],
      [gtReceipt, GT_RECEIPT],
      [noticeT, NOTICE_TEXT],
      [ghostLbl, GHOST_LABEL],
    ];
    for (const [el, want] of strings) {
      if (el.textContent !== want) {
        throw new Error(`[edit] the markup says "${el.textContent}" where this file says "${want}"`);
      }
    }
    /* The counter's aperture is one two-glyph cell of the column behind it and
       must never animate (scene 5's printer law). */
    const cntAp = q<SVGRectElement>(svg, "#edt-cnt-clip rect");
    if (
      Number(cntAp.getAttribute("x")) !== CNT_AP_X ||
      Number(cntAp.getAttribute("y")) !== CNT_AP_Y ||
      Number(cntAp.getAttribute("width")) !== CNT_AP_W ||
      Number(cntAp.getAttribute("height")) !== CNT_AP_H
    ) {
      throw new Error("[edit] the canary counter's aperture is not one cell of its own column");
    }
    const tallyAp = q<SVGRectElement>(svg, "#edt-tally-clip rect");
    if (
      Number(tallyAp.getAttribute("x")) !== TALLY_AP_X ||
      Number(tallyAp.getAttribute("y")) !== TALLY_AP_Y ||
      Number(tallyAp.getAttribute("width")) !== TALLY_AP_W ||
      Number(tallyAp.getAttribute("height")) !== TALLY_AP_H
    ) {
      throw new Error("[edit] the bench tally's aperture is not one cell of its own column");
    }
    if (tallyDen.textContent !== TALLY_DEN) {
      throw new Error(`[edit] the markup says "${tallyDen.textContent}" where this file says "${TALLY_DEN}"`);
    }
  }

  /** Everything that is traced rather than faded. All of it rests at
   *  drawSVG "0% 0%", which is why every one of these classes carries
   *  stroke-linecap: butt in the stylesheet (DESIGN §3). */
  const strokeParts: SVGGeometryElement[] = [
    railLine,
    railOriginTick,
    panel,
    panelRule,
    ...scnRects,
    ...scnBoxes,
    ...scnTicks,
    judge,
    thresh,
    judgeTick,
    lane,
    gate,
    ...checkBoxes,
    ...checkTicks,
    ...failCross,
    chipBody,
    tktBody,
    ...stamps.flatMap((s) => (s ? [s.tick, ...(s.mark ? [s.mark] : [])] : [])),
    /* stations 4–8 */
    notchV6,
    notchV7,
    dash,
    dashRule,
    field,
    ...btnRects,
    saveWire,
    chkPanel,
    anywayRect,
    cnIn,
    cnUp,
    cnDn,
    swBox,
    ...jmBoxes,
    ...jmTicks,
    ...bars,
    merge,
    rtIn,
    rtUp,
    rtDn,
    bigChip,
    smallChip,
    reachSm,
    barrier,
    reachBg,
    tool,
    rmsgBody,
    gbWall,
    ...doorJambs,
    gtIn,
    gtOut,
    clsCard,
    polCard,
    nx,
    askBody,
    knockBody,
    noteBody,
    replyBody,
    ...laneRules,
    valve,
    valveAmber,
    ...valveJambs,
    noticeBody,
    ghost,
  ];

  /** Everything that only ever fades. */
  const fadeParts: SVGElement[] = [
    railOriginLbl,
    ...stamps.flatMap((s) => (s ? [s.label] : [])),
    fileLbl,
    ...nums,
    ...lines,
    lineOld,
    caret,
    bench,
    tallyCol,
    tallyDen,
    ...scnTitles,
    ...scnLines,
    judgeTitle,
    judgeRubric,
    scoreDen,
    threshLbl,
    judgeVerdict,
    ...jambs,
    checkLbl,
    ...statuses,
    chipLine,
    chipCommit,
    /* stations 4–8 */
    dashLbl,
    fieldLbl,
    ...btnLbls,
    chkTitle,
    chkRun,
    ...chkRows,
    chkVerdict,
    anywayLbl,
    laneALbl,
    laneALbl2,
    laneBLbl,
    laneBLbl2,
    swRead,
    cntDen,
    cntCap,
    ...barLbls,
    judgedEach,
    ...cnEntry,
    bigLbl,
    smallLbl,
    ...barrierJambs,
    barrierLbl,
    toolLbl,
    toolDone,
    tickLbl,
    ...tickReads,
    rmsgT1,
    rmsgT2,
    gbLbl,
    ...gbRows,
    clsTitle,
    clsStamp,
    polTitle,
    polStamp,
    nxLbl,
    /* Only the QUESTION carries a group opacity, and only because it is the
       one object at this station that has to LEAVE (it was answered; the
       reply is what ships). Everything else here arrives once and stays, so
       it is drawn and lit like every other box in the scene — one switch per
       state, and the ticket's precedent kept for the one case that needs it. */
    ask,
    askT,
    knockT,
    noteT,
    replyPrefix,
    ...replyRuns,
    ...redacts,
    gtReceipt,
    ...laneLabels,
    ...replyDots,
    ...delivereds,
    ...floodDots,
    noticeT,
    ghostLbl,
  ];

  /** The boxes whose fill comes up behind their own outline, so a rectangle is
   *  a line before it is a surface (scene 2's drawBox). */
  const boxRects: SVGElement[] = [
    panel,
    judge,
    ...scnRects,
    chipBody,
    tktBody,
    dash,
    field,
    ...btnRects,
    chkPanel,
    anywayRect,
    swBox,
    bigChip,
    smallChip,
    tool,
    clsCard,
    polCard,
    rmsgBody,
    askBody,
    knockBody,
    noteBody,
    replyBody,
    noticeBody,
  ];

  /** The two objects in the scene that are a FILL and nothing else: the agent
   *  box's surface (its walls are a separate path, because a rect cannot have
   *  a door cut in it) and the two lane bands (a band is a quantity, and a
   *  hairline round it would make it a box). */
  const fillOnly: SVGElement[] = [gbFill, bandA, bandB];

  /** Everything the POINTER owns at station 5, in one place so the disarm can
   *  put all of it back exactly the way the scrub authored it.
   *
   *  THE CONTRACT IS PER PROPERTY, NOT PER ELEMENT. Two of these elements are
   *  also in the lists above — the two bands, whose fill-opacity is the
   *  scrub's and whose scaleY is the hand's — and that is the whole trick:
   *  ownership is of a NUMBER, so a band can arrive under the scrub and be
   *  re-proportioned by a reader in the same frame without either regime
   *  overwriting the other. Everything else here (the hint, the two readings,
   *  the counter's inner column, the twelve switchable dots) is touched by
   *  the pointer alone. */
  const pointerParts = { swHint, sw10, sw50, cntFlip, cnPeelPointer, bandA, bandB };

  /* AND THE CONTRACT IS CHECKED, not just described. Every element the hand
     owns OUTRIGHT is absent from all four of the scrub's lists — so a future
     beat that reaches for the hint, either reading, the inner counter column
     or one of the twelve switchable dots trips at boot rather than showing up
     as a switch that fights the reader on a slow scroll. The two bands are
     deliberately not in this loop: they are the shared-by-property case, and
     the property split is asserted by construction (fill-opacity below,
     scaleY in setFlip). */
  {
    const scrubbed = new Set<Element>([...strokeParts, ...fadeParts, ...boxRects, ...fillOnly]);
    const exclusive: Element[] = [
      pointerParts.swHint,
      pointerParts.sw10,
      pointerParts.sw50,
      pointerParts.cntFlip,
      ...pointerParts.cnPeelPointer,
    ];
    for (const el of exclusive) {
      if (scrubbed.has(el)) {
        throw new Error("[edit] an element the pointer owns outright is also driven by the scrub");
      }
    }
    if (pointerParts.cnPeelPointer.length !== CN_SWITCH_B.length) {
      throw new Error("[edit] the pointer does not own every dot the switch is supposed to move");
    }
  }

  /* ════════════════════════════════════════════════════════════════════════
     REST STATE — the inverse of the stylesheet
     ════════════════════════════════════════════════════════════════════════ */

  const camState = { z: CAM_START.z, fx: CAM_START.fx, fy: CAM_START.fy };

  /** scene point p renders at z·p + t, with t chosen so (fx,fy) lands on the
   *  frame centre. Owned as one transform attribute rather than as gsap
   *  scale/x/y for scene 2's reason: a camera whose pivot is re-derived from a
   *  bbox drifts a little further off with every keyframe. */
  function applyCam(): void {
    const { z, fx, fy } = camState;
    cam.setAttribute(
      "transform",
      `translate(${(FRAME_CX - z * fx).toFixed(3)} ${(FRAME_CY - z * fy).toFixed(3)}) scale(${z.toFixed(5)})`,
    );
  }

  /* ════════════════════════════════════════════════════════════════════════
     THE POINTER'S REGIME  —  station 5's switch
     ──────────────────────────────────────────────────────────────────────
     The second half of the two-regime split scene 4's ticket runs on: the
     SCRUB owns the canary beat, and once that beat has settled the SWITCH
     belongs to the hand until the camera leaves the bay.

     Three things make it safe to hand a live control to a reader in the
     middle of a scrubbed scene:

       1. OWNERSHIP IS PER NUMBER. Every transform the hand writes is one no
          tween in buildScrub() touches — the twelve switchable dots' y, the
          counter's INNER column, the two bands' scaleY, the two readings'
          opacity, the hint. Nothing is ever written twice.
       2. THE WINDOW IS THE DWELL. armed is derived from the timeline's own
          time on every scrub frame, so it is a pure function of scroll
          position: scroll away and the control is gone, scroll back and it is
          there again, in the state the scrub authored.
       3. THE DISARM RESETS. Whatever the reader left the switch at, leaving
          the bay puts every number back where the scrub expects it — so the
          scrub never has to know the hand was here.

     None of this is a `.call()` inside the scrubbed range in the sense the
     rules ban: nothing here is a one-way mutation of the SCENE. It is the
     same position-derived, idempotent, reversible arithmetic applyCam() is.
     ════════════════════════════════════════════════════════════════════════ */

  /** What the button says it is, for a reader who cannot see the drawing. */
  const toggleNameFor = (on: boolean): string =>
    `Canary share: ${on ? "50" : "10"} percent of conversations. Activate to switch to ${on ? "10" : "50"} percent.`;

  /** How far a band has to scale to become an even split. Derived, so the
   *  50/50 state cannot drift away from the thicknesses that mean 90/10. */
  const bandScale = (h: number): number => BAND_EVEN_H / h;
  const BAND_MID_X = BAND_X0 + BAND_W / 2;

  let flipped = false;
  let armed = false;

  /** The hand's rest, which is also its disarm. Written once and used by both
   *  restState() and disarm, so the two can never describe different states. */
  function resetPointerState(): void {
    flipped = false;
    gsap.set(swHint, { opacity: 0 });
    gsap.set(sw10, { opacity: 1 });
    gsap.set(sw50, { opacity: 0 });
    gsap.set(cntFlip, { y: 0 });
    gsap.set(cnPeelPointer, { y: 0 });
    gsap.set(bandA, { scaleY: 1, svgOrigin: `${BAND_MID_X} ${LANE_A_Y}` });
    gsap.set(bandB, { scaleY: 1, svgOrigin: `${BAND_MID_X} ${LANE_B_Y}` });
    gsap.set(swBox, { scale: 1, svgOrigin: `${SW_BOX_X + SW_BOX_W / 2} ${SW_BOX_Y + SW_BOX_H / 2}` });
    toggle.setAttribute("aria-pressed", "false");
    toggleName.textContent = toggleNameFor(false);
  }

  /** The flip itself. Transform and opacity only, one ease, no overshoot: a
   *  traffic split that bounced would be a traffic split nobody believed. */
  function setFlip(next: boolean): void {
    if (next === flipped) return;
    flipped = next;
    gsap.to(sw10, { opacity: next ? 0 : 1, duration: FLIP_DUR * 0.5, ease: "power2.out" });
    gsap.to(sw50, { opacity: next ? 1 : 0, duration: FLIP_DUR * 0.5, ease: "power2.out" });
    gsap.to(cntFlip, { y: next ? -CNT_PITCH : 0, duration: FLIP_DUR, ease: "power2.out" });
    /* The twelve peel in ARRIVAL ORDER, 12ms apart, because they are a
       stream and a stream does not change lane all at once. */
    gsap.to(cnPeelPointer, {
      y: next ? CN_PEEL_DY : 0,
      duration: FLIP_DUR,
      ease: "power2.out",
      stagger: 0.012,
    });
    gsap.to(bandA, {
      scaleY: next ? bandScale(BAND_A_H) : 1,
      duration: FLIP_DUR,
      ease: "power2.out",
      svgOrigin: `${BAND_MID_X} ${LANE_A_Y}`,
    });
    gsap.to(bandB, {
      scaleY: next ? bandScale(BAND_B_H) : 1,
      duration: FLIP_DUR,
      ease: "power2.out",
      svgOrigin: `${BAND_MID_X} ${LANE_B_Y}`,
    });
    toggle.setAttribute("aria-pressed", String(next));
    toggleName.textContent = toggleNameFor(next);
  }

  /** Lay the button exactly over the drawn switch. Measured through the svg's
   *  OWN screen matrix rather than off its bounding box: `height: auto` under
   *  a `max-height` letterboxes the viewBox on a short window, and a ratio of
   *  widths would then place the control off the thing it operates. */
  function placeToggle(): void {
    const m = svg.getScreenCTM();
    if (!m) return;
    /* World → frame, at the resting camera the toggle's window guarantees. */
    const fx = SW_BOX_X - bayCx(4) + FRAME_CX;
    const fy = SW_BOX_Y - CAM_FY + FRAME_CY;
    const p0 = new DOMPoint(fx, fy).matrixTransform(m);
    const p1 = new DOMPoint(fx + SW_BOX_W, fy + SW_BOX_H).matrixTransform(m);
    const k = (p1.x - p0.x) / SW_BOX_W;
    if (!(k > 0)) return;
    const stageBox = stage.getBoundingClientRect();
    toggle.style.left = `${p0.x - stageBox.left - HIT_PAD * k}px`;
    toggle.style.top = `${p0.y - stageBox.top - HIT_PAD * k}px`;
    toggle.style.width = `${(SW_BOX_W + 2 * HIT_PAD) * k}px`;
    toggle.style.height = `${(SW_BOX_H + 2 * HIT_PAD) * k}px`;
  }

  function armToggle(on: boolean): void {
    if (on === armed) return;
    armed = on;
    if (on) {
      placeToggle();
      toggle.hidden = false;
      /* The affordance is a whisper, not an instruction: half-lit when the
         control is live, full when the pointer is on it. Scene 4's `tear
         here` does exactly this one scene up. */
      gsap.to(swHint, { opacity: 0.5, duration: 0.3, ease: "power2.out" });
    } else {
      /* Off-stage and out of the tab order in the same frame — a keyboard
         reader must not find a focus stop in a scene that has moved on. */
      if (doc.activeElement === toggle) toggle.blur();
      toggle.hidden = true;
      gsap.to(swHint, { opacity: 0, duration: 0.25, ease: "power2.out" });
      setFlip(false);
      gsap.to(swBox, {
        scale: 1,
        duration: HOVER_DUR,
        ease: "power2.out",
        svgOrigin: `${SW_BOX_X + SW_BOX_W / 2} ${SW_BOX_Y + SW_BOX_H / 2}`,
      });
    }
  }

  /** Derived from the timeline's own time on every frame, which is what makes
   *  it a pure function of scroll rather than a memory of having scrolled. */
  function syncArm(t: number): void {
    armToggle(t >= TOGGLE_FROM && t < TOGGLE_TO);
  }

  function restState(): void {
    gsap.set(pin, { opacity: 0 });
    gsap.set(caps, { opacity: 0, y: 10 });
    gsap.set(clockEls, { opacity: 0 });
    gsap.set(progressFill, { scaleY: 0 });

    gsap.set(strokeParts, { drawSVG: "0% 0%" });
    gsap.set(boxRects, { fillOpacity: 0 });
    gsap.set(fillOnly, { fillOpacity: 0 });
    gsap.set(fadeParts, { opacity: 0 });
    gsap.set(ticket, { opacity: 0 });

    /* The pointer's own rest, which is also its disarm state: the hand has
       touched nothing yet, so every number it owns is exactly what the scrub
       authored. Written here as well as in disarm() so the two can never
       describe different rest states. */
    resetPointerState();

    /* Station 5's thirty conversations come in from the left, and the three
       the scrub peels start up in the v6 lane. Both are POSITIONS, set here
       and tweened from here — the dots' own opacity lives in fadeParts with
       everything else. */
    gsap.set(cnEntry, { x: -40 });
    gsap.set(cnPeelScrub, { y: -CN_PEEL_DY });
    /* The flood is authored where it QUEUES, so its rest is where it arrived:
       spread out along the lane, one offset per message. */
    floodDots.forEach((d, i) => gsap.set(d, { x: floodSpreadDx(i) }));
    /* The four untouched replies come in from up the lane. */
    gsap.set(replyDots, { x: -160 });

    /* Every travelling object at its own start, in world coordinates, for the
       same reason the chip is parked on the line it is lifted from: the
       failure mode of a beat that shows something before placing it is then a
       card in the right neighbourhood rather than one in the world's corner. */
    gsap.set(rmsg, { x: RMSG_START[0], y: RMSG_START[1] });
    gsap.set(ask, { x: ASK_START, y: GB_MID_Y });
    gsap.set(knock, { x: KNOCK_AT, y: GB_MID_Y });
    gsap.set(note, { x: NOTE_FROM, y: NOTE_Y });
    gsap.set(reply, { x: REPLY_DRAFT_X, y: GB_MID_Y });
    gsap.set(notice, { x: NOTICE_FROM, y: laneY(FLOOD_LANE) });
    /* The score column's rest is the BOTTOM of the roll — glyph 0 in the
       aperture — which is +SCORE_VALUE cells from where the markup authored
       it. The finished frame is the untransformed one. */
    gsap.set(scoreCol, { y: SCORE_VALUE * SCORE_PITCH });
    /* The bench's tally rests on ZERO — nothing has been graded yet — which is
       SCENARIOS.length cells below the finished `3`. */
    gsap.set(tallyCol, { y: SCENARIOS.length * TALLY_PITCH });
    /* The canary counter's OUTER column rests one cell down, showing the
       blank; the inner one (the pointer's) rests at zero. Same inversion: the
       finished frame is the untransformed cell. */
    gsap.set(cntRoll, { y: (CNT_SCRUB_CELL - CNT_REST_CELL) * CNT_PITCH });
    /* The chip is parked ON the line it will be lifted from, not at the world
       origin: the failure mode of any future beat that shows it before placing
       it is then a card sitting on the prompt, where it belongs, rather than a
       card floating in the top-left corner of the world.
       Its POSITION is all that is set here — the group carries no opacity of
       its own, because what hides it at rest is the same thing that hides
       every other object in the scene: an undrawn outline (strokeParts), an
       unfilled surface (boxRects) and two unlit strings (fadeParts). A group
       opacity on top of those would be a second switch for one state, and the
       one that got forgotten would be the one that mattered. */
    gsap.set(chip, { x: LINE_X + CHIP_W / 2, y: lineY(EDIT_LINE) });
    gsap.set(caret, { x: LINE_X + 4, y: lineY(EDIT_LINE) + CARET_DY });

    camState.z = CAM_START.z;
    camState.fx = CAM_START.fx;
    camState.fy = CAM_START.fy;
    applyCam();
  }

  /* ════════════════════════════════════════════════════════════════════════
     THE STILL STATE  (< 768px, and prefers-reduced-motion)
     SLICE A STUB. It shows the masthead and nothing else — which is a real
     still state for the three sentences the scene has so far, and, more to the
     point, means the page is never broken on a phone mid-phase. Slice D builds
     the per-station cards.
     ════════════════════════════════════════════════════════════════════════ */

  function buildStill(_reduced: boolean): () => void {
    const frag = doc.createDocumentFragment();

    const wrap = doc.createElement("div");
    wrap.className = "trn-still-title";
    const k = doc.createElement("p");
    k.className = "agt-kicker";
    const num = doc.createElement("span");
    num.className = "agt-kicker-num";
    num.textContent = TITLE_NUM;
    k.append(num, doc.createTextNode(` · ${TITLE_NAME}`));
    const h = doc.createElement("p");
    h.className = "trn-still-head";
    h.textContent = TITLE_HEAD;
    const s = doc.createElement("p");
    s.className = "edt-still-sub";
    s.textContent = TITLE_SUB;
    wrap.append(k, h, s);
    frag.appendChild(wrap);

    still.replaceChildren(frag);
    still.hidden = false;
    pin.hidden = true;
    /* No scrub means no station 5 dwell, so there is no moment at which the
       switch is live — and a button in the tab order over a hidden stage is a
       focus stop that goes nowhere. */
    toggle.hidden = true;

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

    /* The scene materialises on the way in, on its own trigger — the pin's
       timeline does not start until the section is already at the top. */
    gsap.fromTo(
      pin,
      { opacity: 0 },
      {
        opacity: 1,
        ease: "none",
        scrollTrigger: { trigger: section, start: "top 85%", end: "top 12%", scrub: true },
      },
    );

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      /* Two position-derived renders per frame and nothing else: the camera's
         transform, and whether the reader is allowed to touch the switch. */
      onUpdate: () => {
        applyCam();
        syncArm(tl.time());
      },
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: `+=${EDIT_PIN_VH}%`,
        pin,
        pinSpacing: true,
        anticipatePin: 1,
        scrub: SCRUB,
        /* false, deliberately, same as scenes 2–4: every tween here is an
           explicit-constant fromTo in viewBox units, so invalidation re-parses
           the same numbers at the cost of a full re-init. */
        invalidateOnRefresh: false,
      },
    });

    /* ── the four helpers every beat is built from ─────────────────────── */

    function ft(t: gsap.TweenTarget, from: gsap.TweenVars, to: gsap.TweenVars, at: number): void {
      tl.fromTo(t, from, { ...to, immediateRender: false }, at);
    }
    const fadeIn = (t: gsap.TweenTarget, at: number, dur = 1.0, stagger = 0): void =>
      ft(t, { opacity: 0 }, { opacity: 1, duration: dur, stagger }, at);
    const fadeOut = (t: gsap.TweenTarget, at: number, dur = 1.0): void =>
      ft(t, { opacity: 1 }, { opacity: 0, duration: dur }, at);
    const draw = (t: gsap.TweenTarget, at: number, dur: number, stagger = 0): void =>
      ft(
        t,
        { drawSVG: "0% 0%" },
        { drawSVG: "0% 100%", duration: dur, stagger, ease: "power2.out" },
        at,
      );
    /** A box: outline traced, fill brought up behind it at the halfway mark. */
    const drawBox = (t: gsap.TweenTarget, at: number, dur: number, stagger = 0): void => {
      draw(t, at, dur, stagger);
      ft(t, { fillOpacity: 0 }, { fillOpacity: 1, duration: dur * 0.8, stagger }, at + dur * 0.45);
    };

    /* ── the camera ─────────────────────────────────────────────────────── */
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

    /* ── the rail column ────────────────────────────────────────────────── */
    ft(progressFill, { scaleY: 0 }, { scaleY: 1, duration: SLICE_END }, 0);

    caps.forEach((capEl, i) => {
      const at = CAP_AT[i]!;
      const next = CAP_AT[i + 1];
      ft(
        capEl,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: CAP_FADE, ease: "power2.out" },
        at,
      );
      if (next !== undefined) {
        ft(
          capEl,
          { opacity: 1, y: 0 },
          { opacity: 0, y: -10, duration: CAP_FADE, ease: "power2.in" },
          next - CAP_FADE,
        );
      }
    });

    /* The clock. One reading at a time, crossfaded in place — never a text
       rewritten on a frame, which would be a .call() in a scrubbed range. */
    clockEls.forEach((el, i) => {
      const at = CLOCK[i]!.at;
      const next = CLOCK[i + 1]?.at;
      fadeIn(el, at, CLOCK_FADE);
      if (next !== undefined) fadeOut(el, next - CLOCK_FADE, CLOCK_FADE);
    });

    /* ── the version rail (frame furniture, drawn at entry) ─────────────── */
    draw(railLine, 0.6, 1.4);
    draw(railOriginTick, 1.6, 0.5);
    /* The version the story was already standing on gets its notch with the
       rail itself: it is not an event, it is the origin. v7's notch is earned
       at station 4, when the customer's Save actually commits. */
    draw(notchV6, 1.7, 0.5);
    fadeIn(railOriginLbl, 1.8, 0.9);

    /* Each stamp lands as its station earns it: the tick first — the rail is
       a timeline and a tick is the event — then the word for it. */
    for (const s of stamps) {
      if (!s) continue;
      draw(s.tick, s.at, 0.5);
      if (s.mark) draw(s.mark, s.at + 0.2, 0.6);
      fadeIn(s.label, s.at + 0.3, 0.9);
    }

    /* ══════════════════════════════════════════════════════════════════════
       STATION 1 — THE DIFF   (2 → 18)
       ══════════════════════════════════════════════════════════════════════ */

    const S1 = STATION_AT[0];

    drawBox(panel, S1 + 0.4, 2.2);
    fadeIn(fileLbl, S1 + 2.2, 1.0);
    draw(panelRule, S1 + 2.6, 1.0);

    /* The file arrives as a file: six numbers and six lines together, top to
       bottom, at a reading pace. Line 4 comes in carrying the OLD text — the
       thing about to be edited has to be on screen long enough to be read, or
       the edit is a line appearing rather than a line changing. */
    const bodyRows: SVGTextElement[] = lines.map((l, i) => (i === EDIT_LINE ? lineOld : l));
    fadeIn(nums, S1 + 3.2, 1.0, 0.5);
    fadeIn(bodyRows, S1 + 3.2, 1.0, 0.5);

    /* The caret walks the line it is about to change, left to right, and stops
       on its last glyph: an insertion point is a PLACE, and a caret that
       stopped anywhere else would be pointing at a change that did not happen
       there. */
    fadeIn(caret, S1 + 7.4, 0.5);
    ft(
      caret,
      { x: LINE_X + 4 },
      {
        x: LINE_X + monoWidth(PROMPT_OLD, LINE_SIZE),
        duration: 2.2,
        ease: "power1.inOut",
      },
      S1 + 7.9,
    );

    /* The swap. The old line goes, the new one takes its place — one crossfade
       in one position, because it is one line of one file. */
    const SWAP = S1 + 10.3;
    fadeOut(lineOld, SWAP, 0.7);
    fadeIn(lines[EDIT_LINE]!, SWAP + 0.2, 0.9);
    fadeOut(caret, S1 + 11.4, 0.6);

    /* And the new line LIFTS OFF. The chip appears exactly on the line —
       same left edge, same baseline — and rises to the road it will travel
       for the rest of the scene, so the reader watches a line of a file
       become a thing in flight rather than a card arriving from off-stage. */
    const LIFT = S1 + 11.8;
    /* The card is TRACED rather than faded in, like every other box on this
       page: a chip that appeared whole would be a thing arriving, and this one
       is a thing being made out of a line that was already there. */
    drawBox(chipBody, LIFT, 0.8);
    fadeIn(chipLine, LIFT + 0.4, 0.7);
    ft(
      chip,
      { x: LINE_X + CHIP_W / 2, y: lineY(EDIT_LINE) },
      { x: bayCx(0), y: CHIP_LANE_Y, duration: 2.6, ease: "power2.out" },
      LIFT,
    );

    /* ══════════════════════════════════════════════════════════════════════
       STATION 2 — JUDGED EVALS   (18 → 38)
       ══════════════════════════════════════════════════════════════════════ */

    const S2 = STATION_AT[1];

    /* The chip crosses to the next bay at the camera's own pace: they leave
       together and arrive together, so the pan reads as following the chip
       rather than as the stage sliding underneath it. */
    ft(chip, { x: bayCx(0) }, { x: bayCx(1), duration: 3.0, ease: "power2.inOut" }, S2);

    fadeIn(bench, S2 + 0.8, 1.0);
    /* The tally arrives with the header it belongs to, reading 0 — the run
       has started and nothing has been graded. */
    fadeIn([tallyCol, tallyDen], S2 + 1.0, 1.0);
    drawBox(scnRects, S2 + 2.0, 1.4, 1.0);
    fadeIn(scnTitles, S2 + 2.6, 0.9, 1.0);
    draw(scnBoxes, S2 + 2.4, 0.7, 1.0);

    /* WHEN EACH SCENARIO IS SETTLED, written once. Three beats read it: the
       tick that lands on the card, the result line under it, and the tally in
       the header — so a re-timed scenario cannot leave the header counting a
       verdict the reader has not been shown. */
    const RESULT_AT: readonly number[] = [S2 + 6.3, S2 + 7.7, S2 + 15.6];

    /* The two the trace settles. The tick lands WITH the result line and not
       before it: the mark is the consequence of the evidence, and a tick drawn
       first would be a verdict looking for a reason. */
    [0, 1].forEach((i) => {
      fadeIn(scnLines[i]!, RESULT_AT[i]! - 0.3, 0.9);
      draw(scnTicks[i]!, RESULT_AT[i]!, 0.7);
    });

    /* And the count climbs one cell per settled scenario. A column behind an
       aperture, never a rewritten string: 0 → 1 → 2 → 3, and scrolling back up
       counts down again for free. */
    RESULT_AT.forEach((at, i) => {
      ft(
        tallyCol,
        { y: (SCENARIOS.length - i) * TALLY_PITCH },
        { y: (SCENARIOS.length - i - 1) * TALLY_PITCH, duration: 0.5, ease: "power2.out" },
        at,
      );
    });

    /* The third cannot be settled that way, so a second instrument arrives. */
    const JUDGE_AT = S2 + 9.0;
    drawBox(judge, JUDGE_AT, 1.6);
    fadeIn([judgeTitle, judgeRubric], JUDGE_AT + 1.0, 0.9, 0.25);
    fadeIn(scoreDen, JUDGE_AT + 1.6, 0.8);

    /* THE ROLL. The wheel turns up to 4 and stops. Under power2.out it settles
       rather than lands — a number that snapped would read as a lookup, and
       this one was arrived at. */
    ft(
      scoreCol,
      { y: SCORE_VALUE * SCORE_PITCH },
      { y: 0, duration: 1.9, ease: "power2.out" },
      S2 + 11.4,
    );

    /* ONLY THEN the bar it has to clear, and only then the mark. This order is
       the argument: the model supplied a number, and the code is what compares
       it to `min` and decides. */
    draw(thresh, S2 + 13.8, 0.9);
    fadeIn(threshLbl, S2 + 14.2, 0.8);
    draw(judgeTick, S2 + 15.2, 0.7);
    fadeIn(judgeVerdict, S2 + 15.4, 0.9);
    fadeIn(scnLines[2]!, RESULT_AT[2]! - 0.2, 0.9);
    draw(scnTicks[2]!, RESULT_AT[2]!, 0.7);

    /* ══════════════════════════════════════════════════════════════════════
       STATION 3 — THE CI GATE   (38 → 62)
       ══════════════════════════════════════════════════════════════════════ */

    const S3 = STATION_AT[2];

    ft(chip, { x: bayCx(1) }, { x: CHIP_GATE_STOP, duration: 2.8, ease: "power2.inOut" }, S3);

    draw(lane, S3 + 0.4, 1.4);
    /* The bar draws SHUT. It is the resting state of a gate — a turnstile the
       reader arrives at is already closed — and it is what the failing run
       leaves standing. */
    draw(gate, S3 + 1.2, 1.0);
    fadeIn(jambs, S3 + 1.8, 0.8, 0.12);

    /* The chip stops being a line and becomes a commit: same card, same size,
       the lettering crossfaded. One object, one journey. */
    fadeOut(chipLine, S3 + 2.0, 1.2);
    fadeIn(chipCommit, S3 + 2.3, 1.2);

    /* The required check. */
    draw(checkRule, S3 + 3.0, 1.0);
    fadeIn(checkLbl, S3 + 3.4, 0.9);
    draw(checkBoxes, S3 + 3.8, 0.7, 0.3);
    fadeIn(statuses[0]!, S3 + 4.4, 0.9);

    /* Run one. Two pass — and then the mark that does not. The failure is the
       gray ladder plus a struck cross, never a red fill: green is rationed to
       three uses on this site and CI is not one of them, so a red introduced
       for one frame would be a fourth accent (BRAND §2). */
    draw(checkTicks[0]!, S3 + 5.4, 0.7);
    draw(checkTicks[1]!, S3 + 6.2, 0.7);
    draw(failCross, S3 + 7.2, 0.6, 0.15);
    fadeOut(statuses[0]!, S3 + 7.8, 0.8);
    fadeIn(statuses[1]!, S3 + 8.0, 0.8);

    /* The bar does not move, so the commit does. It is pushed back off the
       gate — the whole claim of this station in one gesture. */
    ft(
      chip,
      { x: CHIP_GATE_STOP },
      { x: CHIP_GATE_BACK, duration: 1.3, ease: "power2.out" },
      S3 + 8.2,
    );

    /* And what the run caught falls into the frame's margin, on paper, and
       STAYS there for the rest of the scene. It is the one piece of evidence
       this scene produces that a reader who stops scrolling should still be
       able to read. */
    drawBox(tktBody, S3 + 9.0, 1.2);
    ft(ticket, { opacity: 0 }, { opacity: 1, duration: 1.2 }, S3 + 9.0);

    /* Run two, on the fixed prompt. The cross un-draws before the tick is
       drawn — the mark is corrected, not overwritten. */
    ft(failCross, { drawSVG: "0% 100%" }, { drawSVG: "0% 0%", duration: 0.5 }, S3 + 10.8);
    draw(checkTicks[2]!, S3 + 11.0, 0.7);
    fadeOut(statuses[1]!, S3 + 11.6, 0.8);
    fadeIn(statuses[2]!, S3 + 11.8, 0.8);

    /* The bar clears — a retraction into its own middle between the two jambs
       that stay, which is this site's gate vocabulary (scene 2's meter and its
       workflow gate). 0.3 units under power3.out is a SNAP: a check going
       green does not ease. */
    ft(gate, { drawSVG: "0% 100%" }, { drawSVG: "50% 50%", duration: 0.3, ease: "power3.out" }, S3 + 12.8);
    ft(
      chip,
      { x: CHIP_GATE_BACK },
      { x: CHIP_GATE_THROUGH, duration: 2.2, ease: "power2.inOut" },
      S3 + 13.0,
    );

    /* ══════════════════════════════════════════════════════════════════════
       STATION 4 — THE PRE-SAVE CHECK   (62 → 78)
       ══════════════════════════════════════════════════════════════════════ */

    const S4 = STATION_AT[3]!;

    /* The chip crosses to the customer's own dashboard and then DESCENDS into
       the prompt field. It is the first time in the scene the chip leaves its
       road, and it is the right time: this station is the one where the thing
       that travels stops being ours and becomes a customer's. */
    ft(chip, { x: CHIP_GATE_THROUGH }, { x: FIELD_CX, duration: 3.0, ease: "power2.inOut" }, S4);

    drawBox(dash, S4 + 0.6, 2.2);
    fadeIn(dashLbl, S4 + 2.2, 1.0);
    draw(dashRule, S4 + 2.4, 1.0);
    drawBox(field, S4 + 2.6, 1.4);
    fadeIn(fieldLbl, S4 + 2.8, 0.9);
    drawBox(btnRects, S4 + 4.0, 0.9, 0.25);
    fadeIn(btnLbls, S4 + 4.6, 0.8, 0.25);

    ft(chip, { y: CHIP_LANE_Y }, { y: FIELD_CY, duration: 1.4, ease: "power2.out" }, S4 + 5.0);

    /* The press. 0.96 and back, in the site's own :active gesture — the only
       reason it is a tween here rather than a CSS transition is that nobody
       is pressing it; the reader is watching a press happen. */
    ft(
      btnRects[2]!,
      { scale: 1 },
      { scale: 0.96, duration: 0.25, ease: "power2.out", svgOrigin: `${BTN_BOXES[2]![0] + BTN_BOXES[2]![1] / 2} ${BTN_Y + BTN_H / 2}` },
      S4 + 6.6,
    );
    ft(
      btnRects[2]!,
      { scale: 0.96 },
      { scale: 1, duration: 0.3, ease: "power2.out", svgOrigin: `${BTN_BOXES[2]![0] + BTN_BOXES[2]![1] / 2} ${BTN_Y + BTN_H / 2}` },
      S4 + 6.85,
    );
    draw(saveWire, S4 + 7.0, 0.8);

    /* And the panel UNFOLDS: it is traced like every box on this page, and it
       also grows 6% out of its own top edge, which is the difference between
       a card arriving and a drawer opening. */
    drawBox(chkPanel, S4 + 7.6, 1.6);
    ft(
      chkPanel,
      { scaleY: 0.94 },
      { scaleY: 1, duration: 1.4, ease: "power2.out", svgOrigin: `${CHK_X + CHK_W / 2} ${CHK_Y}` },
      S4 + 7.6,
    );
    fadeIn(chkTitle, S4 + 8.6, 0.8);
    fadeIn(chkRun, S4 + 9.0, 0.8);

    /* THE DETAIL THAT MATTERS. Everything the customer could touch goes dark
       — and `save anyway` arrives at full ink and stays there for the whole
       run. The check warns; it never blocks; and this is that sentence with
       no sentence in it. */
    const dimSet: SVGElement[] = [...btnRects, ...btnLbls, field, fieldLbl, dashLbl];
    ft(dimSet, { opacity: 1 }, { opacity: DIM_TO, duration: 1.2 }, S4 + 8.8);
    drawBox(anywayRect, S4 + 9.6, 0.9);
    fadeIn(anywayLbl, S4 + 10.0, 0.8);

    fadeIn(chkRows, S4 + 10.2, 0.8, 0.9);
    fadeIn(chkVerdict, S4 + 12.8, 0.9);
    /* The save commits: the rail takes a version notch, and the panel's
       controls come back up. The check panel STAYS — it is evidence, and the
       reader who scrolls back should find it exactly where it was. */
    draw(notchV7, S4 + 13.4, 0.6);
    ft(dimSet, { opacity: DIM_TO }, { opacity: 1, duration: 1.2 }, S4 + 13.4);
    ft(chip, { y: FIELD_CY }, { y: CHIP_LANE_Y, duration: 1.6, ease: "power2.inOut" }, S4 + 14.0);

    /* ══════════════════════════════════════════════════════════════════════
       STATION 5 — VERSIONING + CANARY   (78 → 98)
       ══════════════════════════════════════════════════════════════════════ */

    const S5 = STATION_AT[4]!;

    ft(chip, { x: FIELD_CX }, { x: bayCx(4), duration: 3.0, ease: "power2.inOut" }, S5);

    draw(cnIn, S5 + 0.6, 1.2);
    drawBox(swBox, S5 + 1.2, 1.0);
    fadeIn(swRead, S5 + 1.8, 0.8);
    draw([cnUp, cnDn], S5 + 1.6, 1.0, 0.2);
    /* The bands come up as fills. They are quantities, not boxes, so they do
       not get an outline traced — a band that drew itself would be a third
       kind of object arriving where there are only two lanes. */
    ft(bandA, { fillOpacity: 0 }, { fillOpacity: 1, duration: 1.2 }, S5 + 2.0);
    ft(bandB, { fillOpacity: 0 }, { fillOpacity: 1, duration: 1.2 }, S5 + 2.2);
    fadeIn(laneALbl, S5 + 2.4, 0.8);
    fadeIn(laneBLbl, S5 + 2.6, 0.8);

    /* Thirty conversations, in arrival order, one every 0.11 units. */
    ft(
      cnEntry,
      { x: -40, opacity: 0 },
      { x: 0, opacity: 1, duration: 1.0, stagger: 0.11, ease: "power2.out" },
      S5 + 4.0,
    );
    /* And three of them peel, each a beat after its OWN arrival rather than
       all three together: a switch acts on one conversation at a time. */
    CN_ALWAYS_B.forEach((k, j) => {
      ft(
        cnPeelScrub[j]!,
        { y: -CN_PEEL_DY },
        { y: 0, duration: 0.8, ease: "power2.out" },
        S5 + 4.0 + k * 0.11 + 0.25,
      );
    });

    ft(cntRoll, { y: CNT_PITCH }, { y: 0, duration: 1.6, ease: "power2.out" }, S5 + 8.2);
    fadeIn(cntDen, S5 + 8.6, 0.8);
    fadeIn(cntCap, S5 + 9.0, 0.8);

    /* BOTH ARMS, JUDGED. Two marks and two bars, side by side, because an
       unjudged control arm is not a control — the whole reason A5 grades the
       old version as well as the new one. */
    draw(jmBoxes, S5 + 9.4, 0.7, 0.3);
    draw(jmTicks, S5 + 9.8, 0.7, 0.3);
    draw(bars, S5 + 9.8, 1.2, 0.4);
    fadeIn(barLbls, S5 + 10.2, 0.8, 0.4);
    fadeIn(judgedEach, S5 + 11.2, 0.8);

    /* ── the beat settles here; TOGGLE_FROM is this moment ────────────────
       From S5 + 12 until the camera leaves, the switch belongs to the reader.
       Everything below this line is drawn or crossfaded and touches NOTHING
       the hand owns, which is why promote can play at 50% and still be true. */

    draw(merge, S5 + 15.0, 1.4);
    fadeOut(laneALbl, S5 + 15.2, 0.8);
    fadeIn(laneALbl2, S5 + 15.6, 0.9);
    fadeOut(laneBLbl, S5 + 15.4, 0.8);
    fadeIn(laneBLbl2, S5 + 15.8, 0.9);
    /* The old arm retires: its lane dims, and so does its notch on the rail.
       The rail is the flight recorder, so a version going out of service has
       to be legible there too. */
    ft(bandA, { fillOpacity: 1 }, { fillOpacity: 0.35, duration: 1.2 }, S5 + 15.6);
    ft(
      [railOriginTick, railOriginLbl, notchV6],
      { opacity: 1 },
      { opacity: 0.4, duration: 1.2 },
      S5 + 15.6,
    );

    /* ══════════════════════════════════════════════════════════════════════
       STATION 6 — MODEL ROUTING   (98 → 114)
       ══════════════════════════════════════════════════════════════════════ */

    const S6 = STATION_AT[5]!;

    ft(chip, { x: bayCx(4) }, { x: bayCx(5), duration: 3.0, ease: "power2.inOut" }, S6);

    draw(rtIn, S6 + 0.6, 1.0);
    drawBox(bigChip, S6 + 1.0, 1.2);
    fadeIn(bigLbl, S6 + 1.8, 0.8);
    drawBox(smallChip, S6 + 1.4, 1.0);
    fadeIn(smallLbl, S6 + 2.0, 0.8);
    draw([rtUp, rtDn], S6 + 2.2, 1.0, 0.2);

    /* Turn 1 goes to the cheap model and is answered. */
    drawBox(rmsgBody, S6 + 3.4, 0.8);
    fadeIn(rmsgT1, S6 + 3.8, 0.7);
    ft(
      rmsg,
      { x: RMSG_START[0], y: RMSG_START[1] },
      { x: RMSG_SMALL[0], y: RMSG_SMALL[1], duration: 1.6, ease: "power2.inOut" },
      S6 + 4.6,
    );
    fadeIn(tickLbl, S6 + 6.4, 0.8);
    fadeIn(tickReads.slice(0, 3), S6 + 6.8, 0.7, 0.7);

    /* Turn 2, same thread, same body, different words. */
    fadeOut(rmsgT1, S6 + 9.0, 0.8);
    fadeIn(rmsgT2, S6 + 9.3, 0.8);
    /* The cheap model reaches for the refund tool and meets the rule. */
    draw(reachSm, S6 + 10.2, 1.0);
    draw(barrier, S6 + 11.2, 0.6);
    fadeIn(barrierJambs, S6 + 11.4, 0.6, 0.12);
    fadeIn(barrierLbl, S6 + 11.8, 0.8);
    /* And the ticker stalls: a fourth reading arrives and it is a dash. */
    fadeIn(tickReads[3]!, S6 + 12.4, 0.8);

    /* The turn RISES. Escalation is law, not judgment — so it is a move the
       reader watches happen to the turn, not a decision drawn inside a box. */
    ft(
      rmsg,
      { x: RMSG_SMALL[0], y: RMSG_SMALL[1] },
      { x: RMSG_BIG[0], y: RMSG_BIG[1], duration: 1.8, ease: "power2.inOut" },
      S6 + 13.0,
    );
    drawBox(tool, S6 + 14.0, 1.0);
    draw(reachBg, S6 + 14.2, 1.2);
    fadeIn(toolLbl, S6 + 14.6, 0.8);
    fadeIn(toolDone, S6 + 15.0, 0.8);

    /* ══════════════════════════════════════════════════════════════════════
       STATION 7 — TWO GATES   (114 → 132)
       ══════════════════════════════════════════════════════════════════════ */

    const S7 = STATION_AT[6]!;

    ft(chip, { x: bayCx(5) }, { x: bayCx(6), duration: 3.0, ease: "power2.inOut" }, S7);

    draw(gbWall, S7 + 0.6, 1.8);
    ft(gbFill, { fillOpacity: 0 }, { fillOpacity: 1, duration: 1.2 }, S7 + 1.4);
    draw(doorJambs, S7 + 2.0, 0.6, 0.12);
    fadeIn(gbLbl, S7 + 2.2, 0.8);
    fadeIn(gbRows, S7 + 2.4, 0.8, 0.3);
    draw([gtIn, gtOut], S7 + 2.6, 1.2, 0.3);

    /* An order question passes straight through the left door. */
    drawBox(askBody, S7 + 3.8, 0.8);
    ft(ask, { opacity: 0 }, { opacity: 1, duration: 0.6 }, S7 + 3.8);
    fadeIn(askT, S7 + 4.2, 0.7);
    ft(ask, { x: ASK_START }, { x: GB_CX, duration: 1.6, ease: "power2.inOut" }, S7 + 4.8);

    /* Homework knocks and stops. The nudge is the knock — 8u out and back, a
       thing arriving at a door that does not open. */
    drawBox(knockBody, S7 + 6.6, 0.8);
    fadeIn(knockT, S7 + 7.0, 0.7);
    ft(knock, { x: KNOCK_AT }, { x: KNOCK_AT + 8, duration: 0.4, ease: "power2.out" }, S7 + 7.8);
    ft(knock, { x: KNOCK_AT + 8 }, { x: KNOCK_AT, duration: 0.5, ease: "power2.out" }, S7 + 8.2);

    /* Two boxes and a wall between them. The classifier stamps a TOPIC and
       nothing else; the policy stamps the verdict; the classifier is never
       told what the policy says. */
    drawBox(clsCard, S7 + 8.4, 1.0);
    fadeIn(clsTitle, S7 + 9.0, 0.7);
    fadeIn(clsStamp, S7 + 9.5, 0.7);
    drawBox(polCard, S7 + 9.2, 1.0);
    fadeIn(polTitle, S7 + 9.8, 0.7);
    fadeIn(polStamp, S7 + 10.3, 0.7);
    draw(nx, S7 + 10.2, 0.8);
    fadeIn(nxLbl, S7 + 10.6, 0.7);

    /* And the decline goes back under the door. */
    drawBox(noteBody, S7 + 11.0, 0.8);
    fadeIn(noteT, S7 + 11.4, 0.7);
    ft(note, { x: NOTE_FROM }, { x: NOTE_TO, duration: 1.2, ease: "power2.out" }, S7 + 11.4);

    /* The question was answered, so the question goes and the draft arrives. */
    fadeOut(ask, S7 + 12.6, 0.8);
    drawBox(replyBody, S7 + 13.0, 0.8);
    fadeIn([replyPrefix, ...replyRuns], S7 + 13.4, 0.7, 0.08);
    ft(reply, { x: REPLY_DRAFT_X }, { x: REPLY_DOOR_X, duration: 1.2, ease: "power2.inOut" }, S7 + 13.8);

    /* THE REDACTION, BLOCK BY BLOCK. Each bar comes down and the digits under
       it go out a beat later, so the reader sees the bar LAND on something
       rather than replace something that had already gone. */
    REPLY_RUNS.forEach((_r, i) => {
      const at = S7 + 15.0 + i * 0.4;
      fadeIn(redacts[i]!, at, 0.45);
      fadeOut(replyRuns[i]!, at + 0.1, 0.35);
    });
    /* And the fallback ships: the same reply, minus what it may never say. */
    ft(reply, { x: REPLY_DOOR_X }, { x: REPLY_OUT_X, duration: 1.1, ease: "power2.inOut" }, S7 + 16.2);
    fadeIn(gtReceipt, S7 + 16.8, 0.8);

    /* ══════════════════════════════════════════════════════════════════════
       STATION 8 — PER-CUSTOMER LIMITS   (132 → 148, held from 142)
       ══════════════════════════════════════════════════════════════════════ */

    const S8 = STATION_AT[7]!;

    ft(chip, { x: bayCx(6) }, { x: bayCx(7), duration: 3.0, ease: "power2.inOut" }, S8);

    draw(laneRules, S8 + 0.4, 0.8, 0.2);
    fadeIn(laneLabels, S8 + 1.0, 0.7, 0.2);

    /* Four customers get a reply and a receipt. THE ONLY GREEN IN EIGHT
       STATIONS is on those four words. */
    ft(
      replyDots,
      { x: -160, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.9, stagger: 0.2, ease: "power2.out" },
      S8 + 2.2,
    );
    fadeIn(delivereds, S8 + 3.2, 0.7, 0.2);

    /* The fifth floods. */
    fadeIn(floodDots, S8 + 2.8, 0.7, 0.08);
    draw(valve, S8 + 4.4, 0.6);
    draw(valveJambs, S8 + 4.9, 0.4, 0.1);
    /* THE ONLY AMBER IN EIGHT STATIONS, drawn over the closed gray valve
       rather than tweened from it: the valve shuts, and then it is in
       backoff. */
    draw(valveAmber, S8 + 5.1, 0.6);
    /* And the burst queues. A queue is a SPACING — the same nine messages,
       bunched — which is why every one of them has its own tween and its own
       distance to close. */
    floodDots.forEach((d, i) => {
      ft(d, { x: floodSpreadDx(i) }, { x: 0, duration: 1.0, ease: "power2.out" }, S8 + 5.4 + i * 0.05);
    });

    /* One notice, once, back to the customer who caused it. Not a delivery —
       so not green, and not a receipt. */
    drawBox(noticeBody, S8 + 6.2, 0.8);
    fadeIn(noticeT, S8 + 6.6, 0.7);
    ft(notice, { x: NOTICE_FROM }, { x: NOTICE_TO, duration: 1.4, ease: "power2.out" }, S8 + 6.6);

    /* THE GHOST OF THE ALTERNATIVE. A strike across all five lanes, and then
       it is not there: the budget breaker mutes everyone, and this does not.
       It is drawn and then UN-drawn, like the CI gate's failure mark, so a
       reader scrolling back watches it arrive again in the same order. */
    draw(ghost, S8 + 6.8, 0.8);
    fadeIn(ghostLbl, S8 + 7.1, 0.6);
    ft(ghost, { drawSVG: "0% 100%" }, { drawSVG: "0% 0%", duration: 0.8 }, S8 + 9.0);
    fadeOut(ghostLbl, S8 + 9.0, 0.8);

    /* The slice ends with the chip standing over five lanes, one of them
       throttled, and the rail carrying eight stamps. Nothing arrives or
       leaves after SLICE_HOLD_FROM — the reader is meant to be able to stop
       here and read the frame. Slice C prints it. */
  }

  /* ════════════════════════════════════════════════════════════════════════
     THE POINTER'S WIRING
     Split out of buildScrub the way agents.ts splits wireTicket: the scrub is
     one media query and the hand is another, and the two must be able to
     exist without each other.
     ════════════════════════════════════════════════════════════════════════ */

  function wireToggle(): () => void {
    const onClick = (): void => setFlip(!flipped);
    const onResize = (): void => {
      if (armed) placeToggle();
    };
    toggle.addEventListener("click", onClick);
    /* The svg is laid out at 100% of a grid cell, so a window resize moves
       the switch under the button. Observe the drawing, not the window: a
       pin spacer landing is a layout change with no resize event. */
    const ro = new ResizeObserver(onResize);
    ro.observe(svg);
    return () => {
      toggle.removeEventListener("click", onClick);
      ro.disconnect();
    };
  }

  /** Hover is its own regime again (DESIGN §5: gated on a fine pointer, so a
   *  tap never leaves a stuck hover state). The switch leans up 6% and its
   *  whisper comes to full — the ticket's `tear here` idiom, one scene on. */
  function wireToggleHover(): () => void {
    const origin = `${SW_BOX_X + SW_BOX_W / 2} ${SW_BOX_Y + SW_BOX_H / 2}`;
    const on = (): void => {
      if (!armed) return;
      gsap.to(swBox, { scale: 1.06, duration: HOVER_DUR, ease: "power2.out", svgOrigin: origin });
      gsap.to(swHint, { opacity: 1, duration: HOVER_DUR, ease: "power2.out" });
    };
    const off = (): void => {
      gsap.to(swBox, { scale: 1, duration: HOVER_DUR, ease: "power2.out", svgOrigin: origin });
      gsap.to(swHint, { opacity: armed ? 0.5 : 0, duration: HOVER_DUR, ease: "power2.out" });
    };
    toggle.addEventListener("pointerenter", on);
    toggle.addEventListener("pointerleave", off);
    toggle.addEventListener("focus", on);
    toggle.addEventListener("blur", off);
    return () => {
      toggle.removeEventListener("pointerenter", on);
      toggle.removeEventListener("pointerleave", off);
      toggle.removeEventListener("focus", on);
      toggle.removeEventListener("blur", off);
    };
  }

  /* ════════════════════════════════════════════════════════════════════════
     MEDIA GATING
     One matchMedia owns the choice, exactly as scenes 2–4 do.
     ════════════════════════════════════════════════════════════════════════ */

  const mm = gsap.matchMedia();

  mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
    buildScrub();
    /* The click half is NOT gated on a fine pointer: a tablet in this band
       gets the scrub, and a tap on a real <button> is a click. Only the hover
       half below needs the gate. */
    return wireToggle();
  });

  mm.add(
    "(min-width: 768px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    () => wireToggleHover(),
  );

  mm.add("(max-width: 767.98px) and (prefers-reduced-motion: no-preference)", () =>
    buildStill(false),
  );

  mm.add("(prefers-reduced-motion: reduce)", () => buildStill(true));

  function destroy(): void {
    mm.revert();
  }

  return { destroy };
}
