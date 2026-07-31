/* ══════════════════════════════════════════════════════════════════════════
   SCENE 3 — THE TURN
   ──────────────────────────────────────────────────────────────────────────
   One composition, pinned, scrubbed over one and a half viewport heights, in
   three beats:

     1  THE DELIVERY   where scene 2 ended, compressed into three objects: the
                       whole engine as one chip, one wire, one message card. A
                       green packet leaves the chip, lands on the card, and the
                       receipt says the thing every other notification product
                       says last — delivered.
     2  THE REPLY      a field opens under the message and a human types into
                       it, one character at a time. This is the first human act
                       on the page, so it gets the slowest beat in the scene:
                       twenty-two characters over a third of a screen of
                       scroll. Nothing else moves while it happens.
     3  THE REVERSAL   the reply collapses into a single dot, steps out of the
                       field, and STOPS — a turn is a decision and a decision
                       has a pause in it — then runs the delivery wire
                       backwards into the engine. The chip acknowledges in
                       NEUTRAL ink: this message is the user's, not ours, and
                       green on this site means one of ours arrived (BRAND §2).
                       The scene ends held on that frame rather than fading:
                       the cliffhanger scene 4 picks up is a conversation that
                       is still open.

   It obeys engine.ts's four rules — one scrubbed timeline with no .set() or
   .call() in it, every tween a fromTo with immediateRender:false, CSS painting
   the finished frame and restState() inverting it, and transform/opacity/
   stroke/drawSVG only. One of them takes a new form here and is worth naming:
   the typed reply never mutates textContent, because a string that was
   appended to cannot be un-appended by a reverse pass. Every character is its
   own element, authored once, revealed by opacity.

   Nothing in this scene scales, so the non-scaling-stroke dasharray trap
   (DESIGN §3) is out of reach; the butt-linecap law still applies and every
   stroke here inherits it from the .eng-* classes it borrows.

   Constants first, with the arithmetic, same as engine.ts.
   ══════════════════════════════════════════════════════════════════════════ */

import { gsap } from "gsap";

/* ══════════════════════════════════════════════════════════════════════════
   TUNING CONSTANTS  —  change these, not the code below
   ══════════════════════════════════════════════════════════════════════════ */

/* ── The scrub window ──────────────────────────────────────────────────────
   Same arithmetic as scene 2: the number that matters is SCROLL PER TIMELINE
   UNIT, and 1.5 / 60 = 0.025 viewport heights sits just above the 0.020 scene
   2 settled on. Below ~0.02 the typing beat becomes a flicker. 1.5 screens is
   the whole argument for the length — this scene is one sentence ("and then it
   comes back"), and a pinned section that outstays its sentence is the reason
   readers learn to scroll past pinned sections. */
const PIN_HEIGHTS = 1.5;
const TL_END = 60;

/** Scrub catch-up, in seconds. Matched to scene 2 on purpose — the two
 *  sections are read in one continuous scroll and a change of scrub feel
 *  between them reads as the page stuttering, not as a new scene. */
const SCRUB = 0.55;

/* Beat boundaries, in timeline units. The split is 18 / 20 / 22 and it is not
   even by accident: beat 1 is RECAP, and a machine the reader has already
   toured only has to be recognised; beat 2 is the human, and per word it is
   the slowest thing on the page; beat 3 carries the turn, the travel and the
   ending frame, and the ending frame is six units of nothing on purpose. */
const BEAT_1 = 0;
const BEAT_2 = 18;
const BEAT_3 = 38;

/* ── The composition ───────────────────────────────────────────────────────
   1200 × 400, one static frame, no camera. Everything is hung off ONE
   horizontal: WIRE_Y is the spine, and the chip, the wire and the card are all
   centred on it, so the delivery is a straight line across the frame and the
   reply is the only thing in the scene that happens below it. That is the
   whole diagram: out is level, back is a step down and then level again. */
const WIRE_Y = 156;

/** The engine chip — the entire machine from scene 2 as one hairline box, with
 *  no internals. Its interior is left empty because the inbound dot comes to
 *  rest in the middle of it, which is a sentence a box with a label in the
 *  middle of it cannot say; the label sits ABOVE the box instead, the same
 *  place scene 2 puts "queue". */
const CHIP_X = 90;
const CHIP_W = 170;
const CHIP_CX = CHIP_X + CHIP_W / 2;

