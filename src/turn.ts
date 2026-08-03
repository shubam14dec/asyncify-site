/* ══════════════════════════════════════════════════════════════════════════
   SCENE 3 — THE TURN
   ──────────────────────────────────────────────────────────────────────────
   One composition, pinned, scrubbed over one and four-fifths of a viewport
   height, in three beats and three camera positions:

     1  THE DELIVERY   the whole engine as one chip, one wire, and a phone with
                       mail on it. A green packet leaves the chip, rides the
                       wire at exactly the latitude of the inbox row it is
                       about to become, and the message ARRIVES: the list of
                       somebody else's mail slides down a row and ours takes
                       the top slot, with the receipt stamped beside it.
                       The camera pushes from the wide shot to the inbox as the
                       packet crosses, so the row is legible when it lands.
     2  THE REPLY      the camera pushes further, the screen crossfades from
                       the inbox to the opened thread, and a human types into
                       the reply bar one character at a time. This is the first
                       human act on the page, so it owns the frame and gets the
                       slowest beat in the scene: twenty-two characters over a
                       quarter of a screen of scroll, with nothing else moving.
     3  THE REVERSAL   the reply collapses into a single dot, steps out of the
                       phone, and STOPS — a turn is a decision and a decision
                       has a pause in it. The camera pulls back to the wide
                       shot during that pause, so the reader watches the dot
                       cross the whole distance home. The chip acknowledges in
                       NEUTRAL ink: this message is the user's, not ours, and
                       green on this site means one of OURS arrived (BRAND §2).
                       The scene ends held on that frame rather than fading:
                       the cliffhanger scene 4 picks up is a conversation that
                       is still open.

   It obeys engine.ts's four rules — one scrubbed timeline with no .set() or
   .call() in it, every tween a fromTo with immediateRender:false, CSS painting
   the finished frame and restState() inverting it, and transform/opacity/
   stroke/drawSVG only. Two of them take a new form here and are worth naming:

     · the typed reply never mutates textContent, because a string that was
       appended to cannot be un-appended by a reverse pass. Every character is
       its own element, authored once, revealed by opacity. The screen change
       from inbox to thread is the same discipline one level up — both states
       are in the markup and the timeline only ever swaps their opacity.
     · the camera is three tweened numbers written out as ONE transform
       attribute, and every keyframe is an explicit fromTo off the previous
       one, so a reverse scrub lands the frame back on the wide shot exactly.

   The camera makes the non-scaling-stroke dasharray law (DESIGN §3) sharper
   rather than softer: at 1.62× a partial drawSVG range would be off by 62%
   instead of by a rounding error. Nothing in this scene uses one — every draw
   is "0% 0%" → "0% 100%", which is the one range that means the same number in
   screen space and user space. Butt caps everywhere, same reason as always.

   Constants first, with the arithmetic, same as engine.ts.
   ══════════════════════════════════════════════════════════════════════════ */

import { gsap } from "gsap";

/* ══════════════════════════════════════════════════════════════════════════
   TUNING CONSTANTS  —  change these, not the code below
   ══════════════════════════════════════════════════════════════════════════ */

/* ── The scrub window ──────────────────────────────────────────────────────
   The number that matters is SCROLL PER TIMELINE UNIT, and it is unchanged at
   0.025 viewport heights — the same density this scene has always had, and
   just above the 0.020 scene 2 settled on. Below ~0.02 the typing beat becomes
   a flicker.

   PIN_HEIGHTS went 1.5 → 1.8 when the card became a phone, and the twelve
   extra units are itemised rather than rounded up to a feeling:

       +4   the phone is a 494u object with a screen and an app bar in it,
            where the card was a 100u rectangle; assembling it honestly costs
            four more units than tracing one box did
       +3   the push-in from the wide shot to the inbox (B1)
       +3   the push-in from the inbox to the opened thread (B2)
       +2   net cost of the screen crossfade and the camera pull-back, both of
            which overlap beats that already existed

   Nothing was slowed down to get there: every beat that existed before this
   rework costs the reader exactly the scroll it always did. That is the same
   discipline scene 2 keeps with C_ADD, and it is what makes a scene safe to
   lengthen — and safe to shorten again if the phone ever goes. */
const PIN_HEIGHTS = 1.8;
const TL_END = 72;

/** Scrub catch-up, in seconds. Matched to scene 2 on purpose — the two
 *  sections are read in one continuous scroll and a change of scrub feel
 *  between them reads as the page stuttering, not as a new scene. */
const SCRUB = 0.55;

/* Beat boundaries, in timeline units. The split is 22 / 24 / 26 and it is not
   even by accident: beat 1 is RECAP plus one new object, and a machine the
   reader has already toured only has to be recognised; beat 2 is the human,
   and per word it is the slowest thing on the page; beat 3 carries the turn,
   the longest journey in the scene and the ending frame, and the ending frame
   is eight units of nothing on purpose. */
const BEAT_1 = 0;
const BEAT_2 = 22;
const BEAT_3 = 46;

/* ── The composition ───────────────────────────────────────────────────────
   1200 × 600. Everything is hung off ONE horizontal: WIRE_Y is the spine, and
   the chip, the wire and — this is the part that does the work — the inbox row
   the message becomes are all centred on it. The packet therefore flies into
   its own row rather than at the phone in general, and the reply is the only
   thing in the scene that happens below the line. Out is level; back is a step
   down and then level again. */
const WIRE_Y = 192;

/** The engine chip — the entire machine from scene 2 at 1/7 scale. Its label
 *  sits ABOVE the box, the same place scene 2 puts "queue", which is what
 *  leaves the interior free for the machinery. */
const CHIP_X = 90;
const CHIP_W = 170;
const CHIP_CX = CHIP_X + CHIP_W / 2;

/* ── The machine inside the chip ───────────────────────────────────────────
   An unlabelled echo of the schematic the reader has just toured: inlet, api,
   the slotted queue, the meter, the fan-out, left to right in the order scene
   2 reads. There is no text in it and there will not be — recognition is the
   caption, and a 1/7-scale diagram that has to be labelled is a diagram that
   failed. Every dimension below is mirrored in index.html, and the slot
   dividers are generated from these numbers so the box cannot stop dividing
   evenly into its own cells.

   The queue is CENTRED ON THE CHIP, and that is the one piece of arithmetic
   here that carries a beat rather than a measurement: CHIP_CX is where the
   inbound reply comes to rest, so with five cells across 70u the message ends
   the scene sitting in the MIDDLE CELL of the engine's queue. Which is what a
   reply actually becomes in the platform — a job, queued. It is also where
   the outbound packet departs from, so both journeys begin and end in the same
   five cells; the queue is the only object in the schematic that can honestly
   be both. Four cells would put a divider on CHIP_CX and the message would
   spend the last eight units of the scene sitting on a wall. */
const MINI_Q_X = 140;
const MINI_Q_W = 70;
const MINI_Q_CELLS = 5;
const MINI_Q_Y = 183;
const MINI_Q_H = 18;
const MINI_CELL = MINI_Q_W / MINI_Q_CELLS;

/** The wire, end to end. Chip's right edge to the phone's left edge — it
 *  touches both, so nothing in this scene flies over a gap. */
const WIRE_X0 = CHIP_X + CHIP_W;
const WIRE_X1 = 820;

/* ── The phone ─────────────────────────────────────────────────────────────
   494u tall against the chip's 68, and that ratio is the composition's whole
   argument: infrastructure is small and quiet, the thing a person is holding
   is not. Its screen is a 236 × 470 window, which at 12u mono is 28 characters
   across — measured, not guessed, and the reason the subject line is the
   length it is. */
const PHONE_X = 820;
const SCREEN_X = 832;
const SCREEN_W = 236;

/** Inbox rows. The pitch is what the arrival animates: the four rows of
 *  somebody else's mail rest ONE PITCH HIGHER than they are authored, and
 *  drop into place as ours takes the top slot. A list receiving a new item at
 *  its head is a list that moves down, and the drop is the only part of this
 *  beat a reader could not have inferred from a static picture. */
const ROW_PITCH = 66;
/** Where a row's contents sit, left to right: avatar centre, text, time mark.
 *  Row k's centre is WIRE_Y + k · ROW_PITCH, so row 0 is on the spine. */
const ROW_AVATAR_X = 852;
const ROW_TEXT_X = 870;
const ROW_TIME_X = 1048;
/** The four placeholder rows, as sender-bar / subject-bar widths. Authored,
 *  never rolled: a width that changes when you scroll past it twice is a
 *  width that will eventually change in a screenshot (same rule as scene 2's
 *  mock latencies). Widest is 132u, which clears the time mark at 1048. */
