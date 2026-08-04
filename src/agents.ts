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
const FRAME_H = 634; // 600 + the second 34u drop of the beat-3 cluster (user call) — the foot margin was already at its floor, so the frame grew instead
const SPINE_Y = 306;

/** The chassis, as one box — scene 3's chip dialect, one scene on. It grew
 *  from 200 × 116 to 240 × 140 and moved 50u left when the customer guide's
 *  five capability rows went into it: the rows need the measure, and the left
 *  is where the frame had the room (it also hands the tool traces 88u of
 *  runway where they used to have 78). */
const AGENT_X = 190;
const AGENT_Y = 236;
const AGENT_W = 240;
const AGENT_H = 140;

/* ── the chassis's contents, from the customer guide ────────────────────
   notification-system/docs/ASYNCIFY-AGENTS-GUIDE.md §1 draws Asyncify as a
   chassis listing what it owns, handing off to a brain the customer supplies.
   These five rows are that list, compressed to fit at a legible size and not
   otherwise reworded (the guide's `identity` and `human` are the two words
   that did not fit). The copy itself lives in the markup, next to the comment
   that cites the source; what lives here is only the geometry that has to
   agree with the packets. */
const GUTS_X = 204;
const GUTS_Y0 = 272;
/* 34, up from the 24 five rows needed. THE BOX DID NOT SHRINK WITH THE LIST,
   and that is deliberate: the chassis is the guide's own picture of "Asyncify
   owns everything around the brain", and a box that contracts every time a row
   leaves reads as a list in a container rather than as a machine. It also has
   to stay visibly bigger than the 28u brain seated in it, and its height is
   load-bearing in four other places — the label stack above it, the channel
   row's clearance below it, the three trace departure latitudes on its wall,
   and SPINE_Y being its exact centre. Shrinking would ripple through all four
   to buy nothing. The three rows take the space instead, which is the right
   answer to a clutter complaint: air, not a tighter box.

   The middle row lands on SPINE_Y exactly, which is the brain's own latitude
   — the busiest line in the scene now reads as one continuous thought from
   the chassis, through the brain, out to the phone. */
const GUTS_PITCH = 34;
const GUTS_SIZE = 11.5;
/** What the rows drop to once the work starts. The chassis is the subject for
 *  exactly one beat; after that it is scenery, and scenery that keeps talking
 *  at reading weight competes with the three tool cards for the same eye.
 *
 *  THIS IS AN OPACITY AND NOT A LADDER STEP, which BRAND §1 discourages for
 *  text — "no opacity-faked grays over the canvas for a resting colour". The
 *  exception is argued rather than assumed: the rows already sit on
 *  --text-faint, the bottom rung, so there is no darker step to tween to, and
 *  what is wanted here is not a different colour but a state change the scene
 *  drives and un-drives. 0.4 puts #6e6e6e at roughly --hairline-strong against
 *  the canvas: the reader can still see there is a list, and has stopped
 *  reading it. Which is the whole instruction. */
const GUTS_DIM = 0.4;

/** THE BRAIN, on the chassis's right wall where the guide puts it, and the
 *  thing the "any model · your system prompt" label is naming. The inbound
 *  reply comes to rest ON it — not merely inside the box — because the first
 *  thing the checklist claims is "any model" and a tick has to be earned
 *  by something the reader can point at. With the box full of text it is also
 *  the only landing point that is not a word. */
const BRAIN_CX = 406;
const BRAIN_CY = 306;
const BRAIN_R = 14;

/** Where scene 3's door wire comes back into the frame. It comes down on the
 *  BRAIN's own centre line, so the reply drops straight into the thing that
 *  thinks — no elbow, no curve, and nothing for it to cross on the way in.
 *  It is also far enough right that the box's two-line label, which is
 *  left-aligned on the box's own wall, never runs under it (asserted at
 *  boot). */
const IN_X = BRAIN_CX;

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
   box. The gap between card 2 and card 3 is that clearance, and it is also the
   beat break: everything above the spine is the agent thinking, everything
   below it is the agent acting.

   THE GUARDED-ACTION CLUSTER SITS 34u LOWER THAN IT USED TO — the annotation,
   the action card, the connector and the approval card, moved as ONE object
   (user call). At the old latitudes the cluster started 110u under card 2 and
   read as a third entry in the same trace log; the beat it belongs to is not
   another lookup, it is the scene stopping. 154u of daylight is what makes it
   its own act, and it is bought at the bottom rather than in the middle: the
   approval card's floor lands on 566, which is the door cue's own baseline at
   the other end of the frame, so the composition's foot is one band and the
   frame keeps a 34u margin under it.

   Nothing INSIDE the cluster moved relative to anything else in it: the
   annotation is still 10u over the card it explains, the connector is still the
   same 22u stem, and the approval card still hangs 22u under the action it
   asks about. A cluster whose parts drifted apart while it travelled would be
   a different drawing, not the same one lower down. */
const CARD_X = 518;
const CARD_W = 246;
const CARD_PAD = 12;
const CARDS: readonly { y: number; h: number }[] = [
  { y: 96, h: 74 },
  { y: 208, h: 58 },
  { y: 454, h: 54 },
];
const APPROVE_Y = 530;
const APPROVE_H = 70;
/** The policy annotation's own baseline. It is authored in the markup like
 *  every other string in the world, and it lives here too because it is the
 *  one label in the scene whose POSITION carries meaning: it explains the card
 *  under it, so "paired, above, and closer to that card than to anything else"
 *  is an invariant rather than a placement. Asserted against the markup and
 *  against both its neighbours at boot. */
const GUARD_Y = 444;
const GUARD_SIZE = 11;
/** How much frame has to be left under the deepest thing in the world. The
 *  cluster is what pushed against this, and 24u is the floor the move was
 *  designed to keep clear of — .agt-svg scales the whole viewBox to the
 *  viewport, so anything past 600 is not clipped, it simply never existed. */
const FRAME_FOOT_MIN = 24;

/* ── The tool traces' departure latitudes ──────────────────────────────────
   Three lines out of the chassis's right wall, one per card, and the three
   numbers are here rather than only in the markup because they are a FAN and
   not three placements: they have to stay on their card's own side of the
   spine, inside the wall between its corners, and in the same order as the
   cards they serve.

   282 and 296 are the two questions — adjacent, just above the spine, because
   they are one kind of act happening twice. 352 is the ACTION, and it moved
   down from 338 with the cluster it serves: a departure that stayed where it
   was would have turned a swept elbow into a drop, and the trace would have
   been a leftover of the old composition pointing at the new one. At 352 it
   leaves 46u under the spine and 24u over the box's bottom corner — the wall's
   last honest latitude — and the fan now reads the way the scene does, two
   lines thinking and one line acting. */
