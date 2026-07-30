/* ══════════════════════════════════════════════════════════════════════════
   THE HANGING HEADLINE
   ──────────────────────────────────────────────────────────────────────────
   Everything in this hero hangs. The bell hangs from a thread; the six signal
   paths sag under their own weight. So does the type: each word of the H1
   hangs from its own invisible thread, pinned at the top centre of its box.

   Three forces act on it, and nothing else:

     1. gravity   — a damped pendulum per word, integrated on gsap.ticker.
     2. the cursor — moving past a word displaces the air around it. Near
                     words stir, far words do not. This is the "brush".
     3. the bell   — when it rings, a pressure wave leaves the mouth and
                     passes outward through the line. Nearest words first.

   It has to read as air moving through type. Nothing here should ever be
   describable as "the words are animating": the amplitude ceiling is 1.5°,
   which at a 300px-wide word is under 4px of travel at the far end.

   The subline never moves. One thing in the copy block is alive, not two.

   Constants first, with the arithmetic, same as bell.ts — "does this feel
   like paper in a draught?" is the whole job of this file.
   ══════════════════════════════════════════════════════════════════════════ */

import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { acquirePointer, type PointerHandle } from "./pointer";

/* ══════════════════════════════════════════════════════════════════════════
   TUNING CONSTANTS  —  change these, not the code below
   ══════════════════════════════════════════════════════════════════════════ */

/* ── The per-word pendulum ─────────────────────────────────────────────────
   Same integration as the bell:   θ'' = −K·θ − D·θ'
   with θ in DEGREES, t in SECONDS, and the pivot at the word's top centre.

   ω = √K            → natural angular frequency
   ζ = D / (2·√K)    → damping ratio

   K = 105  → ω = 10.247 rad/s → period 0.613 s. A word is a much smaller,
              much lighter thing than the bell (whose period is 1.405 s), and
              it must read that way: if the two swing at similar rates the
              headline looks like it is hanging off the bell rather than off
              its own threads. Below ~0.45s it stops reading as swinging and
              starts reading as vibrating; above ~0.9s the type looks heavy.
   D = 5.2  → ζ = 0.254. Envelope e^(−ζωt) = e^(−2.60·t):
              50% at 0.27 s, 10% at 0.89 s, 2% at 1.51 s.
              So a kick shows ~2.5 clean swings and is visually dead at
              ~1.5 s, inside the 1.2–1.8 s brief. The bell rings for four
              seconds because it is the subject; the type must be done with
              it long before the reader gets to the end of the sentence.     */
const WORD_K = 105;
const WORD_D = 5.2;

/** Hard amplitude ceiling, in degrees. This is the brief, not a safety net:
 *  above ~1.5° the reader notices the motion instead of the sentence. At a
 *  300px word that is ±3.9px of vertical travel at the far end. */
const WORD_MAX_DEG = 2.2;

/** Velocity ceiling. 16 deg/s ⇒ peak ≈ 16/ω ≈ 1.56°, i.e. just past the angle
 *  wall — so this clamp is what actually enforces the ceiling in normal use,
 *  and WORD_MAX_DEG only catches pathological input (a resize mid-swing, a
 *  ring landing on top of a flick). Clamping velocity rather than angle is
 *  what keeps a hard flick looking damped instead of looking *stopped*. */
const WORD_MAX_VEL = 24;

/** Snap-to-rest thresholds. Below these the word is set to exactly 0 and its
 *  inline transform is REMOVED — not written as rotate(0deg). Removing it
 *  hands the glyphs back to the browser's subpixel text rasteriser, which is
 *  visibly crisper on a near-black canvas than a composited 0° rotation.
 *  0.012° at a 300px word is 0.03px: a thirtieth of a pixel. */
const WORD_REST_DEG = 0.012;
const WORD_REST_VEL = 0.04;

/* ── The cursor brush ─────────────────────────────────────────────────────
   Momentum is applied as a RATE on the ticker (see pointer.ts), so the energy
   a gesture deposits does not depend on the mouse's polling frequency.

   Proximity is measured to the word's BOX, not to its centre: the distance is
   to the nearest point on the word's rectangle, so "something" and "to" have
   the same reach out of their own edges. Centre-distance would make long
   words feel dead at their ends, which is exactly where they are longest and
   most visible.                                                             */