const ROW_BARS: readonly (readonly [number, number])[] = [
  [58, 132],
  [44, 108],
  [70, 120],
  [52, 96],
];

/* ── The typed reply ───────────────────────────────────────────────────────
   Pre-split into one <text> per character, positioned by us rather than by the
   text layout engine. Two reasons, and the first is the load-bearing one:

     · a per-character reveal has to be REVERSIBLE, and the only way to reverse
       "type a string" is to never have typed it — every glyph exists from the
       first frame and the timeline only ever changes its opacity;
     · placing each glyph at an explicit x means the block cursor's position is
       arithmetic (REPLY_TEXT_X + n · CHAR_W) instead of a measurement, so it
       is exact at every scrub position and does not depend on the web font
       having loaded when the scene booted.

   CHAR_W is the mono advance at this size: 12u × (0.6em + the 0.01em tracking
   the rest of the screen runs at). Geist Mono is a 0.6em monospace, so the
   reply sits on the same rhythm as the subject line above it. */
const REPLY_TEXT = "it hasn't arrived yet?";
const CHAR_W = 12 * 0.61;

/** The reply bar, and where its text starts. 16u of inset, which is the same
 *  inset the row avatars sit at — the screen has one left margin, not two. */
const REPLY_X = 846;
const REPLY_W = 208;
const REPLY_Y = 440;
const REPLY_H = 44;
const REPLY_PAD = 16;
const REPLY_TEXT_X = REPLY_X + REPLY_PAD;
/** The typed reply's baseline, and the y every beat-3 traveller starts at. */
const REPLY_BASE_Y = 467;

/** The block cursor. Narrower than the cell by a hair of air so it never
 *  touches the glyph behind it, and no blink — an infinite loop inside a
 *  scrubbed timeline is a state that survives a reverse pass (DESIGN §3, and
 *  §7 on infinite micro-animations). It is present or it is not. */
const CURSOR_W = 6.7;

/** The send glyph's centre and half-width. It has to clear the last character
 *  the reader types, and the margin is only 3.6u — which is why there is a
 *  boot assert on it rather than a comment hoping for the best. */
const SEND_CX = 1042;
const SEND_HALF = 8;
/** Minimum air between the cursor's trailing edge and the glyph's nose. */
const SEND_GAP_MIN = 2;

/* ── The route out, and the route back ─────────────────────────────────────
   A ROUTE and a LINE are two different objects, exactly as in scene 2. The
   reader sees one wire; the packets fly on guides that lie on top of it and
   run 85u further at the chip end, into the middle of the box, because a guide
   that stopped at the wall would make the last leg of the journey a jump.

   The return has an elbow in it, because the reply bar is 275u below the
   spine. The dot leaves the phone's left wall heading left, climbs, and merges
   onto the wire heading left — both tangents horizontal, so it never appears
   to turn a corner, it appears to step up onto the line. RETURN_JOIN_X is
   where it does so: 200u clear of the phone, which is the air the climb needs
   to not read as a vertical jump. */
const STEP_OUT_X = 800;
const RETURN_JOIN_X = 620;

/* ── The camera ───────────────────────────────────────────────────────────
   Same construction as scene 2's: each keyframe is "put scene point (fx,fy) in
   the middle of the frame at zoom z", tweened as three plain numbers and
   written out as one transform attribute.

   The zoom range is 0.94 → 1.62, which is wider than the 0.88–1.26 scene 2
   holds itself to, and the difference is earned rather than borrowed. Scene 2
   is a schematic with thirty mechanisms in it and a reader who can lose the
   map; this scene has two objects, and the thing it has to show — twenty-two
   characters typed into a 208u field — is 12u type that reads at 10 CSS px on
   the wide shot and 17 at the close-up. A scene whose subject is a sentence
   has to be able to get close enough to read it.

   The last keyframe is CAM_START again, asserted at boot: the scene ends on
   the frame it opened on, because beat 3's whole point is the distance, and
   you cannot show a distance from inside it. */
const CAM_START = { z: 0.94, fx: 600, fy: 300 };
const CAM: { at: number; dur: number; z: number; fx: number; fy: number }[] = [
  /* B1 — the inbox. Starts while the packet is still crossing, so the push
     and the flight are one movement rather than a move and then a move.
     940 ± 600/1.12 covers x 404…1476 and 291 ± 300/1.12 covers y 23…559: the
     WHOLE phone (y 53…547), its label at 43, and the receipt stamp out at
     x 644 on the left. This was 1.28 once, which cropped the phone's bottom
     63u — defensible as framing, but on a dark canvas a device cut by the
     frame edge reads as something black covering it, not as a choice (user
     call). The full-immersion zoom belongs to B2, where being past the
     device's edges is the point. */
  { at: 12.2, dur: 3.2, z: 1.12, fx: 940, fy: 291 },
  /* B2 — the opened thread. 950 ± 600/1.62 covers x 579…1321 and 315 ± 300/
     1.62 covers y 130…500, which is the subject line at 190, the sender at
     218, the body, and the reply bar at 440–484 with 16u of screen under it.
     The app bar falls off the top and should: the reader is in the thread. */
  { at: 22.0, dur: 3.2, z: 1.62, fx: 950, fy: 315 },
  /* B3 — back out, and it happens DURING the pause. The dot stands still
     outside the phone while the frame opens up behind it, so the two things
     the beat has to say — "it stopped" and "look how far it has to go" —
     arrive as one gesture instead of in sequence. */
  { at: 48.2, dur: 3.6, z: CAM_START.z, fx: CAM_START.fx, fy: CAM_START.fy },
];

/** viewBox centre — the point the camera puts things at. */
const FRAME_CX = 600;
const FRAME_CY = 300;

/* ── Beat 1 · the delivery ─────────────────────────────────────────────── */
const B1_CHIP = 0.6;
const B1_WIRE = 1.6;
const B1_PHONE = 3.0;
const B1_SCREEN = 4.6;
/** The phone comes ON in the order a phone does: glass, then chrome, then the
 *  app, then its contents. Four fades, 1.6 units apart. */
const B1_CHROME = 6.4;
const B1_APP = 7.4;
const B1_ROWS = 8.6;
/** When the packet appears in the chip, and how long the crossing takes. 4.2
 *  units ≈ 0.105 viewport heights over 645u of wire. */
const B1_FLY = 11.0;
const B1_FLY_DUR = 4.2;
const B1_LAND = B1_FLY + B1_FLY_DUR; // 15.2
/** The arrival: the list drops one pitch and our row takes the top slot. */
const B1_ARRIVE = B1_LAND + 0.2;

/* ── The buzz ──────────────────────────────────────────────────────────────
   The hero's bell is a real damped oscillator on gsap.ticker, and this is the
   same physics arriving at the other end of the wire — but it CANNOT be a
   ticker here, because a scrubbed scene may be rendered at any progress in any
   order and an integrator has memory. So the damping is authored: one kick out
   to BUZZ_PEAK, then BUZZ_SWINGS reversals each BUZZ_DECAY of the last, ending
   at exactly zero. Five reversals gives 2.8° → −1.96 → 1.37 → −0.96 → 0.67 → 0
   — two and a half oscillations, which is what a phone on a desk does.

   It starts at B1_ARRIVE, which is also the instant the camera's first move
   FINISHES (12.2 + 3.2 = 15.4). That is not a coincidence to be tidied away:
   a rotation and a zoom running together read as a wobble in the lens rather
   than a shake in the object, and the two live on different elements so
   nothing would have warned us. They are butted end to end instead.

   0.14 + 5 × 0.26 = 1.44 units ≈ 0.036 viewport heights: a flick of scroll,
   which is the right price for an event that is over before you look at it. */
const BUZZ_PEAK = 2.8;
const BUZZ_DECAY = 0.7;
const BUZZ_SWINGS = 5;
const BUZZ_IN = 0.14;
const BUZZ_STEP = 0.26;
const BUZZ_END = B1_ARRIVE + BUZZ_IN + BUZZ_SWINGS * BUZZ_STEP;

/* ── Beat 2 · the reply ────────────────────────────────────────────────── */
/** The screen change. Starts 0.6 units after the camera does, so the push-in
 *  reads as the cause and the screen change as the consequence. */
const B2_SWAP = BEAT_2 + 0.6;
/** The hint leaves and the cursor arrives, in that order and NOT overlapping:
 *  a field says "Reply" until somebody is in it, and the cursor is what says
 *  somebody is. Overlapped by 0.5 the block sat on top of the R and the two
 *  read as one smudged glyph — the hint's own fade (0.9) is therefore what
 *  sets the cursor's start, not a number chosen next to it. */
