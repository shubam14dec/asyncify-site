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

   SLICE_END was the scaffolding, and it has arrived: it IS TL_END now, so the
   pin reserves the whole 3.5 screens and PIN_HEIGHTS × SLICE_END / TL_END is
   simply PIN_HEIGHTS. Every beat below has sat on its final unit since slice
   A; the only thing that ever moved was where the reader was asked to stop. */
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

/** The scaffolding, at its terminus. Slice A handed over on STATION_AT[3],
 *  slice B on LANDING_AT, and slice C — this one — hands over on TL_END,
 *  which is where the scaffolding stops being scaffolding: the scene's held
 *  ending and the scene's own end are now the same two numbers the file
 *  declares at the top. Every beat A and B authored sits on the unit it
 *  always did; nothing was ever re-timed, which is the whole thing this pair
 *  of constants existed to guarantee. They are kept (rather than deleted)
 *  because the invariant below is what a future edit trips over if anyone
 *  ever tries to end the scene somewhere other than its own timeline. */
const SLICE_HOLD_FROM = HOLD_FROM;
const SLICE_END = TL_END;

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
  /* THE LANDING'S OWN BAY, and it is empty on purpose. Eight stations have
     been read; what is left to say is not another mechanism, it is the
     RECORD — so the camera pans off the last picture onto bare world, the
     chip parks there, and the only thing on the frame is the receipt the rail
     prints of itself. A landing that stayed parked on the throttle lanes
     would print the whole journey's paperwork over one station's picture and
     say that this station was what the journey was about. */
  { at: 148.0, dur: 3.0, z: 1.0, fx: bayCx(8), fy: CAM_FY }, // the landing
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
   labels and eight ticks sharing 1020u either fit or they do not — so slice A
   places all of them and asserts every neighbouring pair clears, and slice B
   fills in the six `at` values it earns. A stamp with `at: null` has no DOM
   and no tween.

   The origin tick at RAIL_X0 is the version the scene starts on. It is not a
   stamp: nothing happened there, it is where the story was already standing. */
const RAIL_Y = 58;
const RAIL_X0 = 30;
const RAIL_X1 = 1050;
/** Half the tick's height, and the label's baseline under the rail. */
const RAIL_TICK_H = 8;
const RAIL_LBL_Y = 88;
/** The rail's lettering, and it is the LOUDEST mono on this stage rather than
 *  the quietest. The recorder is what the scene is about — eight gates one
 *  edit cleared — so it is read at the size a reader reads a heading at, not
 *  at the size a footnote is set in. MUST match `.edt-rail-lbl`'s font-size:
 *  every clearance below is monoWidth() arithmetic off this number, and the
 *  stylesheet is what actually paints it. */
const RAIL_LBL_SIZE = 12.5;
/** The starting version, written under the rail's own origin. */
const RAIL_ORIGIN_LABEL = "v6";
/** Minimum daylight between two neighbouring stamp labels. Below ~12u two
 *  mono strings at this size stop reading as two stamps and start reading as
 *  one long one; 16 is the assert's floor. */
const RAIL_LBL_GAP = 16;

/** The drawn checkmark EVERY stamp carries, in a 14u box sized to the
 *  lettering beside it. The rail never gets a ✓ glyph — it is not in the
 *  self-hosted latin subset, the same trap the star, the block and U+2116 hit
 *  elsewhere on this page — so a tick here is always a drawn path. */
/** The rail's mark is THE CHECK ROW'S mark, exactly (user call: the same
 *  checkbox the ci row ticks — one grammar for "checked off" on this scene).
 *  Side MARK, rx 1, class edt-mark, tick at (+0.5, +0.5), k = 1.
 *  12 IS MARK — written as a literal because MARK is declared further down
 *  with the check row's constants and a forward reference here would TDZ;
 *  the equality is asserted at boot so the two cannot drift. */
const RAIL_MARK = 12;
const RAIL_MARK_GAP = 5;

/* The eight stamps, in the order the chip earns them.

   EVERY ONE OF THEM CARRIES A TICK, and that is the rail's whole claim. The
   first version of this rail ticked only the three stamps whose station was
   literally a pass/fail check, which quietly said the other five were
   book-keeping — a number, a percentage, a count. They are not: a canary that
   opened, a route that held, a flood that was throttled to one message are
   each a gate this edit cleared. Eight stations, eight ticks, one edit. */
const STAMPS: readonly { label: string; at: number | null }[] = [
  { label: "judged 4.6", at: 34.6 }, // station 2 — a score, not a verdict
  { label: "ci · green", at: 52.4 }, // station 3 — the word, never the colour
  { label: "saved · v7", at: 75.4 }, // station 4 — the save commits
  { label: "canary 10%", at: 81.0 }, // station 5 — the canary opens
  { label: "promoted", at: 93.6 }, // station 5 — and closes on evidence
  { label: "routed", at: 112.6 }, // station 6
  { label: "gated", at: 129.8 }, // station 7
  { label: "throttled 1", at: 139.6 }, // station 8
];
/** Where the first stamp stands, and the even pitch after it — so the
 *  recorder reads as a clock rather than as eight labels that happened to fit.
 *
 *  THE RUN IS NO LONGER HALF A PITCH IN FROM THE RAIL'S END, and the reason is
 *  arithmetic rather than taste. At 13.5u lettering with a tick on all eight,
 *  the widest stamp is a ~101u block; half of the old 120u pitch could not
 *  hold half of that plus the origin label plus RAIL_LBL_GAP, so the first
 *  stamp would have sat on top of `v6`. The run is therefore placed
 *  explicitly, centred on the rail (113 + 3.5 × 122 = 540 = the rail's own
 *  mid-point), and both ends are asserted. */
const STAMP_X0 = 113;
const RAIL_PITCH = 122;
const stampX = (i: number): number => STAMP_X0 + i * RAIL_PITCH;

/* ── the version notches ───────────────────────────────────────────────────
   The rail records eight EVENTS but only two VERSIONS, and the difference is
   worth a mark: an event tick crosses the rail, a version notch points UP out
   of it. Two of them — v6 where the story was already standing, v7 where the
   pre-save check let the save commit — and a reader can then find the two
   boundaries in the recorder without being told what a tick is.

   Above the rail is empty frame (the labels hang below at RAIL_LBL_Y), so the
   notch costs nothing and collides with nothing; both facts are asserted. */
const RAIL_NOTCH_TOP = 40;
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

/* Five lanes, one valve, and the whole station is derived from TWELVE
   MESSAGES ARRIVING.

   THE FLOOD IS AN ARRIVAL AND NOT A STATE (the user's note on slice B, and it
   was the right one: a burst that was simply THERE was a diagram of a flood,
   not a flood). Customer 3's messages come in one after another at
   FLOOD_PITCH — 0.22 units apart against the other four lanes' ONE message
   each, so the difference in rate is something the reader counts rather than
   something a caption claims. Five clear the valve, the bar shuts as the
   sixth arrives, and seven stack up behind it.

   EVERY NUMBER PRINTED HERE IS DERIVED FROM THOSE TWELVE, and every one of
   them is asserted against the dots that have actually landed by the moment
   it is printed: the rate counter's three readings, and the ledger's three.
   That is the difference between a scene that reports and a scene that
   decorates — and it is the one kind of error a reviewer cannot catch by
   eye, because a counter reading 12 over eleven dots looks exactly right.

   THE VALVE CARRIES THE PRODUCT'S OWN KNOB. `per-customer limit · 5 / min` is
   the setting a customer sets, and `over limit · held` is what it did. Both
   labels are gray: the amber belongs to the valve, and a second amber object
   would spend a ration eight stations have been saving.

   THE VALVE IS THE SCENE'S ONLY AMBER AND THE FOUR RECEIPTS ARE ITS ONLY
   GREEN. Amber is backoff and green is a message that arrived (BRAND §2), and
   eight stations of gray ladder is exactly what makes those two frames mean
   something. The valve goes amber by having an amber copy of itself drawn
   OVER the closed gray one, so no hex ever leaves the stylesheet.

   THE OTHER FOUR ARE PROVEN, NOT ASSERTED. They send DURING the flood, after
   the bar has shut, and each answer lands with a receipt AND an ordinary
   latency stamp while lane 3 is still queued. The timing is the argument: a
   `delivered` that arrived before the throttle would prove nothing at all,
   which is why the order is checked at boot rather than left to the eye.

   THE GHOST IS THE ARGUMENT, AND IT NOW COSTS THE OTHER FOUR SOMETHING. A
   strike across all five lanes labelled `daily budget · muted` is what the
   other design does — and while it stands, the four green receipts go gray,
   because that is precisely what a shared budget breaker does to four
   customers who did nothing. Then the strike un-draws and the green comes
   back. Drawing the alternative, letting it hurt, and taking it away says
   more than any caption claiming a difference could. */
const LANE_N = 5;
const LANE_Y0 = 286;
const LANE_PITCH = 44;
/** Lane i's latitude. At module scope because the asserts reason about it as
 *  much as the drawing does. */
const laneY8 = (i: number): number => LANE_Y0 + i * LANE_PITCH;
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
/** What an ordinary answer took, one per unaffected lane. Four different
 *  readings, all boring, all around two seconds — the point of the number is
 *  that there is nothing to see in it. */
const LATENCIES: readonly string[] = ["2.1s", "1.8s", "2.3s", "1.9s"];
const LAT_X = 8470;
const LAT_SIZE = 11;
/** What the OTHER design turns those four receipts into, for a beat. */
const MUTED = "muted";
const VALVE_X = 8180;
const VALVE_HALF = 12;

/* ── the twelve ────────────────────────────────────────────────────────── */
const FLOOD_N = 12;
/** The limit, in messages: what gets answered before the bar shuts. It is the
 *  `5` in the valve's own label and the `answered 5` in the ledger, written
 *  once so the three can never disagree. */
const FLOOD_PASS = 5;
const FLOOD_HELD = FLOOD_N - FLOOD_PASS;
const FLOOD_R = 3.4;
/** The flood's own pitch and travel, in timeline units. */
const FLOOD_PITCH = 0.22;
const FLOOD_DUR = 0.9;
/** Where a message comes in from: the customer's side of the lane. */
const FLOOD_FROM_X = 7700;
/** Where the five that got through come to rest, past the valve. */
const PASS_X0 = 8200;
const PASS_PITCH = 38;
/** And where the seven that did not stack up behind it. A QUEUE IS A SPACING:
 *  the held messages stand closer together than the ones that got through,
 *  and the back of the queue is the valve itself. */
const FLOOD_QUEUE_PITCH = 17;
const FLOOD_QUEUE_X1 = VALVE_X - 12;
const FLOOD_QUEUE_X0 = FLOOD_QUEUE_X1 - (FLOOD_HELD - 1) * FLOOD_QUEUE_PITCH;

/* ── what the platform says it is doing ────────────────────────────────── */
const VALVE_LIMIT = `per-customer limit · ${FLOOD_PASS} / min`;
const VALVE_HELD = "over limit · held";
const VALVE_LBL_X = VALVE_X;
const VALVE_LBL_Y = 404;
const VALVE_LBL_SIZE = 10;

/* ── the rate counter ──────────────────────────────────────────────────────
   A column of READINGS behind a static aperture, moved by a transform: the
   judge's score column generalised from one glyph to one line, because two
   numbers change on every step and a per-digit column cannot express that.
   Cell 0 is blank (nothing has arrived yet) and the LAST cell is the
   untransformed one — the same inversion the whole file runs on. */
const RATE_AP_X = 7740;
const RATE_AP_Y = 390;
const RATE_AP_W = 92;
const RATE_AP_H = 16;
const RATE_PITCH = RATE_AP_H;
const RATE_BASE_Y = 402;
const RATE_SIZE = 10.5;
/** The three readings, and the unit each one is printed on. `count` is the
 *  load-bearing half: it is checked against the dots that have finished
 *  arriving by `at`, so a re-timed flood cannot leave the counter lying. */
const RATE_READS: readonly { count: number; label: string; at: number }[] = [
  { count: 4, label: "4 msgs · 20s", at: 3.9 },
  { count: 8, label: "8 msgs · 25s", at: 4.7 },
  { count: 12, label: "12 msgs · 30s", at: 5.6 },
];

/* ── the ledger ────────────────────────────────────────────────────────────
   Three readings, CROSSFADED rather than rolled, and the difference is the
   point: the counter climbs (one number going up) and the ledger is rewritten
   (three numbers restated). Every reading reconciles — received = answered +
   held — and every one of them is checked against the flood itself. */
const LEDGER_X = 7930;
const LEDGER_Y = 352;
const LEDGER_SIZE = 10;
const LEDGER: readonly { received: number; answered: number; held: number; at: number }[] = [
  { received: 4, answered: 4, held: 0, at: 3.95 },
  { received: 8, answered: 5, held: 3, at: 4.8 },
  { received: 12, answered: 5, held: 7, at: 5.8 },
];
const ledgerText = (l: { received: number; answered: number; held: number }): string =>
  `received ${l.received} · answered ${l.answered} · held ${l.held}`;

/* ── the bracket over the four who never noticed ───────────────────────────
   Two subpaths in ONE path, because lane 3 is not in it: a bracket spanning
   all five would be the exact opposite of the claim. Its spine stands past
   the receipts, so what it brackets is the evidence rather than the lanes. */
const BRK_X0 = 8520;
const BRK_X1 = 8530;
const BRK_LABEL = `unaffected · ${LANE_N - 1} of ${LANE_N - 1} answered`;
const BRK_LBL_Y = 268;
const BRK_SIZE = 10.5;
/** Which lanes each of the bracket's two runs covers, written out rather than
 *  derived from "everything but the flood": a run is a CONTIGUOUS span and
 *  the flood lane is what splits it, so the pair of spans is the shape and
 *  the assert reads it back. */
const BRK_LANES: readonly (readonly number[])[] = [
  [0, 1],
  [3, 4],
];

const NOTICE_TEXT = "notice sent once";
const NOTICE_W = 150;
const NOTICE_FROM = 7940;
const NOTICE_TO = 7810;
const GHOST_LABEL = "daily budget · muted";
const GHOST_X0 = 8250;
const GHOST_Y0 = 268;
const GHOST_X1 = 8310;
const GHOST_Y1 = 480;
const GHOST_LBL_X = (GHOST_X0 + GHOST_X1) / 2;
const GHOST_LBL_Y = 500;

/* ── station 8's own clock, in units from S8 ───────────────────────────────
   The beats the asserts need to reason about live here rather than inline, so
   that "the four replies land after the valve closes" is a comparison between
   two named numbers instead of a claim about two literals sixty lines
   apart. */
const S8_FLOOD_AT = 2.2;
const S8_VALVE_AT = 3.9;
const S8_VALVE_DUR = 0.5;
const S8_AMBER_AT = 4.5;
const S8_AMBER_DUR = 0.5;
const S8_REPLY_AT = 5.2;
/** The four other customers send ONE message each, this far apart. It is a
 *  stagger between four different people, not a rate — which is exactly why
 *  the flood beside it reads as a rate. */
const REPLY_STAGGER = 0.35;
/** When flood message i has finished arriving, in units from S8. */
const floodLanded = (i: number): number => S8_FLOOD_AT + i * FLOOD_PITCH + FLOOD_DUR;
/** How many of them have landed by unit `t` (from S8). */
const floodArrivedBy = (t: number): number =>
  Array.from({ length: FLOOD_N }, (_v, i) => i).filter((i) => floodLanded(i) <= t).length;

/* ══════════════════════════════════════════════════════════════════════════
   THE LANDING  —  the version rail prints itself as a receipt   (148 → 160)
   ══════════════════════════════════════════════════════════════════════════ */

/* Every number below is in FRAME space, not world space: the receipt is frame
   furniture like the rail it prints and the ticket beside it, because what it
   says is true of the whole scene rather than of the bay the camera is parked
   on.

   THE APERTURE LAW. The clip is a hole in a machine and NEVER animates; the
   paper is what moves (scene 6's printing receipts, and this scene's own two
   digit columns). One translate on one group reveals eleven lines in order at
   exactly the reader's scroll speed, and scrolling up feeds them back in —
   which is also why nothing printed on the paper needs a tween of its own.

   TWO NESTED GROUPS, TWO OWNERS, ZERO SHARED NUMBERS. The outer group's y is
   the SCRUB's (the print). The inner group's y and opacity are the POINTER's
   (the taut lift on hover, and the vanish at the tear). Station 5's law, and
   scene 4's ticket's before it. */
const MOUTH_Y = 300;
/** 620 (was 548): the printer stands a step right (user call) to clear floor
 *  for the pile of old version receipts below-left of it. */
const RCPT_X = 620;
/** Widened from 224 (user call: the paper looked starved) — the scene's
 *  payoff should have a payoff's presence. Every dependent number below and
 *  in the markup (clip, body, rule, perf, punches, whisper anchor) moves
 *  with it; the fall's viewBox, the button overlay and the feed distance all
 *  derive, so the tear and the fall did not change. */
const RCPT_W = 320;
const RCPT_PAD = 20;
/** Where the paper stops being paper. Everything between the mouth and here
 *  is one strip, and the tear takes all of it. 594 is the frame-margin
 *  assert's own ceiling — the longer anatomy earns the full column. */
const RCPT_PERF_Y = 594;
const RCPT_H = RCPT_PERF_Y - MOUTH_Y;
/** The clip's own height: the strip plus a hair, so a 1px perforation never
 *  lands exactly on the aperture's own edge. */
const RCPT_CLIP_H = RCPT_H + 6;
const RCPT_SIZE = 11.5;
/* ── the receipt's anatomy, top to bottom (user call: a receipt, not a
   strip — the shop name, the double rule, dot leaders, a barcode, the
   sign-off; every piece a real thermal receipt has, in this page's ink) ── */
const RCPT_WORDMARK = "Asyncify";
const RCPT_WORDMARK_SIZE = 13;
const RCPT_WORDMARK_Y = 324;
/** Receipts love double rules: two hairlines, 3u apart, under the name. */
const RCPT_DBLRULE_Y = 334;
const RCPT_HEAD_Y0 = 356;
const RCPT_HEAD_PITCH = 19;
const RCPT_MIDRULE_Y = 387;
const RCPT_LINE_Y0 = 406;
const RCPT_LINE_PITCH = 19;
const RCPT_RULE_Y = 532;
const RCPT_TOTAL_Y = 549;
const RCPT_SIGN = "thank you · nothing shipped unverified";
const RCPT_SIGN_SIZE = 9.5;
const RCPT_SIGN_Y = 562;
/** The barcode: pure hairline ink between two quiet zones, widths derived
 *  from the commit the receipt is OF — texture, never a headline. */
const RCPT_CODE_SEED = "a4f2c1";
const RCPT_CODE_N = 32;
const RCPT_CODE_QUIET = 24;
const RCPT_CODE_Y0 = 568;
const RCPT_CODE_H = 14;
const RCPT_CODE_CAP = "v7 · a4f2c1";
const RCPT_CODE_CAP_Y = 590;
/** The serrated bar. One tooth per TEETH_W, so the machine's fringe and the
 *  strip's own torn edge are the same shape with the sign flipped — two
 *  halves of one separation. */
const TEETH_N = 32;
const TEETH_W = RCPT_W / TEETH_N;
const TEETH_H = 3.5;

/* The pile of earlier editions lies below this block — it is built out of the
   live receipt's own rows and its own leaderLine(), so it is declared after
   them (see "the pile" below RCPT_TOTAL). */

/** What the receipt is OF. Two header lines, then the rail's eight stamps as
 *  seven lines — the canary's two stamps are one line, because opening a
 *  canary and promoting it is one event with two ends — then a rule and the
 *  total. Every one of them is checked against the rail below. */
/** THE ARROW IS `->` AND NOT `→`, and that is a measurement decision rather
 *  than a typographic one. The self-hosted latin faces cover U+0000–00FF plus
 *  a short list that does NOT include U+2192 (verified against
 *  @fontsource/geist-mono's own unicode.json) — the same subset trap the
 *  checkmark, the star, the block and U+2116 hit elsewhere on this page. A
 *  glyph outside the subset is painted by a fallback face, and a fallback
 *  face has a different ADVANCE: every monoWidth() assert about a string
 *  containing one is measuring a number it cannot know. `->` is two glyphs
 *  the font has, in a machine's own register, on a machine's own printout. */
