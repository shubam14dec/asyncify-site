/* ══════════════════════════════════════════════════════════════════════════
   intro.ts — the curtain gate

   A first-time visitor lands on a closed theatre curtain. They press the
   button, the cloth parts, "Asyncify" writes itself on the stage behind it,
   the whole thing fades, and only THEN does the hero play its entrance. That
   last clause is the reason this file exports a promise instead of just
   running: the bell's entrance is the page's opening line, and it must not
   be delivered to an empty room behind a curtain.

   THE GATE NEVER DEAD-LOCKS. Four things guarantee it, and they are
   independent on purpose:

     1. `finish()` is idempotent and is the ONLY path to `resolve`. Every
        route out — the full run, skip, Escape, an error, the watchdog —
        goes through the same function, so "resolved twice" and "cleaned up
        twice" are both impossible.
     2. The whole start-up is inside one try/catch. A throw before the
        curtain is even armed calls `finish()` and the visitor gets the page.
     3. The click handler's body is inside its own try/catch, because that
        code runs long after the first one has returned and could not be
        covered by it.
     4. A watchdog timer, armed the moment the reveal starts. If ANY of the
        machinery between the click and the fade fails in a way that simply
        never calls back — a rejected promise swallowed inside a tween, a
        WebGL context lost mid-pull, a browser that throttles the tab and
        never runs the ticker again — the timer fires and finishes anyway.
        It is the only guarantee that does not depend on the animation code
        being correct, which is exactly why it is here.

   The overlay is REMOVED from the DOM by `finish()`, not hidden, so nothing
   in this file can leak into the page it was covering.
   ══════════════════════════════════════════════════════════════════════════ */

import { gsap } from "gsap";

/** Set once the intro has been seen — by completing it OR by skipping it.
   Session, not local: a new tab tomorrow gets the show again, a reload five
   seconds from now does not. */
const SESSION_KEY = "asyncify-intro-done";

/** The pull. The WebGL cloth gathers over 2.6s; the CSS stand-in is a
 *  simpler motion and a shorter one would look unfinished, a longer one
 *  cheap — 1.4s. */
const PULL_GL = 2.6;
const PULL_CSS = 1.4;

/** The button and valance clear the frame before anything moves. */
const CLEAR = 0.35;

/** The signature starts at 35% of the pull — late enough that the gap has
 *  opened, early enough that the two motions overlap and the writing is not
 *  an epilogue. */
const SIG_CUE = 0.35;
const SIG_WRITE = 1.8;

/** A held beat on the finished word, then out. */
const HOLD = 0.6;
const FADE = 0.7;

/** Guarantee 4 (see the header). Generous: the longest legitimate run is
 *  CLEAR + PULL_GL + HOLD + FADE ≈ 4.3s, and a slow first WebGL frame can
 *  add a beat to that. Anything past 12s is a failure, not a slow machine. */
const WATCHDOG_MS = 12000;

/** After a skip there is nothing left to wait for but one short fade. */
const SKIP_FADE = 0.4;
const WATCHDOG_SKIP_MS = 3000;