const B2_HINT_OUT = 26.0;
const B2_HINT_FADE = 0.9;
const B2_CURSOR = B2_HINT_OUT + B2_HINT_FADE;
const TYPE_T0 = 28.0;
/** Scroll per character. 0.52 units = 0.013 viewport heights, so the whole
 *  sentence costs about a quarter of a screen — the slowest thing on the page,
 *  which is the correct price for the only human act on it. Under ~0.3 the
 *  reply appears rather than being typed; over ~0.7 the reader starts to
 *  wonder whether the page has stopped. */
const CHAR_STEP = 0.52;
const CHAR_FADE = 0.14;
/** When the last character has finished fading in. Everything downstream —
 *  the send glyph, the press, the collapse — is written against this, and the
 *  boot assert below is what stops the sequence from ever running backwards. */
const TYPE_END = TYPE_T0 + (REPLY_TEXT.length - 1) * CHAR_STEP + CHAR_FADE; // 39.06
/** Send appears once there is something to send, not before. */
const B2_SEND_IN = TYPE_END + 0.7;

/* ── Beat 3 · the reversal ─────────────────────────────────────────────── */
/** THE PRESS. The last human act in the scene, and now the CAUSE of
 *  everything after it: a quick scale dip on the glyph, and 0.3 units later
 *  the reply comes apart. The collapse used to simply happen at BEAT_3 — it
 *  still does, to the frame, but it is no longer something the scene decided
 *  on its own. Somebody pressed send. */
const B3_PRESS = BEAT_3 - 0.3;
const B3_PRESS_DOWN = 0.18;
const B3_PRESS_UP = 0.26;
const B3_COLLAPSE = BEAT_3;
const B3_STEP = 47.9;
const B3_STEP_DUR = 1.3;
/** THE PAUSE. The dot stands outside the phone, committed to nothing, for 2.8
 *  units — a fourteenth of the whole scene in which the only thing that moves
 *  is the camera opening up behind it. Without it the reply ricochets off the
 *  phone; with it, the message decides to go back. TURN_PAUSE_MIN refuses to
 *  boot if an edit takes it away. */
const B3_COMMIT = 52.0;
const TURN_PAUSE_MIN = 1.5;
/** 8.4 units for ~745u of route, against the outbound's 4.2 for 645u. The way
 *  home is deliberately the slower journey: it is the one nobody else's
 *  product makes, and the reader is meant to watch all of it. */
const B3_RUN_DUR = 8.4;
const B3_LAND = B3_COMMIT + B3_RUN_DUR; // 60.4

/** Packet radius. 4.5u, the same dot as the hero's clapper ball and scene 2's
 *  packets — the third scene in a row is not the place to invent a new one. */
const DOT_R = 4.5;

/* ── The receipt's three states ────────────────────────────────────────────
   delivered → opened → replied, each in the same slot. The moments are not
   chosen for rhythm; each one is the instant the thing it names actually
   happens on screen, which is the only reason a status line is worth putting
   on a page at all:

     delivered  the row lands in the inbox
     opened     the screen changes to the thread — tapping the mail IS opening
                it, so the swap and the receipt are the same event
     replied    the send is pressed

   Each arrives one notch brighter than it rests (--text, settling to the
   stamp's --text-dim over 1.3 units), which is scene 2's stamp emphasis: a
   state change should be visible as a change, not just as new words. */
const RCP_DELIVERED = B1_ARRIVE + 1.9; // 17.3
const RCP_OPENED = 22.8;
const RCP_REPLIED = B3_PRESS + 0.35;
const RCP_SWAP_FADE = 0.8;
const RCP_SETTLE = 1.3;

/* ── The glass ─────────────────────────────────────────────────────────────
   Three narrator sentences, one on the frame at a time, each timed to the
   quiet stretch of its own beat — the place where the reader has understood
   what is happening and has scroll left to think about it.

     1  after the buzz has rung out and before the reply beat starts
     2  in the middle of the typing, when nothing else in the frame is moving
     3  riding the 8.4-unit journey home, gone before the dock stamp lands

   Each is a rule that draws out from its own middle and a block of text that
   rises into place under it, and leaves by dipping and fading. The gaps
   between them are enormous on purpose (8.6 and 15.8 units): the glass is a
   layer that should feel like it is used sparingly, and the boot assert below
   refuses a schedule where one caption is still leaving as the next arrives. */
const CAP_RULE_IN = 0.9;
const CAP_TEXT_IN = 1.1;
const CAP_TEXT_OUT = 0.9;
const CAP_RULE_OUT = 0.7;
/** How far the text rises in, and dips out. Small — this is a settle, not an
 *  entrance (DESIGN §3 caps entrances at subtle). */
const CAP_RISE = 5;
const CAP_DIP = 6;
/** The tracking settle, done as a group scaleX rather than as a letter-spacing
 *  tween. letter-spacing is a LAYOUT property: animating it re-flows the text
 *  run every frame, which DESIGN §3 bans outright ("transform and opacity
 *  only"). A 1.03 → 1.0 scaleX about the text's own left anchor is the same
 *  gesture — the line condenses to its final width — on the one channel the
 *  law allows. */
const CAP_TRACK = 1.03;
const CAPS: { at: number; out: number }[] = [
  /* Written off BUZZ_END rather than as a number near it: the narrator does
     not talk over the phone while it is still shaking, and that relation
     should survive somebody retuning the buzz. */
  { at: BUZZ_END + 0.6, out: 21.0 },
  { at: 30.5, out: 36.5 },
  { at: 53.2, out: 58.6 },
];

/** The developer tease, one and a half units after the stamp it hangs off:
 *  the fact first, then the door. */
const TEASE_AFTER = 1.5;

/* The still fallback's windows: "x y w h" in scene units, cut so each one's
   own mono text is legible on a ~380px phone — plus each beat's narrator line,
   which the still carries as TEXT rather than in the figure. A caption is a
   thing that was said over a moving picture; cropped into a 240u window it
   would be three words lying across a diagram. Verbatim, and the same three
   sentences the glass says (index.html #trn-glass).
   The card captions live here rather
   than in the markup because this scene has no caption rail — the scrubbed
   version says all of this with receipts inside the drawing, so a hidden block
   in index.html would be markup that is never rendered as itself. */
const STILL_WHOLE = "0 20 1200 560";
const STILL_VIEW = [
  {
    /* The inbox is ERASED from the finished frame — the reader tapped into the
       thread — so this card is the only place a still reader ever sees the
       arrival. Same situation as scene 2's phase-A close-up, and the same fix.
       Left edge at 640 because the receipt stamp starts at 644. */
    phase: "delivery",
    kicker: "the delivery",
    text: "One event out, into a real inbox, on the channel it was addressed to — with a receipt.",
    glass: "Delivered is not a log line. It is a buzz in a pocket.",
    /* Left edge at 616 rather than 640 so the arrival cue is whole; the extra
       24u costs 5% of scale and buys the sentence that names the beat. The top
       edge is free — a figure is width:100% with its box's aspect ratio, so
       extending it upward for the phone's label changes nothing but height. */
    box: "616 26 484 224",
  },
  {
    /* Both phone walls (820 and 1080) inside the window, so the crop reads as
       a screen and not as a wall of text. Tall, because a phone is. */
    phase: "reply",
    kicker: "the reply",
    text: "Your user answers the notification itself. No dashboard, no support ticket.",
    glass: "There is no no-reply@ here.",
    box: "812 150 276 350",
  },
  {
    /* Wide enough for the return cue at x 290–458, deep enough for the
       stamp's descender at 273. It is also the only still figure that shows
       the machine inside the chip at a size anyone can read it. */
    phase: "turn",
    kicker: "the turn",
    text: "The answer runs back down the same wire, into the engine. The conversation is open.",
    glass: "Most replies dead-end in a support inbox. Yours comes back as an event.",
    box: "56 130 440 172",
  },
] as const;

const COLOR = {
  green: "#3dd68c",
  greenDim: "#2ba36c",
  text: "#ededed",
  /* Where a receipt settles after arriving one notch brighter. */
  textDim: "#a1a1a1",
  /* The rest ink of both acknowledging boxes. Only one step of the ladder is
     listed because only one step is ever tweened back to. */
  hairlineStrong: "#3f3f3f",
} as const;

const SVG_NS = "http://www.w3.org/2000/svg";

/* ══════════════════════════════════════════════════════════════════════════
   IMPLEMENTATION
   ══════════════════════════════════════════════════════════════════════════ */