/** The wire, end to end. Chip's right edge to the card's left edge — it
 *  touches both, so nothing in this scene flies over a gap. */
const WIRE_X0 = CHIP_X + CHIP_W;
const WIRE_X1 = 720;

/** The message card. 16px radius because BRAND §4 gives cards 16 and chips 6,
 *  and the difference between the two shapes is doing real work here: the
 *  engine is infrastructure, the message is a thing a person received. */
const CARD_X = WIRE_X1;
const CARD_W = 400;
const CARD_PAD = 24;
/** Where every line inside the card and the field starts. */
const TEXT_X = CARD_X + CARD_PAD;

/** The reply field. Same width, 6px radius (it is an input), hung under the
 *  card on a 28u tether — scene 2's workflow-inlet vocabulary. */
const REPLY_Y = 234;
const REPLY_H = 60;
/** The typed reply's baseline, and the y every beat-3 traveller starts at. */
const REPLY_BASE_Y = 270;

/* ── The typed reply ───────────────────────────────────────────────────────
   Pre-split into one <text> per character, positioned by us rather than by the
   text layout engine. Two reasons, and the first is the load-bearing one:

     · a per-character reveal has to be REVERSIBLE, and the only way to reverse
       "type a string" is to never have typed it — every glyph exists from the
       first frame and the timeline only ever changes its opacity;
     · placing each glyph at an explicit x means the block cursor's position is
       arithmetic (TEXT_X + n · CHAR_W) instead of a measurement, so it can be
       tweened as a stepped sequence that is exact at every scrub position and
       does not depend on the web font having loaded when the scene booted.

   CHAR_W is the mono advance at this size: 15u × (0.6em + the 0.01em tracking
   the rest of the scene's mono runs at). Geist Mono is a 0.6em monospace, so
   the reply sits on the same rhythm as the message above it. */
const REPLY_TEXT = "it hasn't arrived yet?";
const CHAR_W = 15 * 0.61;

/** The block cursor. Narrower than the cell by half a pixel of air so it never
 *  touches the glyph behind it, and no blink — an infinite loop inside a
 *  scrubbed timeline is a state that survives a reverse pass (DESIGN §3, and
 *  §7 on infinite micro-animations). It is present or it is not. */
const CURSOR_W = 8.4;

/* ── The route out, and the route back ─────────────────────────────────────
   A ROUTE and a LINE are two different objects, exactly as in scene 2. The
   reader sees one wire; the packets fly on guides that lie on top of it and
   run 85u further at the chip end, into the middle of the box, because a guide
   that stopped at the wall would make the last leg of the journey a jump.

   The return has an elbow in it, because the reply is 114u below the spine. It
   leaves the field's left wall heading left, climbs, and merges onto the wire
   heading left — both tangents horizontal, so the dot never appears to turn a
   corner, it appears to step up onto the line. RETURN_JOIN_X is where it does
   so: 100u clear of the card, which is the only air the climb has. */
const STEP_OUT_X = 700;
const RETURN_JOIN_X = 620;

/* ── Beat 1 · the delivery ─────────────────────────────────────────────── */
const B1_CHIP = 0.6;
const B1_WIRE = 2.2;
const B1_CARD = 3.4;
/** When the packet appears in the chip, and how long the crossing takes. 3.6
 *  units ≈ 0.09 viewport heights: slow enough to be a journey, quick enough
 *  that the reader is not waiting for a dot they have already understood. */
const B1_FLY = 7.4;
const B1_FLY_DUR = 3.6;
const B1_LAND = B1_FLY + B1_FLY_DUR;

/* ── Beat 2 · the reply ────────────────────────────────────────────────── */
const B2_FIELD = BEAT_2 + 0.4;
/** The cursor arrives before the first character and sits there for most of a
 *  unit. That gap is the beat: something is about to be said by a person. */
const B2_CURSOR = 21.2;
const TYPE_T0 = 22.6;
/** Scroll per character. 0.52 units = 0.013 viewport heights, so the whole
 *  sentence costs about a third of a screen — the slowest thing on the page,
 *  which is the correct price for the only human act on it. Under ~0.3 the
 *  reply appears rather than being typed; over ~0.7 the reader starts to
 *  wonder whether the page has stopped. */
const CHAR_STEP = 0.52;
const CHAR_FADE = 0.14;