const TRACE_OUT_Y: readonly number[] = [282, 296, 352];

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
/** The CLOSING STATEMENT's own rule, 44u below the captions'. It is a
 *  different object with a different lifetime (see #agt-closing in the
 *  markup), so it gets its own latitude rather than borrowing theirs — which
 *  is also what buys the channel marks above it their clearance from the
 *  chassis. The two zones overlap in space and never in time; the schedule
 *  asserts below are what keep that true. */
const CLOSE_RULE_Y = 468;
/** The channel words' baseline. The row used to sit 14u under the chassis's
 *  bottom wall, which was close enough that it read as a fifth row OF the
 *  chassis rather than as a statement about the scene (user call). It now sits
 *  58u clear of it and 14u above its own rule — far enough that the eye files
 *  the block separately, near enough that the marks still belong to the words
 *  under them. Both clearances are asserted, because this is the one place in
 *  the scene where a frame-level layer and the world share a band. */
const CHAN_BASE_Y = 449;
/** Each glyph is authored in a CHAN_ART box and PLACED at CHAN_GLYPH with a
 *  scale transform, so the marks grow and the hairline does not (the class
 *  carries vector-effect: non-scaling-stroke). 20 against the 12 it was:
 *  ~16.9 CSS px on a 1250px viewport, ~20.8 on a 1536px one. */
const CHAN_ART = 12;
const CHAN_GLYPH = 20;
const CHAN_GAP = 7;
const CHAN_SEP = 22;
const CHAN_SIZE = 12; // was 14 — the enlarged row's words outgrew their glyphs (user call)
const CHANNELS: readonly { word: string; d: string }[] = [
  /* in-app: a speech bubble with a tail, which is the one shape that means
     "inside your product" without drawing a product. */
  { word: "widget", d: "M 0.5 1 L 11.5 1 L 11.5 8 L 4 8 L 1.5 11 L 1.5 8 L 0.5 8 Z" },
  /* telegram: the paper plane, in one outline and one crease — the same
     construction as scene 3's send glyph, and no fill, for the same reason. */
  { word: "telegram", d: "M 0.5 5.6 L 11.5 1.2 L 7.6 10.8 L 5.4 6.9 Z M 5.4 6.9 L 11.5 1.2" },
  /* slack: the actual pinwheel — four rounded lozenges in Slack's rotational
     arrangement (top-left vertical, top-right horizontal, bottom-right
     vertical, bottom-left horizontal), as ONE-ink outlines. The first draft
     drew a hash instead, reasoning the real logo is four colours; the user
     overruled — the SHAPE is the recognizable part, and an outline keeps the
     colour law intact. */
  {
    word: "slack",
    d:
      "M 3.4 2.1 A 1.1 1.1 0 0 1 5.6 2.1 L 5.6 4.5 A 1.1 1.1 0 0 1 3.4 4.5 Z " +
      "M 7.5 3.4 L 9.9 3.4 A 1.1 1.1 0 0 1 9.9 5.6 L 7.5 5.6 A 1.1 1.1 0 0 1 7.5 3.4 Z " +
      "M 6.4 7.5 A 1.1 1.1 0 0 1 8.6 7.5 L 8.6 9.9 A 1.1 1.1 0 0 1 6.4 9.9 Z " +
      "M 2.1 6.4 L 4.5 6.4 A 1.1 1.1 0 0 1 4.5 8.6 L 2.1 8.6 A 1.1 1.1 0 0 1 2.1 6.4 Z",
  },
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
const B1_BRAIN = 6.4;
const B1_GUTS = 7.2;
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

/* ── The memory close-up ──────────────────────────────────────────────────
   (user call) The "remembers" tick is the one moment to show what the word
   MEANS: the platform's three memories (guide §9 — transcript, episodic
   summaries, durable profile). For seven units the rail becomes the subject:
   the world dims, the checklist scales up about the remembers row (this
   scene's only "camera" move), and three curves fan out of the row one at a
   time, each naming a memory. Then everything folds away and the lookup
   resumes — which is why the card-2 chain below sits +4 from where it was
   authored: the fan needed a stage, and the only honest way to get one in a
   fixed timeline is to move the next act, not to talk over it. */
const MEM_IN = 20.8;
/* The close-up is a REAL one (user call, after the 1.16/0.35 draft read as a
   lean-in rather than a camera move): scene 3's typing zoom is the model --
   the subject owns the frame, everything else is present but unreadable. At
   1.9 the row's word renders ~25px and the fan's labels ~22px; the world at
   0.15 is context, not competition; the title and the other rows hold at 0.2
   so the reader keeps the anchor of "this is the list" without anything to
   read but the subject. One set of constants for all three asides -- one
   camera language, not three. */
const MEM_SCALE = 1.9;
/* 0.05/0.1, down from 0.15/0.2: at the deeper zoom the leftover dims still
   left READABLE text under the fan's labels, and dim-text-over-dim-text is
   mush (user catch). At these values the world and the neighbours are
   silhouettes -- shape without words -- which is what "context" meant. */
const MEM_STAGE_DIM = 0.05;
const MEM_ROW_DIM = 0.1;
/* Zero, not 0.1: a 29px near-white head is still legible at 10% -- big type
   survives dims that erase small type (user catch). The rows may whisper;
   the masthead leaves the frame entirely and returns with the camera. */
const MEM_TITLE_DIM = 0;
/** One memory at a time — a list revealed all at once is read as one item. */
const MEM_CURVES: readonly number[] = [21.6, 23.1, 24.6];
const MEM_CURVE_DRAW = 0.8;
const MEM_LABEL_LAG = 0.35;
const MEM_OUT = 26.6;
const MEM_FOCUS_OUT = 27.3;

/* -- The grounded close-up ------------------------------------------------
   The memory aside's sibling, at the grounded tick, same rhythm on purpose --
   twice is a motif (and it stops at twice; a third would be a template).
   Three curves out of row 3: the agent's grounding is your tools (signed
   calls), your company's documents (cited answers), and the honest boundary
   (no source, no invention). Beat 3's whole chain sits +2 from where it was
   authored to give this the same stage the memory aside got. */
const GRD_IN = 33.6;
const GRD_CURVES: readonly number[] = [34.4, 35.9, 37.4];
const GRD_OUT = 39.2;
const GRD_FOCUS_OUT = 39.9;

/* -- The guarded footnote --------------------------------------------------
   (user call) A third close-up, but deliberately NOT a third fan: guarded is
   the one quality beat 3 dramatizes IN the world (the pause, the human, the
   yes), so the rail owes only what the stage never shows -- the OTHER two
   fences, and the sentence that makes all three matter. One curve, two-line
   label, right after the action completes: the reader has just watched one
   fence work, and this says there are more, built where the model cannot
   talk its way past them. It fits the pocket between the world's tick and
   the answer's flight, so nothing had to move. */
const GUA_IN = 55.6;
const GUA_CURVE = 56.4;
const GUA_OUT = 59.0;
const GUA_FOCUS_OUT = 59.6;

const B2_T2 = 28.2;
const B2_C2 = 29.4;
const B2_C2_TITLE = 30.6;
const B2_C2_RESULT = 32.8;
const T_GROUND = 33.2;

/* ── Beat 3 · the guarded action ───────────────────────────────────────── */
/* The policy is stated BEFORE the call it stops, because that is the order it
   is true in: the rule exists, and then the agent walks into it. */
const B3_GUARD = 41.0;
const B3_T3 = 42.4;
const B3_C3 = 43.6;
const B3_C3_TITLE = 44.8;
/** THE PAUSE. The card's border leaves the ink ladder for the only time in
 *  the scene, and stays there for nearly seven units — a twelfth of the whole
 *  scrub in which the machine does nothing at all. AMBER_MIN_HOLD refuses to
 *  boot if an edit takes that away: an approval that resolves as fast as it is
 *  asked for is not a guardrail, it is a speed bump. */
const B3_AMBER = 45.8;
const B3_AMBER_DUR = 1.0;
const B3_CONN = 47.0;
const B3_APPROVE = 47.6;
const B3_APPROVE_TITLE = 49.0;
const B3_APPROVE_WHO = 49.8;
const B3_YES_IN = 50.4;
/** THE YES. The last human act in the scene, and the cause of everything
 *  after it — the same press gesture scene 3 gives its send glyph, which is
 *  DESIGN §3's press-feedback curve. */
const B3_PRESS = 52.6;
const B3_PRESS_DOWN = 0.18;
const B3_PRESS_UP = 0.26;
const T_GUARD = B3_PRESS;
const B3_DRAIN = 53.0;
const B3_DRAIN_DUR = 1.6;
const B3_RESULT = 54.4;
const AMBER_MIN_HOLD = 4;

/* ── Beat 4 · the answer ───────────────────────────────────────────────── */
/* 5.2 units for 553u of road, which is slower per unit than scene 3's outbound
   delivery and about the speed of its journey home. It is the last travel on
   the page and the reader is meant to watch all of it. */
const B4_FLY = 61.0;
const B4_FLY_DUR = 5.2;
const B4_LAND = B4_FLY + B4_FLY_DUR; // 66.2
const T_ANSWER = B4_LAND;
const B4_MSG = 66.5;
const B4_CITE = 68.2;
const B4_RECEIPT = 67.9;
const B4_EVT = 68.5;
/* ── the receipt pair's viewing window ────────────────────────────────
   `delivered · email` and `websocket event: message.changed` used to stand in
   the finished frame forever. They now stamp, hold long enough to be read at
   scrub pace, and go (user call) — the reader has seen them, and the ending is
   better without two lines of machine muttering hanging in the middle of it.

   The window is measured, not felt: 4.5 units for the receipt and 3.5 for the
   event line, which at this scene's 0.025 viewport-heights-per-unit is a tenth
   of a screen of scroll each with the string standing still. RCP_WINDOW_MIN
   refuses a schedule that gives them less. They are also the LAST thing in the
   scene that ever leaves, so the fade is timed to land exactly on HOLD_FROM:
   past it, the frame is finished and nothing moves but the door drawing itself.

   Nothing is lost by their going. The answer is still in the thread with its
   citation, the checklist's fifth row still reads `answers back / ws ·
   message.changed`, and the closing statement now persists under it. */
const RCP_OUT = 73.0;
const RCP_OUT_DUR = 1.0;
const RCP_WINDOW_MIN = 3;
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
  /* Between the two checklist asides: it narrates the second lookup and must
     be OFF the glass before the grounded close-up dims the stage under it. */
  { at: 29.0, out: 32.6 },
  { at: 48.8, out: 54.6 },
];