const RCPT_HEAD: readonly string[] = ["acme · system prompt", "edit a4f2c1 · v6 -> v7"];
/** The stamp lines as [label, value] pairs. A receipt's signature typography
 *  is the DOT LEADER — label left, value on the right edge, `·` glyphs (IN
 *  the subset, U+00B7) filling the span between. `routed` and `gated` have no
 *  value to print, so a drawn tick stands in the value slot — the same
 *  checked idiom the rail and the check row use. */
const RCPT_ROWS: readonly (readonly [string, string])[] = [
  ["judged", "4.6"],
  ["ci", "green"],
  ["saved", "v7"],
  ["canary", "10% -> promoted"],
  ["routed", ""],
  ["gated", ""],
  ["throttled", "1"],
];
/** Columns a tick occupies at the line's end when it stands in for a value. */
const RCPT_TICK_SLOT = 3;
/** One leader line, filled so every value ends on the same right edge — mono
 *  makes this arithmetic: the column count is the paper's inner width over
 *  one advance, and the dots (each `· ` = two columns) fill what the label
 *  and value leave. Built, never typed, so the column cannot drift.
 *
 *  THE PAPER AND THE SIZE ARE PARAMETERS because this printer prints on two
 *  paper widths: the strip hanging from the mouth, and every earlier edition
 *  lying on the floor below it. The defaults are the live receipt's own
 *  numbers, so its call sites are unchanged — one builder, one grammar, two
 *  scales. (`0.61` is MONO_ADVANCE's value written out rather than
 *  referenced: this function is CALLED at module init, and the const it would
 *  reference is declared further down.) */
function leaderLine(
  label: string,
  value: string,
  inner: number = RCPT_W - 2 * RCPT_PAD,
  size: number = RCPT_SIZE,
): string {
  const cols = Math.floor(inner / (size * 0.61));
  const used = label.length + 1 + (value ? value.length : RCPT_TICK_SLOT);
  const dots = Math.max(3, Math.floor((cols - used) / 2));
  return `${label} ${"· ".repeat(dots).trimEnd()}${value ? ` ${value}` : ""}`;
}
/** How much of a mono line's own size stands above its baseline, and how much
 *  hangs below it. Used to turn a printed string into an INK BOX — the pile's
 *  visibility asserts ask what a reader can actually read, and a box cut at
 *  the baseline lies about every line with a `j`, a `g` or a `p` in it. */
const INK_CAP = 0.72;
const INK_DESC = 0.22;
const RCPT_LINES: readonly string[] = RCPT_ROWS.map(([l, v]) => leaderLine(l, v));
/** The bottom line. Seven stations, because station 1 is the EDIT itself —
 *  the thing that then travelled through seven more. */
const RCPT_TOTAL = `total · ${STATION_AT.length - 1} stations · 1 edit`;

/* ── the pile: the earlier editions, on the floor ──────────────────────────
   The flat fan of OLD version receipts lying between the torn CI ticket and
   the printer — every edit before this one got a receipt too, and the one
   hanging from the mouth (v7) is simply the NEXT one. Append-only history as
   furniture: nothing on a floor ever un-happens.

   THEY ARE REAL RECEIPTS FROM THIS PRINTER (user call: three blank ghosts
   with one ident line each were furniture, not history). Every card carries
   the hanging receipt's anatomy at pile scale — a torn top edge cut by the
   SAME blade, an ident in the same `edit <commit> · vA -> vB` register, a
   rule, and its own station stamps as DOT LEADER lines built by the same
   leaderLine() the live paper is built with. Nothing here is typed twice:
   change the live receipt's grammar and the pile changes with it.

   WHAT A CARD PRINTS IS WHAT ITS PAPER HOLDS — the stamps its own height has
   room for; the rest of the strip is under the card in front of it. What the
   READER can see is the STACK's job, and it is measured rather than eyeballed
   (below): the deepest shows a corner and no print, the middle one hands over
   its ident, and the newest of the old reads as a receipt — its ident plus
   every stamp it prints.

   A STEP FAINTER EVERYWHERE (DESIGN §1, BRAND §2's ladder): hairline where the
   live paper has hairline-strong, text-faint where it has text-dim, and no
   shop name at all. The wordmark at full ink belongs to the edition still in
   the machine, which is the whole old/new contrast the floor line names. */
const PILE_W = 220;
const PILE_H = 88;
const PILE_PAD = 14;
/** THE SAME BLADE: 220 = 22 × TEETH_W exactly, so an earlier edition's torn
 *  top edge has the mouth's tooth pitch and the mouth's tooth depth. One
 *  machine, one separation — asserted, because a second tooth cycle would be
 *  a second printer. */
const PILE_TEETH_N = 22;
/** The card's lettering. MUST match `.edt-pile-ident` / `.edt-pile-line` —
 *  every width assert below is monoWidth() arithmetic off these two numbers
 *  and the stylesheet is what actually paints them. */
const PILE_IDENT_SIZE = 12;
/* 11, not the ident's 12: the canary stamp is 28 characters, and at the
   card's inner width (220 − 2×14) the width assert allows 11.24 — the
   longest line is what sizes the type, not the average one. */
const PILE_LINE_SIZE = 11;
/** The card's anatomy, in units below its own top edge. */
const PILE_IDENT_DY = 16;
const PILE_RULE_DY = 23;
const PILE_LINE_DY0 = 38;
const PILE_LINE_PITCH = 14;
/** The clearance a printed line keeps from the bottom of its own paper. */
const PILE_LINE_BOTTOM = 5;
/** How many stamps a card's paper holds. DERIVED, never typed, so a card that
 *  changed height cannot print off its own bottom edge. */
const PILE_LINE_N = Math.min(
  RCPT_ROWS.length,
  Math.floor((PILE_H - PILE_LINE_BOTTOM - PILE_LINE_DY0) / PILE_LINE_PITCH) + 1,
);
/** The user's floor for the topmost old card: it has to read as a receipt and
 *  not as a hint of one — its ident plus at least four of its seven stamps. */
const PILE_MIN_LINES = 4;
/** The floor the pile lies on, and both ends of it are other objects: the
 *  torn ticket's right edge and the printer's left. The top is four units
 *  above the old 480 because the blade's teeth stand ABOVE a torn-off strip's
 *  own top edge — the bound is about where the paper lies, not about the
 *  rectangle its numbers are derived from. */
const PILE_FLOOR_X0 = TKT_X1 + 20;
const PILE_FLOOR_X1 = RCPT_X - 16;
const PILE_FLOOR_Y0 = 476;
const PILE_FLOOR_Y1 = FRAME_H - 36;

/** The three earlier editions, OLDEST FIRST — array order is stack order, so
 *  the last one lies on top. Each is one edit: the commit it was, the version
 *  it took the story from, the version it left it at, and the score the judge
 *  gave it.
 *
 *  4.4 IS NOT A DECORATION. It is the very number the canary station's own
 *  score bar prints for v6 (SCORE_A), and the two are asserted equal below —
 *  the floor and the bay are talking about the same edition, so they are not
 *  allowed to disagree about how good it was. The three scores ascend for the
 *  same reason the versions do: each edition was judged better than the one it
 *  replaced, and v7's 4.7 is the next step of the same climb. */
const PILE: readonly {
  commit: string;
  from: number;
  to: number;
  judged: number;
  x: number;
  y: number;
  rot: number;
}[] = [
  { commit: "8c04d1", from: 3, to: 4, judged: 4.1, x: 302, y: 490, rot: -5 },
  { commit: "b7e2a9", from: 4, to: 5, judged: 4.2, x: 292, y: 486, rot: 3 },
  /* +1°, not a counter-lean: at 220 wide, ANY negative degree lifts this
     card's right edge over the middle card's ident (the clearOfStack
     assert) — leaning WITH the middle card lays that edge low instead.
     And y 508: at 88 tall, 510 would put the low corner past the floor. */
  { commit: "4d91f7", from: 5, to: 6, judged: 4.4, x: 264, y: 508, rot: 1 },
];
type PileEdit = (typeof PILE)[number];

/** An earlier edition's ident, in the hanging receipt's own register. */
const pileIdent = (c: PileEdit): string => `edit ${c.commit} · v${c.from} -> v${c.to}`;
/** Its stamps — and they are the LIVE receipt's stamps with the two
 *  version-specific values substituted. Same labels, same order, same count,
 *  so an earlier edition cannot drift into a different journey than the one
 *  this printer prints. */
const pileRows = (c: PileEdit): readonly (readonly [string, string])[] =>
  RCPT_ROWS.map(([l, v]) =>
    l === "judged"
      ? ([l, c.judged.toFixed(1)] as const)
      : l === "saved"
        ? ([l, `v${c.to}`] as const)
        : ([l, v] as const),
  );
/** What its paper actually holds, as leader lines at pile scale. */
const pileLines = (c: PileEdit): readonly string[] =>
  pileRows(c)
    .slice(0, PILE_LINE_N)
    .map(([l, v]) => leaderLine(l, v, PILE_W - 2 * PILE_PAD, PILE_LINE_SIZE));

/** THE FLOOR LINE, and it is the reason the pile is drawn at all. A reader
 *  who sees three papers on a floor has to be told what they are and what the
 *  one in the machine is, in the page's own voice — so: a caption, in the
 *  register the receipts themselves are set in, at the receipts' own rung. Not
 *  an eyebrow (DESIGN §7) and not a whisper: the serif annotation voice on
 *  this page is spoken for by the switch and the door, and a third one would
 *  make it a chorus. */
/** User-tuned, two lines: the TITLE names the pile and carries the ink
 *  (bigger, full bright); the sub-line below hands its sentence to the drawn
 *  pointer that runs to the printer's side. Above the pile — a caption reads
 *  before its subject. */
const PILE_TITLE = "Version history";
const PILE_TITLE_SIZE = 21;
const PILE_TITLE_Y = 444;
const PILE_SUB = "and the new one ready to use is here";
const PILE_SUB_SIZE = 13;
const PILE_SUB_Y = 467;
/* 244 (user call: the whole pile a step right): the sub-line at 13 ends at
   529.5, which clears the printer's left bound (the caption-width assert)
   by 2.5 — the sub-line's length is what stops the column going further
   right, not taste. */
const PILE_LABEL_X = 244;

/** A box in a card's OWN coordinates (0,0 = the paper's top-left corner),
 *  carried through that card's rotation about that card's centre — the exact
 *  rotation the group carries, written out in one place so the arithmetic
 *  that PLACES the paper is the arithmetic that asks what it covers. Corners
 *  come back tl, tr, br, bl. */
function pileBox(
  c: PileEdit,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): readonly (readonly [number, number])[] {
  const cx = c.x + PILE_W / 2;
  const cy = c.y + PILE_H / 2;
  const t = (c.rot * Math.PI) / 180;
  const s = Math.sin(t);
  const k = Math.cos(t);
  return (
    [
      [x0, y0],
      [x1, y0],
      [x1, y1],
      [x0, y1],
    ] as const
  ).map(([px, py]) => {
    const dx = c.x + px - cx;
    const dy = c.y + py - cy;
    return [cx + dx * k - dy * s, cy + dx * s + dy * k] as const;
  });
}
/** The card itself. */
const pileQuad = (c: PileEdit): readonly (readonly [number, number])[] =>
  pileBox(c, 0, 0, PILE_W, PILE_H);
/** A printed line's ink box: mono width, a cap above the baseline and a
 *  descender below it. */
const pileInk = (
  c: PileEdit,
  text: string,
  size: number,
  dy: number,
): readonly (readonly [number, number])[] =>
  pileBox(c, PILE_PAD, dy - size * INK_CAP, PILE_PAD + monoWidth(text, size), dy + size * INK_DESC);
/** Is a point inside a convex quad? Sign-consistent cross products, so it
 *  works on a rotated card without ever building an axis-aligned box — an
 *  AABB would over-report coverage and quietly weaken the very asserts that
 *  say what the reader can read. */
function inQuad(quad: readonly (readonly [number, number])[], px: number, py: number): boolean {
  let sign = 0;
  for (let i = 0; i < 4; i++) {
    const a = quad[i]!;
    const b = quad[(i + 1) % 4]!;
    const cr = (b[0] - a[0]) * (py - a[1]) - (b[1] - a[1]) * (px - a[0]);
    if (cr === 0) continue;
    const s = cr > 0 ? 1 : -1;
    if (sign === 0) sign = s;
    else if (s !== sign) return false;
  }
  return true;
}

/* ── the door ──────────────────────────────────────────────────────────────
   The whisper, in scene 4's `click here` grammar: one short curve dipping to
   the perforation, arriving strictly after the print has settled — an
   instruction printed over a page still coming out of the machine would be an
   instruction about something that is not there yet.

   IT IS QUIET IN BEHAVIOUR, NOT IN VOLUME, and the two were confused. Arriving
   once and never looping is what makes it a whisper; being set at 10u in the
   faintest ink on the ladder only made it hard to find, and a door nobody
   finds is a door nobody takes. Same behaviour, two rungs brighter and three
   sizes up, with a curve and a head scaled to match. */
const TEAR_HERE = "Tear here";
const TEAR_HERE_X = 977;
const TEAR_HERE_Y = 583;
/** QUIET IN BEHAVIOUR IS NOT QUIET IN VOLUME. This is the only instruction on
 *  the whole stage and it is what stands between the reader and the door, so
 *  it arrives once, never loops, and is set at a size a reader does not have
 *  to lean in for. MUST match `#edt-tear-here`'s font-size — the width assert
 *  below is monoWidth() arithmetic off this number. */
/** 17 = scene 4's click-here, user-tuned there (the annotation is now in
 *  that voice — Instrument Serif italic). The width assert still uses
 *  monoWidth(), which OVERSTATES a serif's width at the same size — a
 *  conservative bound, so the assert stays honest. */
const TEAR_HERE_SIZE = 17;
/** The whisper's arrowhead: how long each barb is, and the angle it makes
 *  with the curve's own END TANGENT. Both are written down because the head's
 *  two points are authored in the markup and the assert below re-derives them
 *  — an arrowhead is only an arrowhead if it agrees with its line. */
const TEAR_HEAD_LEN = 13;
const TEAR_HEAD_DEG = 28;

/** THE TEAR, at scene 4's ticket's own bar (user call: the ticket's tear is
 *  the real one — one tearing feel on this page, not two). 1.45s, the
 *  ticket's exact run: a real receipt torn deliberately, not snatched. The
 *  front crosses the teeth under the same hand-tremor ease, the freed corner
 *  sags as it goes (the hinge travels with the front), and the paper flexes
 *  toward the corner still held — then springs flat at the release into the
 *  fall. */
const TEAR_RUN = 1.45;
/** How far the freed edge has sagged by the moment the last fibres give —
 *  small, because the strip hangs from a bar rather than off a wall
 *  dispenser: the drama is the fall's, not the peel's. */
const TEAR_END_ROT = -10;
/** The flex toward the held corner while the tear runs (the ticket's cone),
 *  sprung flat by the fall's own first keyframe. Skew ONLY — the ticket also
 *  compresses (scaleY), but on a 294u strip a 3% compression lifts the
 *  bottom edge ~9u, which read as the right side rising (user catch). */
const TEAR_CONE_SKEW = -4;
/** The fall. Once, damped, no bounce and no loop — and long enough to watch,
 *  which is the point of tearing something off. */
const FALL_DUR = 4;
/** How far down the viewport the strip travels, as a fraction of its height,
 *  and the swings it takes on the way. SHRINKING, and alternating — free
 *  paper does not oscillate at a constant amplitude, it spills its energy. */
const FALL_DROP = 0.78;
const FALL_SWINGS: readonly number[] = [64, -40, 24, -10];
/** The lean INTO each swing, in degrees, decaying with it, and flat at each
 *  stall. Keyframed rather than autoRotated: a page's tilt is not its
 *  tangent — it leads the swing and lags the turn. */
const FALL_TILT: readonly number[] = [14, -10, 6, -3];
/** The BOW, and it is a bow rather than a ripple: free paper bends once along
 *  its length and the bend reverses with the swing, where pinned cloth would
 *  ripple. A hint, never a fold — skewX in degrees, about the strip's own
 *  centre. */
const FALL_BOW: readonly number[] = [-5, 4, -2.5, 1.2];
/** The glide, AT THE RELEASE — its delay is TEAR_RUN by reference and not by
 *  number, so the slower tear moved the page's departure with it rather than
 *  leaving the page travelling under a strip that had not come off yet. Its
 *  own duration is scene 4's ticket's exactly: the reader who tears one door
 *  and the reader who tears the other must not feel two different pages
 *  moving. */
const GLIDE_DUR = 1.3;
/** How far the strip stands taut toward the teeth. This began as a hover
 *  offset; the reader liked the hovered posture and asked for it to be the
 *  RESTING one, so the armed strip holds 2×this always, and the pointer adds
 *  ONE more step (3×, wireDoorHover — his second call: "very little bit").
 *  1.5u is under two pixels at the stage's render scale — the paper held
 *  taut, not the paper moved. */
const TEAR_LIFT = 1.5;

/* ── the landing's own clock, in units from LANDING_AT ─────────────────────
   Named rather than inline for the same reason station 8's are: the two facts
   that matter here — the whisper arrives after the print has settled, and
   nothing is still being built when the held ending starts — are comparisons
   between numbers, and a comparison the file can make is a comparison a
   future edit cannot get wrong. */
const L_CLOSE_AT = 1.4;
const L_TEETH_AT = 0.6;
/** The pile settles OLDEST FIRST — they were laid down over time and the
 *  landing shows them the way they accumulated — and its floor line lands with
 *  the last of them. All of it before the print, because the history has to be
 *  on the floor already when the new edition starts coming out; asserted
 *  against L_PRINT_AT rather than trusted. */
const L_PILE_AT = 0.7;
const L_PILE_STEP = 0.3;
const L_PILE_RUN = 0.5;
const L_PRINT_AT = 2.2;
/** The print's length. Eight units of scroll for the full anatomy — sixteen
 *  printed things — is a printer the reader can read AS it prints rather
 *  than one they watch finish. */
const L_PRINT_DUR = 8.0;
const L_HINT_AT = 10.3;
/** How long the whisper takes to arrive, all three of its parts. */
const L_HINT_RUN = 1.55;

/* ══════════════════════════════════════════════════════════════════════════
   THE STILL'S WINDOWS  —  authored by slice A, cut by slice D
   ══════════════════════════════════════════════════════════════════════════ */

/* "x y w h" in WORLD units, one or two per caption: the close-ups a phone and
   a reduced-motion reader get instead of the pan. They are authored here, a
   slice before the still is built, for the same reason the rail's eight stamp
   positions were: a window is geometry, and geometry that only exists in the
   slice that renders it is geometry nothing can check.

   470u IS THE LEGIBILITY CEILING and it is scene 2's, measured rather than
   guessed: a card is ~343px wide on a 375px phone, so a window wider than
   that renders 10.5u lettering under 8px. A mechanism wider than the ceiling
   gets TWO windows stacked, never one sliver — which is why seven of the eight
   stations have two. All of it is asserted at boot: every window inside its
   own station's bay, inside the content band, and inside the ceiling.

   FOUR OF THEM MOVED WHEN SLICE D ACTUALLY LOOKED THROUGH THEM, and every
   move is a thing the finished frame turned out to contain that the authored
   window missed. All four were found by measuring the landmarks each card
   claims against the window that is meant to frame them, not by eye:
     · judged evals — the bench's own header and its live tally sit ON 251-262,
       eleven units above the first scenario card, and a window that started at
       264 cut the run's name and its count off the top of the picture.
     · the ci gate — a still shows the END of the beat, and the end of that
       beat is the bar GONE and the commit past it. The chip is 344u wide and
       stops at 2900, so a window at 2380 framed an empty road; 2660 frames
       the two jambs, the lane, and the commit standing through them.
     · the two gates — the shipped reply comes to rest at 7280 and is 130u
       wide, so its right edge is at 7345 and a 460u window at 6880 sliced it.
     · the customer lanes — the bracket and its label are the beat's whole
       claim ("4 of 4 answered") and they live at 8357-8530, past the old
       window's right wall.
   Two of the four also gained a few units at the top, because a text's own
   cap rises above the baseline its y is: a window cut to a label's baseline
   frames the label's descenders and not its letters. */