/* ── Beat 3 · the reversal ─────────────────────────────────────────────── */
const B3_COLLAPSE = BEAT_3;
const B3_STEP = 39.9;
const B3_STEP_DUR = 1.3;
/** THE PAUSE. The dot stands outside the field, committed to nothing, for 2.4
 *  units — a fifth of a screen of scroll in which the page does nothing at
 *  all. Without it the reply ricochets off the card; with it, the message
 *  decides to go back. TURN_PAUSE_MIN refuses to boot if an edit takes it. */
const B3_COMMIT = 43.6;
const TURN_PAUSE_MIN = 1.5;
const B3_RUN_DUR = 7.2;
const B3_LAND = B3_COMMIT + B3_RUN_DUR;

/** Packet radius. 4.5u, the same dot as the hero's clapper ball and scene 2's
 *  packets — the third scene in a row is not the place to invent a new one. */
const DOT_R = 4.5;

/* The still fallback's windows: "x y w h" in scene units, one per beat, each
   cut so its own mono text clears ~11px on a 380px-wide phone. The captions
   live here rather than in the markup because this scene has no caption rail —
   the scrubbed version says all of this with receipts inside the drawing, so a
   hidden block in index.html would be markup that is never rendered as itself. */
const STILL_WHOLE = "0 80 1200 240";
const STILL_VIEW = [
  {
    phase: "delivery",
    kicker: "the delivery",
    text: "One event out, delivered on the channel it was addressed to, with a receipt.",
    /* Bottom edge at y 212, six units under the card: one unit further and the
       reply field's own label bleeds into a card that is about the delivery. */
    box: "700 90 440 122",
  },
  {
    phase: "reply",
    kicker: "the reply",
    text: "Your user answers the notification itself. No dashboard, no support ticket.",
    box: "700 210 440 96",
  },
  {
    phase: "turn",
    kicker: "the turn",
    text: "The answer runs back down the same wire, into the engine. The conversation is open.",
    box: "56 96 360 152",
  },
] as const;

