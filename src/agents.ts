/* ══════════════════════════════════════════════════════════════════════════
   SCENE 4 — AGENTS
   ──────────────────────────────────────────────────────────────────────────
   One composition, pinned, scrubbed over two viewport heights, in four beats
   and NO camera:

     1  THE PICKUP    the wire scene 3 ended on comes down out of the top of
                      the frame and into an agent box — YOUR agent, your model,
                      your prompt. The user's reply rides it in as the same
                      neutral dot that left the last scene, lands on the model,
                      and the box acknowledges in ink. Nothing here is green:
                      this message is the customer's, not one of our deliveries.
     2  THE LOOKUP    two tool calls, in the brain's real order — remember
                      first, then look up. Each is a trace drawn OUT of the box
                      to a card that materialises, and then a result line
                      fading in INSIDE that card. Request as a draw, response
                      as a fade: the same two-part anatomy the real Turn
                      Inspector shows, rather than one round trip animated
                      twice.
     3  THE GUARDRAIL the agent reaches for a third tool and walks into a
                      policy. The card's border goes amber and STOPS, an
                      approval card asks a person, and the person says yes.
                      This is the only amber in the scene and the only pause
                      in it, and they are the same event.
     4  THE ANSWER    the reply the agent writes leaves the machine as a green
                      dot, rides the one road that was drawn in beat 1, and
                      lands in the thread the reader has been looking at the
                      whole time — with a citation, a receipt, the platform
                      event it fires, and the four channels the same agent
                      could have answered on.

   It obeys the same four rules scenes 2 and 3 do — one scrubbed timeline with
   no .set() or .call() in it, every tween a fromTo with immediateRender:false,
   CSS painting the finished frame and restState() inverting it, and
   transform/opacity/stroke/drawSVG only. Two things about this scene are
   worth naming up front:

     · THE CHECKLIST IS THE TRACKER. Scenes 2 and 3 hand the reader back the
       scrollbar a pinned section took away, with a fill that grows. This one
       hands back something better: five claims, listed empty from the first
       frame, each getting a checkmark DRAWN into its box at the instant the
       scene demonstrates it. A tick's moment is data (QUALITIES), asserted
       strictly increasing at boot, and every one of them un-draws on a
       reverse scrub — which is the whole reason it is a drawSVG on a path
       rather than a glyph being swapped in.
     · THERE IS NO CAMERA. Scenes 2 and 3 move the lens because their subject
       is one small thing inside a big drawing. This scene's subject is a
       SEQUENCE, and a camera that visited each card in turn would show three
       close-ups and hide the thread between them. The composition is sized so
       that every string reads at the wide shot instead — which is what fixes
       the frame at 1120 × 600 and the type ladder at 9–13 user units.

   Every path that rests at drawSVG "0% 0%" carries stroke-linecap: butt, and
   this scene is the sharpest case of that law the site has: five checkmarks
   resting at zero length with round caps would paint five filled dots inside
   five empty boxes, which does not read as a bug — it reads as five rows that
   are already checked, on the frame where the scene is still promising them.

   Constants first, with the arithmetic, same as engine.ts and turn.ts.
   ══════════════════════════════════════════════════════════════════════════ */

import { gsap } from "gsap";

/* ══════════════════════════════════════════════════════════════════════════
   TUNING CONSTANTS  —  change these, not the code below
   ══════════════════════════════════════════════════════════════════════════ */

/* ── The scrub window ──────────────────────────────────────────────────────
   SCROLL PER TIMELINE UNIT is 2.0 / 80 = 0.025 viewport heights, which is
   exactly scene 3's density and just above the 0.020 scene 2 settled on. The
   three pinned scenes are read in one continuous scroll and a change of
   density between them reads as the page speeding up, not as a new scene.

   PIN_HEIGHTS is 2.0 against scene 3's 1.8, and the eight extra units are
   itemised rather than rounded up to a feeling:

       +3   a third and fourth object (the card stack and the approval card)
            that have to assemble, where scene 3 had two
       +3   the guardrail beat, which is a PAUSE — the one thing in this scene
            that costs scroll precisely because nothing moves during it
       +2   the held ending, which is six units of nothing and is the frame the
            reader is meant to leave the scene on

   Nothing that existed in the storyboard was slowed down to reach it. */
const PIN_HEIGHTS = 2.0;
const TL_END = 80;

/** Scrub catch-up, in seconds. Matched to scenes 2 and 3 on purpose. */
const SCRUB = 0.55;

/* Beat boundaries, in timeline units. The split is 14 / 24 / 22 / 20, and the
   shape of it is the argument: the pickup is short because the reader already
   knows the two objects in it; the lookup is the longest because it happens
   twice and both halves have to be legible; the guardrail is nearly as long
   for the opposite reason — most of it is a machine standing still. */
const BEAT_1 = 0;
const BEAT_2 = 14;
const BEAT_3 = 38;
const BEAT_4 = 60;

/** Where the scene stops building anything that moves. Everything after this
 *  is either already standing or is the door to scene 5 drawing itself, and
 *  NOTHING fades out past it — the reader is meant to be able to stop here
 *  and read the finished frame. Asserted below. */
const HOLD_FROM = 74;

/* ── The composition ───────────────────────────────────────────────────────
   1120 × 600, and the width is a legibility decision rather than a framing
   one. With no camera, the stage renders the whole viewBox at about 0.91 on a
   1512px laptop; at 1200 wide that drops to 0.85 and every mono label in the
   scene loses 7% of its rendered size for eighty units of margin nobody sees.

   Everything is hung off ONE horizontal: SPINE_Y is the agent box's own
   centre line, the road to the phone runs along it, and the answer is the
   only thing that ever travels it. The tool traces are the only lines that
   leave it, and they are the only lines that come back. */
const FRAME_W = 1080;
const FRAME_H = 600;
const SPINE_Y = 306;

/** The agent, as one box — scene 3's chip dialect, one scene on. */
const AGENT_X = 240;
const AGENT_Y = 248;
const AGENT_W = 200;
const AGENT_H = 116;

/** The model inside it. The inbound reply comes to rest on this rectangle and
 *  not merely inside the box, because the first thing the checklist claims is
 *  "your own model" and a tick has to be earned by something the reader can
 *  point at. */
const MODEL_X = 266;
const MODEL_W = 34;
const MODEL_CX = MODEL_X + MODEL_W / 2;

/** Where scene 3's door wire comes back into the frame. It is inside the
 *  agent box's x-range and 20u clear of its right wall, so the line reads as
 *  entering the machine rather than passing beside it — and it is far enough
 *  right that the box's two-line label, which is left-aligned on the box's own
 *  wall, never runs under it (asserted at boot). */
const IN_X = 420;

/** The road to the person. Wall to wall, at the spine. */
const WIRE_OUT_X0 = AGENT_X + AGENT_W;

/* ── The tool cards ────────────────────────────────────────────────────────
   One column, three calls and one question, all the same width so the stack
   reads as a trace log rather than as four unrelated boxes. The y ranges are
   authored here and asserted against three things at boot: that they are in
   order, that none of them overlaps its neighbour, and — the load-bearing one
   — that none of them straddles SPINE_Y. The answer's road runs through this
   column at y 306, and a card sitting on it would turn the one line the eye is
   supposed to follow across the frame into a line that disappears behind a
   box. The 120u gap between card 2 and card 3 is that clearance, and it is
   also the beat break: everything above the spine is the agent thinking,
   everything below it is the agent acting. */
const CARD_X = 518;
const CARD_W = 246;
const CARD_PAD = 12;
const CARDS: readonly { y: number; h: number }[] = [
  { y: 96, h: 74 },
  { y: 208, h: 58 },
  { y: 386, h: 54 },
];
const APPROVE_Y = 462;
const APPROVE_H = 70;

/* ── The phone ─────────────────────────────────────────────────────────────
   Scene 3's device at 228u against its 260 — 88%, and the reduction is the
   point rather than a fit. One scene ago the phone was the SUBJECT and the
   engine was a chip; here the machine is the subject and the phone is the
   destination. Making it the same size would be the composition arguing with
   the story.

   Its screen is a 208 × 380 window, which at 11.5u mono is 26 characters
   across with the screen's own 10u padding — measured, not guessed, and the
   reason the agent's answer breaks where it does. It grew by 12u when the
   type ladder went up a step; a screen that could not hold the sentence the
   whole scene is building toward would be a screen sized for the wrong
   thing. */
const PHONE_X = 816;
const PHONE_Y = 100;
const PHONE_W = 228;
const PHONE_H = 400;
const SCREEN_X = 826;
const SCREEN_Y = 110;
const SCREEN_W = 208;
const SCREEN_H = 380;
const SCREEN_PAD = 10;

/** Geist Mono's advance at 1em, plus the 0.01em tracking every mono run on
 *  this site carries. Every width assert below is this number times a length. */
const MONO_ADVANCE = 0.61;
/** The type sizes the asserts measure against. They mirror styles.css exactly;
 *  a stylesheet cannot tell this file what it chose, so the two agree here or
 *  the scene refuses to boot. */
const AGENT_SUB_SIZE = 11;
const MSG_SIZE = 11.5;
const CARD_LINE_SIZE = 11.5;
const CARD_TITLE_SIZE = 12;

const monoWidth = (s: string, size: number): number => s.length * size * MONO_ADVANCE;

/** Packet radius. 4.5u, the same dot as the hero's clapper ball and every
 *  packet in scenes 2 and 3 — the fourth scene in a row is not the place to
 *  invent a new one. */
