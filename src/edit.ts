/* ══════════════════════════════════════════════════════════════════════════
   SCENE 5 — THE EDIT
   ──────────────────────────────────────────────────────────────────────────
   One prompt edit, told as a journey. The quality ladder is not a list of
   features on this page; it is eight stations that ONE object travels
   through, and the reader watches it survive each one.

   SLICE A builds the skeleton and the first three stations:

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

   Stations 4–8 and the landing receipt are slice B and C. Their timeline
   positions are already authored below (STATION_AT, LANDING_AT, TL_END), so
   nothing in this file has to be re-timed when they land: the only constant
   that moves is SLICE_END.

   THE THREE PERSISTENT DEVICES, and why each one is where it is:

     · THE VERSION RAIL is FRAME FURNITURE, not world. It is the flight
       recorder for the whole journey — a hairline across the top of the stage
       that each station stamps as the chip passes it — so it must not travel
       with the camera. All eight stamp positions are authored now and the
       label widths of all eight are asserted at boot; slice B only fills in
       the `at` of the six that are still empty.
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

/** Slice A's own held ending, and the end of the scroll this slice reserves.
 *  SLICE_END is deliberately STATION_AT[3] — the slice hands over on exactly
 *  the unit station 4 will start on, so slice B appends and re-times nothing. */
const SLICE_HOLD_FROM = 54;
const SLICE_END = STATION_AT[3];

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
  { label: "saved · v7", mark: false, at: null }, // station 4 (slice B)
  { label: "canary 10%", mark: false, at: null }, // station 5 (slice B)
  { label: "promoted", mark: true, at: null }, // station 5 (slice B)
  { label: "routed", mark: false, at: null }, // station 6 (slice B)
  { label: "gated", mark: true, at: null }, // station 7 (slice B)
  { label: "throttled 1", mark: false, at: null }, // station 8 (slice B)
];
/** Even pitch across the rail, so the recorder reads as a clock rather than
 *  as eight labels that happened to fit. */
const RAIL_PITCH = (RAIL_X1 - RAIL_X0) / STAMPS.length;
const stampX = (i: number): number => RAIL_X0 + (i + 0.5) * RAIL_PITCH;

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
const CAP_AT: readonly number[] = [STATION_AT[0], STATION_AT[1], STATION_AT[2]];
const CAP_FADE = 1.6;

/* ── the clock ─────────────────────────────────────────────────────────────
   Scroll is time. The clock is the only place the scene says so out loud, and
   it says it in the measurement register — a mono timestamp that has moved on
   by the time the chip reaches the next station.

   Slice A's three are minutes apart because they are minutes apart: an edit,
   a suite run, a CI round trip. The later ones stop being clock times and
   become `day 3` / `day 5`, which is the canary's real unit — the mechanism
   is one text per beat, crossfaded, so a beat measured in days costs the same
   as a beat measured in minutes. */
const CLOCK: readonly { at: number; label: string }[] = [
  { at: 1.0, label: "14:02" }, // the edit
  { at: STATION_AT[1], label: "14:03" }, // judged
  { at: STATION_AT[2], label: "14:06" }, // ci
  /* Reserved (slice B): 14:07 · the pre-save check, day 1 · the canary opens,
     day 3 · the arms are compared, day 5 · promoted. */
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
  /* The slice's own contract. SLICE_END has to land ON a station boundary, or
     the slice that appends next has to re-time the beats this one authored —
     which is the single thing this scaffolding exists to prevent. */
  if (SLICE_END !== STATION_AT[3]) {
    throw new Error("[edit] SLICE_END is not the unit station 4 begins on");
  }
  /* And the held ending has to be long enough to be an ending. Scene 4's
     floor: six units is 0.13 of a viewport height with nothing happening. */
  if (SLICE_END - SLICE_HOLD_FROM < 6) {
    throw new Error("[edit] the held ending is too short to be an ending");
  }
  for (let i = 1; i < CAP_AT.length; i++) {
    if (CAP_AT[i]! <= CAP_AT[i - 1]!) throw new Error("[edit] captions are out of order");
  }
  for (let i = 1; i < CLOCK.length; i++) {
    if (CLOCK[i]!.at <= CLOCK[i - 1]!.at) throw new Error("[edit] the clock runs backwards");
  }
  if (CLOCK[CLOCK.length - 1]!.at >= SLICE_END) {
    throw new Error("[edit] a clock reading arrives after the slice has ended");
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
  ];

  /** The boxes whose fill comes up behind their own outline, so a rectangle is
   *  a line before it is a surface (scene 2's drawBox). */
  const boxRects: SVGElement[] = [panel, judge, ...scnRects, chipBody, tktBody];

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

  function restState(): void {
    gsap.set(pin, { opacity: 0 });
    gsap.set(caps, { opacity: 0, y: 10 });
    gsap.set(clockEls, { opacity: 0 });
    gsap.set(progressFill, { scaleY: 0 });

    gsap.set(strokeParts, { drawSVG: "0% 0%" });
    gsap.set(boxRects, { fillOpacity: 0 });
    gsap.set(fadeParts, { opacity: 0 });
    gsap.set(ticket, { opacity: 0 });
    /* The score column's rest is the BOTTOM of the roll — glyph 0 in the
       aperture — which is +SCORE_VALUE cells from where the markup authored
       it. The finished frame is the untransformed one. */
    gsap.set(scoreCol, { y: SCORE_VALUE * SCORE_PITCH });
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
      onUpdate: applyCam,
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
    drawBox(scnRects, S2 + 2.0, 1.4, 1.0);
    fadeIn(scnTitles, S2 + 2.6, 0.9, 1.0);
    draw(scnBoxes, S2 + 2.4, 0.7, 1.0);

    /* The two the trace settles. The tick lands WITH the result line and not
       before it: the mark is the consequence of the evidence, and a tick drawn
       first would be a verdict looking for a reason. */
    [0, 1].forEach((i) => {
      const at = S2 + 6.0 + i * 1.4;
      fadeIn(scnLines[i]!, at, 0.9);
      draw(scnTicks[i]!, at + 0.3, 0.7);
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
    fadeIn(scnLines[2]!, S2 + 15.4, 0.9);
    draw(scnTicks[2]!, S2 + 15.6, 0.7);

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

    /* The slice ends with the commit standing past the gate. Nothing arrives
       or leaves after SLICE_HOLD_FROM — the reader is meant to be able to stop
       here and read the frame. */
  }

  /* ════════════════════════════════════════════════════════════════════════
     MEDIA GATING
     One matchMedia owns the choice, exactly as scenes 2–4 do.
     ════════════════════════════════════════════════════════════════════════ */

  const mm = gsap.matchMedia();

  mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
    buildScrub();
  });

  mm.add("(max-width: 767.98px) and (prefers-reduced-motion: no-preference)", () =>
    buildStill(false),
  );

  mm.add("(prefers-reduced-motion: reduce)", () => buildStill(true));

  function destroy(): void {
    mm.revert();
  }

  return { destroy };
}