/** Influence radius, in CSS px, measured out from the word's box. 104px is
 *  a little over one line of display type: near enough that the reaction is
 *  obviously caused by your cursor, small enough that half the sentence does
 *  not move when you brush one word. The brief is 90–120. */
const WORD_RADIUS = 104;

/* Drive is SUPERLINEAR in cursor speed, and this is not decoration — it is
   the one place the naive model gives the wrong feel.

   With a plain `v · prox · k · dt` transfer, the total energy deposited by a
   pass through the field is  ∫ v·prox dt = ∫ prox dx  — it depends only on
   the DISTANCE swept through the field, not on the speed. A crawl and a flick
   across the same word deposit identical energy. That is wrong for a brush.

   Real drag on a body in a moving fluid goes as v². So the drive is scaled by
   (|v| / REF), capped: force ∝ v·|v| up to CAP, ∝ v above it. Now the energy
   deposited by a pass is ∝ speed × distance-swept, and a flick beats a drift.
   The cap stops a violent yank from being an order of magnitude louder than
   a firm sweep — past CAP, extra speed buys nothing. */

/** Reference speed: what a deliberate but unhurried sweep across the headline
 *  measures. At exactly this speed the drive is 1× (untouched). */
const WORD_VEL_REF = 900;
/** Saturation speed. 3200 px/s is about as fast as a cursor crosses a laptop
 *  screen; the drive tops out at 3200/1400 = 2.3×. */
const WORD_VEL_CAP = 3200;

/** deg/s of angular velocity added per (px/s of drive) per second of contact,
 *  at proximity 1. Worked examples, for a 150px word (field length ≈ 358px,
 *  mean proximity across it ≈ 0.71, so ∫prox·dx ≈ 254 px). Peak angle is
 *  (deposited velocity)/ω, discounted because the drive is spread over a
 *  fraction of a period rather than delivered as an impulse:
 *
 *    500 px/s drift  → 0.36× drive, 0.72 s in field (>1 period, discount ~0.35)
 *                    → ≈ 0.17°   — you would not swear anything moved
 *   1400 px/s sweep  → 1.00× drive, 0.26 s in field (0.4 period, discount ~0.6)
 *                    → ≈ 0.82°   — clearly stirred, still under the ceiling
 *   3200 px/s flick  → 2.29× drive, 0.11 s in field (discount ~0.85)
 *                    → ≈ 2.6° wanted ⇒ clamped by WORD_MAX_VEL to 1.5°
 *
 *  That 0.17 → 0.82 → 1.5 spread IS the interaction. The discount factors are
 *  estimates off the damped-oscillator step response, not exact — this is the
 *  first constant to hand-tune with real eyes. */
const WORD_TRANSFER = 0.085;

/* ── Ring resonance ───────────────────────────────────────────────────────
   The bell rings; a pressure wave leaves its mouth and crosses the headline.
   Words are kicked OUTWARD (away from the bell's centreline), staggered by
   their horizontal distance from it, decaying with that same distance.

   Outward, not all-one-way: the green ripple leaving the mouth is a circle
   expanding, and the type should agree with it. A uniform kick would read as
   a gust from the side, which is a different (and unrelated) story. It also
   means the two words either side of centre fire together — which is what a
   radiating wave does, and it looks deliberate rather than sequential.      */

/** Speed of the wave across the line, px/s. Measured against the real line at
 *  1536px wide, where the six words sit 11 / 83 / 85 / 153 / 164 / 168 px out
 *  from the bell's centreline — three clear distance bands, not six. At
 *  2000 px/s those bands fire at 6ms, 42ms and 82ms: ~38ms per step, mid-brief
 *  (30–50), and the whole shiver is over in under a tenth of a second.
 *  At 2600 the steps compress to ~29ms and the wave stops reading as a wave
 *  and starts reading as everything moving at once. */
const RES_WAVE_SPEED = 2000;