function q<T extends Element>(root: ParentNode, sel: string): T {
  const el = root.querySelector<T>(sel);
  if (!el) throw new Error(`[turn] missing element: ${sel}`);
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

export interface TurnScene {
  destroy(): void;
}

/**
 * Scene 3, plus the bridge line that hands over to it. Owns its own media
 * gating: gsap.matchMedia() decides between the pinned scrub and the still
 * cards, and re-decides for free if the reader crosses 768px or turns reduced
 * motion on mid-visit.
 */
export function createTurnScene(): TurnScene {
  const doc = document;

  const bridgeLines = Array.from(doc.querySelectorAll<HTMLElement>(".bridge-line"));

  const section = q<HTMLElement>(doc, "#scene-turn");
  const pin = q<HTMLElement>(doc, "#trn-pin");
  const still = q<HTMLElement>(doc, "#trn-still");
  const progressFill = q<HTMLElement>(doc, "#trn-progress-fill");

  const svg = q<SVGSVGElement>(doc, "#trn-svg");
  const cam = q<SVGGElement>(svg, "#trn-cam");

  const chip = q<SVGRectElement>(svg, "#trn-chip");
  const chipLabel = q<SVGTextElement>(svg, "#trn-chip-label");
  const markIn = q<SVGCircleElement>(svg, "#trn-mark-in");
  const stampIn = q<SVGTextElement>(svg, "#trn-stamp-in");
  const wire = q<SVGPathElement>(svg, "#trn-wire");
  const tease = q<SVGTextElement>(svg, "#trn-tease");

  /** The receipt's three states, in the order they happen. */
  const receipts = ["d", "o", "r"].map((k) => q<SVGTextElement>(svg, `#trn-receipt-${k}`));

  /** The device as one shakeable object, and the glass as a layer the camera
   *  cannot reach. */
  const buzz = q<SVGGElement>(svg, "#trn-buzz");
  const glass = q<SVGGElement>(svg, "#trn-glass");
  const caps = [1, 2, 3].map((i) => {
    const g = q<SVGGElement>(svg, `#trn-cap-${i}`);
    return { rule: q<SVGPathElement>(g, ".trn-cap-rule"), text: q<SVGGElement>(g, ".trn-cap-text") };
  });

  const phone = q<SVGRectElement>(svg, "#trn-phone");
  const screen = q<SVGRectElement>(svg, "#trn-screen");
  const chrome = q<SVGGElement>(svg, "#trn-chrome");

  /* The two screen states. Everything about the phone's contents is one of
     these two groups, which is what makes the change a crossfade. */
  const inbox = q<SVGGElement>(svg, "#trn-inbox");
  const thread = q<SVGGElement>(svg, "#trn-thread");

  const mini = q<SVGGElement>(svg, "#trn-mini");
  const miniQueue = q<SVGRectElement>(svg, "#trn-mini-queue");
  const miniSlots = q<SVGGElement>(svg, "#trn-mini-slots");

  const phoneLabel = q<SVGTextElement>(svg, "#trn-phone-label");
  const cueArrive = q<SVGTextElement>(svg, "#trn-cue-arrive");
  const cueReturn = q<SVGTextElement>(svg, "#trn-cue-return");

  const rowsG = q<SVGGElement>(svg, "#trn-rows");
  const rowNew = q<SVGGElement>(svg, "#trn-row-new");

  const field = q<SVGRectElement>(svg, "#trn-reply");
  const send = q<SVGGElement>(svg, "#trn-send");
  const replyHint = q<SVGTextElement>(svg, "#trn-reply-hint");
  const charsG = q<SVGGElement>(svg, "#trn-chars");
  const cursor = q<SVGRectElement>(svg, "#trn-cursor");

  const dotsG = q<SVGGElement>(svg, "#trn-dots");
  const gSend = q<SVGPathElement>(svg, "#trn-g-send");
  const gStep = q<SVGPathElement>(svg, "#trn-g-step");
  const gBack = q<SVGPathElement>(svg, "#trn-g-back");

  /* ════════════════════════════════════════════════════════════════════════
     BOOT ASSERTS
     Inside the init function, never at module top level: a throw evaluated at
     import time once let esbuild tree-shake a whole scene away in silence.
     Each of these is an invariant a beat below actually relies on.
     ════════════════════════════════════════════════════════════════════════ */

  if (!(BEAT_1 < BEAT_2 && BEAT_2 < BEAT_3 && BEAT_3 < TL_END)) {
    throw new Error("[turn] beats are out of order");
  }

  /* The reply has to be FINISHED before anyone can send it, and the send is
     now what causes the collapse — so this boundary moved from BEAT_3 to the
     press. It is the one place in the scene where a beat destroys what the
     previous beat built, and the order has to be typing, then send, then
     collapse, in that order and never any other. */
  if (TYPE_END > B3_PRESS) {
    throw new Error("[turn] the reply is still being typed when the send is pressed");
  }
  if (B2_SEND_IN < TYPE_END || B3_PRESS < B2_SEND_IN) {
    throw new Error("[turn] the send glyph is pressed before it exists, or exists before the words do");
  }
  /* The glyph has to clear the last character the reader types. The reply is
     placed by arithmetic and the glyph is authored in the markup, so nothing
     else in the system would ever notice them touching. */
  if (REPLY_TEXT_X + (REPLY_TEXT.length + 1) * CHAR_W > SEND_CX - SEND_HALF - SEND_GAP_MIN) {
    throw new Error("[turn] the typed reply runs into the send glyph");
  }

  /* A buzz that does not decay is a vibration, and a vibration on a hairline
     dark UI is a rendering fault. */
  if (BUZZ_DECAY >= 1 || BUZZ_DECAY <= 0) {
    throw new Error("[turn] the buzz does not damp — that is a vibration, not a buzz");
  }
  /* And it must not run while the camera is still moving: a rotation under a
     zoom reads as the lens wobbling rather than the object shaking, and the
     two live on different elements so nothing else would catch it. */
  const camB1 = CAM[0]!;
  if (B1_ARRIVE < camB1.at + camB1.dur) {
    throw new Error("[turn] the buzz starts before the camera has finished moving");
  }

  /* The narrator waits for the phone to stop. A sentence rising into the frame
     while the device is still oscillating is two motions competing for the
     same instant, and the caption loses. */
  if (CAPS[0]!.at < BUZZ_END) {
    throw new Error("[turn] caption 1 arrives while the phone is still buzzing");
  }

  /* One caption on the glass at a time — including the tail of the one that is
     leaving. A schedule where two overlap is two narrators. */
  for (const [i, c] of CAPS.entries()) {
    if (c.out <= c.at) throw new Error(`[turn] caption ${i + 1} leaves before it arrives`);
    const next = CAPS[i + 1];
    if (next && next.at < c.out + Math.max(CAP_TEXT_OUT, CAP_RULE_OUT + 0.2)) {
      throw new Error(`[turn] caption ${i + 2} arrives before caption ${i + 1} has left`);
    }
  }

  /* The turn is a decision, not a bounce. See B3_COMMIT. */
  if (B3_COMMIT - (B3_STEP + B3_STEP_DUR) < TURN_PAUSE_MIN) {
    throw new Error("[turn] the reply turns around without stopping — that is a bounce");
  }

  /* The reply plus its cursor has to fit between the field's own walls. The
     text is placed by arithmetic rather than laid out, so nothing else would
     ever notice it running past the edge. */
  if (REPLY_TEXT_X + (REPLY_TEXT.length + 1) * CHAR_W > REPLY_X + REPLY_W - REPLY_PAD) {
    throw new Error("[turn] the typed reply overflows the reply field");
  }

  /* The field and the cursor are authored in the markup; the reply's baseline
     and the cursor's step pitch are computed here, and neither can see the
     box it has to sit in. The cheapest way to guarantee they agree is to
     refuse to boot if they do not. */
  if (
    Number(field.getAttribute("y")) !== REPLY_Y ||
    Number(field.getAttribute("height")) !== REPLY_H ||
    Number(cursor.getAttribute("width")) !== CURSOR_W
  ) {
    throw new Error("[turn] #trn-reply / #trn-cursor disagree with REPLY_Y / REPLY_H / CURSOR_W");
  }
  if (REPLY_BASE_Y <= REPLY_Y || REPLY_BASE_Y >= REPLY_Y + REPLY_H) {
    throw new Error("[turn] the typed reply's baseline sits outside the reply field");
  }

  /* The markup and the constants above have to agree about where the wire is,
     because the return guide is written from the constants and the reader
     watches the packet against the LINE. Endpoints, not the whole path: it is
     a straight horizontal and these two points are all of it. */
  const wireA = wire.getPointAtLength(0);
  const wireB = wire.getPointAtLength(wire.getTotalLength());
  if (
    Math.abs(wireA.x - WIRE_X0) > 0.5 ||
    Math.abs(wireB.x - WIRE_X1) > 0.5 ||
    Math.abs(wireA.y - WIRE_Y) > 0.5 ||
    Math.abs(wireB.y - WIRE_Y) > 0.5
  ) {
    throw new Error("[turn] #trn-wire does not match WIRE_X0 / WIRE_X1 / WIRE_Y");
  }

  /* The inbound dot has to join the wire ON the wire, and come to rest INSIDE
     the chip. Either one off by a little is a packet travelling over nothing,
     which is the undrawn-road bug scene 2 spent two commits on. */
  if (RETURN_JOIN_X <= WIRE_X0 || RETURN_JOIN_X >= WIRE_X1) {
    throw new Error("[turn] the return joins the wire off the end of the wire");
  }
  if (CHIP_CX <= CHIP_X || CHIP_CX >= CHIP_X + CHIP_W) {
    throw new Error("[turn] the inbound dot comes to rest outside the engine chip");
  }

  /* And it has to come to rest in a SLOT, not just somewhere in the box. The
     last frame of the scene is a message sitting in the engine's queue; if
     CHIP_CX drifts off a cell centre — which is what happens the moment the
     queue's width or its cell count is edited — the message spends the ending
     straddling a divider, and the beat becomes an accident. */
  const dockCell = (CHIP_CX - MINI_Q_X) / MINI_CELL - 0.5;
  if (Math.abs(dockCell - Math.round(dockCell)) > 1e-6 || dockCell < 0 || dockCell >= MINI_Q_CELLS) {
    throw new Error("[turn] the inbound message does not come to rest in a queue cell");
  }
  /* The miniature has to fit inside the box it is the inside of, and the
     markup has to agree with the constants the dividers are generated from. */
  if (
    MINI_Q_X <= CHIP_X ||
    MINI_Q_X + MINI_Q_W >= CHIP_X + CHIP_W ||
    Number(miniQueue.getAttribute("x")) !== MINI_Q_X ||
    Number(miniQueue.getAttribute("width")) !== MINI_Q_W
  ) {
    throw new Error("[turn] the miniature queue disagrees with MINI_Q_X / MINI_Q_W");
  }

  /* The wire has to end ON the phone's own wall, and the screen has to be the
     window the rows are measured against. Both are authored in the markup and
     both are what the constants here compute against, so a drift of a few
     units would put the packet's landing point in mid-air and the time marks
     through the right bezel — neither of which a diff shows. */
  if (
    Number(phone.getAttribute("x")) !== PHONE_X ||
    PHONE_X !== WIRE_X1 ||
    Number(screen.getAttribute("x")) !== SCREEN_X ||
    Number(screen.getAttribute("width")) !== SCREEN_W
  ) {
    throw new Error("[turn] the phone and the wire disagree about where the phone's wall is");
  }
  if (ROW_TIME_X + 14 > SCREEN_X + SCREEN_W) {
    throw new Error("[turn] an inbox row's time mark runs past the screen");
  }

  /* The scene has to END on the frame it OPENED on. Beat 3's whole argument is
     the distance the reply travels, and a camera left anywhere near the phone
     is a camera that cannot show a distance. It is also what makes a reverse
     scrub honest: the last keyframe and the rest state are the same three
     numbers, so scrolling back up cannot leave the frame parked. */
  const camLast = CAM[CAM.length - 1]!;
  if (camLast.z !== CAM_START.z || camLast.fx !== CAM_START.fx || camLast.fy !== CAM_START.fy) {
    throw new Error("[turn] the camera does not return to the wide shot it started on");
  }

  /* The arrival slides the placeholder list down by exactly one row pitch, and
     the pitch is a constant the markup cannot see. If the authored rows and
     ROW_PITCH ever disagree, the list lands half a row off its own ruling —
     which is the kind of thing a diff does not show. */
  if (Number(rowNew.querySelector("circle")?.getAttribute("cy")) !== WIRE_Y) {
    throw new Error("[turn] the new inbox row is not on the wire's own latitude");
  }

  /* ════════════════════════════════════════════════════════════════════════
     GENERATED DOM
     The three flight routes, four rows of somebody else's mail, and the
     twenty-two characters of the reply. Written from the constants above so
     the markup can never drift from them.
     ════════════════════════════════════════════════════════════════════════ */

  gSend.setAttribute("d", `M ${CHIP_CX} ${WIRE_Y} L ${WIRE_X1} ${WIRE_Y}`);
  gStep.setAttribute("d", `M ${REPLY_TEXT_X} ${REPLY_BASE_Y} L ${STEP_OUT_X} ${REPLY_BASE_Y}`);
  /* The climb, then the wire, then the last 85u into the middle of the chip —
     one continuous route, because the whole point of the beat is that the
     message does not stop between the phone and the engine. The straight run
     lies exactly on #trn-wire (asserted above), so the reader sees the packet
     riding the line it was delivered on, backwards. */
  gBack.setAttribute(
    "d",
    `M ${STEP_OUT_X} ${REPLY_BASE_Y} C 720 ${REPLY_BASE_Y} 700 ${WIRE_Y} ${RETURN_JOIN_X} ${WIRE_Y} L ${CHIP_CX} ${WIRE_Y}`,
  );

  /* The queue's ruling. Generated so the cell pitch lives in exactly one
     place — the same split scene 2 makes with QUEUE_SLOT, and the reason the
     dock assert above can be trusted. Interior dividers only: the box's own
     walls are the first and last. */
  for (let i = 1; i < MINI_Q_CELLS; i++) {
    const x = MINI_Q_X + i * MINI_CELL;
    miniSlots.appendChild(svgEl("path", { d: `M ${x} ${MINI_Q_Y} L ${x} ${MINI_Q_Y + MINI_Q_H}` }));
  }

  /* Four rows of mail the reader is not meant to read. Same anatomy as the one
     they are — avatar, sender, subject, time — with the words replaced by
     bars, which is what "there was already mail in here" looks like without
     inventing five more sentences of copy nobody will read. */
  for (const [i, bars] of ROW_BARS.entries()) {
    const cy = WIRE_Y + (i + 1) * ROW_PITCH;
    rowsG.append(
      svgEl("circle", { class: "trn-ui-line", cx: ROW_AVATAR_X, cy, r: 9 }),
      svgEl("rect", {
        class: "trn-ui-fill",
        x: ROW_TEXT_X,
        y: cy - 16,
        width: bars[0],
        height: 6,
        rx: 2,
      }),
      svgEl("rect", {
        class: "trn-ui-fill",
        x: ROW_TEXT_X,
        y: cy + 4,
        width: bars[1],
        height: 6,
        rx: 2,
      }),
      svgEl("rect", { class: "trn-ui-fill", x: ROW_TIME_X, y: cy - 15, width: 14, height: 5, rx: 2 }),
    );
  }

  const chars = Array.from(REPLY_TEXT, (ch, i) => {
    const t = svgEl("text", {
      class: "trn-char",
      x: (REPLY_TEXT_X + i * CHAR_W).toFixed(2),
      y: REPLY_BASE_Y,
    });
    t.textContent = ch;
    charsG.appendChild(t);
    return t;
  });

  /** The two packets. One is ours going out and is green; one is the user's
   *  coming back and is neutral ink. That is the rationing law being made into
   *  the plot of a scene rather than obeyed by it (BRAND §2). */
  const dotOut = svgEl("circle", { class: "trn-dot trn-dot-out", cx: 0, cy: 0, r: DOT_R });
  const dotIn = svgEl("circle", { class: "trn-dot trn-dot-in", cx: 0, cy: 0, r: DOT_R });
  dotsG.append(dotOut, dotIn);

  /* ── the pristine clone ────────────────────────────────────────────────
     Captured now: the composition is complete and no gsap.set has touched it,
     so this node IS the scrub's final frame. Ids stripped, packets removed.
     The reply's characters are in it but at rest opacity 0, exactly as the
     finished frame has them; the two still figures that need to show the
     words turn them back on by data-phase (see .trn-char in styles.css). */
  const pristine = svg.cloneNode(true) as SVGSVGElement;
  pristine.removeAttribute("id");
  for (const el of Array.from(pristine.querySelectorAll("[id]"))) el.removeAttribute("id");
  pristine.querySelector(".trn-l-dots")?.replaceChildren();
  /* The glass never appears in a still figure. A narrator caption cropped to a
     240u window would be three words of a sentence lying across a diagram;
     the still carries these three lines as text in the cards instead. */
  pristine.querySelector(".trn-l-glass")?.remove();

  /** Everything traced rather than faded — the four boxes that are STRUCTURE.
   *  Nothing inside the screen is traced: an app does not draw itself line by
   *  line, it comes on. */
  const strokeParts: SVGGeometryElement[] = [chip, wire, phone, screen];
  /** The boxes whose fill comes up behind their own outline, so each is a line
   *  before it is a surface. */
  const boxRects: SVGRectElement[] = [chip, phone, screen];
  /** Everything that only ever fades. The two screen states are single
   *  elements here on purpose: an app bar that faded in six pieces would be
   *  six events, and the phone coming on is one. `rowsG` and `rowNew` carry
   *  their own opacity INSIDE the inbox group because they arrive at different
   *  moments than the chrome around them does. */
  const fadeParts: SVGElement[] = [
    chipLabel,
    /* The miniature is ONE fade, not eleven: a machine glimpsed inside a
       window either is there or is not, and tracing it line by line at 1/7
       scale would be eleven events nobody can follow. */
    mini,
    markIn,
    stampIn,
    tease,
    ...receipts,
    cueArrive,
    cueReturn,
    phoneLabel,
    chrome,
    inbox,
    rowsG,
    rowNew,
    thread,
    replyHint,
    send,
    ...caps.map((c) => c.text),
  ];

  /* ── the camera ──────────────────────────────────────────────────────────
     Three numbers — zoom, and the scene point to centre — tweened as a plain
     object and written out as one transform attribute. Not as gsap `scale`/
     `x`/`y` on the group, and that is load-bearing: gsap resolves an SVG
     element's transform origin against its own bbox unless told otherwise,
     re-derives it whenever the transform cache is rebuilt, and compensates
     when it thinks the origin moved. A camera whose pivot silently becomes
     "wherever the drawing happens to be widest" drifts a little further off
     with every keyframe. Owning the matrix costs one setAttribute per frame
     and cannot be wrong. (Identical to #eng-cam, deliberately.)

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

  /* ════════════════════════════════════════════════════════════════════════
     REST STATE — the inverse of the stylesheet
     ════════════════════════════════════════════════════════════════════════ */

  function restState(): void {
    gsap.set(pin, { opacity: 0 });
    gsap.set(progressFill, { scaleX: 0 });
    gsap.set(strokeParts, { drawSVG: "0% 0%" });
    gsap.set(boxRects, { fillOpacity: 0 });
    /* The one box that ever acknowledges anything, put back to the ink the
       stylesheet paints it in. The phone is not in this list any more: its
       arrival is a buzz now, and rest state only owes an inverse for things
       the scrub actually changes. */
    gsap.set(chip, { stroke: COLOR.hairlineStrong });
    gsap.set(fadeParts, { opacity: 0 });
    gsap.set(chars, { opacity: 0 });
    /* The placeholder list rests ONE PITCH HIGHER than it is authored, so the
       arrival can drop it into place. The finished frame is where the markup
       puts it; this is the inverse, same as every other rule here. */
    gsap.set(rowsG, { y: -ROW_PITCH });
    /* The collapse pivots on the head of the sentence — the reply contracts
       back to where it started being written, which is where the dot appears.
       A BBOX origin rather than svgOrigin, and that is deliberate: this group
       lives inside the camera, and a global-space origin under an ancestor
       transform is a question with two defensible answers. The glyphs never
       move, so the bbox never moves, so re-derivation is harmless. Same
       construction scene 2 uses for everything inside #eng-cam. */
    gsap.set(charsG, { scale: 1, transformOrigin: "0% 50%" });
    gsap.set(cursor, { opacity: 0, x: 0 });
    gsap.set(send, { scale: 1, transformOrigin: "50% 50%" });
    /* The device stands still and square until something arrives for it. */
    gsap.set(buzz, { rotation: 0, transformOrigin: "50% 50%" });
    /* The glass. Its own layer opacity is what the stylesheet uses to keep the
       captions out of the finished frame, so the scrub has to raise it once
       and then work in the caption groups underneath. Each rule rests
       collapsed onto its own middle — the one drawSVG range other than 0 and
       100 that means the same number in screen space and user space. */
    gsap.set(glass, { opacity: 1 });
    gsap.set(
      caps.map((c) => c.rule),
      { drawSVG: "50% 50%" },
    );
    gsap.set(
      caps.map((c) => c.text),
      { y: CAP_RISE, scaleX: CAP_TRACK, transformOrigin: "0% 50%" },
    );
    /* Packets parked where their own journey starts rather than at the scene
       origin — same insurance as scene 2. A circle authored at 0,0 sits in the
       viewBox's corner until something moves it, so the failure mode of a beat
       that forgets to place one is a dot floating over the drawing; parked,
       the same mistake puts it on its own route. */
    gsap.set(dotOut, {
      opacity: 0,
      fill: COLOR.greenDim,
      scale: 1,
      x: CHIP_CX,
      y: WIRE_Y,
      transformOrigin: "50% 50%",
    });
    gsap.set(dotIn, {
      opacity: 0,
      scale: 1,
      x: REPLY_TEXT_X,
      y: REPLY_BASE_Y,
      transformOrigin: "50% 50%",
    });
    camState.z = CAM_START.z;
    camState.fx = CAM_START.fx;
    camState.fy = CAM_START.fy;
    applyCam();
  }

  /* ════════════════════════════════════════════════════════════════════════
     THE STILL STATE  (< 768px, and prefers-reduced-motion)
     Same information, delivered by layout instead of by time (DESIGN §3).
     ════════════════════════════════════════════════════════════════════════ */

  function buildStill(reduced: boolean): () => void {
    const frag = doc.createDocumentFragment();

    /* `phase` decides which screen the phone is showing and whether the reply
       is typed into it — two things that are true at different moments and
       cannot both be true in one frame (see .trn-screen-inbox and .trn-char in
       styles.css). Everything else in every figure is the finished frame. */
    function figure(box: string, phase: string): HTMLElement {
      const wrap = doc.createElement("div");
      wrap.className = "trn-card-figure";
      wrap.dataset["phase"] = phase;
      const clone = pristine.cloneNode(true) as SVGSVGElement;
      clone.setAttribute("viewBox", box);
      // As tall as its own window is deep, so nothing letterboxes.
      const n = box.split(" ");
      clone.style.aspectRatio = `${n[2]} / ${n[3]}`;
      wrap.appendChild(clone);
      return wrap;
    }

    /* Kicker, then what happened, then what it meant — the third line being
       the sentence the glass says over this beat in the scrubbed version. Two
       voices on one card, in the same order the frame plays them. */
    function block(kicker: string, text: string, glassLine: string): HTMLElement {
      const el = doc.createElement("div");
      el.className = "eng-card";
      const k = doc.createElement("span");
      k.className = "eng-kicker";
      k.textContent = kicker;
      const p = doc.createElement("p");
      p.className = "eng-caption";
      p.textContent = text;
      const g = doc.createElement("p");
      g.className = "trn-still-glass";
      g.textContent = glassLine;
      el.append(k, p, g);
      return el;
    }

    if (reduced) {
      /* The finished frame whole, then the argument as a list — and the first
         two captions carry their own close-ups, because at 1200u wide the
         phone's 12u screen type is 7px and the two things a reduced-motion
         reader MUST still receive are what the notification said and what the
         human typed back (DESIGN §3). The turn needs no close-up: the chip,
         the mark and the stamp are 15u and legible in the whole frame. */
      const lede = doc.createElement("p");
      lede.className = "eng-still-lede";
      lede.textContent = "The user replies, and the reply comes back in.";
      frag.append(lede, figure(STILL_WHOLE, "all"));
      for (const v of STILL_VIEW) {
        const el = block(v.kicker, v.text, v.glass);
        if (v.phase !== "turn") el.appendChild(figure(v.box, v.phase));
        frag.appendChild(el);
      }
    } else {
      /* One card per beat, each a close-up: the whole 1030u composition on a
         phone is three illegible mono labels. */
      for (const v of STILL_VIEW) {
        const el = block(v.kicker, v.text, v.glass);
        el.appendChild(figure(v.box, v.phase));
        frag.appendChild(el);
      }
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
     THE BRIDGE  —  the narrative hinge, free scroll, never pinned
     Two lines, revealed on a scrub as the section rises. The second line is
     the claim the rest of the site is built on, so it arrives after the first
     has been read rather than with it.
     ════════════════════════════════════════════════════════════════════════ */

  function buildBridge(): void {
    gsap.set(bridgeLines, { opacity: 0, y: 22 });
    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      scrollTrigger: {
        trigger: ".bridge",
        start: "top 82%",
        end: "top 34%",
        scrub: true,
      },
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
     THE SCRUB
     ════════════════════════════════════════════════════════════════════════ */

  function buildScrub(): void {
    restState();

    /* The scene materialises on the way in, on its own trigger — the pinned
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
      /* The camera's three numbers are tweened; this is what paints them. A
         pure function of camState, so it is as rewindable as the tweens are. */
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

    /* ── the helpers every beat is built from ───────────────────────────
       All fromTo with immediateRender:false, so the timeline can be rendered
       at any progress, in any order, and every element knows both ends of
       every tween it is in. Same five as engine.ts, minus the ones this scene
       has no use for. */

    function ft(t: gsap.TweenTarget, from: gsap.TweenVars, to: gsap.TweenVars, at: number): void {
      tl.fromTo(t, from, { ...to, immediateRender: false }, at);
    }

    const fadeIn = (t: gsap.TweenTarget, at: number, dur = 1.2): void =>
      ft(t, { opacity: 0 }, { opacity: 1, duration: dur }, at);

    const fadeOut = (t: gsap.TweenTarget, at: number, dur = 1.2): void =>
      ft(t, { opacity: 1 }, { opacity: 0, duration: dur }, at);

    const draw = (t: gsap.TweenTarget, at: number, dur: number): void =>
      ft(t, { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: dur, ease: "power2.out" }, at);

    /** A box: outline traced, fill brought up behind it at the halfway mark so
     *  the rectangle is a line before it is a surface. */
    const drawBox = (t: gsap.TweenTarget, at: number, dur: number): void => {
      draw(t, at, dur);
      ft(t, { fillOpacity: 0 }, { fillOpacity: 1, duration: dur * 0.8 }, at + dur * 0.45);
    };

    /** A packet running a route. `align` puts the centre of a circle authored
     *  at the origin exactly on the path point, which is why every packet in
     *  this file is authored at cx/cy 0 — an element carrying its own offset
     *  would have that offset silently cancelled (DESIGN §3). */
    function run(dot: Element, path: SVGPathElement, at: number, dur: number, ease = "none"): void {
      tl.to(
        dot,
        {
          motionPath: { path, align: path, alignOrigin: [0.5, 0.5] },
          duration: dur,
          ease,
          immediateRender: false,
        },
        at,
      );
    }

    /** The pop-settle. Two power2 tweens on a scale, never an elastic ease —
     *  the one sanctioned overshoot on this site (DESIGN §3). */
    const pop = (dot: Element, at: number, to: number): void => {
      ft(dot, { scale: 1 }, { scale: to, duration: 0.26, ease: "power2.out" }, at);
      ft(dot, { scale: to }, { scale: 1, duration: 0.3, ease: "power2.inOut" }, at + 0.26);
    };

    /** A box acknowledging something that just landed on it: its stroke lifts
     *  to `ink` and settles back to `rest`. A moment, never a state — which is
     *  the only reason a green border is allowed to exist at all (BRAND §2).
     *  `rest` is passed rather than assumed, because the two boxes that do this
     *  sit on two different steps of the ladder. */
    const ack = (box: Element, at: number, ink: string, rest: string): void => {
      ft(box, { stroke: rest }, { stroke: ink, duration: 0.2, ease: "power2.out" }, at);
      ft(box, { stroke: ink }, { stroke: rest, duration: 1.8 }, at + 0.6);
    };

    /** A receipt state arriving. One notch brighter than it rests, settling
     *  back over 1.3 units — scene 2's stamp emphasis. A status line that
     *  simply appeared would be new words; this is a change of state. */
    const stampState = (el: Element, at: number): void => {
      fadeIn(el, at, 0.6);
      ft(el, { fill: COLOR.text }, { fill: COLOR.textDim, duration: RCP_SETTLE }, at + 0.2);
    };

    /** A caption on the glass: a rule drawn out from its own middle, then the
     *  sentence rising under it with its tracking settling. Out is a dip and a
     *  fade, and the rule collapses back the way it came. Every value explicit
     *  at both ends, so scrubbing back takes the caption apart in the order it
     *  was built. */
    const caption = (i: number, at: number, out: number): void => {
      const c = caps[i]!;
      ft(c.rule, { drawSVG: "50% 50%" }, { drawSVG: "0% 100%", duration: CAP_RULE_IN, ease: "power2.out" }, at);
      ft(
        c.text,
        { opacity: 0, y: CAP_RISE, scaleX: CAP_TRACK },
        { opacity: 1, y: 0, scaleX: 1, duration: CAP_TEXT_IN, ease: "power2.out", transformOrigin: "0% 50%" },
        at + 0.25,
      );
      ft(
        c.text,
        { opacity: 1, y: 0 },
        { opacity: 0, y: CAP_DIP, duration: CAP_TEXT_OUT, ease: "power2.in", transformOrigin: "0% 50%" },
        out,
      );
      ft(c.rule, { drawSVG: "0% 100%" }, { drawSVG: "50% 50%", duration: CAP_RULE_OUT, ease: "power2.in" }, out + 0.2);
    };

    /* How much of the pin is left. A pinned section takes the scrollbar away
       from the reader; this hands the information back. */
    ft(progressFill, { scaleX: 0 }, { scaleX: 1, duration: TL_END }, 0);

    /* The three sentences on the glass. Written here as one block rather than
       scattered through the beats they belong to, because they are one voice
       and a reader of this file should be able to see the whole of what the
       narrator says without reading the whole scene. */
    CAPS.forEach((c, i) => caption(i, c.at, c.out));

    /* ── the camera ──────────────────────────────────────────────────────
       Every keyframe is an explicit fromTo off the previous one, so the frame
       is a pure function of timeline position: scrub back and it lands on the
       wide shot exactly, not near it. */
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

    /* ── BEAT 1 · the delivery ───────────────────────────────────────────
       The anatomy assembles left to right, in the order a message travels it:
       the machine, then the road, then the thing at the end of it. The phone
       then comes ON rather than being drawn — glass, chrome, app, contents —
       because a device powering up is not a device being sketched. */
    drawBox(chip, B1_CHIP, 2.4);
    fadeIn(chipLabel, B1_CHIP + 1.2, 1.1);
    /* The machine comes up inside its own box, a beat after the box closes —
       the reader gets the silhouette, and then sees there is something in it.
       Simultaneous, the two read as one busy rectangle. */
    fadeIn(mini, B1_CHIP + 2.0, 1.3);
    draw(wire, B1_WIRE, 2.8);
    drawBox(phone, B1_PHONE, 4.0);
    fadeIn(phoneLabel, B1_PHONE + 2.2, 1.2);
    drawBox(screen, B1_SCREEN, 2.6);
    fadeIn(chrome, B1_CHROME, 1.2);
    fadeIn(inbox, B1_APP, 1.4);
    fadeIn(rowsG, B1_ROWS, 1.2);

    fadeIn(dotOut, B1_FLY - 0.4, 0.5);
    run(dotOut, gSend, B1_FLY, B1_FLY_DUR, "power1.inOut");

    /* The delivery. Dim green to full green at the instant of arrival — a
       packet that was born green has nothing left to say when it lands — and
       it is the ONLY green in the scene, in either direction. */
    ft(dotOut, { fill: COLOR.greenDim }, { fill: COLOR.green, duration: 0.14 }, B1_LAND);
    pop(dotOut, B1_LAND, 1.45);
    fadeOut(dotOut, B1_LAND + 0.7, 0.8);

    /* The phone used to acknowledge with a green edge here, and it is gone.
       Two reasons, and the first one is the law. A 494u silhouette lit in
       --green-dim is the largest green shape on the site — larger than the one
       CTA at the bottom of the page — and BRAND §2 rations green precisely so
       that a delivery has somewhere to go. It was defensible as a transient
       moment when the phone was a 100u card; at full height, with the whole
       device in frame at this camera, it is the page shouting.

       The second reason is that it is now redundant. A phone that receives
       mail BUZZES — the device's reaction is the buzz below, the row landing,
       and the receipt. Acknowledgment by motion instead of by colour is the
       better sentence anyway, and it leaves the packet's landing pop as the
       only green in the scene, in either direction. */

    /* THE ARRIVAL. The list of somebody else's mail drops one full row and
       ours takes the slot at the top — the packet does not become a label
       beside the phone, it becomes a line in a real inbox. The drop and the
       fade are one gesture, 0.15 apart, because a row that appeared and THEN
       pushed the others down would be two events. */
    ft(rowsG, { y: -ROW_PITCH }, { y: 0, duration: 1.1, ease: "power2.out" }, B1_ARRIVE);
    fadeIn(rowNew, B1_ARRIVE + 0.15, 1.2);

    /* AND THE PHONE BUZZES. The hero's bell is a real damped oscillator; this
       is the same idea authored as keyframes because a scrub has no memory to
       integrate with. One kick, then five reversals each 0.7 of the last,
       ending at exactly zero — so a reader who scrolls back finds the device
       square again rather than a degree off true. */
    {
      let a = BUZZ_PEAK;
      let at = B1_ARRIVE;
      ft(
        buzz,
        { rotation: 0 },
        { rotation: a, duration: BUZZ_IN, ease: "power2.out", transformOrigin: "50% 50%" },
        at,
      );
      at += BUZZ_IN;
      for (let i = 1; i <= BUZZ_SWINGS; i++) {
        const next = i === BUZZ_SWINGS ? 0 : -a * BUZZ_DECAY;
        ft(
          buzz,
          { rotation: a },
          { rotation: next, duration: BUZZ_STEP, ease: "power1.inOut", transformOrigin: "50% 50%" },
          at,
        );
        a = next;
        at += BUZZ_STEP;
      }
    }

    /* Our note about their surface, and it lands after the row it is about:
       read before the arrival it would be a promise. The human sentence
       follows the machine receipt rather than leading it — the reader should
       see the thing happen, then be told the receipt, then be told what the
       receipt means. */
    stampState(receipts[0]!, RCP_DELIVERED);
    fadeIn(cueArrive, B1_ARRIVE + 3.2, 1.3);

    /* ── BEAT 2 · the reply ──────────────────────────────────────────────
       The camera pushes in (above), the screen changes underneath it, and then
       nothing in the frame moves except twenty-two characters.

       The screen change is a crossfade between two groups that both exist in
       the markup — the inbox out, the thread in, overlapping by 0.8 units so
       the phone is never blank. Mutating the DOM instead would be a change
       that cannot be scrubbed backwards. */
    fadeOut(inbox, B2_SWAP, 1.6);
    fadeIn(thread, B2_SWAP + 0.8, 1.6);
    /* The arrival's cue goes with the inbox it was about. Two beats later it
       would be a caption for something off screen. */
    fadeOut(cueArrive, B2_SWAP, 1.2);
    fadeIn(replyHint, B2_SWAP + 1.6, 1.0);

    /* Tapping the mail IS opening it, so the screen change and the receipt's
       second state are the same event rather than two things that happen to
       be near each other. The old state leaves as the new one arrives. */
    fadeOut(receipts[0]!, RCP_OPENED - 0.4, RCP_SWAP_FADE);
    stampState(receipts[1]!, RCP_OPENED);

    /* The hint leaves and the cursor arrives, in that order: a field says
       "Reply" right up until somebody is standing in it. */
    fadeOut(replyHint, B2_HINT_OUT, B2_HINT_FADE);
    fadeIn(cursor, B2_CURSOR, 0.8);

    chars.forEach((ch, i) => {
      const at = TYPE_T0 + i * CHAR_STEP;
      fadeIn(ch, at, CHAR_FADE);
      /* The cursor is one discrete step per character, authored as its own
         short tween rather than as a stepped ease: a fromTo pair per step is
         exact at both ends under a reverse scrub, and it means the cursor and
         the glyph it follows are written on the same line of code and can
         never drift apart. */
      ft(cursor, { x: i * CHAR_W }, { x: (i + 1) * CHAR_W, duration: 0.06 }, at);
    });

    /* The sentence is finished, so the thing that sends it appears. Not
       before: a send button beside an empty field is a control, and this is a
       moment. */
    fadeIn(send, B2_SEND_IN, 0.9);

    /* ── BEAT 3 · the reversal ───────────────────────────────────────────
       THE PRESS, and everything after it is a consequence. A quick dip about
       the glyph's own centre — 0.18 down under power2.in, 0.26 back under
       power2.out, which is DESIGN §3's press-feedback curve and the same
       gesture every button on this site makes at :active. */
    ft(
      send,
      { scale: 1 },
      { scale: 0.82, duration: B3_PRESS_DOWN, ease: "power2.in", transformOrigin: "50% 50%" },
      B3_PRESS,
    );
    ft(
      send,
      { scale: 0.82 },
      { scale: 1, duration: B3_PRESS_UP, ease: "power2.out", transformOrigin: "50% 50%" },
      B3_PRESS + B3_PRESS_DOWN,
    );
    /* The receipt's third state arrives with the press, not with the landing:
       "replied" is true the instant the user sends, and everything after it is
       the engine's problem. */
    fadeOut(receipts[1]!, RCP_REPLIED - 0.4, RCP_SWAP_FADE);
    stampState(receipts[2]!, RCP_REPLIED);
    /* And the glyph goes with the words it sent. */
    fadeOut(send, B3_COLLAPSE + 0.2, 0.8);

    /* Note for note the dedupe dissolve from scene 2 — shrink under power2.in,
       fade — because it is the same kind of claim: this text stops being text
       and becomes one thing the engine can carry. It begins 0.3 units after
       the press, which is what makes the press its cause rather than its
       neighbour. */
    ft(
      charsG,
      { scale: 1 },
      /* transformOrigin restated on the tween as well as in restState: gsap
         re-derives an SVG element's origin whenever it rebuilds the transform
         cache, and a collapse that silently re-pivots to the middle of the
         sentence is a collapse toward a point no dot ever appears at. */
      { scale: 0.55, duration: 1.3, ease: "power2.in", transformOrigin: "0% 50%" },
      B3_COLLAPSE,
    );
    fadeOut(chars, B3_COLLAPSE, 0.9);
    fadeOut(cursor, B3_COLLAPSE, 0.5);
    /* The field goes back to saying what an empty field says. It is also what
       the finished frame has in it, so this tween is the one that leaves the
       scene where the stylesheet already had it. */
    fadeIn(replyHint, B3_COLLAPSE + 1.4, 1.0);
    fadeIn(dotIn, B3_COLLAPSE + 0.6, 0.5);

    /* Out through the phone's left wall, and then STOP. The pause is not a gap
       in the storyboard; it is the beat the whole scene turns on — and the
       camera opens up behind the stopped dot (CAM's last keyframe), so the
       reader learns how far it has to go at the exact moment it decides. */
    run(dotIn, gStep, B3_STEP, B3_STEP_DUR, "power2.out");
    run(dotIn, gBack, B3_COMMIT, B3_RUN_DUR, "power1.inOut");

    /* The one thing the travel cannot say for itself. It arrives as the dot
       joins the line rather than as it leaves the phone, so the reader is
       looking at the wire when they are told which wire it is — and it stays,
       because it names the route and not the moment. */
    fadeIn(cueReturn, B3_COMMIT + 1.6, 1.3);

    /* The engine hears it. NEUTRAL ink and no green anywhere in this beat:
       green is a message of ours arriving, and this one is the user's. */
    pop(dotIn, B3_LAND, 1.35);
    ack(chip, B3_LAND, COLOR.text, COLOR.hairlineStrong);

    /* The traveller goes, the mark it left stays — same handoff as scene 2's
       timeline strip, and for the same reason: what the engine heard has to
       still be on screen for a reader who arrives after the motion, and for a
       reader whose browser never plays it at all. */
    fadeIn(markIn, B3_LAND + 0.5, 0.45);
    fadeOut(dotIn, B3_LAND + 0.8, 0.45);

    /* The cliffhanger, stamped in the engine's own corner. Scene 4 opens on
       what the engine does about it. Nothing fades out after this: the last
       eight units of the scrub are the reader sitting with the final frame. */
    fadeIn(stampIn, B3_LAND + 1.8, 1.5);
    /* And the door out of the scene, a beat and a half behind the fact. The
       arrow points the way the reader is about to scroll. */
    fadeIn(tease, B3_LAND + 1.8 + TEASE_AFTER, 1.3);
  }

  /* ════════════════════════════════════════════════════════════════════════
     MEDIA GATING
     One matchMedia owns every choice. The bridge is a fade and works at any
     width, so it is gated on the motion preference alone; the scene itself is
     gated on both, same as scene 2.
     ════════════════════════════════════════════════════════════════════════ */

  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", () => buildBridge());

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