/* ── the closing statement ─────────────────────────────────────────────
   There used to be a third caption here and there is not any more, because it
   stopped being one (user call). It arrives the way a caption does — the marks
   lead, the rule draws under them, the words rise last — and then it simply
   never leaves. The scene ends with it on the frame.

   That is a deliberate exception to the rule the glass layer states about
   itself, and it is worth naming rather than quietly breaking: narration is a
   thing that was said, so it goes; this is the claim the scene exists to make,
   so it stays. Everything that is still a caption is still governed by the
   one-at-a-time assert, and the statement gets its own assert saying it may
   not arrive while the last of them is still leaving. */
const CLOSE_AT = 69.4;

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
  /* The word follows the box's own label (user call): the box says "any
     model", so a checklist that still claimed "your own model" was quoting a
     line the scene no longer has. The EVIDENCE is unchanged on purpose — the
     word is the claim the product makes, the evidence is the receipt the
     customer supplies, and "any model" backed by "your endpoint · your prompt"
     is those two facts in the right order. */
  { word: "any model", evidence: "your endpoint · your prompt", at: T_MODEL },
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
/** The memory fan pivots the close-up on the remembers row's own latitude
 *  (declared here, beside the geometry it is derived from). */
const MEM_ORIGIN_Y = Q_Y0 + 1 * Q_PITCH + 6;
const GRD_ORIGIN_Y = Q_Y0 + 2 * Q_PITCH + 6;
const GUA_ORIGIN_Y = Q_Y0 + 3 * Q_PITCH + 6;
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
    text: "The reply comes out of the queue and into an AI agent that is yours: Asyncify owns the conversation, the channels and the safety rails; any model you like does the thinking.",
    glass: "",
    event: "job · conversation-inbound",
    /* The wire from the top edge, the box, both label lines and the job stamp.
       Square, because this beat is one object and its name. */
    box: "180 96 300 300",
  },
  {
    chans: false,
    kicker: "the lookup",
    text: "Two calls, in the order a brain makes them: what do I already know about this person — short-term transcript, episodic past conversations, long-term profile — and what does the order actually say.",
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
    /* Cut to the cluster's own block — the annotation's em box at ~402 down to
       the approval card's floor at 566 — and it followed the cluster 34u down
       when the cluster moved. A window left at the old latitude would have
       framed the empty gap the move created. */
    box: "500 424 300 190",
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
  const cam = q<HTMLElement>(doc, "#agt-cam");
  /** Where the camera aims: a subject row's point in the CAMERA's own box,
   *  measured lazily (function-based tween values evaluate on first render,
   *  which is after fonts and layout have settled -- the boot-font-metrics
   *  trap does not apply). The checklist renders at scale 1, so svg units are
   *  pixels. x aims a third into the fan so row + labels centre together. */
  const camAim = (originY: number) => {
    const c = cam.getBoundingClientRect();
    const k = checklist.getBoundingClientRect();
    return { x: k.left - c.left + 150, y: k.top - c.top + originY };
  };
  /** translate that keeps aim-point fixed while the frame scales about 0,0 */
  const camX = (originY: number) => () => (1 - MEM_SCALE) * camAim(originY).x;
  const camY = (originY: number) => () => (1 - MEM_SCALE) * camAim(originY).y;
  const checklist = q<SVGSVGElement>(doc, "#agt-checklist");
  const rulesG = q<SVGGElement>(checklist, "#agt-rules");
  const qualitiesG = q<SVGGElement>(checklist, "#agt-qualities");
  const memCurves = [1, 2, 3].map((i) => q<SVGPathElement>(checklist, `#agt-mem-c${i}`));
  const memLabels = [1, 2, 3].map((i) => q<SVGTextElement>(checklist, `#agt-mem-l${i}`));
  const grdCurves = [1, 2, 3].map((i) => q<SVGPathElement>(checklist, `#agt-grd-c${i}`));
  const grdLabels = [1, 2, 3].map((i) => q<SVGTextElement>(checklist, `#agt-grd-l${i}`));
  const guaCurve = q<SVGPathElement>(checklist, "#agt-gua-c");
  const guaLabel = q<SVGGElement>(checklist, "#agt-gua-label");

  const wireIn = q<SVGPathElement>(svg, "#agt-wire-in");
  const wireOut = q<SVGPathElement>(svg, "#agt-wire-out");
  const stampJob = q<SVGTextElement>(svg, "#agt-stamp-job");

  const agentBox = q<SVGRectElement>(svg, "#agt-box");
  const agentLabel = q<SVGTextElement>(svg, "#agt-label");
  const agentSub = q<SVGTextElement>(svg, "#agt-sub");
  const guts = q<SVGGElement>(svg, "#agt-guts");
  const gutsRows = Array.from(guts.querySelectorAll<SVGTextElement>(".agt-guts-row"));
  const brain = q<SVGCircleElement>(svg, "#agt-brain");
  const brainOut = q<SVGPathElement>(svg, "#agt-brain-out");

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

  const doorRule = q<SVGPathElement>(svg, "#agt-door-rule");
  const doorText = q<SVGTextElement>(svg, "#agt-door");

  const glass = q<SVGGElement>(svg, "#agt-glass");
  const caps = [1, 2].map((i) => {
    const g = q<SVGGElement>(svg, `#agt-cap-${i}`);
    return { rule: q<SVGPathElement>(g, ".trn-cap-rule"), text: q<SVGGElement>(g, ".trn-cap-text") };
  });
  /* The closing statement. Same two parts a caption has and the same ink, but
     its own elements and its own schedule — it outlives them. */
  const closeRule = q<SVGPathElement>(svg, "#agt-close-rule");
  const closeText = q<SVGGElement>(svg, "#agt-close-text");

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
  /* The memory close-up has to be OVER — curves retracted, world back at
     full ink — before trace 2 fires; a lookup drawn into a dimmed stage is a
     scene talking over its own aside. */
  if (MEM_FOCUS_OUT + 0.9 > B2_T2) {
    throw new Error("[agents] the memory close-up is still folding away when the lookup resumes");
  }
  if (MEM_CURVES[MEM_CURVES.length - 1]! + MEM_CURVE_DRAW + MEM_LABEL_LAG >= MEM_OUT) {
    throw new Error("[agents] the last memory label has no time to stand before the fan folds");
  }

  /* Same two guards for the grounded aside, against the SHIFTED beat 3. */
  if (GRD_FOCUS_OUT + 0.9 > B3_GUARD) {
    throw new Error("[agents] the grounded close-up is still folding away when the guardrail speaks");
  }
  if (GRD_CURVES[GRD_CURVES.length - 1]! + MEM_CURVE_DRAW + MEM_LABEL_LAG >= GRD_OUT) {
    throw new Error("[agents] the last grounding label has no time to stand before the fan folds");
  }
  /* And caption 1 must be off the glass before that close-up dims the stage
     it is printed on. */
  if (CAPS[0]!.out + CAP_TEXT_OUT > GRD_IN) {
    throw new Error("[agents] caption 1 is still on the glass when the grounded close-up dims it");
  }

  /* The guarded footnote's own guards: caption 2 off the glass before the
     dim, the label standing before the fold, the fold done before the
     answer flies. */
  if (CAPS[1]!.out + CAP_TEXT_OUT > GUA_IN) {
    throw new Error("[agents] caption 2 is still on the glass when the guarded footnote dims it");
  }
  if (GUA_CURVE + MEM_CURVE_DRAW + MEM_LABEL_LAG >= GUA_OUT) {
    throw new Error("[agents] the guarded footnote has no time to stand before it folds");
  }
  if (GUA_FOCUS_OUT + 0.9 > B4_FLY) {
    throw new Error("[agents] the guarded footnote is still folding away when the answer flies");
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
  /* The dot has to come to rest ON the brain, because "any model" is the
     first thing the checklist claims and a tick has to be earned by something
     the reader can point at. */
  if (
    BRAIN_CX - BRAIN_R <= AGENT_X ||
    BRAIN_CX + BRAIN_R >= AGENT_X + AGENT_W ||
    BRAIN_CY !== SPINE_Y
  ) {
    throw new Error("[agents] the brain is not seated on the spine inside the chassis");
  }
  if (Number(brain.getAttribute("cx")) !== BRAIN_CX || Number(brain.getAttribute("r")) !== BRAIN_R) {
    throw new Error("[agents] #agt-brain disagrees with BRAIN_CX / BRAIN_R");
  }

  /* ── the chassis rows vs the two things that move through the box ──────
     This is the collision class this scene has already been burned by once: a
     glyph placed on a latitude a packet travels. There are exactly two hazards
     inside the chassis:

       1  THE FALL. The reply drops down a column at BRAIN_CX from the box's
          top wall to the spine, so no row may reach into that column anywhere
          above SPINE_Y.
       2  THE SEAT. The brain's disc is where the reply stops, and a row whose
          em box entered it would be a word with a packet parked on it.

     EVERY NUMBER BELOW IS ARITHMETIC, NOT A MEASUREMENT, and that is the fix
     for a bug this assert caused on its first draft: it read getBBox() on the
     rows, which at boot returns FALLBACK-FONT metrics, because the scene is
     built before document.fonts has resolved. The rows were fine and the scene
     refused to start. turn.ts states the same rule for the typed reply —
     placement by arithmetic "does not depend on the web font having loaded
     when the scene booted" — and a boot assert has to obey it twice over,
     because an assert that fails on slow fonts is worse than no assert. */
  {
    const lane = BRAIN_CX - DOT_R - 6;
    /* Geist Mono's em box, in ems: cap-and-ascender up, descender down. Wider
       than the glyphs actually are, which is the direction an assert should
       err in. */
    const ROW_UP = GUTS_SIZE * 0.75;
    const ROW_DOWN = GUTS_SIZE * 0.25;

    if (gutsRows.length !== 3) {
      throw new Error("[agents] the chassis does not have its three rows");
    }
    /* The rows have to be at full ink before the scene asks them to step back,
       or the dim tween starts from a value that was never reached and the
       reverse pass has nowhere to return to. */
    if (B2_T1 < B1_GUTS + 1.4) {
      throw new Error("[agents] the chassis rows are told to dim before they have finished arriving");
    }
    if (GUTS_DIM <= 0 || GUTS_DIM >= 1) {
      throw new Error("[agents] the chassis rows dim to nothing, or do not dim at all");
    }

    for (const [i, row] of gutsRows.entries()) {
      /* The markup is the source of the copy and this file is the source of
         the geometry, so the two have to be checked against each other before
         anything is computed from either. */
      const baseline = GUTS_Y0 + i * GUTS_PITCH;
      if (
        Number(row.getAttribute("x")) !== GUTS_X ||
        Number(row.getAttribute("y")) !== baseline
      ) {
        throw new Error(`[agents] chassis row ${i + 1} disagrees with GUTS_X / GUTS_Y0 / GUTS_PITCH`);
      }

      const x0 = GUTS_X;
      const x1 = GUTS_X + monoWidth(row.textContent ?? "", GUTS_SIZE);
      const y0 = baseline - ROW_UP;
      const y1 = baseline + ROW_DOWN;

      if (y0 < SPINE_Y && x1 > lane) {
        throw new Error(`[agents] chassis row ${i + 1} reaches into the column the reply falls down`);
      }
      const nearestX = Math.max(x0, Math.min(BRAIN_CX, x1));
      const nearestY = Math.max(y0, Math.min(BRAIN_CY, y1));
      if (Math.hypot(nearestX - BRAIN_CX, nearestY - BRAIN_CY) < BRAIN_R + 4) {
        throw new Error(`[agents] chassis row ${i + 1} runs into the brain`);
      }
      /* And every row has to fit the chassis it is the inside of. */
      if (x0 < AGENT_X + 8 || x1 > AGENT_X + AGENT_W - 8) {
        throw new Error(`[agents] chassis row ${i + 1} runs past the chassis wall`);
      }
      if (y0 < AGENT_Y + 8 || y1 > AGENT_Y + AGENT_H - 8) {
        throw new Error(`[agents] chassis row ${i + 1} does not fit between the chassis walls`);
      }
    }
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
  /* And the boxes in the markup have to BE where this file says the column is.
     Everything below — the traces' landing points, the connector, the cluster's
     clearances — is computed from CARDS and APPROVE_Y, so a rect that drifted
     from them would make every assert in this section true about a drawing
     nobody is looking at. */
  {
    const drawn: readonly { el: SVGRectElement; y: number; h: number }[] = [
      ...cardBoxes.map((el, i) => ({ el, y: CARDS[i]!.y, h: CARDS[i]!.h })),
      { el: approveBox, y: APPROVE_Y, h: APPROVE_H },
    ];
    for (const [i, d] of drawn.entries()) {
      if (
        Number(d.el.getAttribute("x")) !== CARD_X ||
        Number(d.el.getAttribute("width")) !== CARD_W ||
        Number(d.el.getAttribute("y")) !== d.y ||
        Number(d.el.getAttribute("height")) !== d.h
      ) {
        throw new Error(`[agents] card ${i + 1} in the markup disagrees with the card column's constants`);
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

  /* ── the tool traces ────────────────────────────────────────────────────
     A trace is the only thing in this scene that joins two objects placed by
     two different hands — a latitude on the chassis's wall and the middle of a
     card's wall — and until the guarded-action cluster moved, nothing checked
     that it still reached either of them. It does now, at both ends and in
     four ways.

     ENDPOINTS ARE THE WHOLE CHECK, because of how the `d`s are authored: each
     is one cubic whose first control point carries its start's y and whose
     second carries its end's y, so both tangents are horizontal and the curve's
     y is bounded by its own two endpoints. A trace therefore cannot bulge
     across the spine between checks — the two points are the path. */
  for (const [i, t] of traces.entries()) {
    const card = CARDS[i]!;
    const wall = TRACE_OUT_Y[i]!;
    const mid = card.y + card.h / 2;
    const a = t.getPointAtLength(0);
    const b = t.getPointAtLength(t.getTotalLength());

    if (Math.abs(a.x - (AGENT_X + AGENT_W)) > 0.5 || Math.abs(a.y - wall) > 0.5) {
      throw new Error(`[agents] trace ${i + 1} does not leave the chassis wall at its own latitude`);
    }
    if (Math.abs(b.x - CARD_X) > 0.5 || Math.abs(b.y - mid) > 0.5) {
      throw new Error(`[agents] trace ${i + 1} does not land on the middle of card ${i + 1}'s wall`);
    }
    /* Out of the wall, not out of a corner. 12u is twice the box's own corner
       radius, which is the distance at which a line still reads as leaving a
       flat surface. */
    if (wall < AGENT_Y + 12 || wall > AGENT_Y + AGENT_H - 12) {
      throw new Error(`[agents] trace ${i + 1} leaves the chassis through a corner`);
    }
    /* And it stays on its card's own side of the spine. The answer's road is
       the one line the reader follows across the frame; a request crossing it
       would be a second road. */
    if ((wall < SPINE_Y) !== (mid < SPINE_Y)) {
      throw new Error(`[agents] trace ${i + 1} crosses the answer's road`);
    }
    const prev = TRACE_OUT_Y[i - 1];
    if (prev !== undefined && wall <= prev) {
      throw new Error(`[agents] trace ${i + 1} leaves the wall above the trace before it`);
    }
  }

  /* ── the guarded-action cluster ─────────────────────────────────────────
     Four objects that have to move as one, and the two relations that make
     them one: the annotation is PAIRED to the card under it, and the whole
     block is further from the lookup cards than any of its own parts are from
     each other. Both are arithmetic on the constants, and the second one is
     the user's complaint written down — the cluster used to sit 102u under
     card 2 and read as a third entry in the same log. */
  {
    const card2 = CARDS[1]!;
    const card3 = CARDS[2]!;
    if (Number(guard.getAttribute("x")) !== CARD_X || Number(guard.getAttribute("y")) !== GUARD_Y) {
      throw new Error("[agents] the guardrail annotation disagrees with CARD_X / GUARD_Y");
    }
    /* Baseline to the wall of the card it explains. Close enough to belong to
       it, far enough not to sit on it. */
    const pair = card3.y - GUARD_Y;
    if (pair < 4 || pair > 20) {
      throw new Error("[agents] the guardrail annotation has come unpaired from the card it explains");
    }
    /* 120, and the number is chosen the way the channel row's floor was: it has
       to REFUSE the arrangement we were just asked to leave. The annotation's
       em box used to clear card 2 by 102u; a floor that permits the defect is
       not a floor. */
    const top = GUARD_Y - GUARD_SIZE * 0.75;
    if (top - (card2.y + card2.h) < 120) {
      throw new Error("[agents] the guarded action has drifted back up into the lookup cards");
    }
    /* The annotation is the one string in the world wider than the card it
       belongs to, so it is the one that could reach the phone. */
    if (CARD_X + monoWidth(guard.textContent ?? "", GUARD_SIZE) > PHONE_X - 12) {
      throw new Error("[agents] the guardrail annotation runs into the phone");
    }
    /* The deepest object in the world, against the frame it is drawn in.
       .agt-svg fits the whole viewBox to the viewport, so a cluster that walked
       past 600 would not be clipped — it would be missing. */
    if (FRAME_H - (APPROVE_Y + APPROVE_H) < FRAME_FOOT_MIN) {
      throw new Error("[agents] the guarded-action cluster has walked off the bottom of the frame");
    }
    /* Going down put the approval card into the closing statement's band. They
       are two columns and never touch, but nothing in the system would notice
       them starting to: the statement's rule is what marks its column's width,
       and it is held off the card stack by the same 20u the channel row above
       it is held to. */
    const ruleEnd = closeRule.getPointAtLength(closeRule.getTotalLength());
    if (ruleEnd.x > CARD_X - 20) {
      throw new Error("[agents] the closing statement's column runs into the approval card");
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
    const ra = closeRule.getPointAtLength(0);
    if (Math.abs(ra.x - CAP_X) > 0.5 || Math.abs(ra.y - CLOSE_RULE_Y) > 0.5) {
      throw new Error("[agents] the closing rule disagrees with CAP_X / CLOSE_RULE_Y");
    }
    /* The two real captions still hang on the band above. They share the left
       column with the statement and never the frame, so what has to hold is
       only that they are a different latitude and the higher one — a caption
       drawn at the statement's y would be the scene contradicting itself about
       where its own margin note lives. */
    if (CAP_RULE_Y >= CLOSE_RULE_Y) {
      throw new Error("[agents] the captions no longer sit above the closing statement");
    }
    for (const [i, c] of caps.entries()) {
      const ca = c.rule.getPointAtLength(0);
      if (Math.abs(ca.x - CAP_X) > 0.5 || Math.abs(ca.y - CAP_RULE_Y) > 0.5) {
        throw new Error(`[agents] caption ${i + 1}'s rule disagrees with CAP_X / CAP_RULE_Y`);
      }
    }
    const rowTop = CHAN_BASE_Y - CHAN_SIZE * 0.36 - CHAN_GLYPH / 2;
    const rowBottom = rowTop + CHAN_GLYPH;
    if (CLOSE_RULE_Y - rowBottom < 12) {
      throw new Error("[agents] the channel row is sitting on its own rule");
    }
    /* 40, not the 12 this started at. The whole point of moving the block was
       that 14u read as "attached to the chassis" (user call), so the floor has
       to be a number that refuses the arrangement we were just asked to leave
       — a floor that permits the defect is not a floor. */
    if (rowTop - (AGENT_Y + AGENT_H) < 40) {
      throw new Error("[agents] the channel row has drifted back up under the chassis");
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
    const rowEnd = B4_CHANNELS + (CHANNELS.length - 1) * CHAN_STEP + CHAN_FADE;
    const lastCaption = CAPS[CAPS.length - 1]!;
    if (B4_CHANNELS < lastCaption.out + CAP_TEXT_OUT) {
      throw new Error("[agents] the closing statement arrives while the last caption is still leaving");
    }
    if (B4_CHANNELS > CLOSE_AT) {
      throw new Error("[agents] the channel row follows its own sentence instead of leading it");
    }
    if (rowEnd > CLOSE_AT + CAP_TEXT_IN + 0.6) {
      throw new Error("[agents] the channel row is still assembling after its sentence has landed");
    }
    /* The statement is the last thing the scene builds before the door, and it
       has to be standing by the time the held ending starts — it is what the
       reader is meant to be able to stop and read. */
    if (CLOSE_AT + 0.25 + CAP_TEXT_IN > HOLD_FROM) {
      throw new Error("[agents] the closing statement is still arriving inside the held ending");
    }
  }

  /* ── the receipt pair's window ──────────────────────────────────────
     A string that leaves has to have been readable first, and "readable" here
     is a distance in scroll rather than a feeling: RCP_WINDOW_MIN units with
     the line standing still and nothing else arriving on top of it. The two
     have different windows because the event line stamps after the receipt it
     annotates, so both are checked. */
  {
    const receiptUp = B4_RECEIPT + 0.6;
    const evtUp = B4_EVT + 1.0;
    if (RCP_OUT - receiptUp < RCP_WINDOW_MIN || RCP_OUT - evtUp < RCP_WINDOW_MIN) {
      throw new Error("[agents] the delivery receipt leaves before anyone could have read it");
    }
    if (RCP_OUT < B4_LAND) {
      throw new Error("[agents] the receipt leaves before the delivery it is a receipt for");
    }
    /* They are the last thing in the scene that ever leaves. */
    if (RCP_OUT + RCP_OUT_DUR > HOLD_FROM) {
      throw new Error("[agents] the receipt is still leaving inside the held ending");
    }
  }

  /* Captions and the receipt pair are the only things in this scene that ever
     leave; the receipt's bound is checked above, and this is the captions'.
     The closing statement is deliberately not in either list — it stays. */
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
     them and run further at the machine end, into the BRAIN itself — a guide
     that stopped at the box's wall would make the last leg of each journey a
     jump. The route in is now a plain vertical: the wire comes down at the
     brain's own centre line, so the reply falls into the thing that thinks
     without turning a corner or crossing a single row of the chassis. A packet
     in this scene never crosses drawn ink, and the boot asserts are what keep
     that true when somebody edits a row. */
  gIn.setAttribute("d", `M ${IN_X} 0 L ${IN_X} ${BRAIN_CY}`);
  gOut.setAttribute("d", `M ${BRAIN_CX} ${BRAIN_CY} L ${PHONE_X} ${SPINE_Y}`);

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
    return { box, tick, word, evidence, at: qy.at };
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
    brain,
    brainOut,
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
    closeText,
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
    /* The memory close-up fully folded: curves at zero length, labels dark,
       the checklist at scale 1 about the pivot it will use, every row and the
       stage at full ink. */
    gsap.set([...memCurves, ...grdCurves, guaCurve], { drawSVG: "0% 0%" });
    gsap.set([...memLabels], { opacity: 0 });
    gsap.set([...grdLabels, guaLabel], { opacity: 0 });
    gsap.set(cam, { scale: 1, x: 0, y: 0, transformOrigin: "0px 0px" });
    gsap.set(svg, { opacity: 1 });
    gsap.set(rulesG, { opacity: 1 });
    gsap.set(
      rows.flatMap((r) => [r.word, r.box]),
      { opacity: 1 },
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
    /* The closing statement rests exactly as a caption does — it is only its
       exit that differs, and a rest state owes an inverse for the way in. */
    gsap.set(closeRule, { drawSVG: "50% 50%" });
    gsap.set(closeText, { y: CAP_RISE, scaleX: CAP_TRACK, transformOrigin: "0% 50%" });
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
      x: BRAIN_CX,
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
    /* The brain is DRAWN, a beat after the chassis closes and before its
       contents arrive: it is a peer object, not a detail, and the reader has
       to see the chassis get its brain before the reply falls into it. */
    draw(brain, B1_BRAIN, 1.0);
    draw(brainOut, B1_BRAIN + 0.9, 0.4);
    /* And the chassis's rows come up as ONE fade: what the machine owns is one
       fact, not three events, and lines fading in sequence would be the reader
       counting instead of reading. Same call scene 3 makes about its
       miniature — a machine glimpsed inside a window either is there or is
       not. */
    fadeIn(guts, B1_GUTS, 1.4);
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
    /* THE CHASSIS STEPS BACK. The rows have had the whole of beat 1 at
       reading weight, which is the beat they are the subject of; the instant
       the first trace starts drawing out of the wall they drop to a whisper
       and stay there. It is one tween, explicit at both ends, so scrubbing
       back up brings the list to full ink again exactly where it dimmed — the
       box does not "remember" that it has spoken. */
    ft(guts, { opacity: 1 }, { opacity: GUTS_DIM, duration: 1.8 }, B2_T1);

    draw(traces[0]!, B2_T1, 2.0);
    drawBox(cardBoxes[0]!, B2_C1, 2.0);
    fadeIn(cardTitles[0]!, B2_C1_TITLE, 1.0);
    fadeIn(cardResults[0]!, B2_C1_RESULT, 1.2);

    /* ── the memory close-up ─────────────────────────────────────────────
       The world yields, the rail speaks: three curves out of the remembers
       row, one memory at a time, then the whole aside folds away and the
       scene picks its sentence back up. Every move is an explicit pair, so
       scrubbing back re-dims, re-scales and re-folds in reverse order. */
    {
      const others = rows.filter((_, i) => i !== 1).flatMap((r) => [r.word, r.box]);
      ft(svg, { opacity: 1 }, { opacity: MEM_STAGE_DIM, duration: 0.7 }, MEM_IN);
      ft(cam, { scale: 1, x: 0, y: 0 }, { scale: MEM_SCALE, x: camX(MEM_ORIGIN_Y), y: camY(MEM_ORIGIN_Y), duration: 0.9, ease: "power2.inOut", transformOrigin: "0px 0px" }, MEM_IN);
      ft(others, { opacity: 1 }, { opacity: MEM_ROW_DIM, duration: 0.7 }, MEM_IN);
      ft(rulesG, { opacity: 1 }, { opacity: MEM_ROW_DIM, duration: 0.7 }, MEM_IN);
      ft(title, { opacity: 1 }, { opacity: MEM_TITLE_DIM, duration: 0.7 }, MEM_IN);
      MEM_CURVES.forEach((at, i) => {
        draw(memCurves[i]!, at, MEM_CURVE_DRAW);
        fadeIn(memLabels[i]!, at + MEM_LABEL_LAG, 0.6);
      });
      ft(memCurves, { drawSVG: "0% 100%" }, { drawSVG: "0% 0%", duration: 0.8, ease: "power2.in" }, MEM_OUT);
      ft(memLabels, { opacity: 1 }, { opacity: 0, duration: 0.6 }, MEM_OUT);
      ft(svg, { opacity: MEM_STAGE_DIM }, { opacity: 1, duration: 0.8 }, MEM_FOCUS_OUT);
      ft(cam, { scale: MEM_SCALE, x: camX(MEM_ORIGIN_Y), y: camY(MEM_ORIGIN_Y) }, { scale: 1, x: 0, y: 0, duration: 0.8, ease: "power2.inOut", transformOrigin: "0px 0px" }, MEM_FOCUS_OUT);
      ft(others, { opacity: MEM_ROW_DIM }, { opacity: 1, duration: 0.8 }, MEM_FOCUS_OUT);
      ft(rulesG, { opacity: MEM_ROW_DIM }, { opacity: 1, duration: 0.8 }, MEM_FOCUS_OUT);
      ft(title, { opacity: MEM_TITLE_DIM }, { opacity: 1, duration: 0.8 }, MEM_FOCUS_OUT);
    }

    draw(traces[1]!, B2_T2, 1.8);
    drawBox(cardBoxes[1]!, B2_C2, 1.8);
    fadeIn(cardTitles[1]!, B2_C2_TITLE, 1.0);
    fadeIn(cardResults[1]!, B2_C2_RESULT, 1.2);

    /* -- the grounded close-up -------------------------------------------
       The memory aside's sibling at the grounded tick -- same choreography,
       different pivot and different truth: tools, documents, honesty. Rows
       other than row 3 recede this time. */
    {
      const others = rows.filter((_, i) => i !== 2).flatMap((r) => [r.word, r.box]);
      ft(svg, { opacity: 1 }, { opacity: MEM_STAGE_DIM, duration: 0.7 }, GRD_IN);
      ft(cam, { scale: 1, x: 0, y: 0 }, { scale: MEM_SCALE, x: camX(GRD_ORIGIN_Y), y: camY(GRD_ORIGIN_Y), duration: 0.9, ease: "power2.inOut", transformOrigin: "0px 0px" }, GRD_IN);
      ft(others, { opacity: 1 }, { opacity: MEM_ROW_DIM, duration: 0.7 }, GRD_IN);
      ft(rulesG, { opacity: 1 }, { opacity: MEM_ROW_DIM, duration: 0.7 }, GRD_IN);
      ft(title, { opacity: 1 }, { opacity: MEM_TITLE_DIM, duration: 0.7 }, GRD_IN);
      GRD_CURVES.forEach((at, i) => {
        draw(grdCurves[i]!, at, MEM_CURVE_DRAW);
        fadeIn(grdLabels[i]!, at + MEM_LABEL_LAG, 0.6);
      });
      ft(grdCurves, { drawSVG: "0% 100%" }, { drawSVG: "0% 0%", duration: 0.8, ease: "power2.in" }, GRD_OUT);
      ft(grdLabels, { opacity: 1 }, { opacity: 0, duration: 0.6 }, GRD_OUT);
      ft(svg, { opacity: MEM_STAGE_DIM }, { opacity: 1, duration: 0.8 }, GRD_FOCUS_OUT);
      ft(cam, { scale: MEM_SCALE, x: camX(GRD_ORIGIN_Y), y: camY(GRD_ORIGIN_Y) }, { scale: 1, x: 0, y: 0, duration: 0.8, ease: "power2.inOut", transformOrigin: "0px 0px" }, GRD_FOCUS_OUT);
      ft(others, { opacity: MEM_ROW_DIM }, { opacity: 1, duration: 0.8 }, GRD_FOCUS_OUT);
      ft(rulesG, { opacity: MEM_ROW_DIM }, { opacity: 1, duration: 0.8 }, GRD_FOCUS_OUT);
      ft(title, { opacity: MEM_TITLE_DIM }, { opacity: 1, duration: 0.8 }, GRD_FOCUS_OUT);
    }

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

    /* -- the guarded footnote --------------------------------------------
       One curve, not a fan: the stage already told guarded's story; this is
       the footnote naming the fences the story did not need -- and the line
       under the bar is the deepest claim on the page. Same camera, fourth
       row's pivot. */
    {
      const others = rows.filter((_, i) => i !== 3).flatMap((r) => [r.word, r.box]);
      ft(svg, { opacity: 1 }, { opacity: MEM_STAGE_DIM, duration: 0.7 }, GUA_IN);
      ft(cam, { scale: 1, x: 0, y: 0 }, { scale: MEM_SCALE, x: camX(GUA_ORIGIN_Y), y: camY(GUA_ORIGIN_Y), duration: 0.9, ease: "power2.inOut", transformOrigin: "0px 0px" }, GUA_IN);
      ft(others, { opacity: 1 }, { opacity: MEM_ROW_DIM, duration: 0.7 }, GUA_IN);
      ft(rulesG, { opacity: 1 }, { opacity: MEM_ROW_DIM, duration: 0.7 }, GUA_IN);
      ft(title, { opacity: 1 }, { opacity: MEM_TITLE_DIM, duration: 0.7 }, GUA_IN);
      draw(guaCurve, GUA_CURVE, MEM_CURVE_DRAW);
      fadeIn(guaLabel, GUA_CURVE + MEM_LABEL_LAG, 0.6);
      ft(guaCurve, { drawSVG: "0% 100%" }, { drawSVG: "0% 0%", duration: 0.8, ease: "power2.in" }, GUA_OUT);
      ft(guaLabel, { opacity: 1 }, { opacity: 0, duration: 0.6 }, GUA_OUT);
      ft(svg, { opacity: MEM_STAGE_DIM }, { opacity: 1, duration: 0.8 }, GUA_FOCUS_OUT);
      ft(cam, { scale: MEM_SCALE, x: camX(GUA_ORIGIN_Y), y: camY(GUA_ORIGIN_Y) }, { scale: 1, x: 0, y: 0, duration: 0.8, ease: "power2.inOut", transformOrigin: "0px 0px" }, GUA_FOCUS_OUT);
      ft(others, { opacity: MEM_ROW_DIM }, { opacity: 1, duration: 0.8 }, GUA_FOCUS_OUT);
      ft(rulesG, { opacity: MEM_ROW_DIM }, { opacity: 1, duration: 0.8 }, GUA_FOCUS_OUT);
      ft(title, { opacity: MEM_TITLE_DIM }, { opacity: 1, duration: 0.8 }, GUA_FOCUS_OUT);
    }

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
    fadeIn(evt, B4_EVT, 1.0);
    /* And then they go. The pair arrived together and leaves together, because
       they are one stamp read at two rungs — a receipt whose event line
       outlived it would be half a thought left on the frame. */
    fadeOut(receipt, RCP_OUT, RCP_OUT_DUR);
    fadeOut(evt, RCP_OUT, RCP_OUT_DUR);
    /* And the four channels the SAME agent would have answered on — now the
       first half of caption 3 rather than a label beside the phone. The marks
       come in left to right, a beat ahead of the rule and two ahead of the
       words, so the reader meets the picture and is then told what it means.

       AND THEY STAY, with the sentence they belong to. That is why the block
       moved off the glass: the glass's contract is that its contents are not
       in the finished frame, and this claim is (user call). */
    chanItems.forEach((item, i) => {
      fadeIn(item, B4_CHANNELS + i * CHAN_STEP, CHAN_FADE);
    });
    /* The rule and the words that finish the statement, built exactly the way
       a caption is built and then left alone. No exit tween on any of the three
       parts, which is the entire difference between this and the two real
       captions above it. */
    ft(
      closeRule,
      { drawSVG: "50% 50%" },
      { drawSVG: "0% 100%", duration: CAP_RULE_IN, ease: "power2.out" },
      CLOSE_AT,
    );
    ft(
      closeText,
      { opacity: 0, y: CAP_RISE, scaleX: CAP_TRACK },
      { opacity: 1, y: 0, scaleX: 1, duration: CAP_TEXT_IN, ease: "power2.out", transformOrigin: "0% 50%" },
      CLOSE_AT + 0.25,
    );

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