const DOT_R = 4.5;

/* ── The channel row ───────────────────────────────────────────────────────
   Four line marks and four lowercase words (BRAND §6 — the channels are
   lowercase because that is how the API spells them), LEFT-ALIGNED TO THE
   CAPTION COLUMN and stacked directly above caption 3's rule (user call).

   It used to be right-aligned to the phone's right wall, and that was the
   wrong argument: down there it read as a claim about the phone, and it was a
   fifth object in a composition that already had four. Above the sentence
   that names it, it is the picture of that sentence — marks, a rule, then the
   words — and the two are one statement that arrives and leaves together.

   Laid out from a cursor rather than from four hand-placed x values, so the
   spacing is arithmetic and stays even if a channel is ever renamed.

   Each glyph is authored in its own 12 × 12 box at the origin and placed with
   a translate — which is why none of them carries an offset in its `d`. */
/** The caption column's own left edge, shared with the glass so the row and
 *  the sentence under it hang on one margin. */
const CAP_X = 40;
/** The rule every caption draws itself out from. Authored in the markup;
 *  asserted against it at boot, because the row is placed above it by
 *  arithmetic and nothing else in the system would notice them colliding. */
const CAP_RULE_Y = 424;
/** The channel words' baseline. The row sits between the agent box's bottom
 *  wall (364) and the caption rule (424) with roughly 20u of air either side —
 *  both clearances are asserted, because this is the one place in the scene
 *  where the glass and the world share a band of frame. */
const CHAN_BASE_Y = 398;
/** Each glyph is authored in a CHAN_ART box and PLACED at CHAN_GLYPH with a
 *  scale transform, so the marks grow and the hairline does not (the class
 *  carries vector-effect: non-scaling-stroke). 20 against the 12 it was:
 *  ~16.9 CSS px on a 1250px viewport, ~20.8 on a 1536px one. */
const CHAN_ART = 12;
const CHAN_GLYPH = 20;
const CHAN_GAP = 7;
const CHAN_SEP = 22;
const CHAN_SIZE = 14;
const CHANNELS: readonly { word: string; d: string }[] = [
  /* in-app: a speech bubble with a tail, which is the one shape that means
     "inside your product" without drawing a product. */
  { word: "widget", d: "M 0.5 1 L 11.5 1 L 11.5 8 L 4 8 L 1.5 11 L 1.5 8 L 0.5 8 Z" },
  /* telegram: the paper plane, in one outline and one crease — the same
     construction as scene 3's send glyph, and no fill, for the same reason. */
  { word: "telegram", d: "M 0.5 5.6 L 11.5 1.2 L 7.6 10.8 L 5.4 6.9 Z M 5.4 6.9 L 11.5 1.2" },
  /* slack: the hash, as four leaning strokes. Not the logo — the logo is four
     colours and this site has one. */
  { word: "slack", d: "M 3.2 1 L 2.2 11 M 8.2 1 L 7.2 11 M 0.5 4.2 L 10.6 3.6 M 1.4 8.6 L 11.5 8" },
  /* email: the site's own envelope, whose fold is the M. Same glyph scene 2
     stamps on its digest and scene 3 puts in the mail app. */
  { word: "email", d: "M 0.5 2 L 11.5 2 L 11.5 10 L 0.5 10 Z M 0.5 2 L 6 6.6 L 11.5 2" },
];

/** Each item's width, and the row's, computed once from the constants above:
 *  the boot assert that keeps the row inside its own column and the builder
 *  that lays it out then read the same two numbers, instead of one of them
 *  re-deriving what the other measured. */
const CHAN_WIDTHS = CHANNELS.map((c) => CHAN_GLYPH + CHAN_GAP + monoWidth(c.word, CHAN_SIZE));
const CHAN_TOTAL =
  CHAN_WIDTHS.reduce((acc, w) => acc + w, 0) + (CHANNELS.length - 1) * CHAN_SEP;

/* ══════════════════════════════════════════════════════════════════════════
   THE BEATS
   ══════════════════════════════════════════════════════════════════════════ */

/* ── Beat 1 · the pickup ───────────────────────────────────────────────── */
/* The world starts assembling at 2.4, not at 0: the first two units of the
   pin belong to the rail column alone — the reader arrives from the bridge,
   the scene's NAME and its five empty promises greet them, and only then does
   the stage start drawing. Scene 3's entry pattern, deliberately. */
const B1_WIRE_IN = 2.4;
const B1_BOX = 4.0;
const B1_WIRE_OUT = 4.6;
const B1_PHONE = 5.0;
const B1_LABEL = 5.4;
const B1_SUB = 6.2;
const B1_SCREEN = 6.6;
const B1_GUTS = 6.8;
/** The queue's name arrives with the dot, not with the wire: the wire is a
 *  road and roads do not have job ids. */
const B1_STAMP = 8.0;
const B1_THREAD = 8.6;
/** When the reply appears in the chip, and how long the run in takes. */
const B1_FLY = 8.4;
const B1_FLY_DUR = 3.4;
const B1_LAND = B1_FLY + B1_FLY_DUR; // 11.8
const B1_REPLY = 10.0;
/** The first tick, once the box and its label have settled — the claim is not
 *  "a message arrived", it is "the thing that picked it up is yours". */
const T_MODEL = 12.4;

/* ── Beat 2 · the lookup ───────────────────────────────────────────────── */
/* Two calls, and each one is four events in the same order: the trace draws
   out, the card draws itself, the call's name appears, and — after a real gap,
   because a lookup that returned instantly would be a lookup nobody believes —
   the result fades in. The tick lands on the RETURN, never on the request. */
const B2_T1 = 15.2;
const B2_C1 = 16.6;
const B2_C1_TITLE = 17.8;
const B2_C1_RESULT = 20.0;
const T_MEMORY = 20.4;
const B2_T2 = 24.2;
const B2_C2 = 25.4;
const B2_C2_TITLE = 26.6;
const B2_C2_RESULT = 28.8;
const T_GROUND = 29.2;

/* ── Beat 3 · the guarded action ───────────────────────────────────────── */
/* The policy is stated BEFORE the call it stops, because that is the order it
   is true in: the rule exists, and then the agent walks into it. */
const B3_GUARD = 39.0;
const B3_T3 = 40.4;
const B3_C3 = 41.6;
const B3_C3_TITLE = 42.8;
/** THE PAUSE. The card's border leaves the ink ladder for the only time in
 *  the scene, and stays there for nearly seven units — a twelfth of the whole
 *  scrub in which the machine does nothing at all. AMBER_MIN_HOLD refuses to
 *  boot if an edit takes that away: an approval that resolves as fast as it is
 *  asked for is not a guardrail, it is a speed bump. */
const B3_AMBER = 43.8;
const B3_AMBER_DUR = 1.0;
const B3_CONN = 45.0;
const B3_APPROVE = 45.6;
const B3_APPROVE_TITLE = 47.0;
const B3_APPROVE_WHO = 47.8;
const B3_YES_IN = 48.4;
/** THE YES. The last human act in the scene, and the cause of everything
 *  after it — the same press gesture scene 3 gives its send glyph, which is
 *  DESIGN §3's press-feedback curve. */
const B3_PRESS = 50.6;
const B3_PRESS_DOWN = 0.18;
const B3_PRESS_UP = 0.26;
const T_GUARD = B3_PRESS;
const B3_DRAIN = 51.0;
const B3_DRAIN_DUR = 1.6;
const B3_RESULT = 52.4;
const AMBER_MIN_HOLD = 4;

/* ── Beat 4 · the answer ───────────────────────────────────────────────── */
/* 5.2 units for 553u of road, which is slower per unit than scene 3's outbound
   delivery and about the speed of its journey home. It is the last travel on
   the page and the reader is meant to watch all of it. */
const B4_FLY = 61.0;
const B4_FLY_DUR = 5.2;
const B4_LAND = B4_FLY + B4_FLY_DUR; // 66.2
const T_ANSWER = B4_LAND;
const B4_MSG = 66.6;
const B4_CITE = 68.2;
const B4_RECEIPT = 69.0;
const B4_EVT = 70.0;
/** The row leads its own sentence in by a beat, left to right. Each mark is
 *  its own explicit fromTo, so a reverse scrub un-staggers them in the order
 *  they arrived — a stagger built with gsap's `stagger` shorthand would be one
 *  tween with an internal offset, and this scene has to be a pure function of
 *  timeline position. */
const B4_CHANNELS = 68.8;
const CHAN_STEP = 0.22;
const CHAN_FADE = 0.5;
/** The door to scene 5, drawn last and inside the held ending — a build, not
 *  a fade, which is the one kind of motion the held ending allows. */
const B4_DOOR_RULE = 75.0;
const B4_DOOR_TEXT = 75.8;

/** How long a receipt settles after arriving one notch brighter — scene 2's
 *  and scene 3's stamp emphasis, unchanged. */
const RCP_SETTLE = 1.3;

/* ── The glass ─────────────────────────────────────────────────────────────
   Three narrator sentences, one on the frame at a time, each timed to the
   quiet stretch of its own beat:

     1  after both lookups have returned, when the reader has just watched the
        thing the sentence is about and has scroll left to think about it
     2  over the pause itself, so the caption is up while the machine is
        waiting and is still up when the person says yes
     3  riding the answer's arrival, gone well before the held ending

   The system is scene 3's, borrowed whole (styles.css keeps the ink): a rule
   drawn out from its own middle and a block of text rising into place under
   it, leaving by dipping and fading. The boot assert below refuses a schedule
   where one caption is still leaving as the next arrives. */