export function introGate(): Promise<void> {
  const root = document.getElementById("intro");
  if (!root) return Promise.resolve();

  /* The head script already decided this, before the body parsed — returning
     visitors and reduced-motion visitors never had a curtain painted. Clear
     the markup out and hand the page straight over. */
  if (document.documentElement.classList.contains("intro-skip")) {
    root.remove();
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    let finished = false;
    let started = false;
    let watchdog = 0;
    let curtain: { open(): Promise<void>; dispose(): void } | null = null;
    let timeline: ReturnType<typeof gsap.timeline> | null = null;

    const main = document.querySelector("main");

    /** The single exit. Idempotent, total, and it cannot throw its way out
     *  of resolving: every teardown step is individually guarded so a
     *  failure in one does not skip the rest. */
    const finish = (): void => {
      if (finished) return;
      finished = true;
      try {
        window.clearTimeout(watchdog);
      } catch {
        /* nothing to clear */
      }
      try {
        document.removeEventListener("keydown", onKey);
        for (const type of SWALLOWED) window.removeEventListener(type, swallow, { capture: true });
      } catch {
        /* already gone */
      }
      try {
        timeline?.kill();
        gsap.killTweensOf(root);
      } catch {
        /* the timeline is being thrown away regardless */
      }
      try {
        curtain?.dispose();
      } catch {
        /* a half-built renderer is still better disposed than kept */
      }
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* private mode: the visitor sees the intro again. Acceptable. */
      }
      try {
        document.documentElement.classList.remove("in-lock");
        main?.removeAttribute("inert");
      } catch {
        /* nothing survives that matters */
      }
      root.remove();
      resolve();
    };

    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") skipNow();
    };

    /* A modal swallows the page's scroll input, and this one has a second
       reason to. main.ts arms one-shot wheel / touchmove / scroll listeners
       that flush the deferred scene builds SYNCHRONOUSLY — several seconds
       of layout, deliberately, because a reader who scrolls is heading into
       unbuilt scenes. A reader who spins the wheel at a closed curtain is
       not, and letting that flush land in the middle of a 2.6s pull would
       freeze the reveal solid. Stopping the event during the CAPTURE phase
       at window keeps it from ever reaching those bubble-phase listeners;
       because they are `{ once: true }` and never fire, they stay armed for
       the real scroll later. No preventDefault — the listeners are passive
       and the scroll lock already holds the page still. */
    const SWALLOWED = ["wheel", "touchmove", "scroll"] as const;
    const swallow = (e: Event): void => {
      e.stopPropagation();
    };

    /** Fade the overlay and finish. `onComplete` is the normal path; the
     *  watchdog is the abnormal one. */
    const fadeOut = (duration: number): void => {
      if (finished) return;
      try {
        gsap.to(root, { opacity: 0, duration, ease: "power2.out", onComplete: finish });
      } catch {
        finish();
      }
    };

    const skipNow = (): void => {
      if (finished) return;
      if (!watchdog) watchdog = window.setTimeout(finish, WATCHDOG_SKIP_MS);
      try {
        timeline?.kill();
      } catch {
        /* going away anyway */
      }
      fadeOut(SKIP_FADE);
    };

    try {
      const btn = root.querySelector<HTMLButtonElement>("#in-open");
      const skip = root.querySelector<HTMLButtonElement>("#in-skip");
      const valance = root.querySelector<HTMLElement>(".in-valance");
      const poster = root.querySelector<HTMLElement>(".in-poster");
      const halfL = root.querySelector<HTMLElement>(".in-half-l");
      const halfR = root.querySelector<HTMLElement>(".in-half-r");
      const host = root.querySelector<HTMLElement>("#in-canvas");
      const sig = root.querySelector<SVGPathElement>("#in-sig-path");

      /* No button, no way in — and no way for the visitor out. Bail loudly
         to the page rather than sealing it behind an inert curtain. */
      if (!btn) {
        finish();
        return;
      }
      /* One non-null binding for everything downstream. The handlers below
         close over it, and an explicitly typed const says the guard above is
         the only place that question is ever asked. */
      const openBtn: HTMLButtonElement = btn;

      document.documentElement.classList.add("in-lock");
      main?.setAttribute("inert", "");
      document.addEventListener("keydown", onKey);
      for (const type of SWALLOWED)
        window.addEventListener(type, swallow, { capture: true, passive: true });

      /* ── the velvet, if it will come ───────────────────────────────────
         Requested immediately, not on click: the chunk is large and the
         visitor's reading of "click to reveal" is the loading budget. If it
         lands, it cross-fades over the CSS poster showing the same closed
         cloth, so the swap is invisible. If it never lands — no WebGL, a
         blocked chunk, an integrated driver that refuses a context — the
         poster simply stays and opens by transform instead. Nothing about
         the flow below branches on WHY. */
      if (host) {
        void import("./curtain")
          .then((mod) => {
            /* Too late to swap mid-pull: the poster is already moving. */
            if (finished || started) return;
            curtain = mod.mount(host);
            gsap.to(host, { opacity: 1, duration: 0.5, ease: "power1.inOut" });
            if (poster) gsap.to(poster, { opacity: 0, duration: 0.5, ease: "power1.inOut" });
          })
          .catch(() => {
            /* The poster is the fallback and it is already on screen. */
          });
      }

      /** Arm the write-on.
       *
       *  DESIGN §3's non-scaling-stroke trap, head on: a path with
       *  `vector-effect: non-scaling-stroke` has its dash pattern measured
       *  in SCREEN pixels, while `getTotalLength()` answers in user units.
       *  Setting dasharray to the raw length would therefore be wrong by the
       *  render scale — on a 620px-wide render of a 574-unit viewBox, by
       *  about 8%, which is a visible chunk of the flourish left undrawn (or
       *  a word that finishes early and sits there). Multiplying by the
       *  measured scale is the whole fix; the stylesheet's 4000 was only
       *  ever a "longer than anything" rest value. */
      const armSignature = (): number => {
        if (!sig) return 0;
        const len = sig.getTotalLength();
        if (!(len > 0)) return 0;
        let scale = 1;
        const svg = sig.ownerSVGElement;
        if (svg) {
          const rendered = svg.getBoundingClientRect().width;
          const authored = svg.viewBox.baseVal.width;
          if (rendered > 0 && authored > 0) scale = rendered / authored;
        }
        const dash = Math.ceil(len * scale) + 4;
        sig.style.strokeDasharray = String(dash);
        sig.style.strokeDashoffset = String(dash);
        return dash;
      };

      const reveal = (): void => {
        if (started || finished) return;
        started = true;
        /* Guarantee 4, armed here rather than at load: a visitor is allowed
           to look at a closed curtain for as long as they like. */
        watchdog = window.setTimeout(finish, WATCHDOG_MS);

        try {
          openBtn.removeEventListener("click", reveal);
          const dash = armSignature();
          const gl = curtain;
          const pull = gl ? PULL_GL : PULL_CSS;

          const tl = gsap.timeline({ onComplete: () => fadeOut(FADE) });
          timeline = tl;

          /* The invitation and the pelmet leave first — the frame empties,
             then the cloth moves. */
          const clearing: Element[] = [openBtn];
          if (valance) clearing.push(valance);
          tl.to(clearing, { opacity: 0, duration: CLEAR, ease: "power2.out" }, 0);
          if (skip) tl.to(skip, { opacity: 0.55, duration: CLEAR, ease: "power2.out" }, 0);

          if (gl) {
            /* The WebGL pull runs on its own clock inside curtain.ts; the
               timeline only needs to start it and to know how long it takes
               so the signature and the hold land in the right places. */
            tl.call(
              () => {
                void gl.open();
              },
              undefined,
              CLEAR,
            );
          } else if (halfL && halfR) {
            /* The stand-in. A flat slide would read as two rectangles; the
               scaleX squeeze against each half's outer transform-origin is
               the cheapest thing that suggests cloth bunching as it goes. */
            tl.to(halfL, { xPercent: -100, scaleX: 0.86, duration: pull, ease: "power2.inOut" }, CLEAR)
              .to(halfR, { xPercent: 100, scaleX: 0.86, duration: pull, ease: "power2.inOut" }, CLEAR);
          }

          if (sig && dash > 0) {
            /* power1.inOut, not the house expo: a pen accelerates out of the
               first stroke and eases into the last one. An expo curve writes
               the whole word in the first third and then crawls. */
            tl.to(
              sig,
              { strokeDashoffset: 0, duration: SIG_WRITE, ease: "power1.inOut" },
              CLEAR + pull * SIG_CUE,
            );
          }

          /* Hold on the finished picture — both the parted cloth and the
             completed word, whichever of the two lands last. */
          const settled = Math.max(CLEAR + pull, CLEAR + pull * SIG_CUE + SIG_WRITE);
          tl.to({}, { duration: HOLD }, settled);
        } catch {
          /* Guarantee 3. */
          finish();
        }
      };

      /* Wired last, so nothing can be pressed before every handler above it
         exists. A <button> already fires click on Enter and Space; there is
         no keyboard branch to write. */
      openBtn.addEventListener("click", reveal);
      skip?.addEventListener("click", skipNow);
      openBtn.focus({ preventScroll: true });
    } catch {
      /* Guarantee 2. */
      finish();
    }
  });
}