const STILL_VIEW: readonly { cap: number; boxes: readonly string[] }[] = [
  { cap: 0, boxes: ["196 250 460 252"] },
  { cap: 1, boxes: ["1240 244 380 246", "1640 292 364 208"] },
  { cap: 2, boxes: ["2660 162 460 100", "2390 258 440 60"] },
  { cap: 3, boxes: ["3310 256 460 248", "3790 280 460 224"] },
  { cap: 4, boxes: ["4560 300 420 190", "4980 300 380 190"] },
  { cap: 5, boxes: ["5460 260 460 250", "5960 264 460 250"] },
  { cap: 6, boxes: ["6520 340 440 170", "6875 268 470 244"] },
  { cap: 7, boxes: ["7600 268 460 250", "8080 254 470 264"] },
];
/** The highest latitude a still window may look at, and it is derived from
 *  the highest thing the world actually draws: the turnstile's upper jamb, at
 *  CHIP_LANE_Y − GATE_HALF, plus a hairline's clearance. It was the chip's own
 *  band until slice D tried to frame an OPEN gate — two jambs and no bar — and
 *  found the upper one two units above the ceiling, which would have drawn a
 *  gate with one post. */
const WORLD_TOP = CHIP_LANE_Y - GATE_HALF - 6;
/** The widest a still window may be before its lettering stops being legible
 *  on a phone. Scene 2's number, and its reasoning. */
const STILL_VIEW_MAX_W = 470;

/* ── the two FRAME-space windows ───────────────────────────────────────────
   The eight above look at the WORLD, through a camera that is at rest at the
   identity in a still. Two of this scene's objects are not in the world at
   all — they are frame furniture, painted over it — and each belongs to
   exactly one card:

     · THE TORN TICKET is what the ci gate caught. It rides the ci card, so
       the reader who is shown a bar that cleared is shown, on the same card,
       the paper that says what the first run stopped.
     · THE LANDING RECEIPT is the rail's paper copy, and it is the last card.

   They are in frame coordinates, so their windows are cut from a clone with
   the camera group taken out — otherwise bay 0's prompt panel, which sits at
   the same numbers, would be painted underneath them. */
const STILL_TKT_VIEW = "14 500 210 92";
const STILL_RCPT_VIEW = "608 288 344 318";
/** The scene's LAST FRAME, whole, and it is genuinely the last frame: at the
 *  landing the camera is parked on bay 8, which is empty by design, so the
 *  frame layer standing alone is exactly what the reader is left looking at.
 *  Reduced motion only — 1080u is over the phone ceiling by design, and that
 *  branch is a desktop at full width (agents.ts's STILL_WHOLE, same rule). */
const STILL_WHOLE = `0 0 ${FRAME_W} ${FRAME_H}`;

/** Where the commit stands in the ci close-up. It is the chip's own
 *  through-the-gate constant, not a second number: the still shows the beat's
 *  end, and that is where the beat ends. */
const STILL_CHIP_AT = CHIP_GATE_THROUGH;

/* ── the still's own lettering ─────────────────────────────────────────────
   Four strings the pinned scene has no room for and the still needs: what the
   scene is (the reduced branch's lede, in the site's voice), what the rail's
   list is a list OF, and the landing card's name and sentence. They are
   checked at boot against the banned-glyph list like every other string this
   file prints. */
const STILL_LEDE =
  "One line of an agent's prompt, and every gate it clears before a customer sees it.";
const STILL_RAIL_LEAD = "the version rail · every stamp this edit earned";
const STILL_LANDING_KICKER = "the landing";
const STILL_LANDING_TEXT =
  "The rail hands over its paper copy, torn off at the bar: the whole journey on one strip.";
/** The glyphs the self-hosted latin faces do not carry (DESIGN §3). A drawn
 *  tick, `->` and `·` are how this page says the three it would otherwise
 *  reach for; the rest are simply not printable here. */
const BANNED_GLYPHS = "✓★▪≥№→";

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
 *  same tick. `k` scales the gesture for a box that is not MARK — the rail's
 *  is 14u, because a tick beside 13.5u lettering has to be the lettering's
 *  size or it reads as a bullet. Everything else passes no scale and gets
 *  byte-identical geometry to before. */