const CAP_RULE_IN = 0.9;
const CAP_TEXT_IN = 1.1;
const CAP_TEXT_OUT = 0.9;
const CAP_RULE_OUT = 0.7;
const CAP_RISE = 5;
const CAP_DIP = 6;
/** The tracking settle, as a group scaleX about the text's own left anchor
 *  rather than as a letter-spacing tween — letter-spacing is a LAYOUT property
 *  and DESIGN §3 bans animating one outright. */
const CAP_TRACK = 1.03;
const CAPS: readonly { at: number; out: number }[] = [
  { at: 30.8, out: 36.4 },
  { at: 46.8, out: 52.6 },
  /* Pushed 0.4 later than it used to sit so the channel row can lead it: the
     marks come in from 68.8, the rule draws under them at 69.4, and the words
     rise last. Out at 72.8 leaves the held ending clear by 0.3 (asserted). */
  { at: 69.4, out: 72.8 },
];

/* ── The checklist ─────────────────────────────────────────────────────────
   Five capabilities, listed complete from the pin's entry fade, each ticked at
   the instant the scene demonstrates it. A row's y is derived from its index
   and its MOMENT is data, so the two can never be typed in inconsistently —
   the same discipline scene 3's tracker keeps, aimed at a different question.

   THE STRINGS ARE CHECKED. Verified in the platform repo
   (C:\...\notification-system), not invented:

     search_history      src/core/managed-brain.ts:1082 — the built-in
                         episodic-retrieval tool's registered name, dispatched
                         at :1251 and executed at :1545; also
                         docs/AGENT-TOOLS.md:119. Snake case, exactly as here.
     maxAutoCalls        src/api/routes/agent-tools.ts:60 — the per-tool
                         repeat-action guardrail's config key. Enforced at
                         src/core/managed-brain.ts:1684-1700, where exceeding
                         it flips the tool's effectiveApproval from 'auto' to
                         'required' and parks a tool-call row at status
                         'pending' — which is literally what "maxAutoCalls →
                         approval" says.
     message.changed     src/core/tenant-events.ts:29, pushed over the
                         WebSocket gateway's admin plane, which is why it reads
                         `ws ·` here exactly as it does in scene 3.

   `orders_lookup` and `refund_reissue` are STORY names for tools this
   scene's fictional customer registered themselves, over
   POST /v1/agents/:identifier/tools (src/api/routes/agent-tools.ts:139) —
   custom tools are user-defined, so inventing two of them is honest. They are
   snake_case rather than dotted because the platform's own name regex is
   ^[a-z][a-z0-9_]{0,63}$ (agent-tools.ts:44): a dotted name would be rejected
   with a 400, and a fictional string the real API would refuse is not a
   fiction, it is a mistake. */
const QUALITIES: readonly { word: string; evidence: string; at: number }[] = [
  { word: "your own model", evidence: "your endpoint · your prompt", at: T_MODEL },
  { word: "remembers", evidence: "search_history", at: T_MEMORY },
  { word: "grounded", evidence: "orders_lookup · cited", at: T_GROUND },
  { word: "guarded", evidence: "maxAutoCalls → approval", at: T_GUARD },
  { word: "answers back", evidence: "ws · message.changed", at: T_ANSWER },
];

/* The checklist's own geometry, in REAL PIXELS: the svg's CSS width equals its
   viewBox width, so it renders at scale 1 and every number here is a number on
   screen. Row pitch has to clear a word row plus an evidence row plus air, and
   Q_MIN_PITCH is what refuses a tighter edit.

   THESE ARE THE SECOND SET. The first was a 9px box, an 11px word and a 9.5px
   evidence line at a 42px pitch — arithmetically correct, rendered at scale 1
   exactly as intended, and unreadable. Two things were wrong and only one of
   them was size: the unlit word sat at --text-faint, so the five claims this
   column exists to make up front could not be read until the scene had already
   proved them. A checklist whose unchecked state is invisible is not a
   checklist, it is a reveal. The word now rests at --text-dim and lights to
   --text, --text-faint is reserved for the evidence rows, and everything is
   one clear step larger. */
const Q_TRACK_W = 220;
const Q_TRACK_H = 240;
const Q_BOX = 13;
const Q_X = 0.5;
const Q_TEXT_X = 26;
const Q_Y0 = 12;
const Q_PITCH = 46;
const Q_MIN_PITCH = 38;
const Q_WORD_DY = 11;
/* Measured rather than eyeballed, twice. At the original 22 the word and its
   evidence had 0.6px of daylight between their em boxes and read as one
   smudged block; 26 fixed that at the old 11/9.5px sizes. At today's 13/11px
   the same ratio wants 28, which leaves ~5.9px inside a row and ~9px before
   the next row's word — the relation that actually matters, because a row is
   one thing and the gap between rows has to be visibly bigger than the gap
   inside one. Q_RULE_DY is where the hairline that says so is drawn. */
const Q_EVID_DY = 28;
/* The row's own rule, below its evidence line and above the next row's word.
   Q_Y0 leaves room for the list's TOP rule at Q_RULE_TOP, so the column is
   bounded the same way the still's list is by border-top. */
const Q_RULE_DY = 38;
const Q_RULE_TOP = 2;
const Q_WORD_SIZE = 13;
const Q_EVID_SIZE = 11;
/** The checkmark, as offsets from its box's own origin — redrawn for the 13u
 *  box, not scaled up from the 9u one, because a tick is a gesture and its
 *  proportions are not linear in its size. Two segments, one corner: the
 *  shortest path that is unmistakably a tick and not an arrow. */
const Q_TICK: readonly (readonly [number, number])[] = [
  [3.4, 7.2],
  [5.7, 10.1],
  [10.2, 3.9],
];
/** How long a tick takes to draw, and how long the row's word takes to lift
 *  off the bottom of the ladder with it. */
const Q_DRAW = 0.7;
const Q_LIGHT = 0.7;
const Q_EVID_IN = 0.9;

/** The scene's name, and the ONE place the two strings live: the pin shows
 *  them in HTML, the still fallback rebuilds them, and a title that said two
 *  different things in the two renderings would be a title nobody could
 *  quote. MUST match #agt-title in index.html. */
const TITLE_NUM = "04";
const TITLE_NAME = "agents";
const TITLE_HEAD = "It answers. You stay in control.";

/* The title and the checklist have NO timeline entrance: they are the pin's
   FURNITURE and ride its entry fade, so the scene is named — and its five
   promises are already made — before the first stroke of the world is drawn.
   Scene 3 was changed to work this way and this scene is built that way. */

/* The still fallback's windows: "x y w h" in scene units, cut so each one's
   own mono text is legible on a ~380px phone, plus each beat's narrator line,
   which the still carries as TEXT rather than in the figure — a caption is a
   thing that was said over a moving picture, and cropped into a 300u window it
   would be four words lying across a diagram. Verbatim, and the same three
   sentences the glass says (index.html #agt-glass).

   Unlike scene 3 these windows need no per-phase overrides at all: nothing in
   this composition is erased by a later beat, so a window cut into the
   finished frame is already the right picture. */
const STILL_WHOLE = `0 0 ${FRAME_W} ${FRAME_H}`;
const STILL_VIEW = [
  {
    chans: false,
    kicker: "the pickup",
    text: "The reply comes out of the queue and into an agent that is yours — your endpoint, your prompt, your model.",
    glass: "",
    event: "job · conversation-inbound",
    /* The wire from the top edge, the box, both label lines and the job stamp.
       Square, because this beat is one object and its name. */
    box: "180 96 300 300",
  },
  {
    chans: false,
    kicker: "the lookup",
    text: "Two calls, in the order a brain makes them: what do I already know about this person, and what does the order actually say.",
    glass: "It doesn't guess. It remembers, and it looks things up.",
    event: "tool · search_history",
    /* Both traces leaving the box's wall and both cards, so the crop still
       shows a request going somewhere rather than two floating boxes. */
    box: "418 84 372 200",
  },
  {
    chans: false,
    kicker: "the guardrail",
    text: "The third call is an action, not a question. It stops at the policy and waits for a person.",
    glass: "Real actions wait for a human yes.",
    event: "guard · maxAutoCalls → approval",
    box: "500 360 300 190",
  },
  {
    chans: true,
    kicker: "the answer",
    text: "The answer lands in the thread the reply was written in, with the source it came from and a receipt for the send.",
    glass: "One agent. Every channel your user lives on.",
    event: "ws · message.changed",
    /* Wide enough for the receipt and the event line out at x 619, deep
       enough for the channel row at 552. */
    box: "564 280 500 300",
  },
] as const;

const COLOR = {
  green: "#3dd68c",
  greenDim: "#2ba36c",
  amber: "#ffb224",
  text: "#ededed",
  /* Where a receipt settles after arriving one notch brighter. */
  textDim: "#a1a1a1",
  /* The unlit ink of a checklist row's word — --text-dim, not --text-faint.
     A promise the reader cannot read before it is kept is not a promise. */
  textFaint: "#6e6e6e",
  /* The rest ink of every box in this scene that ever changes colour: the
     agent box acknowledging, the action card pausing, the yes affordance
     being pressed. One value, because all three sit on the same rung. */
  hairlineStrong: "#3f3f3f",
} as const;

const SVG_NS = "http://www.w3.org/2000/svg";

/* ══════════════════════════════════════════════════════════════════════════
   IMPLEMENTATION
   ══════════════════════════════════════════════════════════════════════════ */