const COLOR = {
  green: "#3dd68c",
  greenDim: "#2ba36c",
  text: "#ededed",
  hairline: "#262626",
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
  const chip = q<SVGRectElement>(svg, "#trn-chip");
  const chipLabel = q<SVGTextElement>(svg, "#trn-chip-label");
  const markIn = q<SVGCircleElement>(svg, "#trn-mark-in");
  const stampIn = q<SVGTextElement>(svg, "#trn-stamp-in");
  const wire = q<SVGPathElement>(svg, "#trn-wire");
  const card = q<SVGRectElement>(svg, "#trn-card");
  const msg = q<SVGTextElement>(svg, "#trn-msg");
  const receipt = q<SVGTextElement>(svg, "#trn-receipt");
  const tether = q<SVGPathElement>(svg, "#trn-tether");
  const field = q<SVGRectElement>(svg, "#trn-reply");
  const fieldLabel = q<SVGTextElement>(svg, "#trn-reply-label");
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

  /* The reply has to have finished being typed before beat 3 collapses it. It
     is the one place in the scene where two beats share a boundary and the
     later one destroys what the earlier one built. */
  const TYPE_END = TYPE_T0 + (REPLY_TEXT.length - 1) * CHAR_STEP + CHAR_FADE;
  if (TYPE_END > BEAT_3) {
    throw new Error("[turn] the reply is still being typed when beat 3 collapses it");
  }

  /* The turn is a decision, not a bounce. See B3_COMMIT. */
  if (B3_COMMIT - (B3_STEP + B3_STEP_DUR) < TURN_PAUSE_MIN) {
    throw new Error("[turn] the reply turns around without stopping — that is a bounce");
  }

  /* The reply plus its cursor has to fit between the field's own walls. The
     text is placed by arithmetic rather than laid out, so nothing else would
     ever notice it running past the edge. */
  if (TEXT_X + (REPLY_TEXT.length + 1) * CHAR_W > CARD_X + CARD_W - CARD_PAD) {
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

  /* ════════════════════════════════════════════════════════════════════════
     GENERATED DOM
     The two flight routes and the twenty-two characters of the reply. Written
     from the constants above so the markup can never drift from them.
     ════════════════════════════════════════════════════════════════════════ */

  gSend.setAttribute("d", `M ${CHIP_CX} ${WIRE_Y} L ${WIRE_X1} ${WIRE_Y}`);
  gStep.setAttribute("d", `M ${TEXT_X} ${REPLY_BASE_Y} L ${STEP_OUT_X} ${REPLY_BASE_Y}`);
  /* The climb, then the wire, then the last 85u into the middle of the chip —
     one continuous route, because the whole point of the beat is that the
     message does not stop between the card and the engine. The straight run
     lies exactly on #trn-wire (asserted above), so the reader sees the packet
     riding the line it was delivered on, backwards. */
  gBack.setAttribute(
    "d",
    `M ${STEP_OUT_X} ${REPLY_BASE_Y} C 664 ${REPLY_BASE_Y} 660 ${WIRE_Y} ${RETURN_JOIN_X} ${WIRE_Y} L ${CHIP_CX} ${WIRE_Y}`,
  );

  const chars = Array.from(REPLY_TEXT, (ch, i) => {
    const t = svgEl("text", {
      class: "trn-char",
      x: (TEXT_X + i * CHAR_W).toFixed(2),
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

  /** Everything traced rather than faded. */
  const strokeParts: SVGGeometryElement[] = [chip, wire, card, tether, field];
  /** Everything that only ever fades. */
  const fadeParts: SVGElement[] = [chipLabel, markIn, stampIn, msg, receipt, fieldLabel];

  /* ════════════════════════════════════════════════════════════════════════
     REST STATE — the inverse of the stylesheet
     ════════════════════════════════════════════════════════════════════════ */

  function restState(): void {
    gsap.set(pin, { opacity: 0 });
    gsap.set(progressFill, { scaleX: 0 });
    gsap.set(strokeParts, { drawSVG: "0% 0%" });
    gsap.set([chip, card, field], { fillOpacity: 0, stroke: COLOR.hairline });
    gsap.set(fadeParts, { opacity: 0 });
    gsap.set(chars, { opacity: 0 });
    /* The group scales about the head of the sentence, not its middle: the
       reply collapses back to where it started being written. */
    gsap.set(charsG, { scale: 1, svgOrigin: `${TEXT_X} ${REPLY_BASE_Y}` });
    gsap.set(cursor, { opacity: 0, x: 0 });
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
      x: TEXT_X,
      y: REPLY_BASE_Y,
      transformOrigin: "50% 50%",
    });
  }

  /* ════════════════════════════════════════════════════════════════════════
     THE STILL STATE  (< 768px, and prefers-reduced-motion)
     Same information, delivered by layout instead of by time (DESIGN §3).
     ════════════════════════════════════════════════════════════════════════ */

  function buildStill(reduced: boolean): () => void {
    const frag = doc.createDocumentFragment();

    /* `phase` decides which marks the figure shows. Only one thing in this
       scene needs it — the typed reply, which is not in the finished frame
       (see .trn-char in styles.css) and has to be put back for the two figures
       whose whole job is to show it. */
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

    function block(kicker: string, text: string): HTMLElement {
      const el = doc.createElement("div");
      el.className = "eng-card";
      const k = doc.createElement("span");
      k.className = "eng-kicker";
      k.textContent = kicker;
      const p = doc.createElement("p");
      p.className = "eng-caption";
      p.textContent = text;
      el.append(k, p);
      return el;
    }

    if (reduced) {
      /* One finished frame, then the argument as a list. Reduced motion is a
         designed still state, so the reader still gets all three beats — the
         drawing carries beat 1 and beat 3's marks, the captions carry the
         order they happened in. */
      const lede = doc.createElement("p");
      lede.className = "eng-still-lede";
      lede.textContent = "The user replies, and the reply comes back in.";
      frag.append(lede, figure(STILL_WHOLE, "all"));
      for (const v of STILL_VIEW) frag.appendChild(block(v.kicker, v.text));
    } else {
      /* One card per beat, each a close-up: the whole 1030u composition on a
         phone is three illegible mono labels. */
      for (const v of STILL_VIEW) {
        const el = block(v.kicker, v.text);
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

    /** A box acknowledging something that just landed on it: its hairline
     *  lifts to `ink` and settles back. A moment, never a state — which is the
     *  only reason a green border is allowed to exist at all (BRAND §2). */
    const ack = (box: Element, at: number, ink: string): void => {
      ft(box, { stroke: COLOR.hairline }, { stroke: ink, duration: 0.2, ease: "power2.out" }, at);
      ft(box, { stroke: ink }, { stroke: COLOR.hairline, duration: 1.8 }, at + 0.6);
    };

    /* How much of the pin is left. A pinned section takes the scrollbar away
       from the reader; this hands the information back. */
    ft(progressFill, { scaleX: 0 }, { scaleX: 1, duration: TL_END }, 0);

    /* ── BEAT 1 · the delivery ───────────────────────────────────────────
       The anatomy assembles left to right, in the order a message travels it:
       the machine, then the road, then the destination. */
    drawBox(chip, B1_CHIP, 2.4);
    fadeIn(chipLabel, B1_CHIP + 1.2, 1.1);
    draw(wire, B1_WIRE, 2.6);
    drawBox(card, B1_CARD, 3.0);

    fadeIn(dotOut, B1_FLY - 0.4, 0.5);
    run(dotOut, gSend, B1_FLY, B1_FLY_DUR, "power1.inOut");

    /* The delivery. Dim green to full green at the instant of arrival — a
       packet that was born green has nothing left to say when it lands. */
    ft(dotOut, { fill: COLOR.greenDim }, { fill: COLOR.green, duration: 0.14 }, B1_LAND);
    pop(dotOut, B1_LAND, 1.45);
    fadeOut(dotOut, B1_LAND + 0.7, 0.8);
    ack(card, B1_LAND, COLOR.greenDim);

    /* And what the delivery leaves behind: the message, then its receipt. In
       that order and half a unit apart, because the receipt is an answer to
       the message having arrived, not part of it. */
    fadeIn(msg, B1_LAND + 0.5, 1.2);
    fadeIn(receipt, B1_LAND + 2.0, 1.1);

    /* ── BEAT 2 · the reply ──────────────────────────────────────────────
       A field opens under the message, a cursor appears in it, and then
       nothing on screen moves except twenty-two characters. */
    draw(tether, B2_FIELD, 0.9);
    drawBox(field, B2_FIELD + 0.5, 2.2);
    fadeIn(fieldLabel, B2_FIELD + 1.2, 1.0);

    fadeIn(cursor, B2_CURSOR, 0.7);

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

    /* ── BEAT 3 · the reversal ───────────────────────────────────────────
       Note for note the dedupe dissolve from scene 2 — shrink under power2.in,
       fade — because it is the same kind of claim: this text stops being text
       and becomes one thing the engine can carry. */
    ft(
      charsG,
      { scale: 1 },
      /* svgOrigin restated on the tween as well as in restState: gsap
         re-derives an SVG element's transform origin whenever it rebuilds the
         transform cache, and a collapse that silently re-pivots to the middle
         of the sentence is a collapse toward a point no dot ever appears at. */
      { scale: 0.55, duration: 1.3, ease: "power2.in", svgOrigin: `${TEXT_X} ${REPLY_BASE_Y}` },
      B3_COLLAPSE,
    );
    fadeOut(chars, B3_COLLAPSE, 0.9);
    fadeOut(cursor, B3_COLLAPSE, 0.5);
    fadeIn(dotIn, B3_COLLAPSE + 0.6, 0.5);

    /* Out through the field's left wall, and then STOP. The pause is not a
       gap in the storyboard; it is the beat the whole scene turns on. */
    run(dotIn, gStep, B3_STEP, B3_STEP_DUR, "power2.out");
    run(dotIn, gBack, B3_COMMIT, B3_RUN_DUR, "power1.inOut");

    /* The engine hears it. NEUTRAL ink and no green anywhere in this beat:
       green is a message of ours arriving, and this one is the user's. */
    pop(dotIn, B3_LAND, 1.35);
    ack(chip, B3_LAND, COLOR.text);

    /* The traveller goes, the mark it left stays — same handoff as scene 2's
       timeline strip, and for the same reason: what the engine heard has to
       still be on screen for a reader who arrives after the motion, and for a
       reader whose browser never plays it at all. */
    fadeIn(markIn, B3_LAND + 0.5, 0.45);
    fadeOut(dotIn, B3_LAND + 0.8, 0.45);

    /* The cliffhanger, stamped in the engine's own corner. Scene 4 opens on
       what the engine does about it. Nothing fades out after this: the last
       six units of the scrub are the reader sitting with the final frame. */
    fadeIn(stampIn, B3_LAND + 1.8, 1.4);
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