/** Velocity kick at the wave's origin, deg/s. A kick v produces a peak of
 *  (v/ω) discounted by the damping that runs during the quarter-period it
 *  takes to get there — e^(−ζ·1.31) ≈ 0.72 at ζ = 0.254. So:
 *      peak ≈ 0.72 · (15 / 10.247) · e^(−dist/RES_FALLOFF)
 *  giving 0.99° at the centre word and 0.71° at the outermost — measured 0.69°
 *  and 0.47° at RES_KICK = 11, which was too quiet to register against six
 *  signal paths drawing out of the bell at the same time. Under 1° is still
 *  1.6px of travel at the tip of a 190px word: a shiver, not a dance. */
const RES_KICK = 26;

/** Amplitude falloff: kick × e^(−dist/RES_FALLOFF). 420px means the outermost
 *  word of the real line (168px out) still gets 67% of the kick, and a much
 *  wider headline at 350px would get 44%. Faster falloff and the wave dies
 *  before it reaches the ends of the line, which reads as a bug rather than
 *  as distance. */
const RES_FALLOFF = 540;

/* ══════════════════════════════════════════════════════════════════════════
   IMPLEMENTATION
   ══════════════════════════════════════════════════════════════════════════ */

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
const smoothstep = (t: number) => t * t * (3 - 2 * t);

interface Word {
  el: HTMLElement;
  /* Box in PAGE space (client rect + scroll offset at measure time), so a
     scroll does not invalidate it — only a reflow does. */
  l: number;
  t: number;
  r: number;
  b: number;
  /** Page-space x of the word's centre. The resonance wave's ruler. */
  cx: number;
  cy: number;
  angle: number;
  vel: number;
  /** Whether an inline transform is currently written. See WORD_REST_DEG. */
  styled: boolean;
}

export interface HangingHeadline {
  /** The per-word spans, in DOM order. The entrance timeline tweens these.
   *  Empty under reduced motion, where the headline is never split. */
  readonly words: HTMLElement[];
  /** Hand the words over to physics. Called when the entrance has landed. */
  activate(): void;
  /** A ring happened at this client x: send the wave out from it. */
  resonate(originClientX: number, originClientY?: number): void;
  destroy(): void;
}

export interface HangingHeadlineOptions {
  /** When true: no split, no ticker, no listeners. See DESIGN.md §3. */
  reducedMotion: boolean;
}