function q<T extends Element>(root: ParentNode, sel: string): T {
  const el = root.querySelector<T>(sel);
  if (!el) throw new Error(`[agents] missing element: ${sel}`);
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

/** The checkmark's `d`, for a box whose origin is (x, y). Written once and
 *  used in three places — the rail's five ticks, the world's one tick, and the
 *  still fallback's list — so a checkmark on this page is always the same
 *  checkmark. */
function tickPath(x: number, y: number): string {
  return Q_TICK.map(([dx, dy], i) => `${i === 0 ? "M" : "L"} ${(x + dx).toFixed(2)} ${(y + dy).toFixed(2)}`).join(" ");
}

export interface AgentsScene {
  destroy(): void;
}

/**
 * Scene 4, plus the bridge line that hands over to it. Owns its own media
 * gating: gsap.matchMedia() decides between the pinned scrub and the still
 * cards, and re-decides for free if the reader crosses 768px or turns reduced
 * motion on mid-visit.
 */
export function createAgentsScene(): AgentsScene {
  const doc = document;

  /* The bridge's own lines, and NOT `.bridge-line`: turn.ts owns every element
     with that class in the document and animates the lot on scene 3's trigger.
     See the comment above #bridge-agents in index.html. */
  const bridgeLines = Array.from(doc.querySelectorAll<HTMLElement>(".agt-bridge-line"));

  const section = q<HTMLElement>(doc, "#scene-agents");
  const pin = q<HTMLElement>(doc, "#agt-pin");
  const still = q<HTMLElement>(doc, "#agt-still");

  const svg = q<SVGSVGElement>(doc, "#agt-svg");

  /* Rail-column furniture: the HTML title and the checklist's own svg, both
     outside the stage svg and queried from the document. */
  const title = q<HTMLElement>(doc, "#agt-title");
  const checklist = q<SVGSVGElement>(doc, "#agt-checklist");
  const rulesG = q<SVGGElement>(checklist, "#agt-rules");
  const qualitiesG = q<SVGGElement>(checklist, "#agt-qualities");

  const wireIn = q<SVGPathElement>(svg, "#agt-wire-in");
  const wireOut = q<SVGPathElement>(svg, "#agt-wire-out");
  const stampJob = q<SVGTextElement>(svg, "#agt-stamp-job");

  const agentBox = q<SVGRectElement>(svg, "#agt-box");
  const agentLabel = q<SVGTextElement>(svg, "#agt-label");
  const agentSub = q<SVGTextElement>(svg, "#agt-sub");
  const guts = q<SVGGElement>(svg, "#agt-guts");

  const traces = [1, 2, 3].map((i) => q<SVGPathElement>(svg, `#agt-trace-${i}`));
  const cardBoxes = [1, 2, 3].map((i) => q<SVGRectElement>(svg, `#agt-card-${i}-box`));
  const cardTitles = [1, 2, 3].map((i) => q<SVGTextElement>(svg, `#agt-card-${i}-title`));
  const cardResults: SVGElement[] = [
    q<SVGGElement>(svg, "#agt-card-1-result"),
    q<SVGTextElement>(svg, "#agt-card-2-result"),
    q<SVGTextElement>(svg, "#agt-card-3-result"),
  ];
  const cardTick = q<SVGPathElement>(svg, "#agt-card-3-tick");
  const guard = q<SVGTextElement>(svg, "#agt-guard");

  const conn = q<SVGPathElement>(svg, "#agt-conn");
  const approveBox = q<SVGRectElement>(svg, "#agt-approve-box");
  const approveTitle = q<SVGTextElement>(svg, "#agt-approve-title");
  const approveWho = q<SVGGElement>(svg, "#agt-approve-who");
  const yesGroup = q<SVGGElement>(svg, "#agt-yes");
  const yesBox = q<SVGRectElement>(svg, "#agt-yes-box");
  const yesText = q<SVGTextElement>(svg, "#agt-yes text");

  const phone = q<SVGRectElement>(svg, "#agt-phone");
  const screen = q<SVGRectElement>(svg, "#agt-screen");
  const thread = q<SVGGElement>(svg, "#agt-thread");
  const replyMsg = q<SVGGElement>(svg, "#agt-reply");
  const answer = q<SVGGElement>(svg, "#agt-answer");
  const cite = q<SVGTextElement>(svg, "#agt-cite");

  const receipt = q<SVGTextElement>(svg, "#agt-receipt");
  const evt = q<SVGTextElement>(svg, "#agt-evt");
  const channelsG = q<SVGGElement>(svg, "#agt-channels");
  const capRule3 = q<SVGPathElement>(svg, "#agt-cap-3 .trn-cap-rule");

  const doorRule = q<SVGPathElement>(svg, "#agt-door-rule");
  const doorText = q<SVGTextElement>(svg, "#agt-door");

  const glass = q<SVGGElement>(svg, "#agt-glass");
  const caps = [1, 2, 3].map((i) => {
    const g = q<SVGGElement>(svg, `#agt-cap-${i}`);
    return { rule: q<SVGPathElement>(g, ".trn-cap-rule"), text: q<SVGGElement>(g, ".trn-cap-text") };
  });

  const dotsG = q<SVGGElement>(svg, "#agt-dots");
  const gIn = q<SVGPathElement>(svg, "#agt-g-in");
  const gOut = q<SVGPathElement>(svg, "#agt-g-out");

  /* ════════════════════════════════════════════════════════════════════════
     BOOT ASSERTS
     Inside the init function, never at module top level: a throw evaluated at
     import time once let esbuild tree-shake a whole scene away in silence.
     Each of these is an invariant a beat below actually relies on.
     ════════════════════════════════════════════════════════════════════════ */

  if (!(BEAT_1 < BEAT_2 && BEAT_2 < BEAT_3 && BEAT_3 < BEAT_4 && BEAT_4 < TL_END)) {
    throw new Error("[agents] beats are out of order");
  }

  /* The held ending is the frame the reader is meant to be able to stop on, so
     it has to be long enough to notice and nothing may leave during it. Six
     units is 0.15 of a viewport height of scroll with nothing happening. */
  if (TL_END - HOLD_FROM < 6) {
    throw new Error("[agents] the held ending is too short to be an ending");
  }

  /* ── the checklist ──────────────────────────────────────────────────────
     A tick's moment is its row's whole reason to exist, so the moments have to
     be strictly increasing and inside the timeline — a row that lit before the
     one above it would make the list a list of nothing. */
  for (const [i, qy] of QUALITIES.entries()) {
    if (qy.at <= 0 || qy.at >= TL_END) {
      throw new Error(`[agents] quality ${i + 1} (${qy.word}) ticks outside the timeline`);
    }
    const prev = QUALITIES[i - 1];
    if (prev && qy.at <= prev.at) {
      throw new Error(`[agents] quality ${i + 1} (${qy.word}) ticks before the one above it`);
    }
  }
  /* And the last one has to land before the held ending: a checklist still
     completing itself while the scene is supposedly finished is a scene whose
     ending is a lie. */
  const lastQuality = QUALITIES[QUALITIES.length - 1]!;
  if (lastQuality.at + Math.max(Q_DRAW, Q_EVID_IN) + 0.2 > HOLD_FROM) {
    throw new Error("[agents] the last quality is still ticking inside the held ending");
  }

  /* Row pitch has to clear a word row plus an evidence row plus air, or the
     evidence for one claim interleaves with the word of the next. */
  if (Q_PITCH < Q_MIN_PITCH) {
    throw new Error("[agents] two checklist rows sit too close for their label rows");
  }
  /* And every label has to fit the rail the checklist is drawn on. These are
     the longest developer-facing strings in the scene and they are the ones
     nobody would notice being clipped, because a clipped mono string still
     looks like a mono string. */
  {
    const widest = Math.max(
      ...QUALITIES.map((qy) =>
        Math.max(monoWidth(qy.word, Q_WORD_SIZE), monoWidth(qy.evidence, Q_EVID_SIZE)),
      ),
    );
    if (Q_TEXT_X + widest > Q_TRACK_W) {
      throw new Error("[agents] a checklist label runs off the rail it is written on");
    }
  }
  /* The rows have to fit the svg they are drawn in, or the last one's evidence
     is clipped by the viewBox rather than by the column. */
  if (Q_Y0 + (QUALITIES.length - 1) * Q_PITCH + Q_RULE_DY + 2 > Q_TRACK_H) {
    throw new Error("[agents] the checklist is taller than its own viewBox");
  }
  /* The svg has to BE the box the arithmetic above assumes, or every number in
     this block is measured against something that is not on screen. This is
     the one assert that makes "the checklist renders at scale 1" a fact rather
     than an intention. */
  if (
    checklist.viewBox.baseVal.width !== Q_TRACK_W ||
    checklist.viewBox.baseVal.height !== Q_TRACK_H
  ) {
    throw new Error("[agents] #agt-checklist's viewBox disagrees with Q_TRACK_W / Q_TRACK_H");
  }
  /* And it has to be LAID OUT at that width, or the type is not the size this
     file says it is. A percentage width here would silently rescale the whole
     column; the rail's clamp starts at 232px so 220 always fits. */
  {
    const laid = checklist.getBoundingClientRect().width;
    if (laid > 0 && Math.abs(laid - Q_TRACK_W) > 1) {
      throw new Error("[agents] the checklist is not rendering at scale 1 — its type is not the size it says");
    }
  }

  /* ── the world's geometry ───────────────────────────────────────────────
     The markup and the constants above have to agree, because the guides are
     written from the constants and the reader watches the packets against the
     LINES. Endpoints, not whole paths: both wires are straight and these four
     points are all of them. */
  const inA = wireIn.getPointAtLength(0);
  const inB = wireIn.getPointAtLength(wireIn.getTotalLength());
  if (
    Math.abs(inA.x - IN_X) > 0.5 ||
    Math.abs(inB.x - IN_X) > 0.5 ||
    Math.abs(inA.y) > 0.5 ||
    Math.abs(inB.y - AGENT_Y) > 0.5
  ) {
    throw new Error("[agents] #agt-wire-in does not run from the frame's top edge to the agent box");
  }
  const outA = wireOut.getPointAtLength(0);
  const outB = wireOut.getPointAtLength(wireOut.getTotalLength());
  if (
    Math.abs(outA.x - WIRE_OUT_X0) > 0.5 ||
    Math.abs(outB.x - PHONE_X) > 0.5 ||
    Math.abs(outA.y - SPINE_Y) > 0.5 ||
    Math.abs(outB.y - SPINE_Y) > 0.5
  ) {
    throw new Error("[agents] #agt-wire-out does not run wall to wall along the spine");
  }

  /* The answer leaves from the MIDDLE of the machine. If the spine and the
     box ever disagree the road becomes a line that happens to pass nearby,
     and the whole composition stops being hung off one horizontal. */
  if (SPINE_Y !== AGENT_Y + AGENT_H / 2) {
    throw new Error("[agents] the answer's road is not on the agent box's own centre line");
  }
  /* The wire down from scene 3 has to land ON the box, and clear of the box's
     own two-line label — which is left-aligned on the box's wall and is the
     one thing in this composition placed by the text layout engine rather than
     by arithmetic. */
  if (IN_X <= AGENT_X || IN_X >= AGENT_X + AGENT_W) {
    throw new Error("[agents] the wire from scene 3 does not land on the agent box");
  }
  if (AGENT_X + monoWidth(agentSub.textContent ?? "", AGENT_SUB_SIZE) > IN_X - 8) {
    throw new Error("[agents] the agent's second label line runs under the inbound wire");
  }
  /* The dot has to come to rest ON the model, because "your own model" is the
     first thing the checklist claims and a tick has to be earned by something
     the reader can point at. */
  if (MODEL_CX <= AGENT_X || MODEL_CX >= AGENT_X + AGENT_W) {
    throw new Error("[agents] the model the reply lands on is outside the agent box");
  }

  /* ── the card column ────────────────────────────────────────────────────
     Ordered, gapped, and — the load-bearing one — clear of the spine. A card
     sitting on y 306 would put a box on top of the one line the reader is
     meant to follow from the machine to the person. */
  const allCards = [...CARDS, { y: APPROVE_Y, h: APPROVE_H }];
  for (const [i, c] of allCards.entries()) {
    if (c.y < SPINE_Y && c.y + c.h > SPINE_Y) {
      throw new Error(`[agents] card ${i + 1} straddles the answer's road`);
    }
    const prev = allCards[i - 1];
    if (prev && c.y < prev.y + prev.h + 8) {
      throw new Error(`[agents] card ${i + 1} overlaps the card above it`);
    }
  }
  if (CARD_X <= AGENT_X + AGENT_W || CARD_X + CARD_W >= PHONE_X) {
    throw new Error("[agents] the card column does not fit between the agent box and the phone");
  }
  /* Every line in every card has to fit the card. They are placed by hand in
     the markup and measured by nobody, so a string that grew by four
     characters would simply run out through the wall. */
  {
    const inner = CARD_W - 2 * CARD_PAD;
    for (const t of Array.from(svg.querySelectorAll<SVGTextElement>(".agt-l-card .agt-card-title"))) {
      if (monoWidth(t.textContent ?? "", CARD_TITLE_SIZE) > inner) {
        throw new Error(`[agents] a card title runs past its own wall: ${t.textContent}`);
      }
    }
    for (const t of Array.from(svg.querySelectorAll<SVGTextElement>(".agt-l-card .agt-card-line"))) {
      if (monoWidth(t.textContent ?? "", CARD_LINE_SIZE) > inner) {
        throw new Error(`[agents] a card line runs past its own wall: ${t.textContent}`);
      }
    }
  }
  /* The connector has to actually join the two boxes it claims to. */
  {
    const cA = conn.getPointAtLength(0);
    const cB = conn.getPointAtLength(conn.getTotalLength());
    const card3 = CARDS[2]!;
    if (Math.abs(cA.y - (card3.y + card3.h)) > 0.5 || Math.abs(cB.y - APPROVE_Y) > 0.5) {
      throw new Error("[agents] the approval connector does not join the action card to the approval");
    }
  }

  /* ── the phone ──────────────────────────────────────────────────────────
     The wire has to end ON the device's wall, the screen has to be inside the
     device, and — the one nobody would ever see failing — the longest line the
     agent says has to fit the screen it is said on. */
  if (
    Number(phone.getAttribute("x")) !== PHONE_X ||
    Number(phone.getAttribute("width")) !== PHONE_W ||
    Number(screen.getAttribute("x")) !== SCREEN_X ||
    Number(screen.getAttribute("width")) !== SCREEN_W
  ) {
    throw new Error("[agents] the phone and the constants disagree about where the phone is");
  }
  if (SCREEN_X < PHONE_X || SCREEN_X + SCREEN_W > PHONE_X + PHONE_W || SCREEN_Y < PHONE_Y || SCREEN_Y + SCREEN_H > PHONE_Y + PHONE_H) {
    throw new Error("[agents] the screen is not inside the device");
  }
  {
    const widest = Math.max(
      ...Array.from(svg.querySelectorAll<SVGTextElement>(".agt-msg")).map((t) =>
        monoWidth(t.textContent ?? "", MSG_SIZE),
      ),
    );
    if (2 * SCREEN_PAD + widest > SCREEN_W) {
      throw new Error("[agents] a message in the thread is wider than the screen it is on");
    }
  }

  /* ── the one amber, and the one pause ───────────────────────────────────
     Amber is pain (BRAND §2), and this scene spends it once. The press has to
     happen while the card is still paused — a yes granted before the block or
     after it has already drained is a yes for nothing — and the hold has to be
     long enough that the reader sees a machine waiting rather than a machine
     blinking. */
  if (B3_PRESS <= B3_AMBER + B3_AMBER_DUR || B3_PRESS >= B3_DRAIN) {
    throw new Error("[agents] the human approves outside the pause they are approving");
  }
  if (B3_DRAIN - (B3_AMBER + B3_AMBER_DUR) < AMBER_MIN_HOLD) {
    throw new Error("[agents] the guardrail resolves as fast as it is hit — that is not a guardrail");
  }
  /* And the thing being approved must not report a result before it is
     approved. */
  if (B3_RESULT <= B3_PRESS) {
    throw new Error("[agents] the guarded action completes before the human says yes");
  }

  /* ── the glass ──────────────────────────────────────────────────────────
     One caption on the frame at a time, including the tail of the one that is
     leaving. A schedule where two overlap is two narrators. */
  for (const [i, c] of CAPS.entries()) {
    if (c.out <= c.at) throw new Error(`[agents] caption ${i + 1} leaves before it arrives`);
    const next = CAPS[i + 1];
    if (next && next.at < c.out + Math.max(CAP_TEXT_OUT, CAP_RULE_OUT + 0.2)) {
      throw new Error(`[agents] caption ${i + 2} arrives before caption ${i + 1} has left`);
    }
  }
  /* ── the channel row, and the sentence it belongs to ──────────────────
     The row is placed above the caption's rule by arithmetic and the rule is
     authored in the markup, so nothing else in the system would ever notice
     the two colliding — or notice the row drifting up into the agent box,
     which is the only world object that shares this band of frame. */
  {
    const ra = capRule3.getPointAtLength(0);
    if (Math.abs(ra.x - CAP_X) > 0.5 || Math.abs(ra.y - CAP_RULE_Y) > 0.5) {
      throw new Error("[agents] the caption rule disagrees with CAP_X / CAP_RULE_Y");
    }
    const rowTop = CHAN_BASE_Y - CHAN_SIZE * 0.36 - CHAN_GLYPH / 2;
    const rowBottom = rowTop + CHAN_GLYPH;
    if (CAP_RULE_Y - rowBottom < 12) {
      throw new Error("[agents] the channel row is sitting on its own caption's rule");
    }
    if (rowTop - (AGENT_Y + AGENT_H) < 12) {
      throw new Error("[agents] the channel row has drifted up into the agent box");
    }
    /* And it has to stay in its own column rather than running under the card
       stack, which is 100u of frame to its right at exactly this latitude. */
    if (CAP_X + CHAN_TOTAL > CARD_X - 20) {
      throw new Error("[agents] the channel row runs into the tool-card column");
    }
  }

  /* The row and its sentence are ONE statement (user call), so the schedule
     has to keep them one: the marks lead the words in and cannot still be
     assembling after the sentence has landed, and they cannot start while the
     previous narrator is still leaving. */
  {
    const cap3 = CAPS[2]!;
    const rowEnd = B4_CHANNELS + (CHANNELS.length - 1) * CHAN_STEP + CHAN_FADE;
    if (B4_CHANNELS < CAPS[1]!.out + CAP_TEXT_OUT) {
      throw new Error("[agents] the channel row arrives while the previous caption is still leaving");
    }
    if (B4_CHANNELS > cap3.at) {
      throw new Error("[agents] the channel row follows its own sentence instead of leading it");
    }
    if (rowEnd > cap3.at + CAP_TEXT_IN + 0.6) {
      throw new Error("[agents] the channel row is still assembling after its sentence has landed");
    }
  }

  /* Captions are the only thing in this scene that ever leaves, so they are
     the only thing that can violate the held ending. The channel row leaves
     with caption 3 and is covered by the same bound. */
  const lastCap = CAPS[CAPS.length - 1]!;
  if (lastCap.out + Math.max(CAP_TEXT_OUT, CAP_RULE_OUT + 0.2) > HOLD_FROM) {
    throw new Error("[agents] the last caption is still leaving inside the held ending");
  }

  /* ════════════════════════════════════════════════════════════════════════
     GENERATED DOM
     The two flight routes, the checklist's five rows, and the channel row.
     Written from the constants above so the markup can never drift from them.
     ════════════════════════════════════════════════════════════════════════ */

  /* A ROUTE and a LINE are two different objects, exactly as in scenes 2 and
     3. The reader sees two wires; the packets fly on guides that lie on top of
     them and run further at the machine end, into the model itself — a guide
     that stopped at the box's wall would make the last leg of each journey a
     jump. Both of them come to rest on the box's own through-line, which is
     why the internals put the loop ABOVE that line rather than around it: a
     packet in this scene never crosses drawn ink. */
  gIn.setAttribute("d", `M ${IN_X} 0 L ${IN_X} 268 C ${IN_X} 292 424 ${SPINE_Y} 396 ${SPINE_Y} L ${MODEL_CX} ${SPINE_Y}`);
  gOut.setAttribute("d", `M ${MODEL_CX} ${SPINE_Y} L ${PHONE_X} ${SPINE_Y}`);

  /* The checklist's five rows. A box, a checkmark resting at zero length
     inside it, the claim beside it, and the evidence under that — generated
     from QUALITIES so a row's y is derived from its index and its moment is
     the same datum the timeline reads. */
  /* The rules first, in their own group under the rows: a top edge for the
     list and one under each row, exactly the border-top / border-bottom the
     still's list gets from CSS. Permanent furniture — they are never drawn
     and never tweened, because the STRUCTURE of the list is not one of the
     things this scene has to prove. */
  rulesG.replaceChildren();
  rulesG.appendChild(
    svgEl("path", { class: "agt-q-rule", d: `M 0 ${Q_RULE_TOP} L ${Q_TRACK_W} ${Q_RULE_TOP}` }),
  );
  for (let i = 0; i < QUALITIES.length; i++) {
    const y = Q_Y0 + i * Q_PITCH + Q_RULE_DY;
    rulesG.appendChild(svgEl("path", { class: "agt-q-rule", d: `M 0 ${y} L ${Q_TRACK_W} ${y}` }));
  }

  qualitiesG.replaceChildren();
  const rows = QUALITIES.map((qy, i) => {
    const y = Q_Y0 + i * Q_PITCH;
    const box = svgEl("rect", {
      class: "agt-q-box",
      x: Q_X,
      y: y + 0.5,
      width: Q_BOX,
      height: Q_BOX,
      rx: 2,
    });
    const tick = svgEl("path", { class: "agt-q-tick", d: tickPath(Q_X, y + 0.5) });
    const word = svgEl("text", { class: "agt-q-word", x: Q_TEXT_X, y: (y + Q_WORD_DY).toFixed(2) });
    word.textContent = qy.word;
    const evidence = svgEl("text", {
      class: "agt-q-evidence",
      x: Q_TEXT_X,
      y: (y + Q_EVID_DY).toFixed(2),
    });
    evidence.textContent = qy.evidence;
    qualitiesG.append(box, tick, word, evidence);
    return { tick, word, evidence, at: qy.at };
  });

  /* The channel row, laid out from a cursor: total width first, then
     right-aligned to the phone's own wall. Each glyph is authored at the
     origin in its own 12u box and placed with a translate, so none of them
     carries an offset in its `d` and renaming a channel cannot move a mark. */
  channelsG.replaceChildren();
  /** One group per channel, so each mark-and-word pair can arrive on its own
   *  beat. The pair is grouped rather than tweened as two elements because a
   *  glyph that faded in without its own name is a mark nobody can read. */
  const chanItems: SVGGElement[] = [];
  {
    /* The glyph box hangs so its middle sits on the word's optical centre.
       Geist Mono's caps are ~0.72em, so the centre of a cap is 0.36em above
       the baseline, and the box starts half its own height above that. */
    const glyphTop = CHAN_BASE_Y - CHAN_SIZE * 0.36 - CHAN_GLYPH / 2;
    /* The marks are authored in a CHAN_ART box and scaled into place. The
       transform is static — written once here, never tweened — and the class
       is non-scaling-stroke, so the drawing grows and the hairline does not. */
    const k = (CHAN_GLYPH / CHAN_ART).toFixed(4);
    let x = CAP_X;
    for (const [i, c] of CHANNELS.entries()) {
      const item = svgEl("g", { class: "agt-chan" });
      const mark = svgEl("g", {
        transform: `translate(${x.toFixed(2)} ${glyphTop.toFixed(2)}) scale(${k})`,
      });
      mark.appendChild(svgEl("path", { class: "agt-chan-glyph", d: c.d }));
      const word = svgEl("text", {
        class: "agt-chan-word",
        x: (x + CHAN_GLYPH + CHAN_GAP).toFixed(2),
        y: CHAN_BASE_Y,
      });
      word.textContent = c.word;
      item.append(mark, word);
      channelsG.appendChild(item);
      chanItems.push(item);
      x += CHAN_WIDTHS[i]! + CHAN_SEP;
    }
  }

  /** The two packets. The one coming in is the CUSTOMER'S reply and is neutral
   *  ink; the one going out is OUR answer and is the only green in the scene.
   *  That is the rationing law being made into the plot rather than obeyed by
   *  it (BRAND §2), and it is the same pair of colours scene 3 used for the
   *  same two directions — reversed, because in that scene we spoke first. */
  const dotIn = svgEl("circle", { class: "trn-dot trn-dot-in", cx: 0, cy: 0, r: DOT_R });
  const dotOut = svgEl("circle", { class: "trn-dot trn-dot-out", cx: 0, cy: 0, r: DOT_R });
  dotsG.append(dotIn, dotOut);

  /* ── the pristine clone ────────────────────────────────────────────────
     Captured now: the composition is complete and no gsap.set has touched it,
     so this node IS the scrub's final frame. Ids stripped (a document may only
     have one of each, and the still figures are clones), packets removed, and
     the glass removed — a narrator caption cropped into a 300u window would be
     four words of a sentence lying across a diagram, and the still cards carry
     those three lines as text instead. */
  const pristine = svg.cloneNode(true) as SVGSVGElement;
  pristine.removeAttribute("id");
  for (const el of Array.from(pristine.querySelectorAll("[id]"))) el.removeAttribute("id");
  pristine.querySelector(".agt-l-dots")?.replaceChildren();
  pristine.querySelector(".trn-l-glass")?.remove();

  /** Everything traced rather than faded — every line and every wall that is
   *  STRUCTURE, plus the two checkmarks in the world's own dialect. Nothing
   *  inside the phone's screen is traced: an app does not draw itself line by
   *  line, it comes on. */
  const strokeParts: SVGGeometryElement[] = [
    wireIn,
    wireOut,
    ...traces,
    agentBox,
    phone,
    screen,
    ...cardBoxes,
    cardTick,
    conn,
    approveBox,
    yesBox,
    doorRule,
    ...rows.map((r) => r.tick),
  ];
  /** The boxes whose fill comes up behind their own outline, so each is a line
   *  before it is a surface. The yes affordance is not among them: it has no
   *  fill, because it is the one control in the scene and a filled control on
   *  a hairline dark UI reads as already pressed. */
  const boxRects: SVGRectElement[] = [agentBox, phone, screen, ...cardBoxes, approveBox];
  /** Everything that only ever fades. The thread and the reply are single
   *  groups on purpose: a screen that came on in nine pieces would be nine
   *  events, and a phone showing a conversation is one. */
  const fadeParts: SVGElement[] = [
    agentLabel,
    agentSub,
    guts,
    stampJob,
    ...cardTitles,
    ...cardResults,
    guard,
    approveTitle,
    approveWho,
    yesText,
    thread,
    replyMsg,
    answer,
    cite,
    receipt,
    evt,
    ...chanItems,
    doorText,
    ...caps.map((c) => c.text),
    ...rows.map((r) => r.evidence),
  ];

  /* ════════════════════════════════════════════════════════════════════════
     REST STATE — the inverse of the stylesheet
     ════════════════════════════════════════════════════════════════════════ */

  function restState(): void {
    gsap.set(pin, { opacity: 0 });
    /* Fully standing at rest — the pin's entry fade is the only entrance the
       rail column gets, so the scene is named and its five promises are made
       before a single stroke of the world is drawn. */
    gsap.set(title, { opacity: 1, y: 0 });
    /* Every checklist row unticked and unlit. The stylesheet already paints
       them this way, but the scrub tweens the word's ink, so rest owes an
       explicit inverse for it. */
    gsap.set(
      rows.map((r) => r.word),
      { fill: COLOR.textDim },
    );
    gsap.set(strokeParts, { drawSVG: "0% 0%" });
    gsap.set(boxRects, { fillOpacity: 0 });
    /* The three boxes that ever change colour, put back to the ink the
       stylesheet paints them in. All three sit on the same rung, which is why
       there is one constant and not three. */
    gsap.set([agentBox, cardBoxes[2]!, yesBox], { stroke: COLOR.hairlineStrong });
    gsap.set(fadeParts, { opacity: 0 });
    /* The affordance is unpressed and pivots on its own middle. A bbox origin
       rather than svgOrigin: this scene has no camera, but the rule is the
       rule, and a bbox origin cannot be wrong under a transform that arrives
       later. */
    gsap.set(yesGroup, { scale: 1, transformOrigin: "50% 50%" });
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
       origin — same insurance as scenes 2 and 3. A circle authored at 0,0 sits
       in the viewBox's corner until something moves it, so the failure mode of
       a beat that forgets to place one is a dot floating over the drawing;
       parked, the same mistake puts it on its own route. */
    gsap.set(dotIn, { opacity: 0, scale: 1, x: IN_X, y: 0, transformOrigin: "50% 50%" });
    gsap.set(dotOut, {
      opacity: 0,
      fill: COLOR.greenDim,
      scale: 1,
      x: MODEL_CX,
      y: SPINE_Y,
      transformOrigin: "50% 50%",
    });
  }

  /* ════════════════════════════════════════════════════════════════════════
     THE STILL STATE  (< 768px, and prefers-reduced-motion)
     Same information, delivered by layout instead of by time (DESIGN §3).
     ════════════════════════════════════════════════════════════════════════ */

  function buildStill(reduced: boolean): () => void {
    const frag = doc.createDocumentFragment();

    function figure(box: string): HTMLElement {
      const wrap = doc.createElement("div");
      wrap.className = "trn-card-figure";
      const clone = pristine.cloneNode(true) as SVGSVGElement;
      clone.setAttribute("viewBox", box);
      // As tall as its own window is deep, so nothing letterboxes.
      const n = box.split(" ");
      clone.style.aspectRatio = `${n[2]} / ${n[3]}`;
      wrap.appendChild(clone);
      return wrap;
    }

    /* The scene's name, once, at the head of the block — the same two lines
       the pin's rail carries, in HTML because a still has no rail. */
    function stillTitle(): HTMLElement {
      const wrap = doc.createElement("div");
      wrap.className = "trn-still-title";
      /* The rail's own two-tone kicker, rebuilt: the number a rung brighter
         than the word, same as the pinned version. A still that quoted the
         string but dropped the treatment would be a second design. */
      const k = doc.createElement("p");
      k.className = "agt-kicker";
      const num = doc.createElement("span");
      num.className = "agt-kicker-num";
      num.textContent = TITLE_NUM;
      k.append(num, doc.createTextNode(` · ${TITLE_NAME}`));
      const h = doc.createElement("p");
      h.className = "trn-still-head";
      h.textContent = TITLE_HEAD;
      wrap.append(k, h);
      return wrap;
    }

    /* The checklist, as a checklist. This is the one part of the scene that
       survives the fallback by CHANGING FORM rather than by being cropped, and
       it survives better than it started: five claims and their five pieces of
       evidence, in a list, on a device that is good at lists. Every row is
       already checked, because in a still there is no "yet". */
    function stillChecklist(): HTMLElement {
      const ul = doc.createElement("ul");
      ul.className = "agt-still-list";
      for (const qy of QUALITIES) {
        const li = doc.createElement("li");
        li.className = "agt-still-row";
        const mark = document.createElementNS(SVG_NS, "svg");
        mark.setAttribute("class", "agt-still-tick");
        mark.setAttribute("viewBox", `0 0 ${Q_BOX + 1} ${Q_BOX + 1}`);
        mark.setAttribute("aria-hidden", "true");
        mark.append(
          svgEl("rect", { class: "agt-q-box", x: 0.5, y: 0.5, width: Q_BOX, height: Q_BOX, rx: 1 }),
          svgEl("path", { class: "agt-q-tick", d: tickPath(0.5, 0.5) }),
        );
        const body = doc.createElement("div");
        const w = doc.createElement("span");
        w.className = "agt-still-q";
        w.textContent = qy.word;
        const e = doc.createElement("span");
        e.className = "agt-still-e";
        e.textContent = qy.evidence;
        body.append(w, e);
        li.append(mark, body);
        ul.appendChild(li);
      }
      return ul;
    }

    /* Kicker, then what happened, then — where the beat has one — what it
       meant, the third line being the sentence the glass says over this beat
       in the scrubbed version. The pickup has no narrator and gets no third
       voice either. */
    /* The channel row, rebuilt as a strip. Same CHANNELS const, same four
       marks; the glyph `d`s are authored in a CHAN_ART box so a viewBox of
       exactly that size renders them at whatever the stylesheet asks for. */
    function stillChannels(): HTMLElement {
      const ul = doc.createElement("ul");
      ul.className = "agt-still-chans";
      for (const c of CHANNELS) {
        const li = doc.createElement("li");
        li.className = "agt-still-chan";
        const mark = document.createElementNS(SVG_NS, "svg");
        mark.setAttribute("viewBox", `0 0 ${CHAN_ART} ${CHAN_ART}`);
        mark.setAttribute("aria-hidden", "true");
        mark.appendChild(svgEl("path", { class: "agt-chan-glyph", d: c.d }));
        const w = doc.createElement("span");
        w.textContent = c.word;
        li.append(mark, w);
        ul.appendChild(li);
      }
      return ul;
    }

    function block(kicker: string, text: string, glassLine: string, event: string): HTMLElement {
      const el = doc.createElement("div");
      el.className = "eng-card";
      const k = doc.createElement("span");
      k.className = "eng-kicker";
      k.textContent = kicker;
      const p = doc.createElement("p");
      p.className = "eng-caption";
      p.textContent = text;
      el.append(k, p);
      if (glassLine) {
        const g = doc.createElement("p");
        g.className = "trn-still-glass";
        g.textContent = glassLine;
        el.appendChild(g);
      }
      /* The platform string this beat produces. The scrubbed version puts
         these in the checklist's evidence rows; a still reader gets them
         twice, in the list above and on the card whose beat they belong to,
         which is the right kind of redundancy for the most copy-pasteable
         words on the page. */
      const e = doc.createElement("p");
      e.className = "trn-still-event";
      e.textContent = event;
      el.appendChild(e);
      return el;
    }

    frag.appendChild(stillTitle());
    if (reduced) {
      /* The finished frame whole, then the checklist, then the argument as
         four close-ups — because at 1120u wide this scene's 10.5u mono is
         about 4px, and every claim it makes is made in mono. */
      const lede = doc.createElement("p");
      lede.className = "eng-still-lede";
      lede.textContent = "An agent of yours reads the reply, looks things up, waits for a human on the one action that matters, and answers back.";
      frag.append(lede, figure(STILL_WHOLE));
    }
    frag.appendChild(stillChecklist());
    for (const v of STILL_VIEW) {
      const el = block(v.kicker, v.text, v.glass, v.event);
      el.appendChild(figure(v.box));
      /* The beat that makes the multi-channel claim carries the row that
         proves it — in the scrub that row is on the glass, and the glass is
         stripped out of every still figure. */
      if (v.chans) el.appendChild(stillChannels());
      frag.appendChild(el);
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
     Two lines, revealed on a scrub as the section rises. Same construction as
     the first bridge (turn.ts), on its own trigger and its own class.
     ════════════════════════════════════════════════════════════════════════ */

  function buildBridge(): void {
    gsap.set(bridgeLines, { opacity: 0, y: 22 });
    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      scrollTrigger: {
        trigger: "#bridge-agents",
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
       every tween it is in. The same five scenes 2 and 3 are built from. */

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
     *  to `ink` and settles back. A moment, never a state. */
    const ack = (box: Element, at: number, ink: string, rest: string, out = 1.8): void => {
      ft(box, { stroke: rest }, { stroke: ink, duration: 0.2, ease: "power2.out" }, at);
      ft(box, { stroke: ink }, { stroke: rest, duration: out }, at + 0.6);
    };

    /** A receipt arriving one notch brighter than it rests and settling back —
     *  scenes 2 and 3's stamp emphasis. A status line that simply appeared
     *  would be new words; this is a change of state. */
    const stampState = (el: Element, at: number): void => {
      fadeIn(el, at, 0.6);
      ft(el, { fill: COLOR.text }, { fill: COLOR.textDim, duration: RCP_SETTLE }, at + 0.2);
    };

    /** A caption on the glass. Every value explicit at both ends, so scrubbing
     *  back takes the caption apart in the order it was built. */
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

    /* ── THE CHECKLIST ───────────────────────────────────────────────────
       Written as one block rather than scattered through the beats, because
       the checklist is the scene's ledger and a reader of this file should be
       able to see the whole of what it claims in one place. Each row: the tick
       DRAWS into its box, the word lifts off the bottom of the ink ladder with
       it, and the evidence for the claim fades in underneath a beat later —
       the claim is made and then the receipt for it arrives, never the other
       way round.

       Every one of these is a drawSVG from "0% 0%" to "0% 100%", so a reverse
       scrub un-draws it: the checklist walks backwards to five empty boxes,
       which is the only honest rest state for a list of promises. */
    rows.forEach((r) => {
      draw(r.tick, r.at, Q_DRAW);
      ft(r.word, { fill: COLOR.textDim }, { fill: COLOR.text, duration: Q_LIGHT }, r.at);
      fadeIn(r.evidence, r.at + 0.3, Q_EVID_IN);
    });

    /* The sentences on the glass, likewise in one block: they are one voice,
       and a reader should be able to see the whole of what the narrator says
       without reading the whole scene. */
    CAPS.forEach((c, i) => caption(i, c.at, c.out));

    /* ── BEAT 1 · the pickup ─────────────────────────────────────────────
       The world assembles in the order the message travels it: the wire down
       from the last scene, the machine it lands in, the road out, and the
       person at the end of it. The phone comes ON rather than being drawn —
       glass, screen, thread — because a device showing a conversation is not
       a device being sketched. */
    draw(wireIn, B1_WIRE_IN, 2.6);
    drawBox(agentBox, B1_BOX, 2.4);
    draw(wireOut, B1_WIRE_OUT, 3.0);
    drawBox(phone, B1_PHONE, 3.4);
    fadeIn(agentLabel, B1_LABEL, 1.1);
    fadeIn(agentSub, B1_SUB, 1.1);
    drawBox(screen, B1_SCREEN, 2.6);
    /* The internals come up as ONE fade, a beat after the box closes: the
       reader gets the silhouette, and then sees there is something in it.
       Simultaneous, the two read as one busy rectangle — and tracing a loop
       line by line would be three events where the machine is one. */
    fadeIn(guts, B1_GUTS, 1.3);
    fadeIn(thread, B1_THREAD, 1.6);
    fadeIn(replyMsg, B1_REPLY, 1.4);

    /* The job the reply is sitting in, named as it leaves the queue — the same
       string scene 3's last frame ends on, so the two frames are demonstrably
       the same job rather than two drawings of the idea of one. */
    fadeIn(stampJob, B1_STAMP, 1.2);

    fadeIn(dotIn, B1_FLY - 0.4, 0.5);
    run(dotIn, gIn, B1_FLY, B1_FLY_DUR, "power1.inOut");
    /* The machine hears it. NEUTRAL ink, and this is the rationing law doing
       narrative work rather than being obeyed: green on this site means a
       message of OURS arrived, and this one is the customer's (BRAND §2). */
    pop(dotIn, B1_LAND, 1.35);
    ack(agentBox, B1_LAND, COLOR.text, COLOR.hairlineStrong);
    fadeOut(dotIn, B1_LAND + 0.7, 0.6);

    /* ── BEAT 2 · the lookup ─────────────────────────────────────────────
       Two calls, four events each, and the gap between the third and the
       fourth is the beat: a request that returned in the same frame it was
       sent in is a request nobody believes. */
    draw(traces[0]!, B2_T1, 2.0);
    drawBox(cardBoxes[0]!, B2_C1, 2.0);
    fadeIn(cardTitles[0]!, B2_C1_TITLE, 1.0);
    fadeIn(cardResults[0]!, B2_C1_RESULT, 1.2);

    draw(traces[1]!, B2_T2, 1.8);
    drawBox(cardBoxes[1]!, B2_C2, 1.8);
    fadeIn(cardTitles[1]!, B2_C2_TITLE, 1.0);
    fadeIn(cardResults[1]!, B2_C2_RESULT, 1.2);

    /* ── BEAT 3 · the guarded action ─────────────────────────────────────
       The policy is stated before the call it stops, the call is made anyway,
       and then the card's border leaves the ink ladder. This is the only amber
       on this screen and the only stillness in this scene, and they are the
       same event. */
    fadeIn(guard, B3_GUARD, 1.2);
    draw(traces[2]!, B3_T3, 1.8);
    drawBox(cardBoxes[2]!, B3_C3, 1.8);
    fadeIn(cardTitles[2]!, B3_C3_TITLE, 1.0);
    ft(
      cardBoxes[2]!,
      { stroke: COLOR.hairlineStrong },
      { stroke: COLOR.amber, duration: B3_AMBER_DUR, ease: "power2.out" },
      B3_AMBER,
    );

    draw(conn, B3_CONN, 0.6);
    drawBox(approveBox, B3_APPROVE, 1.8);
    fadeIn(approveTitle, B3_APPROVE_TITLE, 1.1);
    fadeIn(approveWho, B3_APPROVE_WHO, 1.0);
    draw(yesBox, B3_YES_IN, 0.8);
    fadeIn(yesText, B3_YES_IN + 0.4, 0.8);

    /* THE YES. A quick dip about the affordance's own centre — 0.18 down under
       power2.in, 0.26 back under power2.out, which is DESIGN §3's press
       curve and the same gesture every button on this site makes at :active.
       The border brightens with it, because a press with no feedback is a
       press the reader has to be told about. */
    ft(
      yesGroup,
      { scale: 1 },
      { scale: 0.9, duration: B3_PRESS_DOWN, ease: "power2.in", transformOrigin: "50% 50%" },
      B3_PRESS,
    );
    ft(
      yesGroup,
      { scale: 0.9 },
      { scale: 1, duration: B3_PRESS_UP, ease: "power2.out", transformOrigin: "50% 50%" },
      B3_PRESS + B3_PRESS_DOWN,
    );
    ack(yesBox, B3_PRESS, COLOR.text, COLOR.hairlineStrong, 1.2);

    /* And the amber drains back to the ladder. Slowly — 1.6 units against the
       1.0 it took to arrive, because a block is a decision and its release is
       a consequence, and consequences settle. */
    ft(
      cardBoxes[2]!,
      { stroke: COLOR.amber },
      { stroke: COLOR.hairlineStrong, duration: B3_DRAIN_DUR },
      B3_DRAIN,
    );
    /* The action reports. INK, not green: this is a refund being reissued in
       somebody else's system, not one of our messages arriving. The tick is
       drawn rather than typed for the reason in index.html — and it is the
       same two segments the checklist uses, which makes it the fifth
       checkmark of the scene, drawn in the world instead of in the rail. */
    fadeIn(cardResults[2]!, B3_RESULT, 1.0);
    draw(cardTick, B3_RESULT + 0.2, 0.5);

    /* ── BEAT 4 · the answer ─────────────────────────────────────────────
       Out of the model, under the loop, out of the box and down the one road
       that has been standing since beat 1 — and the box's own through-line is
       the first 140u of it, so the answer never appears to start outside the
       machine. Dim green to full green at the
       instant of arrival — a packet that was born green has nothing left to
       say when it lands — and it is the ONLY green in the scene. */
    fadeIn(dotOut, B4_FLY - 0.4, 0.5);
    run(dotOut, gOut, B4_FLY, B4_FLY_DUR, "power1.inOut");
    ft(dotOut, { fill: COLOR.greenDim }, { fill: COLOR.green, duration: 0.14 }, B4_LAND);
    pop(dotOut, B4_LAND, 1.45);
    fadeOut(dotOut, B4_LAND + 0.7, 0.8);

    /* The thread gains the answer, and then the source it came from — in that
       order and a unit and a half apart, because the sentence is what the user
       reads and the citation is what an engineer checks. */
    fadeIn(answer, B4_MSG, 1.4);
    fadeIn(cite, B4_CITE, 1.2);
    /* Our receipt for their surface, and then the platform event it fires.
       The receipt is a fact about the send; the event is the string a
       developer would subscribe to. */
    stampState(receipt, B4_RECEIPT);
    fadeIn(evt, B4_EVT, 1.2);
    /* And the four channels the SAME agent would have answered on — now the
       first half of caption 3 rather than a label beside the phone. The marks
       come in left to right, a beat ahead of the rule and two ahead of the
       words, so the reader meets the picture and is then told what it means.

       They leave with the sentence, because they are part of it. Nothing on
       the glass is in the finished frame (styles.css, .trn-l-glass) and this
       row is on the glass now; the still cards carry the claim instead. */
    chanItems.forEach((item, i) => {
      fadeIn(item, B4_CHANNELS + i * CHAN_STEP, CHAN_FADE);
      fadeOut(item, CAPS[2]!.out, CAP_TEXT_OUT);
    });

    /* ── THE HELD ENDING ─────────────────────────────────────────────────
       Six units in which nothing leaves. The only thing still being built is
       the door to scene 5 — drawn, so that the last motion on the frame points
       at the next one rather than at itself. */
    draw(doorRule, B4_DOOR_RULE, 1.2);
    fadeIn(doorText, B4_DOOR_TEXT, 1.4);

    /* AND THE HELD ENDING, AS A LENGTH.
       A gsap timeline is exactly as long as its last tween, and ScrollTrigger
       maps the whole pin onto that length — so a scene whose last build
       finishes at 77.2 does not get 80 units of scroll with nothing at the
       end of it. It gets 77.2 units, stretched, and the frame the ending is
       supposed to rest on is handed back to the scrollbar the instant it
       finishes assembling. The reader never sees the finished picture stand
       still, which is the one thing the last beat is for.

       This inert tween on a throwaway object is those units, made explicit.
       It is also what makes TL_END mean what the file says it means at the
       top: 2.0 viewport heights over 80 units is 0.025 vh per unit only if
       the timeline is actually 80 units long. */
    const built = tl.duration();
    if (built > TL_END) {
      throw new Error("[agents] the scene's last build runs past its own timeline");
    }
    /* And the pad has to be a pause a reader can feel, not a rounding error.
       The door is allowed to draw itself inside the held ending — a build is
       the one kind of motion an ending permits, and it points at the next
       scene — but something has to be left over after it. */
    if (TL_END - built < 2) {
      throw new Error("[agents] there is no still frame left at the end of the scene");
    }
    tl.to({}, { duration: TL_END - built, ease: "none" }, built);
  }

  /* ════════════════════════════════════════════════════════════════════════
     MEDIA GATING
     One matchMedia owns every choice. The bridge is a fade and works at any
     width, so it is gated on the motion preference alone; the scene itself is
     gated on both, same as scenes 2 and 3.
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