function tickPath(x: number, y: number, k = 1): string {
  return TICK.map(
    ([dx, dy], i) =>
      `${i === 0 ? "M" : "L"} ${(x + dx * k).toFixed(2)} ${(y + dy * k).toFixed(2)}`,
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

/** ONE RUN OF THE MACHINE'S BLADE: `n` teeth of TEETH_W each, TEETH_H deep,
 *  starting at (x, y). `sign` +1 is the bar itself and the fringe it leaves in
 *  the machine; −1 is the complementary edge on the strip that comes away.
 *
 *  It takes an origin and a count because this printer cuts on two paper
 *  widths — the strip at the mouth, and every earlier edition lying on the
 *  floor below it. A tooth cycle that existed in two places would be two
 *  blades, and two blades do not make one separation. */
function serration(x: number, y: number, n: number, sign: number): string {
  const parts = [`M ${x} ${y}`];
  for (let i = 0; i < n; i++) {
    parts.push(`l ${TEETH_W / 2} ${sign * TEETH_H}`, `l ${TEETH_W / 2} ${-sign * TEETH_H}`);
  }
  return parts.join(" ");
}
/** The mouth's own bar, and the strip's own torn edge. */
function teethPath(y: number, sign: number): string {
  return serration(RCPT_X, y, TEETH_N, sign);
}

/** An earlier edition's outline: the blade's torn edge across the top (sign
 *  −1, the strip's half of the separation — the same edge the falling receipt
 *  carries), then the three cut sides. ONE path, so the paper and its tear are
 *  one object and the card's single hairline draws both. */
function pileCardPath(c: PileEdit): string {
  return (
    `${serration(c.x, c.y, PILE_TEETH_N, -1)}` +
    ` L ${c.x + PILE_W} ${c.y + PILE_H} L ${c.x} ${c.y + PILE_H} Z`
  );
}

/** The bracket over the four lanes the flood never touched. Two subpaths in
 *  one path, one per contiguous run, because the flooding lane is what splits
 *  it — a single span would be the opposite of what it says. */
function bracketPath(): string {
  return BRK_LANES.map((run) => {
    const y0 = laneY8(run[0]!);
    const y1 = laneY8(run[run.length - 1]!);
    return `M ${BRK_X0} ${y0} L ${BRK_X1} ${y0} L ${BRK_X1} ${y1} L ${BRK_X0} ${y1}`;
  }).join(" ");
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
  /* The scaffolding's FINAL invariant, and the last one it will ever have.
     Slice A handed over on STATION_AT[3], slice B on LANDING_AT; slice C ends
     the scene, so the only correct value left is the timeline's own end. A
     future edit that shortens the scrub has to move TL_END and take the
     density paragraph at the top of the file with it, rather than quietly
     stopping the pin somewhere else. */
  if (SLICE_END !== TL_END || SLICE_HOLD_FROM !== HOLD_FROM) {
    throw new Error("[edit] the scene does not end on its own timeline");
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
     Eight ticked labels sharing 1020u either fit or they do not, and the
     failure mode is two mono strings reading as one. Measured with the
     arithmetic above, for all eight, including the six no tween touches yet —
     that is the whole reason their x and their text are authored a slice
     early. Every one of these numbers moved when the rail was raised to 13.5u
     and every stamp was given a tick, which is exactly what they are for.
     ════════════════════════════════════════════════════════════════════════ */

  /** How wide a stamp's block is: tick, gap, label. Every stamp has all
   *  three now, so there is no longer a second shape to measure. */
  /* The rail's checkbox IS the check row's (user call, one "checked" idiom);
     RAIL_MARK is written as a literal up top only because MARK is declared
     later — this is the promised no-drift guard. */
  if (RAIL_MARK !== MARK) {
    throw new Error("[edit] the rail's checkbox is not the check row's mark");
  }
  const stampWidth = (i: number): number =>
    RAIL_MARK + 1 + RAIL_MARK_GAP + monoWidth(STAMPS[i]!.label, RAIL_LBL_SIZE);
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
  {
    /* And every stamp stands ON the rail rather than off the end of it, with
       the run centred on the rail's own mid-point — the two facts that used
       to be free when the pitch was derived from RAIL_X0/RAIL_X1 and are now
       written down, because STAMP_X0 and RAIL_PITCH are typed by hand. */
    if (stampX(0) < RAIL_X0 || stampX(STAMPS.length - 1) > RAIL_X1) {
      throw new Error("[edit] a rail stamp stands off the end of the rail it is recorded on");
    }
    const mid = (stampX(0) + stampX(STAMPS.length - 1)) / 2;
    if (Math.abs(mid - (RAIL_X0 + RAIL_X1) / 2) > 1) {
      throw new Error("[edit] the rail's stamps are not centred on the rail");
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
  /** Per stamp: the event tick that crosses the rail, the drawn checkmark
   *  under it, and the word for it. Null for the slots later slices own — no
   *  DOM at all, so nothing can fade in by accident. All three exist for all
   *  eight now, so the block is one shape: [ tick ][gap][ label ], centred on
   *  the stamp's own x. */
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
      x: x - w / 2 + RAIL_MARK + RAIL_MARK_GAP,
      y: RAIL_LBL_Y,
      "text-anchor": "start",
    });
    label.textContent = s.label;
    /* The checkbox (user call): the check row's own mark, byte-identical
       grammar — box, then the tick lands inside it. A stamp reads as a
       feature checked off, in the one "checked" idiom this scene has. */
    const boxY = RAIL_LBL_Y - RAIL_MARK - 1;
    const box = svgEl("rect", {
      class: "edt-mark",
      x: (x - w / 2 + 0.5).toFixed(2),
      y: (boxY + 0.5).toFixed(2),
      width: String(MARK),
      height: String(MARK),
      rx: 1,
    });
    const mark = svgEl("path", {
      class: "edt-tick",
      d: tickPath(x - w / 2 + 0.5, boxY + 0.5),
    });
    stampsG.append(box, tick, mark, label);
    return { at: s.at, tick, label, mark, box };
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
  const laneY = laneY8;
  const laneRules: SVGPathElement[] = [];
  const laneLabels: SVGTextElement[] = [];
  const replyDots: SVGCircleElement[] = [];
  const delivereds: SVGTextElement[] = [];
  const muteds: SVGTextElement[] = [];
  const latencies: SVGTextElement[] = [];
  for (let i = 0; i < LANE_N; i++) {
    const y = laneY(i);
    const rule = svgEl("path", { class: "edt-lane", d: `M ${LANE8_X0} ${y} L ${LANE8_X1} ${y}` });
    const lbl = svgEl("text", { class: "edt-judge-rubric", x: LANE8_LBL_X, y: y + 4 });
    lbl.textContent = `customer ${i + 1}`;
    lanes8G.append(rule, lbl);
    laneRules.push(rule);
    laneLabels.push(lbl);
    /* The four who never notice get a reply, a receipt and a LATENCY — and
       the latency is what makes the receipt evidence rather than a claim: it
       says the answer took as long as an answer takes, while one lane over a
       queue is being held. The flooding lane gets none of the three: what
       comes back to it is a notice, and a notice is not a delivery. */
    if (i === FLOOD_LANE) continue;
    const k = latencies.length;
    const dot = svgEl("circle", { class: "edt-dot", cx: REPLY_DOT_X, cy: y, r: CN_R });
    const rcpt = svgEl("text", { class: "edt-delivered", x: DELIVERED_X, y: y + 4 });
    rcpt.textContent = DELIVERED;
    /* What the ghost turns that receipt into, for a beat. Same anchor, same
       size, one rung of gray — a receipt that VANISHED would say the message
       was never sent, and the whole point is that it was and nobody got it. */
    const mute = svgEl("text", { class: "edt-muted", x: DELIVERED_X, y: y + 4 });
    mute.textContent = MUTED;
    const lat = svgEl("text", { class: "edt-lat", x: LAT_X, y: y + 4 });
    lat.textContent = LATENCIES[k]!;
    lanes8G.append(dot, rcpt, mute, lat);
    replyDots.push(dot);
    delivereds.push(rcpt);
    muteds.push(mute);
    latencies.push(lat);
  }

  /* ── the flood ─────────────────────────────────────────────────────────
     Twelve messages from one customer, authored where each one COMES TO REST
     (the finished frame) and pushed back out to the customer's side of the
     lane by restState: the first five past the valve, the other seven stacked
     up behind it. */
  const floodG = q<SVGGElement>(svg, "#edt-flood");
  /** Where message i ends up. One function, read by the authoring, by the
   *  rest state and by the arrival tween, so the three can never disagree
   *  about which message is which. */
  const floodX = (i: number): number =>
    i < FLOOD_PASS
      ? PASS_X0 + i * PASS_PITCH
      : FLOOD_QUEUE_X0 + (i - FLOOD_PASS) * FLOOD_QUEUE_PITCH;
  const floodDots: SVGCircleElement[] = [];
  for (let i = 0; i < FLOOD_N; i++) {
    const c = svgEl("circle", {
      class: "edt-dot",
      cx: floodX(i),
      cy: laneY(FLOOD_LANE),
      r: FLOOD_R,
    });
    floodG.appendChild(c);
    floodDots.push(c);
  }
  /** How far back down the lane message i started. */
  const floodEntryDx = (i: number): number => FLOOD_FROM_X - floodX(i);

  /* ── the rate counter's column ─────────────────────────────────────────
     One cell per reading plus a blank one for "nothing has arrived yet", and
     the LAST cell is authored with no transform, because the finished frame is
     the untransformed one. The judge's score column, generalised. */
  const rateCol = q<SVGGElement>(svg, "#edt-rate-col");
  const rateCells = ["", ...RATE_READS.map((r) => r.label)];
  rateCells.forEach((text, k) => {
    const t = svgEl("text", {
      class: "edt-rate",
      x: RATE_AP_X,
      y: RATE_BASE_Y + (k - (rateCells.length - 1)) * RATE_PITCH,
    });
    t.textContent = text;
    rateCol.appendChild(t);
  });
  /** Where the column stands when cell c is in the window. */
  const rateY = (c: number): number => (rateCells.length - 1 - c) * RATE_PITCH;

  /* ── the ledger's three readings ───────────────────────────────────────── */
  const ledgerG = q<SVGGElement>(svg, "#edt-ledger");
  const ledgerReads: SVGTextElement[] = LEDGER.map((l) => {
    const t = svgEl("text", { class: "edt-ledger-read", x: LEDGER_X, y: LEDGER_Y });
    t.textContent = ledgerText(l);
    ledgerG.appendChild(t);
    return t;
  });

  /* ── the landing receipt's lettering ───────────────────────────────────
     Generated, like every other family on this stage, so a pitch cannot be
     typed in twice and disagree with itself. None of it is in the scrub's
     fade lists: the APERTURE is the reveal, and a line that also faded in
     would be a second switch for one state. */
  {
    const headG = q<SVGGElement>(svg, "#edt-rcpt-head");
    RCPT_HEAD.forEach((text, i) => {
      const t = svgEl("text", {
        class: "edt-rcpt-head",
        x: RCPT_X + RCPT_PAD,
        y: RCPT_HEAD_Y0 + i * RCPT_HEAD_PITCH,
      });
      t.textContent = text;
      headG.appendChild(t);
    });
    const linesG8 = q<SVGGElement>(svg, "#edt-rcpt-lines");
    RCPT_LINES.forEach((text, i) => {
      const t = svgEl("text", {
        class: "edt-rcpt-line",
        x: RCPT_X + RCPT_PAD,
        y: RCPT_LINE_Y0 + i * RCPT_LINE_PITCH,
      });
      t.textContent = text;
      linesG8.appendChild(t);
    });
    /* The rest of the anatomy (user call: a receipt, not a strip). All of it
       generated for the same reason the lines are, all of it printed by the
       one aperture — nothing here tweens. */
    const extraG = q<SVGGElement>(svg, "#edt-rcpt-extra");
    const midX0 = RCPT_X + RCPT_PAD;
    const midX1 = RCPT_X + RCPT_W - RCPT_PAD;
    const centre = RCPT_X + RCPT_W / 2;
    const wm = svgEl("text", {
      class: "edt-rcpt-wordmark",
      x: centre,
      y: RCPT_WORDMARK_Y,
      "text-anchor": "middle",
    });
    wm.textContent = RCPT_WORDMARK;
    extraG.appendChild(wm);
    for (const y of [RCPT_DBLRULE_Y, RCPT_DBLRULE_Y + 3, RCPT_MIDRULE_Y]) {
      extraG.appendChild(
        svgEl("path", { class: "edt-rcpt-rule", d: `M ${midX0} ${y} L ${midX1} ${y}` }),
      );
    }
    /* A drawn tick stands in the value slot of the two rows that have no
       value to print — the scene's one "checked" idiom, on the paper too. */
    RCPT_ROWS.forEach(([, v], i) => {
      if (v !== "") return;
      extraG.appendChild(
        svgEl("path", {
          class: "edt-tick",
          d: tickPath(midX1 - MARK, RCPT_LINE_Y0 + i * RCPT_LINE_PITCH - 10),
        }),
      );
    });
    const sg = svgEl("text", {
      class: "edt-rcpt-sign",
      x: centre,
      y: RCPT_SIGN_Y,
      "text-anchor": "middle",
    });
    sg.textContent = RCPT_SIGN;
    extraG.appendChild(sg);
    /* The barcode: bar widths from the commit's own character bits — texture
       DERIVED from the thing the receipt is of, never randomness. */
    const span = RCPT_W - 2 * RCPT_PAD - 2 * RCPT_CODE_QUIET;
    const pitch = span / RCPT_CODE_N;
    for (let i = 0; i < RCPT_CODE_N; i++) {
      const c = RCPT_CODE_SEED.charCodeAt(i % RCPT_CODE_SEED.length);
      const wBar = ((c >> i % 7) & 1) === 1 ? 2.4 : 1;
      const bx = (RCPT_X + RCPT_PAD + RCPT_CODE_QUIET + (i + 0.5) * pitch).toFixed(2);
      extraG.appendChild(
        svgEl("path", {
          class: "edt-rcpt-code",
          d: `M ${bx} ${RCPT_CODE_Y0} L ${bx} ${RCPT_CODE_Y0 + RCPT_CODE_H}`,
          "stroke-width": String(wBar),
        }),
      );
    }
    const cap = svgEl("text", {
      class: "edt-rcpt-sign",
      x: centre,
      y: RCPT_CODE_CAP_Y,
      "text-anchor": "middle",
    });
    cap.textContent = RCPT_CODE_CAP;
    extraG.appendChild(cap);
  }

  /* ── the pile of earlier editions ──────────────────────────────────────── */
  const pileCards: SVGGElement[] = [];
  const pileTitle = svgEl("text", {
    class: "edt-pile-title",
    x: PILE_LABEL_X,
    y: PILE_TITLE_Y,
  });
  const pileSub = svgEl("text", {
    class: "edt-pile-floor",
    x: PILE_LABEL_X,
    y: PILE_SUB_Y,
  });
  /* The caption's pointer: "…and the new one is here" hands the sentence to
     a drawn line that rises to the printer's mouth. Same ink family as the
     door's hook; the head derives from the curve's end tangent (the tear
     arrow's law — a chevron cannot disagree with the line that draws it). */
  const pileArrow = svgEl("path", { class: "edt-hint-arrow", d: "M 0 0" }) as SVGPathElement;
  const pileArrowHead = svgEl("path", { class: "edt-hint-arrow", d: "M 0 0" }) as SVGPathElement;
  {
    const pileG = q<SVGGElement>(svg, "#edt-pile");
    const inner = PILE_W - 2 * PILE_PAD;

    /* ── THE PAPER, and the blade that cut it ───────────────────────────── */
    if (PILE_TEETH_N * TEETH_W !== PILE_W) {
      throw new Error("[edit] an earlier edition was torn off a different blade than the one at the mouth");
    }
    if (PILE.length < 3) {
      throw new Error("[edit] the pile is not a stack");
    }
    /* The anatomy stacks down the paper and stops before the bottom edge, and
       the number of lines that fit is DERIVED — so a card can never print off
       its own paper, and can never print fewer stamps than the user's floor. */
    if (
      PILE_IDENT_DY <= TEETH_H + PILE_IDENT_SIZE ||
      PILE_RULE_DY <= PILE_IDENT_DY ||
      PILE_LINE_DY0 <= PILE_RULE_DY + PILE_LINE_SIZE
    ) {
      throw new Error("[edit] an earlier edition's anatomy overlaps itself or its own torn edge");
    }
    if (PILE_LINE_N < PILE_MIN_LINES) {
      throw new Error(`[edit] an earlier edition's paper holds ${PILE_LINE_N} stamps, and the pile is meant to print at least ${PILE_MIN_LINES}`);
    }
    if (
      PILE_LINE_DY0 + (PILE_LINE_N - 1) * PILE_LINE_PITCH + PILE_LINE_SIZE * INK_DESC >
      PILE_H - PILE_LINE_BOTTOM
    ) {
      throw new Error("[edit] an earlier edition prints past the bottom of its own paper");
    }

    /* ── THE CHAIN, from v3 to the paper still in the machine ────────────
       Each edition moves the story by exactly one version, each one picks up
       where the one under it left off, and the newest of the old is the very
       version the hanging receipt takes over from. Parsed out of RCPT_HEAD
       rather than typed again, so the floor and the mouth cannot disagree
       about where the story was when this edit started. */
    const handoff = RCPT_HEAD[1]!.match(/v(\d+) -> v(\d+)$/);
    if (!handoff) {
      throw new Error("[edit] the hanging receipt's ident is not a version hand-off");
    }
    PILE.forEach((c, i) => {
      if (c.to !== c.from + 1) {
        throw new Error(`[edit] "${pileIdent(c)}" does not move the story by one version`);
      }
      if (i > 0 && c.from !== PILE[i - 1]!.to) {
        throw new Error(`[edit] "${pileIdent(c)}" does not pick up where the edition under it left off`);
      }
      if (i > 0 && !(c.judged > PILE[i - 1]!.judged)) {
        throw new Error(`[edit] "${pileIdent(c)}" was not judged better than the edition it replaced`);
      }
    });
    const newest = PILE[PILE.length - 1]!;
    if (Number(handoff[1]) !== newest.to) {
      throw new Error("[edit] the newest edition on the floor is not the one the hanging receipt takes over from");
    }
    /* THE 4.4 CROSS-CHECK. The score the floor prints for the last edition and
       the score the canary station's own bar prints for it are ONE number, and
       the read is out of the array so the comparison is a real one at boot
       rather than something the bundler folds away. */
    if (newest.judged !== SCORE_A) {
      throw new Error("[edit] the pile's newest receipt scores v6 differently than the canary's own bar does");
    }
    if (BAR_A_LBL !== `v${newest.to} ${SCORE_A}`) {
      throw new Error("[edit] the canary's bar does not name the version the pile's newest receipt is of");
    }
    if (!(newest.judged < SCORE_B)) {
      throw new Error("[edit] the new edition did not out-score the one it replaced");
    }

    /* ── WHAT EACH CARD PRINTS ──────────────────────────────────────────── */
    for (const c of PILE) {
      const rows = pileRows(c);
      if (rows.length !== RCPT_ROWS.length || rows.some(([l], k) => l !== RCPT_ROWS[k]![0])) {
        throw new Error(`[edit] "${pileIdent(c)}" prints a different journey than this printer prints`);
      }
      /* The live paper draws a tick where a stamp has no value to print. At
         pile scale that mark is smaller than a reader can resolve, so a card
         stops at the stamps that carry one — checked rather than assumed, and
         it trips the moment a taller card starts printing `routed`. */
      if (rows.slice(0, PILE_LINE_N).some(([, v]) => v === "")) {
        throw new Error("[edit] an earlier edition would need a drawn tick, which is unreadable at pile scale");
      }
      if (monoWidth(pileIdent(c), PILE_IDENT_SIZE) > inner) {
        throw new Error(`[edit] the pile is narrower than "${pileIdent(c)}"`);
      }
      for (const l of pileLines(c)) {
        if (monoWidth(l, PILE_LINE_SIZE) > inner) {
          throw new Error(`[edit] the pile is narrower than "${l}"`);
        }
      }
      if (!pileLines(c).some((l) => l.endsWith(` v${c.to}`))) {
        throw new Error(`[edit] "${pileIdent(c)}" does not say which version it saved`);
      }
      /* Where it lies, rotation and torn teeth included: between the ticket
         and the printer, and on the floor rather than through it. */
      const quad = pileQuad(c);
      const xs = quad.map((p) => p[0]);
      const ys = quad.map((p) => p[1]);
      if (Math.min(...xs) < PILE_FLOOR_X0 || Math.max(...xs) > PILE_FLOOR_X1) {
        throw new Error("[edit] an earlier edition lies under the ticket or the printer");
      }
      if (Math.min(...ys) - TEETH_H < PILE_FLOOR_Y0 || Math.max(...ys) > PILE_FLOOR_Y1) {
        throw new Error("[edit] an earlier edition is off the floor");
      }
    }

    /* ── WHAT THE STACK LETS THE READER READ ─────────────────────────────
       The pile's whole claim, and the only part of it a comment cannot keep
       true. Every ink box is asked against the cards lying ON TOP of it —
       later in the array is later in the paint order — so the three statements
       below are measurements rather than intentions:

         · the deepest shows paper and no print (its ident is buried),
         · the middle one hands over its ident,
         · the newest of the old reads as a receipt: its ident plus at least
           PILE_MIN_LINES of its stamps, none of them under anything. */
    const clearOfStack = (i: number, ink: readonly (readonly [number, number])[]): boolean =>
      PILE.every((o, j) => j <= i || ink.every((p) => !inQuad(pileQuad(o), p[0], p[1])));
    const buriedByStack = (i: number, ink: readonly (readonly [number, number])[]): boolean =>
      PILE.some((o, j) => j > i && ink.every((p) => inQuad(pileQuad(o), p[0], p[1])));
    const identInk = (c: PileEdit): readonly (readonly [number, number])[] =>
      pileInk(c, pileIdent(c), PILE_IDENT_SIZE, PILE_IDENT_DY);
    const top = PILE.length - 1;
    const middle = PILE.length - 2;
    /* And every card is IN the picture: a stack whose deepest sheet is wholly
       under the ones on top of it is a stack of one, however many are in the
       array. One free corner each is the whole of "a corner peeking". */
    PILE.forEach((c, i) => {
      if (!pileQuad(c).some((p) => clearOfStack(i, [p]))) {
        throw new Error(`[edit] "${pileIdent(c)}" is completely buried — the pile is shorter than it says it is`);
      }
    });
    if (!buriedByStack(0, identInk(PILE[0]!))) {
      throw new Error("[edit] the deepest edition in the pile shows print it is meant to keep under the next one");
    }
    if (!clearOfStack(middle, identInk(PILE[middle]!))) {
      throw new Error("[edit] the middle edition in the pile cannot be identified — its ident is under the card on top");
    }
    if (!clearOfStack(top, identInk(PILE[top]!))) {
      throw new Error("[edit] the newest edition on the floor cannot be identified");
    }
    {
      const c = PILE[top]!;
      const readable = pileLines(c).filter((l, k) =>
        clearOfStack(top, pileInk(c, l, PILE_LINE_SIZE, PILE_LINE_DY0 + k * PILE_LINE_PITCH)),
      ).length;
      if (readable < PILE_MIN_LINES) {
        throw new Error(`[edit] the newest edition on the floor shows ${readable} of its stamps, and the pile is meant to show at least ${PILE_MIN_LINES}`);
      }
    }

    /* ── THE CAPTION (above the pile now — a caption reads before its
       subject, per the user's call). Its ink must clear the tallest card's
       torn teeth below it, and it still may not run into the ticket or the
       printer. */
    for (const [line, size] of [
      [PILE_TITLE, PILE_TITLE_SIZE],
      [PILE_SUB, PILE_SUB_SIZE],
    ] as const) {
      if (
        PILE_LABEL_X < PILE_FLOOR_X0 ||
        PILE_LABEL_X + monoWidth(line, size) > PILE_FLOOR_X1
      ) {
        throw new Error("[edit] the pile's caption runs into the ticket or the printer");
      }
    }
    if (PILE_SUB_Y - PILE_SUB_SIZE * INK_CAP <= PILE_TITLE_Y + 2) {
      throw new Error("[edit] the pile's two caption lines are printed over each other");
    }
    {
      const highest =
        Math.min(...PILE.flatMap((c) => pileQuad(c).map((p) => p[1]))) - TEETH_H;
      if (PILE_SUB_Y + PILE_SUB_SIZE * INK_DESC >= highest - 4) {
        throw new Error("[edit] the pile's caption is printed on the paper it is about");
      }
    }
    /* The history is on the floor before the new edition starts coming out. */
    if (L_PILE_AT + PILE.length * L_PILE_STEP + L_PILE_RUN > L_PRINT_AT) {
      throw new Error("[edit] the pile is still settling when the new receipt starts printing");
    }

    /* ── AND THE PAPER ITSELF ───────────────────────────────────────────── */
    for (const c of PILE) {
      /* Explicit origin (DESIGN §3): the card turns about its own centre, and
         the number is written into the transform rather than left to a
         default. The scrub only ever tweens this group's y and opacity. */
      const g = svgEl("g", {
        transform: `rotate(${c.rot} ${c.x + PILE_W / 2} ${c.y + PILE_H / 2})`,
      }) as SVGGElement;
      g.appendChild(svgEl("path", { class: "edt-pile-card", d: pileCardPath(c) }));
      const id = svgEl("text", {
        class: "edt-pile-ident",
        x: c.x + PILE_PAD,
        y: c.y + PILE_IDENT_DY,
      });
      id.textContent = pileIdent(c);
      g.appendChild(id);
      g.appendChild(
        svgEl("path", {
          class: "edt-pile-rule",
          d: `M ${c.x + PILE_PAD} ${c.y + PILE_RULE_DY} L ${c.x + PILE_W - PILE_PAD} ${c.y + PILE_RULE_DY}`,
        }),
      );
      pileLines(c).forEach((text, k) => {
        const t = svgEl("text", {
          class: "edt-pile-line",
          x: c.x + PILE_PAD,
          y: c.y + PILE_LINE_DY0 + k * PILE_LINE_PITCH,
        });
        t.textContent = text;
        g.appendChild(t);
      });
      pileG.appendChild(g);
      pileCards.push(g);
    }
    pileTitle.textContent = PILE_TITLE;
    pileSub.textContent = PILE_SUB;
    pileG.append(pileTitle, pileSub);

    /* ── the pointer to the printer ─────────────────────────────────────
       It leaves the sub-line's last word and travels RIGHT, nearly level,
       into the printer's flank — so the head points AT the machine (user
       catch: an upward tip near the mouth read as pointing at air). */
    {
      const lblEnd = PILE_LABEL_X + monoWidth(PILE_SUB, PILE_SUB_SIZE);
      const c: readonly number[] = [
        lblEnd + 8, PILE_SUB_Y - 4,
        lblEnd + 40, PILE_SUB_Y - 15,
        RCPT_X - 32, PILE_SUB_Y - 13,
        RCPT_X - 6, PILE_SUB_Y - 8,
      ];
      pileArrow.setAttribute(
        "d",
        `M ${c[0]} ${c[1]} C ${c[2]} ${c[3]} ${c[4]} ${c[5]} ${c[6]} ${c[7]}`,
      );
      const back = Math.atan2(c[5]! - c[7]!, c[4]! - c[6]!);
      const rad = (TEAR_HEAD_DEG * Math.PI) / 180;
      const b = (a: number): string =>
        `${(c[6]! + TEAR_HEAD_LEN * Math.cos(a)).toFixed(2)} ${(c[7]! + TEAR_HEAD_LEN * Math.sin(a)).toFixed(2)}`;
      pileArrowHead.setAttribute("d", `M ${b(back - rad)} L ${c[6]} ${c[7]} L ${b(back + rad)}`);
      /* The tip must stand just off the printer's left edge, on its flank —
         and the approach must be TRAVELLING RIGHT (tip x past the last
         control), or the head faces the wrong thing. */
      if (
        c[0]! <= lblEnd ||
        c[6]! >= RCPT_X ||
        c[6]! < RCPT_X - 16 ||
        c[6]! <= c[4]! ||
        c[7]! < MOUTH_Y + 60 ||
        c[7]! > RCPT_PERF_Y - 60
      ) {
        throw new Error("[edit] the pile's pointer does not run from the caption into the printer's side");
      }
      pileG.append(pileArrow, pileArrowHead);
    }
  }

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
  /* THE TICKET'S RAIL TWIN (user call, thrice refined): the torn ticket lives
     IN THE RAIL from the moment the first ci run produces it, and it lives in
     its OWN SLOT — a flow child between the caption box and the progress
     line, never inside the caption box, because the captions and the closing
     statement own that box and the long captions ran into a ticket parked
     there (his catch). One spot the whole way: below the ci caption at
     station 3, below the verdict at the landing, nothing reflows because the
     slot is reserved whether or not the paper is lit. The twin is CLONED
     from the stage's own nodes (never re-typed strings, so the two can't
     drift), in the frame window the still already names for it. Its rest is
     stylesheet-owned (opacity 0 in .edt-closing-tkt); the stage copy never
     appears at all. */
  const closingTkt = doc.createElementNS(SVG_NS, "svg") as unknown as SVGSVGElement;
  closingTkt.setAttribute("class", "edt-closing-tkt");
  /* The still's window (STILL_TKT_VIEW) with its 10u of top headroom cut:
     a card frames with air, but in the rail the paper hangs from the words
     above it, and dead sky between them reads as a gap (user call). */
  closingTkt.setAttribute("viewBox", "14 510 210 82");
  closingTkt.setAttribute("aria-hidden", "true");
  for (const el of Array.from(ticket.children)) {
    const c = el.cloneNode(true) as SVGElement;
    c.removeAttribute("id");
    closingTkt.appendChild(c);
  }
  {
    const progress = q<HTMLElement>(doc, "#edt-pin .eng-progress");
    (progress.parentNode as HTMLElement).insertBefore(closingTkt, progress);
  }

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
  const limitLbl = q<SVGTextElement>(svg, "#edt-limit");
  const heldLbl = q<SVGTextElement>(svg, "#edt-held");
  const brk = q<SVGPathElement>(svg, "#edt-brk");
  const brkLbl = q<SVGTextElement>(svg, "#edt-brk-lbl");

  /* ── the landing receipt ───────────────────────────────────────────────── */
  const teeth = q<SVGPathElement>(svg, "#edt-teeth");
  const rcptFringe = q<SVGPathElement>(svg, "#edt-rcpt-fringe");
  const rcptFeed = q<SVGGElement>(svg, "#edt-rcpt-feed");
  const rcptPaper = q<SVGGElement>(svg, "#edt-rcpt-paper");
  const tearHere = q<SVGTextElement>(svg, "#edt-tear-here");
  const tearArrow = q<SVGPathElement>(svg, "#edt-tear-arrow");
  const tearHead = q<SVGPathElement>(svg, "#edt-tear-head");

  const stage = q<HTMLElement>(doc, ".edt-stage");
  const toggle = q<HTMLButtonElement>(doc, "#edt-toggle");
  const toggleName = q<HTMLElement>(doc, "#edt-toggle-name");
  const tearBtn = q<HTMLButtonElement>(doc, "#edt-tear");
  const closingRule = q<HTMLElement>(doc, "#edt-closing-rule");
  const closingText = q<HTMLElement>(doc, "#edt-closing-text");
  const bridgeLines = Array.from(doc.querySelectorAll<HTMLElement>(".edt-bridge-line"));

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
  /* THE RAIL'S OWN LINE AND ORIGIN ARE AUTHORED IN THE MARKUP — a still clone
     is a clone of the markup, so they have to be there — and nothing in this
     file writes them back. That makes RAIL_X0/RAIL_X1/RAIL_Y/RAIL_TICK_H the
     one set of numbers here that can drift from what is actually drawn: this
     slice moved all four and the drift would have been invisible, because a
     rail 30u short still looks like a rail. Read back, never assumed. */
  {
    const drawn: readonly [SVGPathElement, string, string][] = [
      [railLine, `M ${RAIL_X0} ${RAIL_Y} L ${RAIL_X1} ${RAIL_Y}`, "#edt-rail-line"],
      [
        railOriginTick,
        `M ${RAIL_X0} ${RAIL_Y - RAIL_TICK_H} L ${RAIL_X0} ${RAIL_Y + RAIL_TICK_H}`,
        "#edt-rail-origin",
      ],
    ];
    for (const [el, d, sel] of drawn) {
      if (el.getAttribute("d") !== d) {
        throw new Error(`[edit] ${sel} is drawn at numbers this file does not use`);
      }
    }
    if (
      Number(railOriginLbl.getAttribute("x")) !== RAIL_X0 ||
      Number(railOriginLbl.getAttribute("y")) !== RAIL_LBL_Y
    ) {
      throw new Error("[edit] the rail's origin label is not under the rail's own origin");
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
    if (!inBay(7, LANE8_LBL_X, BRK_X1) || !inBand(LANE_Y0 - 12, lastLaneY + 12)) {
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

    /* ── the flood, and everything printed off it ───────────────────────── */

    /* The five that clear the valve stand PAST it and inside the lane; the
       seven that do not stand BEHIND it, and the back of the queue is the
       valve itself. */
    if (PASS_X0 - FLOOD_R <= VALVE_X) {
      throw new Error("[edit] a message that got through is standing behind the valve");
    }
    if (PASS_X0 + (FLOOD_PASS - 1) * PASS_PITCH + FLOOD_R > LANE8_X1) {
      throw new Error("[edit] a message that got through stands off the end of its own lane");
    }
    if (FLOOD_QUEUE_X1 + FLOOD_R >= VALVE_X) {
      throw new Error("[edit] the queue runs through the valve that is holding it");
    }
    if (FLOOD_QUEUE_X0 - FLOOD_R < LANE8_X0) {
      throw new Error("[edit] the queue runs off the back end of its own lane");
    }
    /* A QUEUE IS A SPACING: held messages stand closer together than the ones
       that got through. If the two pitches matched, the valve would have shut
       and the picture would say nothing happened. */
    if (FLOOD_QUEUE_PITCH >= PASS_PITCH) {
      throw new Error("[edit] the throttled messages do not actually queue up");
    }
    if (FLOOD_FROM_X >= LANE8_X0 || FLOOD_FROM_X < bayCx(7) - CONTENT_HALF) {
      throw new Error("[edit] the flood does not come in from the customer's side of the lane");
    }
    /* THE FLOOD IS VISIBLY FASTER THAN ANY OTHER LANE, and the honest test of
       that is not a pitch against a pitch — every other customer sends ONE
       message in the station's whole dwell — but whether the messages OVERLAP
       IN FLIGHT. A burst whose pitch is longer than a message's own travel is
       a queue of separate arrivals; one whose pitch is a fraction of it is a
       flood, and the reader sees a lane with several messages on it at once.
       The second clause keeps the whole burst well inside its station. */
    if (FLOOD_PITCH >= FLOOD_DUR / 3) {
      throw new Error("[edit] the flood's messages never overlap in flight, so it is not a flood");
    }
    if (FLOOD_N * FLOOD_PITCH >= LANDING_AT - STATION_AT[7]! - 10) {
      throw new Error("[edit] the flood does not finish arriving inside its own station");
    }
    if (REPLY_STAGGER <= FLOOD_PITCH) {
      throw new Error("[edit] the four single messages arrive as fast as the flood does");
    }
    /* THE COUNTER CANNOT LIE. Every reading is checked against the dots that
       have actually finished arriving by the unit it is printed on — the one
       error in this station a reviewer cannot catch by eye, because a counter
       reading 12 over eleven dots looks exactly right. */
    for (const [i, r] of RATE_READS.entries()) {
      if (floodArrivedBy(r.at) !== r.count) {
        throw new Error(
          `[edit] the rate counter reads ${r.count} where ${floodArrivedBy(r.at)} messages have arrived`,
        );
      }
      if (!r.label.startsWith(`${r.count} msgs`)) {
        throw new Error(`[edit] rate reading "${r.label}" does not print its own count`);
      }
      if (i > 0 && (r.at <= RATE_READS[i - 1]!.at || r.count <= RATE_READS[i - 1]!.count)) {
        throw new Error("[edit] the rate counter does not climb");
      }
      if (monoWidth(r.label, RATE_SIZE) > RATE_AP_W) {
        throw new Error(`[edit] rate reading "${r.label}" is wider than its own aperture`);
      }
    }
    if (RATE_READS[RATE_READS.length - 1]!.count !== FLOOD_N) {
      throw new Error("[edit] the rate counter never counts the whole flood");
    }
    if (RATE_AP_H !== RATE_PITCH || RATE_BASE_Y <= RATE_AP_Y || RATE_BASE_Y > RATE_AP_Y + RATE_AP_H) {
      throw new Error("[edit] the rate counter's aperture is not one cell of its own column");
    }
    if (!inBay(7, RATE_AP_X, RATE_AP_X + RATE_AP_W) || !inBand(RATE_AP_Y, RATE_AP_Y + RATE_AP_H)) {
      throw new Error("[edit] the rate counter leaves the lanes' own bay");
    }
    /* THE LEDGER RECONCILES, and it reconciles against the flood rather than
       against itself: received is what has landed, answered is what the limit
       let through, held is the rest. Three sums that always add up, and none
       of them typed twice. */
    for (const [i, l] of LEDGER.entries()) {
      if (l.received !== l.answered + l.held) {
        throw new Error(`[edit] ledger reading ${i} does not add up`);
      }
      if (l.received !== floodArrivedBy(l.at)) {
        throw new Error(
          `[edit] the ledger says ${l.received} received where ${floodArrivedBy(l.at)} have arrived`,
        );
      }
      if (l.answered !== Math.min(l.received, FLOOD_PASS)) {
        throw new Error(`[edit] ledger reading ${i} answers a different number than the limit allows`);
      }
      if (i > 0 && l.at <= LEDGER[i - 1]!.at) {
        throw new Error("[edit] the ledger runs backwards");
      }
      if (monoWidth(ledgerText(l), LEDGER_SIZE) + LEDGER_X > VALVE_X - VALVE_HALF) {
        throw new Error(`[edit] the ledger is printed over the valve it reports on`);
      }
    }
    if (LEDGER[LEDGER.length - 1]!.held !== FLOOD_HELD) {
      throw new Error("[edit] the ledger's final tally is not the queue standing behind the valve");
    }
    if (!inBand(LEDGER_Y - LEDGER_SIZE, LEDGER_Y + 4) || LEDGER_Y + 4 >= laneY8(FLOOD_LANE) - VALVE_HALF) {
      throw new Error("[edit] the ledger collides with the lane it reports on");
    }
    /* The valve says what it IS before it says what it did, and both readings
       fit between the lane it sits on and the one below it. */
    if (!VALVE_LIMIT.includes(String(FLOOD_PASS))) {
      throw new Error("[edit] the valve's label does not carry the limit it enforces");
    }
    for (const s of [VALVE_LIMIT, VALVE_HELD]) {
      const half = monoWidth(s, VALVE_LBL_SIZE) / 2;
      if (!inBay(7, VALVE_LBL_X - half, VALVE_LBL_X + half)) {
        throw new Error(`[edit] the valve label "${s}" leaves its own bay`);
      }
      if (VALVE_LBL_X + half >= GHOST_X0 + ((VALVE_LBL_Y - GHOST_Y0) * (GHOST_X1 - GHOST_X0)) / (GHOST_Y1 - GHOST_Y0)) {
        throw new Error(`[edit] the valve label "${s}" runs into the ghost's strike`);
      }
    }
    if (VALVE_LBL_Y <= laneY8(FLOOD_LANE) + VALVE_HALF || VALVE_LBL_Y >= laneY8(FLOOD_LANE + 1) - 8) {
      throw new Error("[edit] the valve's label does not sit between its lane and the next");
    }
    /* THE FOUR REPLIES LAND AFTER THE VALVE HAS SHUT. The timing IS the
       argument — a `delivered` that arrived before the throttle would prove
       nothing at all — so it is a comparison between two named units rather
       than something the eye has to catch. */
    if (S8_REPLY_AT <= S8_AMBER_AT + S8_AMBER_DUR) {
      throw new Error("[edit] the four unaffected replies land before the valve has closed");
    }
    if (S8_VALVE_AT <= floodLanded(FLOOD_PASS - 1) - S8_VALVE_DUR) {
      throw new Error("[edit] the valve shuts before the messages it was supposed to let through");
    }
    if (S8_VALVE_AT + S8_VALVE_DUR > floodLanded(FLOOD_PASS) + 0.5) {
      throw new Error("[edit] the valve is still open when the message over the limit lands");
    }
    /* The latency stamps sit past the receipts they qualify, and there is one
       per unaffected lane. */
    if (LATENCIES.length !== LANE_N - 1) {
      throw new Error("[edit] there is not one latency stamp per unaffected lane");
    }
    if (LAT_X < DELIVERED_X + monoWidth(DELIVERED, DELIVERED_SIZE) + 8) {
      throw new Error("[edit] a latency stamp is printed over the receipt it belongs to");
    }
    if (monoWidth(MUTED, DELIVERED_SIZE) > monoWidth(DELIVERED, DELIVERED_SIZE)) {
      throw new Error("[edit] the muted reading is wider than the receipt it replaces");
    }
    /* THE BRACKET SPANS EXACTLY THE FOUR NON-FLOOD LANES. A bracket that
       reached across lane 3 would be the opposite of what it says. */
    {
      const spanned = BRK_LANES.flat();
      if (spanned.length !== LANE_N - 1 || spanned.includes(FLOOD_LANE)) {
        throw new Error("[edit] the bracket does not span exactly the four unaffected lanes");
      }
      if (new Set(spanned).size !== spanned.length) {
        throw new Error("[edit] the bracket spans a lane twice");
      }
      if (!BRK_LABEL.includes(`${LANE_N - 1} of ${LANE_N - 1}`)) {
        throw new Error("[edit] the bracket's label counts a different number of lanes than it spans");
      }
      if (BRK_X0 < LAT_X + monoWidth(LATENCIES[0]!, LAT_SIZE) + 8) {
        throw new Error("[edit] the bracket is drawn over the evidence it brackets");
      }
      if (BRK_LBL_Y > LANE_Y0 - 12 || BRK_LBL_Y - BRK_SIZE < CONTENT_Y0) {
        throw new Error("[edit] the bracket's label sits on the top lane, or above the content band");
      }
      if (BRK_X1 - monoWidth(BRK_LABEL, BRK_SIZE) < bayCx(7) - CONTENT_HALF) {
        throw new Error("[edit] the bracket's label runs out of its own bay");
      }
    }
    /* The notice goes back to the customer without driving through the queue
       it caused. */
    if (NOTICE_FROM + NOTICE_W / 2 > FLOOD_QUEUE_X0 || NOTICE_TO - NOTICE_W / 2 < LANE8_X0) {
      throw new Error("[edit] the throttle notice collides with the queue it is about");
    }
    if (monoWidth(NOTICE_TEXT, 10) > NOTICE_W - 20) {
      throw new Error("[edit] the notice is narrower than what is printed on it");
    }
    /* The ghost strikes every lane, and its label clears the bay. */
    if (GHOST_Y0 > LANE_Y0 || GHOST_Y1 < lastLaneY) {
      throw new Error("[edit] the ghost's strike does not cross all five lanes");
    }
    if (monoWidth(GHOST_LABEL, RUBRIC_SIZE) / 2 + GHOST_LBL_X > bayCx(7) + CONTENT_HALF) {
      throw new Error("[edit] the ghost's label runs out of its own bay");
    }
    if (GHOST_LBL_X + monoWidth(GHOST_LABEL, RUBRIC_SIZE) / 2 >= BRK_X1 - monoWidth(BRK_LABEL, BRK_SIZE)) {
      /* Both labels are right-hand furniture at this station; they are on
         different latitudes, and this is what keeps them there. */
      if (Math.abs(GHOST_LBL_Y - BRK_LBL_Y) < 20) {
        throw new Error("[edit] the ghost's label and the bracket's label are printed over each other");
      }
    }
  }

  /* ════════════════════════════════════════════════════════════════════════
     BOOT ASSERTS — the landing receipt and the door
     Frame space, not world space. Two things are being checked: that the
     paper holds what is printed on it, and that the receipt is a true copy of
     the rail — a flight recorder whose paper copy said something else would
     be the one object on this page that could be caught lying.
     ════════════════════════════════════════════════════════════════════════ */

  {
    const inner = RCPT_X + RCPT_W - RCPT_PAD;
    const textX = RCPT_X + RCPT_PAD;
    const fits: readonly (readonly [string, number])[] = [
      [RCPT_WORDMARK, RCPT_WORDMARK_SIZE],
      ...RCPT_HEAD.map((l) => [l, RCPT_SIZE] as const),
      ...RCPT_LINES.map((l) => [l, RCPT_SIZE] as const),
      [RCPT_TOTAL, RCPT_SIZE],
      [RCPT_SIGN, RCPT_SIGN_SIZE],
      [RCPT_CODE_CAP, RCPT_SIGN_SIZE],
    ];
    for (const [line, size] of fits) {
      if (textX + monoWidth(line, size) > inner) {
        throw new Error(`[edit] the receipt is narrower than "${line}"`);
      }
    }
    /* The strip stands clear of the two other frame-space objects it shares
       the stage with: the version rail it is a copy of, and the torn ticket. */
    if (MOUTH_Y < RAIL_LBL_Y + 10 || RCPT_PERF_Y > FRAME_H - 40) {
      throw new Error("[edit] the receipt runs into the version rail, or off the bottom of the frame");
    }
    if (RCPT_X < TKT_X1 + 20 || RCPT_X + RCPT_W > FRAME_W - 20) {
      throw new Error("[edit] the receipt collides with the torn ticket, or leaves the frame");
    }
    /* The lines are in printing order and none of them lands on another. */
    if (RCPT_HEAD_Y0 <= MOUTH_Y + RCPT_SIZE) {
      throw new Error("[edit] the receipt's first line is printed inside the mouth");
    }
    {
      const lastHead = RCPT_HEAD_Y0 + (RCPT_HEAD.length - 1) * RCPT_HEAD_PITCH;
      const lastLine = RCPT_LINE_Y0 + (RCPT_LINES.length - 1) * RCPT_LINE_PITCH;
      /* Top of the anatomy: name, double rule, header, mid rule, stamps. */
      if (
        RCPT_WORDMARK_Y <= MOUTH_Y + RCPT_WORDMARK_SIZE ||
        RCPT_DBLRULE_Y <= RCPT_WORDMARK_Y + 2 ||
        RCPT_HEAD_Y0 <= RCPT_DBLRULE_Y + 3 + RCPT_SIZE ||
        RCPT_MIDRULE_Y <= lastHead + 4 ||
        RCPT_LINE_Y0 <= RCPT_MIDRULE_Y + RCPT_SIZE
      ) {
        throw new Error("[edit] the receipt's header anatomy is printed out of order");
      }
      if (RCPT_RULE_Y <= lastLine + 6 || RCPT_TOTAL_Y <= RCPT_RULE_Y + RCPT_SIZE) {
        throw new Error("[edit] the receipt's total is printed over the rule above it");
      }
      /* Bottom of the anatomy: total, sign-off, barcode, caption, perf. */
      if (
        RCPT_SIGN_Y <= RCPT_TOTAL_Y + 4 ||
        RCPT_CODE_Y0 <= RCPT_SIGN_Y + 2 ||
        RCPT_CODE_CAP_Y <= RCPT_CODE_Y0 + RCPT_CODE_H ||
        RCPT_CODE_CAP_Y + 3 > RCPT_PERF_Y
      ) {
        throw new Error("[edit] the receipt's barcode block is printed out of order");
      }
    }
    /* THE PAPER COPY IS A TRUE COPY OF THE RAIL. Eight stamps, seven lines —
       the canary's two are one event with two ends — and every stamp's own
       words appear on exactly one line of the receipt. */
    if (RCPT_LINES.length !== STAMPS.length - 1) {
      throw new Error("[edit] the receipt prints a different number of events than the rail recorded");
    }
    for (const s of STAMPS) {
      /* The leader dots sit between a stamp's words now, so the check is by
         TOKEN rather than substring: every word of the stamp must appear on
         exactly one line, with the `·` leaders themselves filtered out. */
      const words = s.label.split(" ").filter((w) => w !== "·");
      const on = RCPT_LINES.filter((l) => {
        const cells = l.split(" ").filter((w) => w !== "·");
        return words.every((w) => cells.includes(w));
      });
      if (on.length !== 1) {
        throw new Error(`[edit] the rail stamp "${s.label}" is printed ${on.length} times on the receipt`);
      }
    }
    if (RCPT_TOTAL !== `total · ${STATION_AT.length - 1} stations · 1 edit`) {
      throw new Error("[edit] the receipt's total counts a different journey than the one it printed");
    }
    /* The teeth tile the strip exactly — a bar whose last tooth ran past the
       paper would be a bar the paper was not cut on. */
    if (TEETH_N * TEETH_W !== RCPT_W || TEETH_H <= 0 || TEETH_H > 6) {
      throw new Error("[edit] the serrated bar does not tile the strip it cuts");
    }
    /* The whisper sits BESIDE the strip, not on it, and inside the frame. */
    if (TEAR_HERE_X < RCPT_X + RCPT_W + 12) {
      throw new Error("[edit] `tear here` is printed on the paper it is about");
    }
    if (TEAR_HERE_X + monoWidth(TEAR_HERE, TEAR_HERE_SIZE) > FRAME_W - 4 || TEAR_HERE_Y > FRAME_H - 40) {
      throw new Error("[edit] `tear here` runs off the frame");
    }
    /* THE HEAD IS DERIVED FROM ITS CURVE, not authored (three hand-authored
       heads disagreed with their line in a row — user catches, every one).
       The markup carries a placeholder; boot computes the two barbs at
       ±TEAR_HEAD_DEG about the tangent the curve ACTUALLY ends on,
       TEAR_HEAD_LEN long, standing on the tip. A chevron cannot be parked
       near its line if the line is what draws it — the assert became the
       generator. */
    {
      const nums = (el: SVGPathElement): number[] =>
        ((el.getAttribute("d") ?? "").match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
      const c = nums(tearArrow);
      if (c.length !== 8) {
        throw new Error("[edit] the whisper's arrow is not one cubic");
      }
      const tipX = c[6]!;
      const tipY = c[7]!;
      const back = Math.atan2(c[5]! - tipY, c[4]! - tipX);
      const rad = (TEAR_HEAD_DEG * Math.PI) / 180;
      const barb = (a: number): string =>
        `${(tipX + TEAR_HEAD_LEN * Math.cos(a)).toFixed(2)} ${(tipY + TEAR_HEAD_LEN * Math.sin(a)).toFixed(2)}`;
      tearHead.setAttribute(
        "d",
        `M ${barb(back - rad)} L ${tipX} ${tipY} L ${barb(back + rad)}`,
      );
    }
    /* THE PRINT SETTLES BEFORE THE WHISPER, and nothing is still being built
       when the held ending begins. The second one is what makes the ending an
       ending; the first is what stops the scene telling the reader to tear
       something that is still coming out of the machine. */
    if (L_PRINT_AT + L_PRINT_DUR > L_HINT_AT) {
      throw new Error("[edit] `tear here` arrives while the receipt is still printing");
    }
    if (LANDING_AT + L_HINT_AT + L_HINT_RUN > HOLD_FROM) {
      throw new Error("[edit] the landing is still building itself inside the held ending");
    }
    if (LANDING_AT + L_CLOSE_AT <= LANDING_AT || L_CLOSE_AT >= L_PRINT_AT) {
      throw new Error("[edit] the closing statement does not arrive before the print it closes");
    }
    /* ── the fall ─────────────────────────────────────────────────────────
       Damped, alternating, and a bow rather than a ripple. All three are
       properties of the arrays rather than of the code that reads them, so
       an edit that made the paper oscillate for ever trips here. */
    for (let i = 1; i < FALL_SWINGS.length; i++) {
      if (Math.abs(FALL_SWINGS[i]!) >= Math.abs(FALL_SWINGS[i - 1]!)) {
        throw new Error("[edit] the fall's swings do not shrink");
      }
      if (Math.sign(FALL_SWINGS[i]!) === Math.sign(FALL_SWINGS[i - 1]!)) {
        throw new Error("[edit] the fall's swings do not alternate");
      }
    }
    if (FALL_TILT.length !== FALL_SWINGS.length || FALL_BOW.length !== FALL_SWINGS.length) {
      throw new Error("[edit] the fall's lean and its bow do not follow its swings");
    }
    for (const [i, t] of FALL_TILT.entries()) {
      if (Math.sign(t) !== Math.sign(FALL_SWINGS[i]!)) {
        throw new Error("[edit] the paper leans away from the swing it is taking");
      }
      /* And the BOW reverses with each swing — that is the whole difference
         between paper bending and cloth rippling. */
      if (Math.sign(FALL_BOW[i]!) === Math.sign(FALL_SWINGS[i]!)) {
        throw new Error("[edit] the paper's bend does not reverse against its swing");
      }
      if (Math.abs(FALL_BOW[i]!) > 8) {
        throw new Error("[edit] the paper's bend is a fold rather than a hint");
      }
    }
    /* The tear matches scene 4's ticket EXACTLY (user call, overruling the
       earlier two-characters rule): one page, one tearing feel. Parity is by
       equality so neither door can drift a different hand. */
    if (TEAR_RUN !== 1.45) {
      throw new Error("[edit] the tear does not run at scene 4's ticket's bar (one tearing feel)");
    }
    if (TEAR_END_ROT >= 0 || TEAR_END_ROT < -20 || TEAR_CONE_SKEW >= 0) {
      throw new Error("[edit] the tear's sag or flex is not a sag or a flex");
    }
    /* And the fall stays a fall. Long enough to watch, short enough that the
       reader is not waiting on a piece of paper — and it must outlast the
       glide it is released with, or the page arrives before the strip does. */
    /* Upper bound user-tuned across 2.7 / 3.1 / 4: the fall is the payoff and
       the reader chose to linger on it. 4.5 stays the line past which paper
       reads as a feather. */
    if (FALL_DUR < 2.0 || FALL_DUR > 4.5 || TEAR_RUN + FALL_DUR <= TEAR_RUN + GLIDE_DUR) {
      throw new Error("[edit] the fall is not a fall, or the page lands before the strip is gone");
    }
    /* THE SUBSET LAW, AS AN ASSERT rather than as one more comment nobody
       reads. The self-hosted latin faces carry U+0000–00FF plus a short list;
       everything this slice prints is measured with monoWidth(), and a glyph
       outside the subset is painted by a FALLBACK face whose advance this
       file does not know. So a width assert over such a string is a coin
       toss, and the string is the bug. `·` (U+00B7) and `º` (U+00BA) are in
       the subset, which is exactly why the whole page uses those two and
       never U+2192, U+2713, U+2265 or U+2116. */
    const printed = [
      ...RCPT_HEAD,
      ...RCPT_LINES,
      RCPT_TOTAL,
      ...PILE.map(pileIdent),
      ...PILE.flatMap((c) => pileLines(c)),
      PILE_TITLE,
      PILE_SUB,
      TEAR_HERE,
      VALVE_LIMIT,
      VALVE_HELD,
      BRK_LABEL,
      MUTED,
      ...LATENCIES,
      ...RATE_READS.map((r) => r.label),
      ...LEDGER.map(ledgerText),
    ];
    for (const s of printed) {
      for (const ch of s) {
        const cp = ch.codePointAt(0)!;
        if (cp > 0xff) {
          throw new Error(
            `[edit] "${s}" carries U+${cp.toString(16).toUpperCase()}, which the self-hosted latin subset does not have`,
          );
        }
      }
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
      if (y < WORLD_TOP || y + h > CONTENT_Y1 + 8) {
        throw new Error(`[edit] still window "${box}" looks outside the world`);
      }
    }
  }
  /* THE CI WINDOW HAS TO HOLD THE COMMIT IT IS ABOUT. The chip is 344u wide
     and the ceiling is 470, so "the bar cleared and the commit went through"
     is a picture with almost no slack in it — which is exactly the kind of
     thing an eye reads as fine and a number does not. */
  {
    const n = STILL_VIEW[2]!.boxes[0]!.split(" ").map(Number) as [number, number, number, number];
    if (STILL_CHIP_AT - CHIP_W / 2 < n[0] || STILL_CHIP_AT + CHIP_W / 2 > n[0] + n[2]) {
      throw new Error("[edit] the ci close-up cannot hold the commit standing through the gate");
    }
    if (GATE_X < n[0] || GATE_X > n[0] + n[2]) {
      throw new Error("[edit] the ci close-up does not show the gate the commit came through");
    }
  }

  /* ── the two frame-space windows ────────────────────────────────────────
     Same discipline, one rung simpler: a frame window is measured against the
     frame rather than against a bay, and each one has to actually CONTAIN the
     object it is named for. A window that framed the ticket's neighbourhood
     would be a card showing an empty margin. */
  {
    const frameWindows: readonly { box: string; name: string; x0: number; y0: number; x1: number; y1: number }[] = [
      { box: STILL_TKT_VIEW, name: "the torn ticket", x0: TKT_X0, y0: TKT_Y0, x1: TKT_X1, y1: TKT_TEAR + 4 },
      {
        box: STILL_RCPT_VIEW,
        name: "the landing receipt",
        x0: RCPT_X,
        y0: MOUTH_Y - TEETH_H,
        x1: RCPT_X + RCPT_W,
        y1: RCPT_PERF_Y,
      },
      /* The whole last frame. It holds every frame-space object there is, and
         it is the one window the ceiling does not apply to. */
      { box: STILL_WHOLE, name: "the scene's last frame", x0: TKT_X0, y0: RAIL_NOTCH_TOP, x1: RCPT_X + RCPT_W, y1: RCPT_PERF_Y },
    ];
    for (const fw of frameWindows) {
      const n = fw.box.split(" ").map(Number);
      if (n.length !== 4 || n.some((k) => !Number.isFinite(k))) {
        throw new Error(`[edit] the still window for ${fw.name} is not four numbers`);
      }
      const [x, y, w, h] = n as [number, number, number, number];
      if (w <= 0 || h <= 0 || x < 0 || y < 0 || x + w > FRAME_W || y + h > FRAME_H) {
        throw new Error(`[edit] the still window for ${fw.name} looks outside the frame`);
      }
      if (w > STILL_VIEW_MAX_W && fw.box !== STILL_WHOLE) {
        throw new Error(`[edit] the still window for ${fw.name} is wider than a phone can read`);
      }
      if (x > fw.x0 || y > fw.y0 || x + w < fw.x1 || y + h < fw.y1) {
        throw new Error(`[edit] the still window for ${fw.name} does not hold it`);
      }
    }
  }

  /* ── what the still has to UNDO, and what it has to PLACE ───────────────
     A still figure is a clone of the finished markup, and the markup plus the
     stylesheet is the finished frame — with two classes of exception, and
     both of them are listed rather than discovered:

       · THE MOMENTS. Anything the scrub passes THROUGH. Most already rest at
         opacity 0 in the stylesheet, but a still figure renames every id it
         carries (four mechanisms in this scene are columns behind clipPath
         apertures, and a clip whose url() stops resolving is a column with
         every cell showing at once), so an id-scoped rest does not survive
         the clone and has to be written into it.
       · THE TRAVELLERS. Six groups whose finished position is a transform the
         SCRUB owns; in the markup they sit at their own origin, which in a
         still is the world's corner.

     Both lists are checked here against the live markup, so a rename trips at
     boot rather than showing a station with a transient standing in it. */
  const STILL_GONE: readonly string[] = [
    "#edt-line-old", //   the prompt line before the edit
    "#edt-caret", //      an insertion mark is a moment, never furniture
    "#edt-status-run",
    "#edt-status-fail", //  the row ends on `3 passing`
    "#edt-gate", //       the bar retracted: an open gate is two jambs and no bar
    "#edt-chip-line", //  the chip became a commit at station 3
    "#edt-lane-a-lbl",
    "#edt-lane-b-lbl", // both lanes are relabelled when the canary is promoted
    "#edt-switch-50", //  the still's own second canary figure turns this back on
    "#edt-switch-hint", // an affordance for a pointer a still does not have
    "#edt-rmsg-t1", //    turn 1's words; the body carries turn 2's at the end
    "#edt-ask", //        the question was answered, so the question left
    "#edt-reply-b0",
    "#edt-reply-b1",
    "#edt-reply-b2", //   the three runs the reply rules took out
    "#edt-limit", //      the knob's reading becomes the verdict
    "#edt-ghost", //      the other design is drawn, allowed to hurt, and removed
    "#edt-ghost-lbl",
    "#edt-ticket", //     the ticket lives in the RAIL, not on the stage: its
    //                    twin sits under the rail's words from station 3 on
    //                    (user call), so the stage copy never appears — the
    //                    still's ci card un-hides its own cropped copy
  ];
  const STILL_PLACED: readonly { sel: string; x: number; y: number }[] = [
    { sel: "#edt-chip", x: STILL_CHIP_AT, y: CHIP_LANE_Y },
    { sel: "#edt-rmsg", x: RMSG_BIG[0], y: RMSG_BIG[1] },
    { sel: "#edt-knock", x: KNOCK_AT, y: GB_MID_Y },
    { sel: "#edt-note", x: NOTE_TO, y: NOTE_Y },
    { sel: "#edt-reply", x: REPLY_OUT_X, y: GB_MID_Y },
    { sel: "#edt-notice", x: NOTICE_TO, y: laneY(FLOOD_LANE) },
  ];
  for (const sel of STILL_GONE) {
    if (!svg.querySelector(sel)) {
      throw new Error(`[edit] the still is told to hide ${sel}, which is not on the stage`);
    }
  }
  for (const p of STILL_PLACED) {
    if (!svg.querySelector(p.sel)) {
      throw new Error(`[edit] the still is told to place ${p.sel}, which is not on the stage`);
    }
  }
  /* The still's own four sentences, against the same subset law every string
     on this stage obeys: a glyph outside the self-hosted latin faces is
     painted by a fallback face, and one fallback glyph in a mono line is a
     line that no longer lines up with the ones around it (DESIGN §3). */
  for (const s of [STILL_LEDE, STILL_RAIL_LEAD, STILL_LANDING_KICKER, STILL_LANDING_TEXT]) {
    for (const ch of s) {
      if (BANNED_GLYPHS.includes(ch)) {
        throw new Error(`[edit] the still string "${s}" carries ${ch}, which the latin subset does not have`);
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
  ghost.setAttribute("d", `M ${GHOST_X0} ${GHOST_Y0} L ${GHOST_X1} ${GHOST_Y1}`);
  ghostLbl.setAttribute("x", String(GHOST_LBL_X));
  ghostLbl.setAttribute("y", String(GHOST_LBL_Y));
  brk.setAttribute("d", bracketPath());
  brkLbl.setAttribute("x", String(BRK_X1));
  brkLbl.setAttribute("y", String(BRK_LBL_Y));
  for (const el of [limitLbl, heldLbl]) {
    el.setAttribute("x", String(VALVE_LBL_X));
    el.setAttribute("y", String(VALVE_LBL_Y));
  }
  tearHere.setAttribute("x", String(TEAR_HERE_X));
  tearHere.setAttribute("y", String(TEAR_HERE_Y));

  /* The serrated bar and the two halves of the tear it makes. All three are
     one shape at three offsets, so a bar that moved could not leave a fringe
     that no longer fitted it. */
  teeth.setAttribute("d", teethPath(MOUTH_Y, 1));
  rcptFringe.setAttribute("d", teethPath(MOUTH_Y + 1, 1));

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
      [limitLbl, VALVE_LIMIT],
      [heldLbl, VALVE_HELD],
      [brkLbl, BRK_LABEL],
      [q<SVGTextElement>(svg, "#edt-rcpt-total"), RCPT_TOTAL],
      [tearHere, TEAR_HERE],
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
    /* The rate counter's aperture, and the receipt's. Both are holes in
       machines and neither may ever animate (the printer law); both are
       checked against the constants the beats are written against, because
       an aperture that drifted would stop a roll half a reading short and
       read as a rendering fault rather than as an edit. */
    const rateAp = q<SVGRectElement>(svg, "#edt-rate-clip rect");
    if (
      Number(rateAp.getAttribute("x")) !== RATE_AP_X ||
      Number(rateAp.getAttribute("y")) !== RATE_AP_Y ||
      Number(rateAp.getAttribute("width")) !== RATE_AP_W ||
      Number(rateAp.getAttribute("height")) !== RATE_AP_H
    ) {
      throw new Error("[edit] the rate counter's aperture is not one cell of its own column");
    }
    const rcptAp = q<SVGRectElement>(svg, "#edt-rcpt-clip rect");
    if (
      Number(rcptAp.getAttribute("x")) !== RCPT_X ||
      Number(rcptAp.getAttribute("y")) !== MOUTH_Y ||
      Number(rcptAp.getAttribute("width")) !== RCPT_W ||
      Number(rcptAp.getAttribute("height")) !== RCPT_CLIP_H
    ) {
      throw new Error("[edit] the printer's mouth is not the aperture the paper is fed through");
    }
    /* And the paper is exactly the strip between the mouth and the
       perforation — the thing the tear takes. */
    const rcptBody = q<SVGRectElement>(svg, "#edt-rcpt-body");
    if (
      Number(rcptBody.getAttribute("x")) !== RCPT_X ||
      Number(rcptBody.getAttribute("y")) !== MOUTH_Y ||
      Number(rcptBody.getAttribute("width")) !== RCPT_W ||
      Number(rcptBody.getAttribute("height")) !== RCPT_H
    ) {
      throw new Error("[edit] #edt-rcpt-body is not the strip the mouth cut");
    }
    /* The rail's paper copy must be INSIDE the paper, or the tear takes a
       receipt with nothing printed on it. */
    if (!rcptPaper.contains(rcptBody) || !rcptFeed.contains(rcptPaper) || rcptFeed === rcptPaper) {
      throw new Error("[edit] the receipt's two owners are not two nested groups");
    }
  }

  /** Everything that is traced rather than faded. All of it rests at
   *  drawSVG "0% 0%", which is why every one of these classes carries
   *  stroke-linecap: butt in the stylesheet (DESIGN §3). */
  const strokeParts: SVGGeometryElement[] = [
    railLine,
    railOriginTick,
    pileArrow,
    pileArrowHead,
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
    ...stamps.flatMap((s) => (s ? [s.tick, s.mark, s.box] : [])),
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
    brk,
    /* the landing */
    teeth,
    tearArrow,
    tearHead,
  ];

  /** Everything that only ever fades. */
  const fadeParts: SVGElement[] = [
    railOriginLbl,
    ...stamps.flatMap((s) => (s ? [s.label] : [])),
    ...pileCards,
    pileTitle,
    pileSub,
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
    ...muteds,
    ...latencies,
    ...floodDots,
    rateCol,
    ...ledgerReads,
    limitLbl,
    heldLbl,
    brkLbl,
    noticeT,
    ghostLbl,
    /* the landing. The receipt's own lettering is NOT here: the aperture is
       what reveals it, and a line that also faded in would be a second switch
       for one state — the one that got forgotten would be the one that
       mattered. Only the whisper beside the paper fades. */
    tearHere,
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

  /** And everything the POINTER owns at the landing. Same law, same shape:
   *  the receipt's OUTER group is the scrub's (the print) and its INNER group
   *  is the hand's (the taut lift, and the vanish at the tear), so the two
   *  regimes move two different transforms on two different nodes. The fringe
   *  the tear leaves in the machine is the hand's outright — it does not
   *  exist until a reader tears something. */
  const doorParts = { rcptPaper, rcptFringe };

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
      /* the landing's door, on the same contract */
      doorParts.rcptPaper,
      doorParts.rcptFringe,
    ];
    for (const el of exclusive) {
      if (scrubbed.has(el)) {
        throw new Error("[edit] an element the pointer owns outright is also driven by the scrub");
      }
    }
    if (pointerParts.cnPeelPointer.length !== CN_SWITCH_B.length) {
      throw new Error("[edit] the pointer does not own every dot the switch is supposed to move");
    }
    /* The receipt's two owners are two DIFFERENT nodes, and the scrub's is
       the outer one. If the feed group ever ended up in a scrub list as well
       as being written by restState it would still be correct; if the PAPER
       group did, a reader mid-tear would have the scrub put the torn strip
       back while it was falling. */
    if (scrubbed.has(rcptFeed)) {
      throw new Error("[edit] the receipt's feed is driven twice");
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

  /* ════════════════════════════════════════════════════════════════════════
     THE POINTER'S REGIME  —  the landing's door
     ──────────────────────────────────────────────────────────────────────
     The scene's second live control, on exactly the switch's contract: the
     SCRUB prints the receipt, and once the print has settled the PAPER
     belongs to the hand until the reader scrolls back out of the held ending.

     THE SNAP IS NOT THE PEEL, and that is the whole reason there are two
     doors on this page. Scene 4's ticket comes off a PERFORATION: it gives
     dash by dash over 1.45s, the freed part hangs from what still holds, and
     the last fibre lets go into a tumble. A receipt comes off a BAR: one pull
     up against the teeth, the separation running the width of the strip in a
     third of a second, and then it is simply falling. Two doors that felt the
     same would be one door built twice.

     AND THE FALL IS PAPER, NOT A LEAF. Shrinking swings (energy spent, never
     restored), a lean INTO each swing and flat at each stall, and a single
     BOW along the strip's length that reverses with the swing — free paper
     bends once; pinned cloth ripples. Damped, once, no bounce anywhere.
     ════════════════════════════════════════════════════════════════════════ */

  let doorArmed = false;
  let tearing = false;
  let fallEl: SVGSVGElement | null = null;
  let gliding: gsap.core.Tween | null = null;

  /** The glide is killed by the reader's own scroll and by nothing else — in
   *  particular NOT by the disarm, because the glide's whole job is to move
   *  the page out of the window the disarm is derived from. */
  const killGlide = (): void => {
    if (gliding) {
      gliding.kill();
      gliding = null;
    }
  };

  /** The dispenser feeding the next receipt: an untorn strip, no fringe in the
   *  mouth, and a door the reader can use again. It refuses to run while a
   *  tear is in flight — the reset is what a reader who SCROLLED AWAY gets,
   *  and the strip they tore has to be allowed to finish falling first. */
  function resetDoor(): void {
    if (tearing) return;
    if (fallEl) {
      fallEl.remove();
      fallEl = null;
    }
    gsap.set(rcptFringe, { opacity: 0, drawSVG: "0% 0%" });
    /* The strip rests at the hover's old offset — taut, pulled a step toward
       the hand — because the reader liked the hovered posture and asked for
       it to BE the posture (user call). The pointer adds one more TEAR_LIFT
       step on top (wireDoorHover). */
    gsap.set(rcptPaper, { opacity: 1, y: 2 * TEAR_LIFT });
    tearBtn.hidden = !doorArmed;
  }

  /** Lay the button exactly over the printed strip, through the svg's OWN
   *  screen matrix — the receipt is frame furniture, so its own coordinates
   *  are frame coordinates and no camera arithmetic is involved. */
  function placeTear(): void {
    const m = svg.getScreenCTM();
    if (!m) return;
    const p0 = new DOMPoint(RCPT_X, MOUTH_Y).matrixTransform(m);
    const p1 = new DOMPoint(RCPT_X + RCPT_W, RCPT_PERF_Y).matrixTransform(m);
    if (!(p1.x > p0.x)) return;
    const stageBox = stage.getBoundingClientRect();
    tearBtn.style.left = `${p0.x - stageBox.left}px`;
    tearBtn.style.top = `${p0.y - stageBox.top}px`;
    tearBtn.style.width = `${p1.x - p0.x}px`;
    tearBtn.style.height = `${p1.y - p0.y}px`;
  }

  function armDoor(on: boolean): void {
    if (on === doorArmed) return;
    doorArmed = on;
    if (on) {
      resetDoor();
      placeTear();
    } else {
      /* Off-stage and out of the tab order in the same frame, exactly as the
         switch is: a keyboard reader must not find a focus stop in a frame
         that has scrolled away. */
      if (doc.activeElement === tearBtn) tearBtn.blur();
      tearBtn.hidden = true;
      resetDoor();
    }
  }

  /** THE SNAP, THE FALL, AND THE GLIDE. */
  function tearOff(): void {
    if (tearing || !doorArmed) return;
    const m = svg.getScreenCTM();
    if (!m) return;
    tearing = true;
    tearBtn.hidden = true;
    if (doc.activeElement === tearBtn) tearBtn.blur();

    /* The hover offset is the hand's too — and the tear must START from the
       hovered position, not snap back first (user catch: the strip hopped up
       a frame before tearing). The offset is read, zeroed on the original —
       which is hidden this same frame anyway, so a fresh receipt rests at
       zero — and handed to the CLONE below, so the paper never moves between
       the last hover frame and the first tear frame. */
    const hoverY = Number(gsap.getProperty(rcptPaper, "y")) || 0;
    gsap.killTweensOf(rcptPaper);
    gsap.set(rcptPaper, { y: 0 });

    /* THE ESCAPE (scene 4's ticket, exactly). The strip lives inside the
       printer's clip aperture, and an aperture that makes the feed-out work
       also swallows anything that leaves through it — so the paper is cloned
       into a position:fixed svg laid over its own screen box, with a viewBox
       that carries the SAME authored coordinates, and the original vanishes
       in the same frame. */
    const p0 = new DOMPoint(RCPT_X, MOUTH_Y).matrixTransform(m);
    const p1 = new DOMPoint(RCPT_X + RCPT_W, RCPT_PERF_Y).matrixTransform(m);
    const fall = doc.createElementNS(SVG_NS, "svg");
    fall.setAttribute("viewBox", `${RCPT_X} ${MOUTH_Y} ${RCPT_W} ${RCPT_H}`);
    fall.setAttribute("aria-hidden", "true");
    fall.style.cssText =
      `position:fixed;left:${p0.x}px;top:${p0.y}px;width:${p1.x - p0.x}px;` +
      `height:${p1.y - p0.y}px;overflow:visible;pointer-events:none;z-index:60;`;
    const cloneRoot = rcptPaper.cloneNode(true) as SVGGElement;
    /* A clone carries the original's ids, and two nodes with one id is a
       document where q() can silently return the wrong one. */
    cloneRoot.removeAttribute("id");
    for (const el of Array.from(cloneRoot.querySelectorAll("[id]"))) el.removeAttribute("id");

    /* THE STRIP'S OWN TORN EDGE. Its top was a straight cut by the bar; after
       the tear it is the bar's complement. The clean-topped body is hidden and
       replaced by one with NO top — sides and floor, the fill closing
       invisibly under the ragged stroke — so there is no slab of colour
       between the two torn edges (the ticket's own hard-won lesson). */
    const oldBody = cloneRoot.querySelector<SVGElement>(".edt-rcpt-body");
    if (oldBody) oldBody.style.opacity = "0";
    const tornBody = svgEl("path", {
      class: "edt-rcpt-body",
      d:
        `M ${RCPT_X} ${MOUTH_Y} L ${RCPT_X} ${RCPT_PERF_Y}` +
        ` L ${RCPT_X + RCPT_W} ${RCPT_PERF_Y} L ${RCPT_X + RCPT_W} ${MOUTH_Y}`,
    });
    const stubEdge = svgEl("path", {
      class: "edt-rcpt-stub-edge",
      d: teethPath(MOUTH_Y + 1, -1),
    });
    cloneRoot.insertBefore(tornBody, cloneRoot.firstChild);
    cloneRoot.appendChild(stubEdge);
    fall.appendChild(cloneRoot);
    doc.body.appendChild(fall);
    fallEl = fall;
    gsap.set(rcptPaper, { opacity: 0 });

    /* The machine's half of the separation, revealed left to right BEHIND the
       tear front — a propagation, not a fade, under the ticket's own
       hand-tremor ease (0.12 is the hand's tremor, tuned there). */
    const roughTear =
      "rough({ strength: 0.12, points: 7, taper: 'none', randomize: false, template: 'power1.inOut' })";
    gsap.set(rcptFringe, { opacity: 1, drawSVG: "0% 0%" });
    gsap.to(rcptFringe, { drawSVG: "0% 100%", duration: TEAR_RUN, ease: roughTear });

    /* One origin for the whole flight: the strip's own centre, set once
       rather than re-declared per tween, because every svgOrigin hand-off is
       a chance for gsap to compensate a translate the fall already owns.
       The clone also STARTS at the hover's own offset — the paper the reader
       was holding down is the paper that tears, in the same place. */
    gsap.set(cloneRoot, {
      y: hoverY,
      svgOrigin: `${RCPT_X + RCPT_W / 2} ${MOUTH_Y + RCPT_H / 2}`,
    });

    const tt = gsap.timeline({
      onComplete: () => {
        tearing = false;
        if (fallEl) {
          fallEl.remove();
          fallEl = null;
        }
        /* If the reader stayed, the fringe stays in the mouth: they tore this
           receipt off and it is gone. If they scrolled away, the disarm asked
           for a fresh one and could not have it until now. */
        if (!doorArmed) resetDoor();
      },
    });

    /* THE TEAR FRONT: the strip's own ragged edge, drawn behind the front at
       the same tremor as the machine's half — two halves of one separation. */
    tt.fromTo(
      stubEdge,
      { drawSVG: "0% 0%" },
      { drawSVG: "0% 100%", duration: TEAR_RUN, ease: roughTear },
      0,
    );
    /* THE HINGE TRAVELS WITH THE FRONT (the ticket's law): only as much paper
       may hang as has been cut. The front runs left to right, so the freed
       LEFT edge sags while the still-attached right-top corner stays PINNED —
       near-flat over the first half, a lean past three-quarters, the last
       fibres giving only at the end.

       ONE ORIGIN FOR THE WHOLE FLIGHT (this file's own law, restored — user
       catch: the right side rose at the release). A per-tween corner origin
       made the hand-off to the fall's centre-origin keyframes re-express the
       same rotation about a different point, and the right edge hopped ~27u
       up in one frame. Instead every rotation lives about the strip's centre,
       and the pin is arithmetic: rotating θ about centre lifts the right-top
       corner by (W/2)·sinθ, so each stage carries the equal-and-opposite y —
       the corner holds still, the left edge takes the whole sag, and the fall
       continues from the same origin with nothing to compensate. The weight
       settle rides in the same keyframes (one owner per property). */
    {
      const comp = (deg: number): number =>
        (RCPT_W / 2) * Math.sin((Math.abs(deg) * Math.PI) / 180);
      const stages: readonly (readonly [number, number, number, string])[] = [
        /* [rotation, at, until, ease] — settle share grows power1.in-ish. */
        [-1.5, 0, 0.3, "power1.out"],
        [-4, 0.3, 0.65, roughTear],
        [-7, 0.65, 1.0, roughTear],
        [TEAR_END_ROT, 1.0, TEAR_RUN, "power2.in"],
      ];
      const settleShare = [0.5, 1.5, 3, 5];
      stages.forEach(([deg, at, until, ease], i) => {
        tt.to(
          cloneRoot,
          {
            rotation: deg,
            y: hoverY + settleShare[i]! + comp(deg),
            duration: until - at,
            ease,
          },
          at,
        );
      });
      /* THE CONE: paper flexes toward the held corner while it is pulled —
         skew only (see TEAR_CONE_SKEW's note). */
      tt.to(
        cloneRoot,
        { skewX: TEAR_CONE_SKEW, duration: TEAR_RUN * 0.85, ease: "power1.in" },
        0,
      );
    }

    /* THE FALL. An authored S down the viewport with shrinking, alternating
       swings, travelled with motionPath (registered in main.ts alongside
       DrawSVG and ScrollTo). The path is built at tear time because its only
       unknown is how tall this reader's window is. */
    const fallH = Math.round(window.innerHeight * FALL_DROP);
    const yAt = (f: number): number => Math.round(f * fallH);
    const [a1, a2, a3, a4] = FALL_SWINGS as unknown as [number, number, number, number];
    const path =
      `M 0 0` +
      ` C ${a1 * 0.4} ${yAt(0.1)} ${a1} ${yAt(0.18)} ${a1} ${yAt(0.28)}` +
      ` C ${a1} ${yAt(0.38)} ${a2} ${yAt(0.42)} ${a2} ${yAt(0.52)}` +
      ` C ${a2} ${yAt(0.6)} ${a3} ${yAt(0.64)} ${a3} ${yAt(0.72)}` +
      ` C ${a3} ${yAt(0.78)} ${a4} ${yAt(0.82)} ${a4} ${yAt(0.88)}` +
      ` C ${a4} ${yAt(0.93)} 0 ${yAt(0.97)} 0 ${fallH}`;
    tt.to(
      fall,
      { motionPath: { path, autoRotate: false }, duration: FALL_DUR, ease: "power1.inOut" },
      TEAR_RUN,
    );

    /* The lean and the bow, keyframed WITH the swings rather than derived
       from the tangent: a page's tilt leads its swing and goes flat at the
       stall, which a tangent never does. Each pair is one tween, so the bend
       cannot drift out of phase with the lean it belongs to. */
    {
      const stalls = [0.28, 0.52, 0.72, 0.88];
      /* The fall picks the paper up where the tear left it — sagged and
         flexed, about the SAME centre origin it has had since the clone was
         made — and its first keyframe is the spring flat at the release. */
      let prevR = TEAR_END_ROT;
      let prevB = TEAR_CONE_SKEW;
      let prevT = 0;
      FALL_TILT.forEach((deg, i) => {
        const at = stalls[i]! * FALL_DUR;
        tt.fromTo(
          cloneRoot,
          { rotation: prevR, skewX: prevB },
          {
            rotation: deg,
            skewX: FALL_BOW[i]!,
            duration: at - prevT,
            ease: "power1.inOut",
          },
          TEAR_RUN + prevT,
        );
        prevR = deg;
        prevB = FALL_BOW[i]!;
        prevT = at;
      });
      tt.fromTo(
        cloneRoot,
        { rotation: prevR, skewX: prevB },
        { rotation: 0, skewX: 0, duration: FALL_DUR - prevT, ease: "power1.inOut" },
        TEAR_RUN + prevT,
      );
    }

    /* And it is gone before it lands. A strip that reached the bottom of the
       window would be a strip the reader watched hit something. */
    tt.to(
      fall,
      { opacity: 0, duration: FALL_DUR * 0.4, ease: "power1.in" },
      TEAR_RUN + FALL_DUR * 0.6,
    );

    /* THE GLIDE, at the release, so the fall and the travel are one event:
       the strip drops over a page already moving toward the scene it named.
       Scene 4's ticket's numbers exactly — two doors on one page must not
       move it at two different speeds. Computed at click time, because a pin
       spacer landing moves every geometry on the page. */
    const proofPin = doc.querySelector<HTMLElement>("#prf-pin");
    if (proofPin) {
      const target = window.scrollY + proofPin.getBoundingClientRect().top;
      gliding = gsap.to(window, {
        /* autoKill OFF, for the reason the ticket documents: a pinned scrub
           nudges scrollTop every tick and autoKill reads that as the reader
           disagreeing. The kill is ours — the wheel/touch listeners below. */
        scrollTo: { y: target, autoKill: false },
        duration: GLIDE_DUR,
        ease: "power2.inOut",
        delay: TEAR_RUN,
        onComplete: () => {
          gliding = null;
        },
      });
    }
  }

  /** Derived from the timeline's own time on every frame, which is what makes
   *  both controls pure functions of scroll rather than memories of having
   *  scrolled. The switch is live inside station 5's settled dwell; the door
   *  is live inside the held ending and nowhere else. */
  function syncArm(t: number): void {
    armToggle(t >= TOGGLE_FROM && t < TOGGLE_TO);
    armDoor(t >= HOLD_FROM);
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
    gsap.set([closingRule], { scaleX: 0 });
    gsap.set([closingText], { opacity: 0, y: 10 });

    /* THE RECEIPT IS ROLLED BACK INSIDE THE MACHINE. Nothing printed on it
       needs hiding: the paper starts a full strip's height above the mouth,
       and the aperture — which never animates — is what makes that
       invisible. One number for eleven lines. */
    gsap.set(rcptFeed, { y: -(RCPT_H + 6) });
    resetDoor();

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
    /* The flood is authored where each message COMES TO REST, so its rest
       state is back down the lane on the customer's side — one offset per
       message, and the same function the arrival tween reads. */
    floodDots.forEach((d, i) => gsap.set(d, { x: floodEntryDx(i) }));
    /* The rate counter rests on its blank cell: nothing has arrived. */
    gsap.set(rateCol, { y: rateY(0) });
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
     ──────────────────────────────────────────────────────────────────────
     Same information, delivered by LAYOUT instead of by time (DESIGN §3).
     Nine cards: one per station, plus the landing. Each carries its station's
     own kicker and sentence — read off the pinned rail, so the two renderings
     cannot say different things — the clock reading that station happens at,
     and one or two windows cut into the scene's FINISHED frame.

     THREE THINGS THIS SCENE'S STILL OWES THAT SCENE 4'S DID NOT:

       1. THE FINISHED FRAME IS NOT QUITE THE MARKUP. Scene 4 could clone its
          stage untouched because nothing in that composition is erased by a
          later beat. Eighteen things here are: the prompt line before the
          edit, the caret, two check statuses, the bar that retracts, the
          chip's first lettering, the two pre-promote lane labels, turn 1's
          words, the answered question, three digit runs, the valve's first
          reading, and the ghost of the other design. STILL_GONE is that list
          and it is asserted against the markup at boot.
       2. THE CAMERA AND THE FRAME LAYER SHARE COORDINATES. At the identity
          transform a still has, bay 0's prompt panel and the landing receipt
          are drawn at the same numbers. So there are two source clones — the
          world without the frame, the frame without the world — and every
          window is cut from the one it belongs to.
       3. THE SWITCH BECOMES A SECOND PICTURE. A still cannot hand the reader
          a control, and the control's whole content is "10 becomes 50" — so
          the canary card carries the same window twice, once at each share.
          That is the toggle's information, delivered by layout.

     THE VERSION RAIL CHANGES FORM RATHER THAN BEING CROPPED, exactly as
     scene 4's checklist does: eight stamps are a list, and a phone is good at
     lists. So is the clock — order carries meaning here, so every card says
     when it happens.
     ════════════════════════════════════════════════════════════════════════ */

  /** A clone of the stage in its FINISHED state: the markup (which the
   *  stylesheet already paints as the end of the scene), minus every moment
   *  the scrub passes through, plus the six travellers stood where they come
   *  to rest. Taken from the live svg, which in this branch no `restState()`
   *  has ever touched — the scrub and the still are two media queries and only
   *  one of them ever runs. */
  function finishedClone(): SVGSVGElement {
    const c = svg.cloneNode(true) as SVGSVGElement;
    const hide = (el: Element | null): void => {
      if (el) (el as SVGElement).style.opacity = "0";
    };
    for (const sel of STILL_GONE) hide(c.querySelector(sel));
    /* The three families edit.ts GENERATES that are moments, and so have no
       rest rule in the stylesheet to inherit: the failure mark (drawn, then
       un-drawn when the second run corrects it), the muted receipts (the
       ghost's beat, which ends), and the two ledger readings the third one
       replaces. */
    for (const el of Array.from(c.querySelectorAll(".edt-cross"))) hide(el);
    for (const el of Array.from(c.querySelectorAll(".edt-muted"))) hide(el);
    {
      const reads = Array.from(c.querySelectorAll(".edt-ledger-read"));
      for (let i = 0; i < reads.length - 1; i++) hide(reads[i]!);
    }
    /* v6 RETIRES rather than disappearing: when the canary is promoted the
       rail dims its origin to 0.4, and a still that painted it at full ink
       would say the old version was still in service. */
    for (const sel of ["#edt-rail-origin", "#edt-rail-v0", "#edt-notch-v6"]) {
      const el = c.querySelector<SVGElement>(sel);
      if (el) el.style.opacity = "0.4";
    }
    for (const p of STILL_PLACED) {
      c.querySelector(p.sel)?.setAttribute("transform", `translate(${p.x} ${p.y})`);
    }
    /* THE RECEIPT COMES OFF ITS BAR, and in a still the separation is DRAWN
       rather than played: the machine's fringe (which the scrubbed scene hides
       until a reader tears) and the strip's own complementary edge, the same
       teeth with the sign flipped, interlocking on one latitude. Both halves,
       because one of them alone is a decoration and the two together are a
       tear. */
    const fringe = c.querySelector<SVGElement>("#edt-rcpt-fringe");
    if (fringe) fringe.style.opacity = "1";
    c.querySelector("#edt-rcpt-paper")?.appendChild(
      svgEl("path", { class: "edt-rcpt-stub-edge", d: teethPath(MOUTH_Y + 1, -1) }),
    );
    return c;
  }

  /** The same finished frame with the reader's hand on the switch: everything
   *  the POINTER owns at station 5, set to the even split. The bands are
   *  re-cut rather than scaled — a still has no transform to hand back — and
   *  they stay centred on the latitudes their dots ride, so the only thing
   *  that changes between the two pictures is the share itself. */
  function flippedClone(src: SVGSVGElement): SVGSVGElement {
    const c = src.cloneNode(true) as SVGSVGElement;
    const sw10El = c.querySelector<SVGElement>("#edt-switch-10");
    const sw50El = c.querySelector<SVGElement>("#edt-switch-50");
    if (sw10El) sw10El.style.opacity = "0";
    if (sw50El) sw50El.style.opacity = "1";
    for (const [sel, cy] of [
      ["#edt-band-a", LANE_A_Y],
      ["#edt-band-b", LANE_B_Y],
    ] as const) {
      const r = c.querySelector(sel);
      if (!r) continue;
      r.setAttribute("y", String(cy - BAND_EVEN_H / 2));
      r.setAttribute("height", String(BAND_EVEN_H));
    }
    /* The twelve the switch owns change lane. The three the scrub owns are
       already down there, which is why no dot is in both lists. */
    const dots = c.querySelector("#edt-canary-dots");
    if (dots) {
      for (const k of CN_SWITCH_B) {
        dots.children[k]?.children[0]?.setAttribute("transform", `translate(0 ${CN_PEEL_DY})`);
      }
    }
    /* And the counter reads what the picture shows. */
    c.querySelector("#edt-cnt-flip")?.setAttribute("transform", `translate(0 ${-CNT_PITCH})`);
    return c;
  }

  /** One window onto one of the two source frames.
   *
   *  IDS ARE RENAMED, NOT STRIPPED, and that is the difference between this
   *  scene's still and scene 4's. Four of the mechanisms here are columns
   *  behind a clipPath aperture — the judge's score, the bench's tally, the
   *  canary's counter, the rate counter — and a `clip-path: url(#…)` whose
   *  target no longer exists does not clip at all: every cell of every column
   *  would render at once, which reads as a rendering fault rather than as a
   *  still. So each figure gets its own id namespace and its own clip refs
   *  rewritten to match. */
  let stillSeq = 0;
  function figure(src: SVGSVGElement, box: string): HTMLElement {
    const wrap = doc.createElement("div");
    wrap.className = "trn-card-figure";
    const clone = src.cloneNode(true) as SVGSVGElement;
    const seq = ++stillSeq;
    const renamed = new Map<string, string>();
    for (const el of Array.from(clone.querySelectorAll("[id]"))) {
      const from = el.getAttribute("id");
      if (from === null) continue;
      const to = `${from}-still${seq}`;
      renamed.set(from, to);
      el.setAttribute("id", to);
    }
    clone.removeAttribute("id");
    for (const el of Array.from(clone.querySelectorAll("[clip-path]"))) {
      const ref = /^url\(#(.+)\)$/.exec(el.getAttribute("clip-path") ?? "");
      const to = ref ? renamed.get(ref[1]!) : undefined;
      if (to) el.setAttribute("clip-path", `url(#${to})`);
    }
    clone.setAttribute("viewBox", box);
    // As tall as its own window is deep, so nothing letterboxes.
    const n = box.split(" ");
    clone.style.aspectRatio = `${n[2]} / ${n[3]}`;
    wrap.appendChild(clone);
    return wrap;
  }

  /** Which clock reading a station happens at. `ord` runs forwards and so
   *  does `at`, so the reading a station starts on is the last one no later
   *  than it — station 7 has none of its own and correctly inherits day 6,
   *  which is the fact the CLOCK table states by leaving it out. */
  function stillWhen(i: number): string {
    let label = CLOCK[0]!.label;
    for (const c of CLOCK) if (c.at <= STATION_AT[i]!) label = c.label;
    return label;
  }

  /** Kicker, then when, then what happened — the pinned rail's own two
   *  strings, read off the markup so the two renderings cannot drift. */
  function stillCard(kicker: string, when: string, text: string): HTMLElement {
    const el = doc.createElement("div");
    el.className = "eng-card";
    const k = doc.createElement("span");
    k.className = "eng-kicker";
    k.textContent = kicker;
    const w = doc.createElement("p");
    w.className = "edt-still-when";
    w.textContent = when;
    const p = doc.createElement("p");
    p.className = "eng-caption";
    p.textContent = text;
    el.append(k, w, p);
    return el;
  }

  /** THE VERSION RAIL, AS A LIST. It is the one part of this scene that
   *  survives the fallback by CHANGING FORM rather than by being cropped, and
   *  it survives better than it started: eight events in the order they
   *  happened, in the register a machine writes in, on a device that is good
   *  at lists. Every row carries the drawn tick the pinned rail draws — eight
   *  gates, eight ticks, and the phone gets the same claim the desktop does
   *  rather than a shorter version of it. */
  function stillRail(): HTMLElement {
    const ul = doc.createElement("ul");
    ul.className = "edt-still-rail";
    for (const s of STAMPS) {
      const li = doc.createElement("li");
      li.className = "edt-still-stamp";
      const mark = doc.createElementNS(SVG_NS, "svg");
      mark.setAttribute("class", "edt-still-mark");
      mark.setAttribute("viewBox", `0 0 ${MARK + 1} ${MARK + 1}`);
      mark.setAttribute("aria-hidden", "true");
      /* The checkbox, matching the pinned rail: the check row's own mark. */
      mark.appendChild(
        svgEl("rect", {
          class: "edt-mark",
          x: "0.5",
          y: "0.5",
          width: String(MARK),
          height: String(MARK),
          rx: 1,
        }),
      );
      mark.appendChild(svgEl("path", { class: "edt-tick", d: tickPath(0.5, 0.5) }));
      const w = doc.createElement("span");
      w.textContent = s.label;
      li.append(mark, w);
      ul.appendChild(li);
    }
    return ul;
  }

  function buildStill(reduced: boolean): () => void {
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

    /* The two source frames. The world loses the frame layer and the frame
       loses the world, because at the identity transform a still has, the two
       are drawn at the same numbers (see the note above). */
    const finished = finishedClone();
    const world = finished.cloneNode(true) as SVGSVGElement;
    world.querySelector("#edt-frame")?.remove();
    const frame = finished.cloneNode(true) as SVGSVGElement;
    frame.querySelector("#edt-cam")?.remove();

    if (reduced) {
      /* A lede and the whole last frame, because this branch is a desktop at
         full width: the reader can be shown the finished picture entire
         before being walked through it, which a 375px phone cannot. And the
         frame layer standing alone IS the last frame — at the landing the
         camera is parked on bay 8, which is empty by design. */
      const lede = doc.createElement("p");
      lede.className = "eng-still-lede";
      lede.textContent = STILL_LEDE;
      frag.append(lede, figure(frame, STILL_WHOLE));
    }

    const lead = doc.createElement("p");
    lead.className = "edt-still-rail-lead";
    lead.textContent = STILL_RAIL_LEAD;
    frag.append(lead, stillRail());

    const flipped = flippedClone(world);

    for (const [i, v] of STILL_VIEW.entries()) {
      const cap = caps[i]!;
      const card = stillCard(
        cap.querySelector(".eng-kicker")?.textContent?.trim() ?? "",
        stillWhen(i),
        cap.querySelector(".eng-caption")?.textContent?.trim().replace(/\s+/g, " ") ?? "",
      );
      if (i === 4) {
        /* THE TOGGLE, AS TWO STILLS. Same window, two shares — and then the
           beat's evidence, which is the same either way: both arms judged. */
        card.append(figure(world, v.boxes[0]!), figure(flipped, v.boxes[0]!), figure(world, v.boxes[1]!));
      } else {
        for (const b of v.boxes) card.appendChild(figure(world, b));
        /* What the first ci run CAUGHT is frame furniture — it has to be, it
           stays for the rest of the scene — so it is a third window, cut from
           the frame, on the card whose beat produced it. The finished frame
           hides #edt-ticket (the ticket lives in the rail, not on the stage),
           so this one figure un-hides its own cropped copy: the card is ABOUT
           the ticket, and a window on hidden paper would be an empty margin.
           figure() renames ids with a -stillN suffix, so the group is found
           through its body's class and the parent walk, not its id. */
        if (i === 2) {
          const caught = figure(frame, STILL_TKT_VIEW);
          (q<SVGPathElement>(caught, ".edt-tkt-body").parentNode as SVGGElement).style.opacity = "1";
          card.appendChild(caught);
        }
      }
      frag.appendChild(card);
    }

    /* ── the landing ──────────────────────────────────────────────────────
       The receipt, printed and torn, the closing statement under its rule,
       and the door. */
    const landing = stillCard(
      STILL_LANDING_KICKER,
      stillWhen(STATION_AT.length - 1),
      STILL_LANDING_TEXT,
    );
    landing.appendChild(figure(frame, STILL_RCPT_VIEW));

    /* THE CLOSING STATEMENT SURVIVES INTO THE STILL. It is the only sentence
       in the scene that is about all eight stations rather than about one, so
       it is the last thing that may be dropped when the pictures are — and it
       is rebuilt here rather than cloned, because the pinned one is a rail
       element the still has no rail for. */
    const close = doc.createElement("p");
    close.className = "edt-still-closing";
    close.textContent = closingText.textContent?.trim().replace(/\s+/g, " ") ?? "";
    landing.appendChild(close);
    /* The filed ticket, under the sentence here too — the still shows the
       finished frame, and in the finished frame the evidence is filed. */
    const stillTkt = closingTkt.cloneNode(true) as SVGElement;
    stillTkt.style.opacity = "1";
    landing.appendChild(stillTkt);

    /* THE DOOR. No fall here by design: a reduced-motion reader is owed the
       INFORMATION the motion carried, not the motion — and what the tear
       carries is "the proof is next, and this is how you get there". So it is
       a real control that goes there, and nothing falls. */
    const door = doc.createElement("button");
    door.type = "button";
    door.className = "edt-still-door";
    door.textContent = "Tear here — the proof";
    door.addEventListener("click", () => {
      const proofPin = doc.querySelector<HTMLElement>("#prf-pin");
      if (!proofPin) return;
      proofPin.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    });
    landing.appendChild(door);
    frag.appendChild(landing);

    still.replaceChildren(frag);

    /* ── the still's own asserts ──────────────────────────────────────────
       Three things a reviewer cannot catch by eye on a phone, so they are
       checked here instead: that every station got a card, that every window
       got cut, and that the finished-state pass actually reached the clones —
       a moment that survived into a figure looks exactly like a scene that
       has not started yet. */
    if (still.querySelectorAll(".eng-card").length !== STATION_AT.length + 1) {
      throw new Error("[edit] the still is not one card per station plus the landing");
    }
    /* THE LIST IS THE RAIL, so it carries the rail's whole claim: one row per
       stamp, and a drawn tick on every one of them. A row that lost its tick
       would say, on the one device that cannot see the pinned rail, that the
       edit cleared seven gates. */
    if (
      still.querySelectorAll(".edt-still-stamp").length !== STAMPS.length ||
      still.querySelectorAll(".edt-still-rail .edt-tick").length !== STAMPS.length
    ) {
      throw new Error("[edit] the still's rail is not eight stamps each carrying its tick");
    }
    {
      /* Every authored window, plus the ticket, plus the canary's second
         share, plus the receipt — and the whole frame when the reduced branch
         asked for it. */
      const want =
        STILL_VIEW.reduce((n, v) => n + v.boxes.length, 0) + 3 + (reduced ? 1 : 0);
      if (still.querySelectorAll(".trn-card-figure").length !== want) {
        throw new Error("[edit] the still did not cut every window it was authored");
      }
    }
    for (const sel of [".edt-cross", ".edt-muted"]) {
      for (const el of Array.from(still.querySelectorAll<SVGElement>(sel))) {
        if (el.style.opacity !== "0") {
          throw new Error(`[edit] a still figure is showing ${sel}, which the finished frame does not`);
        }
      }
    }
    /* And every clip still points at a clip that exists in its own figure: a
       renamed aperture whose reference was missed is a column showing all of
       its cells at once. */
    for (const fig of Array.from(still.querySelectorAll(".trn-card-figure"))) {
      for (const el of Array.from(fig.querySelectorAll("[clip-path]"))) {
        const ref = /^url\(#(.+)\)$/.exec(el.getAttribute("clip-path") ?? "");
        if (!ref || !fig.querySelector(`#${ref[1]!}`)) {
          throw new Error("[edit] a still figure's aperture points at a clip that is not in it");
        }
      }
    }

    still.hidden = false;
    pin.hidden = true;
    /* No scrub means no station 5 dwell and no held ending, so there is no
       moment at which either live control is armed — and a button in the tab
       order over a hidden stage is a focus stop that goes nowhere. The still's
       own door is a real button in the flow, and it is the only one. */
    toggle.hidden = true;
    tearBtn.hidden = true;

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
      /* EVERY caption now has an exit, the last one included: the landing
         takes the rail away from the stations and gives it to the closing
         statement, and a station's sentence still standing under it would be
         a caption about a picture that has left the stage. */
      const next = CAP_AT[i + 1] ?? LANDING_AT;
      ft(
        capEl,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: CAP_FADE, ease: "power2.out" },
        at,
      );
      ft(
        capEl,
        { opacity: 1, y: 0 },
        { opacity: 0, y: -10, duration: CAP_FADE, ease: "power2.in" },
        next - CAP_FADE,
      );
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

    /* Each stamp lands as its station earns it, in the order the event
       actually happens: the tick first — the rail is a timeline and a tick is
       the event — then the checkmark that says it was cleared rather than
       merely recorded, then the word for it. */
    for (const s of stamps) {
      if (!s) continue;
      draw(s.tick, s.at, 0.5);
      /* Box first, then the tick inside it — a checkbox is ticked, never
         drawn around an existing tick. */
      draw(s.box, s.at + 0.15, 0.5);
      draw(s.mark, s.at + 0.5, 0.6);
      fadeIn(s.label, s.at + 0.6, 0.9);
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
    /* The ticket arrives IN THE RAIL, under the caption (user call, twice
       refined): the evidence files itself below whatever the rail is saying
       from the moment it exists — the ci caption now, the closing verdict at
       the landing — and never stands on the stage at all. The stage copy
       stays at rest (STILL_GONE agrees); the rail twin is the one object. */
    ft(closingTkt, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 1.2 }, S3 + 9.0);

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
       STATION 8 — PER-CUSTOMER LIMITS   (132 → 148)
       ══════════════════════════════════════════════════════════════════════ */

    const S8 = STATION_AT[7]!;

    ft(chip, { x: bayCx(6) }, { x: bayCx(7), duration: 3.0, ease: "power2.inOut" }, S8);

    draw(laneRules, S8 + 0.4, 0.8, 0.2);
    fadeIn(laneLabels, S8 + 1.0, 0.7, 0.2);

    /* THE FLOOD ARRIVES. Twelve messages from customer 3, one every 0.22
       units — the other four lanes send ONE each, so the rate is something
       the reader counts rather than something a caption claims. Each has its
       own tween because each has its own distance to travel: the first five
       run all the way past the valve, the other seven stop at the back of a
       queue that is being built in front of them. */
    floodDots.forEach((d, i) => {
      ft(
        d,
        { x: floodEntryDx(i), opacity: 0 },
        { x: 0, opacity: 1, duration: FLOOD_DUR, ease: "power2.out" },
        S8 + S8_FLOOD_AT + i * FLOOD_PITCH,
      );
    });

    /* The platform says what it is set to BEFORE it acts on it. A limit
       announced only at the moment it bites reads as an excuse. */
    fadeIn(limitLbl, S8 + 2.6, 0.8);

    /* THE COUNTER CLIMBS, LIVE. A column of readings behind a static
       aperture, one cell per landing — never a rewritten string, which would
       be a .call() inside a scrubbed range, and scrolling back up counts
       down again for free. The column arrives on its BLANK cell, so what the
       reader sees light up is an instrument, and what it then says is the
       first reading. */
    fadeIn(rateCol, S8 + 3.2, 0.6);
    RATE_READS.forEach((r, j) => {
      ft(rateCol, { y: rateY(j) }, { y: rateY(j + 1), duration: 0.5, ease: "power2.out" }, S8 + r.at);
    });

    /* And the record is rewritten beside it. received = answered + held, on
       every reading, checked at boot against the dots themselves. */
    ledgerReads.forEach((el, j) => {
      fadeIn(el, S8 + LEDGER[j]!.at, 0.5);
      const next = LEDGER[j + 1];
      if (next) fadeOut(el, S8 + next.at, 0.4);
    });

    /* THE VALVE SHUTS as the sixth message lands — five is the limit, and the
       bar is what the limit looks like. */
    draw(valve, S8 + S8_VALVE_AT, S8_VALVE_DUR);
    /* DRAWN, not faded: the jambs are in strokeParts, so their rest state is a
       zero-length dash and an opacity tween would light nothing. */
    draw(valveJambs, S8 + S8_VALVE_AT + S8_VALVE_DUR, 0.4, 0.1);
    /* THE ONLY AMBER IN EIGHT STATIONS, drawn over the closed gray valve
       rather than tweened from it: the valve shuts, and then it is in
       backoff. */
    draw(valveAmber, S8 + S8_AMBER_AT, S8_AMBER_DUR);
    /* And the knob becomes a verdict. Same anchor, two readings. */
    fadeOut(limitLbl, S8 + 5.0, 0.7);
    fadeIn(heldLbl, S8 + 5.2, 0.7);

    /* THE OTHER FOUR SEND WHILE LANE 3 IS QUEUED, and the order is the whole
       argument — which is why S8_REPLY_AT is checked against the valve's own
       close at boot rather than left to the eye. Each answer lands with its
       receipt (the only green in eight stations) AND an ordinary latency: the
       number that says nothing happened to them. */
    ft(
      replyDots,
      { x: -160, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.9, stagger: REPLY_STAGGER, ease: "power2.out" },
      S8 + S8_REPLY_AT,
    );
    fadeIn(delivereds, S8 + 6.3, 0.7, REPLY_STAGGER);
    fadeIn(latencies, S8 + 6.6, 0.7, REPLY_STAGGER);

    /* And a bracket says what those four numbers add up to. */
    draw(brk, S8 + 7.8, 1.2);
    fadeIn(brkLbl, S8 + 8.2, 0.8);

    /* One notice, once, back to the customer who caused it. Not a delivery —
       so not green, and not a receipt. */
    drawBox(noticeBody, S8 + 9.0, 0.8);
    fadeIn(noticeT, S8 + 9.4, 0.7);
    ft(notice, { x: NOTICE_FROM }, { x: NOTICE_TO, duration: 1.4, ease: "power2.out" }, S8 + 9.4);

    /* THE GHOST OF THE ALTERNATIVE, and it now costs the other four
       something. A strike across all five lanes — and while it stands, the
       four green receipts go gray, because that is exactly what a shared
       daily budget does to four customers who did nothing. Then the strike
       un-draws, the green comes back, and it is gone: the budget breaker
       mutes everyone, and this does not. Drawn and then UN-drawn, like the CI
       gate's failure mark, so a reader scrolling back watches it arrive again
       in the same order. */
    draw(ghost, S8 + 11.0, 0.9);
    fadeIn(ghostLbl, S8 + 11.4, 0.6);
    fadeOut(delivereds, S8 + 11.6, 0.6);
    fadeIn(muteds, S8 + 11.8, 0.6);
    fadeOut(muteds, S8 + 13.4, 0.6);
    fadeIn(delivereds, S8 + 13.6, 0.6);
    ft(ghost, { drawSVG: "0% 100%" }, { drawSVG: "0% 0%", duration: 0.9 }, S8 + 13.6);
    fadeOut(ghostLbl, S8 + 13.6, 0.8);

    /* ══════════════════════════════════════════════════════════════════════
       THE LANDING — THE RAIL PRINTS ITSELF   (148 → 160)
       ══════════════════════════════════════════════════════════════════════ */

    const L = LANDING_AT;

    /* The chip parks. The camera goes with it, onto bare world — eight
       stations have been read, and what is left to say is the RECORD. */
    ft(chip, { x: bayCx(7) }, { x: bayCx(8), duration: 3.0, ease: "power2.inOut" }, L);

    /* THE CLOSING STATEMENT takes the rail from the stations. A rule out of
       its own middle, and the sentence rising under it — scene 4's
       #agt-closing, and like it, no exit tween anywhere: this is where the
       scene lands, and it is still there when the reader stops. */
    ft(
      closingRule,
      { scaleX: 0 },
      { scaleX: 1, duration: 1.2, ease: "power2.out" },
      L + L_CLOSE_AT,
    );
    ft(
      closingText,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 1.1, ease: "power2.out" },
      L + L_CLOSE_AT + 0.35,
    );
    /* No hand-off any more: the ticket has lived under the rail's words since
       station 3, so when the closing sentence takes the rail, the evidence is
       already filed beneath it. */

    /* The mouth: a serrated bar, drawn like every other machine on this
       stage. */
    draw(teeth, L + L_TEETH_AT, 1.2);

    /* The pile settles in oldest-first — they were laid down over time, and
       the landing shows them the way they accumulated — and the floor line
       that names them lands with the last of them. All of it before the print:
       the history is already on the floor when the new edition starts. */
    pileCards.forEach((g, i) => {
      ft(
        g,
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: L_PILE_RUN, ease: "power2.out" },
        L + L_PILE_AT + i * L_PILE_STEP,
      );
    });
    ft(
      pileTitle,
      { opacity: 0, y: 6 },
      { opacity: 1, y: 0, duration: L_PILE_RUN, ease: "power2.out" },
      L + L_PILE_AT + PILE.length * L_PILE_STEP,
    );
    ft(
      pileSub,
      { opacity: 0, y: 6 },
      { opacity: 1, y: 0, duration: L_PILE_RUN, ease: "power2.out" },
      L + L_PILE_AT + PILE.length * L_PILE_STEP + 0.15,
    );
    /* The pointer draws off the caption's last word and rises to the mouth —
       arriving as the print begins, which is exactly what it is pointing at. */
    draw(pileArrow, L + L_PILE_AT + PILE.length * L_PILE_STEP + 0.35, 0.6);
    draw(pileArrowHead, L + L_PILE_AT + PILE.length * L_PILE_STEP + 0.95, 0.2);

    /* AND THE PRINT. One translate on one group, under an aperture that never
       moves, revealing eleven lines in the order the journey earned them at
       exactly the reader's own scroll speed — and feeding them back in if
       they scroll up. `ease: none` is not laziness: a printer feeds at the
       rate it is driven at, and here the reader is the motor. */
    ft(rcptFeed, { y: -(RCPT_H + 6) }, { y: 0, duration: L_PRINT_DUR }, L + L_PRINT_AT);

    /* THE WHISPER, strictly after the print has settled. Small, quiet, one
       short curve dipping to the perforation — scene 4's `click here`, one
       scene on, pointing at the one thing left to do. */
    fadeIn(tearHere, L + L_HINT_AT, 0.6);
    draw(tearArrow, L + L_HINT_AT + 0.4, 0.7);
    draw(tearHead, L + L_HINT_AT + 1.1, 0.25);

    /* ── THE HELD ENDING  (160 → 166) ────────────────────────────────────
       Nothing arrives and nothing leaves. The chip is parked, the receipt is
       printed and resting, the closing statement is standing in the rail —
       and the strip belongs to the reader's hand for as long as they stay
       here. The timeline is exactly TL_END long because the progress fill
       runs its whole width from zero, so the six units of stillness are real
       scroll rather than a rounding error (scene 4's lesson, kept). */
    if (tl.duration() > TL_END) {
      throw new Error("[edit] the scene's last build runs past its own timeline");
    }
    if (TL_END - HOLD_FROM < 6) {
      throw new Error("[edit] there is no still frame left at the end of the scene");
    }
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

  /** The door's own wiring, split out for the same reason the switch's is:
   *  the scrub is one media query and the hand is another, and the two have
   *  to be able to exist without each other. */
  function wireDoor(): () => void {
    const onClick = (): void => tearOff();
    const onResize = (): void => {
      if (doorArmed) placeTear();
    };
    tearBtn.addEventListener("click", onClick);
    /* Observe the DRAWING, not the window: a pin spacer landing is a layout
       change with no resize event (the toggle's own lesson). */
    const ro = new ResizeObserver(onResize);
    ro.observe(svg);
    window.addEventListener("wheel", killGlide, { passive: true });
    window.addEventListener("touchmove", killGlide, { passive: true });
    return () => {
      tearBtn.removeEventListener("click", onClick);
      ro.disconnect();
      window.removeEventListener("wheel", killGlide);
      window.removeEventListener("touchmove", killGlide);
      killGlide();
    };
  }

  /** Hover is its own regime again (DESIGN §5), one size down: the strip
   *  already RESTS taut at 2×TEAR_LIFT (the reader made the old hovered
   *  posture the resting one — see resetDoor), so the pointer now adds just
   *  one more step, a whisker over a pixel (user call: "very little bit"). */
  function wireDoorHover(): () => void {
    const on = (): void => {
      if (!doorArmed || tearing) return;
      gsap.to(rcptPaper, { y: 3 * TEAR_LIFT, duration: HOVER_DUR, ease: "power2.out" });
    };
    const off = (): void => {
      if (tearing) return;
      gsap.to(rcptPaper, { y: 2 * TEAR_LIFT, duration: HOVER_DUR, ease: "power2.out" });
    };
    tearBtn.addEventListener("pointerenter", on);
    tearBtn.addEventListener("pointerleave", off);
    tearBtn.addEventListener("focus", on);
    tearBtn.addEventListener("blur", off);
    return () => {
      tearBtn.removeEventListener("pointerenter", on);
      tearBtn.removeEventListener("pointerleave", off);
      tearBtn.removeEventListener("focus", on);
      tearBtn.removeEventListener("blur", off);
    };
  }

  /* ════════════════════════════════════════════════════════════════════════
     THE BRIDGE  —  the narrative hinge above this scene, free scroll
     Two lines revealed on a scrub as the section rises, exactly as turn.ts
     and agents.ts build theirs. This scene owns it because the bridge exists
     only to hand over to this scene, and a hinge whose two halves live in two
     files is a hinge nobody owns.
     ════════════════════════════════════════════════════════════════════════ */

  function buildBridge(): void {
    if (bridgeLines.length === 0) return;
    gsap.set(bridgeLines, { opacity: 0, y: 22 });
    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      scrollTrigger: { trigger: "#bridge-edit", start: "top 82%", end: "top 34%", scrub: true },
    });
    bridgeLines.forEach((line, i) => {
      tl.fromTo(
        line,
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 1, immediateRender: false },
        i * 0.45,
      );
    });
  }

  /* ════════════════════════════════════════════════════════════════════════
     MEDIA GATING
     One matchMedia owns the choice, exactly as scenes 2–4 do.
     ════════════════════════════════════════════════════════════════════════ */

  const mm = gsap.matchMedia();

  /* The bridge is a fade and works at any width, so it is gated on the motion
     preference alone — the same split scenes 3 and 4 make for theirs. */
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    buildBridge();
  });

  mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
    buildScrub();
    /* The click halves are NOT gated on a fine pointer: a tablet in this band
       gets the scrub, and a tap on a real <button> is a click. Only the hover
       halves below need the gate. */
    const unToggle = wireToggle();
    const unDoor = wireDoor();
    return () => {
      unToggle();
      unDoor();
    };
  });

  mm.add(
    "(min-width: 768px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    () => {
      const a = wireToggleHover();
      const b = wireDoorHover();
      return () => {
        a();
        b();
      };
    },
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