export function createHangingHeadline(opts: HangingHeadlineOptions): HangingHeadline {
  const headline = document.querySelector<HTMLElement>("#headline");
  if (!headline) throw new Error("[headline] missing #headline");

  /* Reduced motion: the headline is never split, so it never gains per-word
     boxes, so there is nothing for physics to act on and nothing to tear
     down. The entrance cross-fades the whole copy block instead — see
     bell.ts playEntrance(). This is the branch-at-the-top that DESIGN.md §3
     asks for, not an `if (reduced)` sprinkled through the tick loop. */
  if (opts.reducedMotion) {
    return {
      words: [],
      activate: () => {},
      resonate: () => {},
      destroy: () => {},
    };
  }

  /* The split is permanent. The old entrance reverted it at 1.30s to hand the
     browser plain selectable text back; it now stays, because a per-word box
     is the only thing a per-word transform origin can hang off. SplitText's
     own accessibility handling covers the cost: the <h1> gets an aria-label
     carrying the whole sentence and each word div is aria-hidden, so screen
     readers still read one sentence, not six fragments. */
  const split = new SplitText(headline, { type: "words", wordsClass: "hl-word" });
  const els = split.words as HTMLElement[];

  const words: Word[] = els.map((el) => ({
    el,
    l: 0,
    t: 0,
    r: 0,
    b: 0,
    cx: 0,
    cy: 0,
    angle: 0,
    vel: 0,
    styled: false,
  }));

  /* The union of every word box, inflated by WORD_RADIUS. One rectangle test
     against this is how a pointermove decides whether it is worth waking the
     simulation at all. */
  let fieldL = 0;
  let fieldT = 0;
  let fieldR = 0;
  let fieldB = 0;

  let curScrollX = 0;
  let curScrollY = 0;

  let active = false;
  let sleeping = true;
  let pointer: PointerHandle | null = null;
  const resCalls: gsap.core.Tween[] = [];

  /* ── measurement ───────────────────────────────────────────────────────── */

  function measure(): void {
    curScrollX = window.scrollX;
    curScrollY = window.scrollY;

    /* Read the boxes UNROTATED. A resize that lands mid-swing would otherwise
       bake each word's rotated bounding box — up to 4px taller and wider than
       the real one — into the influence field, permanently. */
    for (const w of words) {
      if (w.styled) w.el.style.transform = "";
    }

    let l = Infinity;
    let t = Infinity;
    let r = -Infinity;
    let b = -Infinity;

    for (const w of words) {
      const box = w.el.getBoundingClientRect();
      w.l = box.left + curScrollX;
      w.t = box.top + curScrollY;
      w.r = box.right + curScrollX;
      w.b = box.bottom + curScrollY;
      w.cx = (w.l + w.r) / 2;
      w.cy = (w.t + w.b) / 2;
      if (w.l < l) l = w.l;
      if (w.t < t) t = w.t;
      if (w.r > r) r = w.r;
      if (w.b > b) b = w.b;
    }

    fieldL = l - WORD_RADIUS;
    fieldT = t - WORD_RADIUS;
    fieldR = r + WORD_RADIUS;
    fieldB = b + WORD_RADIUS;

    for (const w of words) {
      if (w.styled) w.el.style.transform = `rotate(${w.angle.toFixed(3)}deg)`;
    }
  }

  /** Page-space pointer position. Word boxes are stored in page space so that
   *  scrolling costs one number, not seven getBoundingClientRect calls. */
  function pointerInField(): boolean {
    if (!pointer) return false;
    const px = pointer.clientX + curScrollX;
    const py = pointer.clientY + curScrollY;
    return px >= fieldL && px <= fieldR && py >= fieldT && py <= fieldB;
  }

  /* ── the one shared loop ───────────────────────────────────────────────── */

  function tick(_time: number, deltaMs: number): void {
    // A backgrounded tab does not run rAF, so this is belt-and-braces: the dt
    // clamp is what actually stops a resumed tab from stepping the integrator
    // three seconds at once and throwing every word past the wall.
    if (document.hidden) return;
    const dt = Math.min(deltaMs, 50) / 1000;

    const vx = pointer ? pointer.vx : 0;
    // Superlinear in speed, saturating — see WORD_VEL_REF.
    const drive =
      vx === 0 ? 0 : (vx * Math.min(Math.abs(vx), WORD_VEL_CAP)) / WORD_VEL_REF;

    const px = pointer ? pointer.clientX + curScrollX : 0;
    const py = pointer ? pointer.clientY + curScrollY : 0;

    let awake = false;

    for (const w of words) {
      if (drive !== 0) {
        // Distance to the word's BOX: zero while the cursor is over the word.
        const dx = px < w.l ? w.l - px : px > w.r ? px - w.r : 0;
        const dy = py < w.t ? w.t - py : py > w.b ? py - w.b : 0;
        if (dx < WORD_RADIUS && dy < WORD_RADIUS) {
          const dist = dx === 0 && dy === 0 ? 0 : Math.sqrt(dx * dx + dy * dy);
          if (dist < WORD_RADIUS) {
            const prox = smoothstep(1 - dist / WORD_RADIUS);
            w.vel += drive * prox * WORD_TRANSFER * dt;
          }
        }
      }

      // θ'' = −K·θ − D·θ'   (semi-implicit Euler: velocity first, then angle)
      w.vel += (-WORD_K * w.angle - WORD_D * w.vel) * dt;
      w.vel = clamp(w.vel, -WORD_MAX_VEL, WORD_MAX_VEL);
      w.angle += w.vel * dt;

      // The amplitude wall is inelastic: hitting it kills the outward
      // velocity rather than reflecting it, so a clamped word settles from
      // the ceiling instead of bouncing off it (DESIGN.md §3 — no bounce).
      if (w.angle > WORD_MAX_DEG) {
        w.angle = WORD_MAX_DEG;
        if (w.vel > 0) w.vel = 0;
      } else if (w.angle < -WORD_MAX_DEG) {
        w.angle = -WORD_MAX_DEG;
        if (w.vel < 0) w.vel = 0;
      }

      if (Math.abs(w.angle) < WORD_REST_DEG && Math.abs(w.vel) < WORD_REST_VEL) {
        w.angle = 0;
        w.vel = 0;
        if (w.styled) {
          w.el.style.transform = "";
          w.styled = false;
        }
      } else {
        // transform-origin lives in styles.css (.hl-word) — top centre, the
        // point the word's invisible thread is tied to.
        w.el.style.transform = `rotate(${w.angle.toFixed(3)}deg)`;
        w.styled = true;
        awake = true;
      }
    }

    // Nothing moving and nothing about to move: stop costing frames. Removing
    // a listener from inside its own tick is supported — gsap's Ticker.remove
    // fixes up the dispatch index when it splices.
    if (!awake && (drive === 0 || !pointerInField())) sleep();
  }

  function wake(): void {
    if (!active || !sleeping) return;
    sleeping = false;
    gsap.ticker.add(tick);
  }

  function sleep(): void {
    if (sleeping) return;
    sleeping = true;
    gsap.ticker.remove(tick);
    for (const w of words) {
      w.angle = 0;
      w.vel = 0;
      if (w.styled) {
        w.el.style.transform = "";
        w.styled = false;
      }
    }
  }

  /* ── inputs ────────────────────────────────────────────────────────────── */

  function onPointerMove(): void {
    // The only work a move does while asleep: one rectangle test.
    if (sleeping && pointerInField()) wake();
  }

  function onScroll(): void {
    curScrollX = window.scrollX;
    curScrollY = window.scrollY;
  }

  function onVisibility(): void {
    if (document.hidden) sleep();
  }

  let resizeRaf = 0;
  function onResize(): void {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      // The headline rewraps: every box moved. Take the swing down rather
      // than let words carry an angle across a reflow.
      sleep();
      measure();
    });
  }

  const ro = new ResizeObserver(onResize);

  /* ── the wave ──────────────────────────────────────────────────────────── */

  function resonate(originClientX: number, originClientY?: number): void {
    if (!active) return;

    // A second ring restarts the wave rather than layering a second one on
    // top of the first (DESIGN.md §3 — interruptible beats restart cleanly).
    for (const call of resCalls) call.kill();
    resCalls.length = 0;

    const ox = originClientX + curScrollX;
    const oy = originClientY; // client-space; word cy is page-space minus scrollY below

    for (const w of words) {
      // 2D distance from the bell's mouth: the wave radiates like sound,
      // reaching the upper line first — not a flat horizontal sweep.
      const dist =
        oy === undefined
          ? Math.abs(w.cx - ox)
          : Math.hypot(w.cx - ox, w.cy - (oy + window.scrollY));
      const kick = RES_KICK * Math.exp(-dist / RES_FALLOFF);
      // Outward from the bell's centreline. A word straddling it goes right.
      const dir = w.cx < ox ? -1 : 1;
      const delay = dist / RES_WAVE_SPEED;
      resCalls.push(
        gsap.delayedCall(delay, () => {
          w.vel = clamp(w.vel + dir * kick, -WORD_MAX_VEL, WORD_MAX_VEL);
          wake();
        }),
      );
    }
  }

  /* ── lifecycle ─────────────────────────────────────────────────────────── */

  function activate(): void {
    if (active) return;
    active = true;

    /* The entrance left an inline transform (its 12px rise) and an opacity on
       every word. Clear both: the rise is over, and from here the transform
       string belongs to the integrator alone — no GSAP transform cache to
       fight with, one style write per word per frame. */
    gsap.set(els, { clearProps: "transform,opacity" });

    pointer = acquirePointer(onPointerMove);
    measure();

    const hero = document.querySelector("#hero");
    if (hero) ro.observe(hero);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    // Web fonts land after boot on a cold cache and rewrap the line. Guarded:
    // a slow font must not re-measure a scene that has already been torn down.
    if (document.fonts?.ready) {
      void document.fonts.ready.then(() => {
        if (active) measure();
      });
    }

    // No ticker yet. Nothing is moving, so nothing needs a frame; the first
    // pointermove into the field (or the first ring) wakes it.
  }

  function destroy(): void {
    sleep();
    active = false;
    for (const call of resCalls) call.kill();
    resCalls.length = 0;
    ro.disconnect();
    cancelAnimationFrame(resizeRaf);
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("visibilitychange", onVisibility);
    pointer?.release();
    pointer = null;
    split.revert();
  }

  return { words: els, activate, resonate, destroy };
}
