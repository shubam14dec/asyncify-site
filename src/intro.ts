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
/* The pen travels every letterform; 2.2s read as hurried (user call:
   "the writing speed is little fast") — a hand takes its time. */
const SIG_WRITE = 3.2;

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

  /* The bundle — and with it the real stylesheet — has arrived: lift the
     head's critical-CSS blackout so the overlay's children may render. */
  root.classList.add("in-css");

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
    let loadTick = 0;
    let curtain: { open(): Promise<void>; invite(on: boolean): void; dispose(): void } | null = null;
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
        window.clearInterval(loadTick);
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
      const halfL = root.querySelector<HTMLElement>(".in-half-l");
      const halfR = root.querySelector<HTMLElement>(".in-half-r");
      const host = root.querySelector<HTMLElement>("#in-canvas");
      /* The timing rails (invisible paths, in writing order — their
         lengths pace the write) and the eight letter glyphs they pace.
         (The visible gold pen dot was removed at the user's call.) */
      const sigPaths = Array.from(root.querySelectorAll<SVGPathElement>(".in-sig-g"));
      const sigLetters = Array.from(root.querySelectorAll<SVGTextElement>(".in-sig-l"));

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

      /* Warm the signature face while the visitor waits: the letters must
         never materialise in a fallback script. Fire-and-forget;
         font-display: block backs it up. */
      try {
        void document.fonts.load('400 100px "AsyncifySig"');
      } catch {
        /* No FontFaceSet: font-display does its best alone. */
      }

      /* ── the velvet, or nothing ────────────────────────────────────────
         DIRECT TO THE REAL CURTAIN (user call, after two rounds of trying
         to disguise the stand-in: "why dont u directly go to the correct
         curtain rather then these fake once"). The first frame is plain
         black — house lights down — and the ONLY curtain that ever fades
         in over it is the WebGL velvet. The CSS poster is no longer a
         loading screen: it starts hidden and appears solely on the
         fallback path — the chunk failing, or hanging past its budget —
         because the page must never be sealed behind an empty overlay. */
      /* THE LOAD READOUT (user call): the wait shows a percentage, and the
         velvet enters only at 100. A dynamic import exposes no byte
         progress, so the number is an eased ramp that asymptotes at 93 and
         is driven to 100 the moment the chunk actually resolves — honest
         about completion, smooth about the middle. */
      const loadBox = root.querySelector<HTMLElement>("#in-load");
      const loadNum = root.querySelector<HTMLElement>("#in-load-num");
      const pace = { p: 0 };
      const setPct = (): void => {
        if (loadNum) loadNum.textContent = `${Math.floor(pace.p)}%`;
      };
      loadTick = window.setInterval(() => {
        pace.p += (93 - pace.p) * 0.085;
        setPct();
      }, 90);
      const hideReadout = (): void => {
        try {
          window.clearInterval(loadTick);
          if (loadBox) gsap.to(loadBox, { opacity: 0, duration: 0.3, ease: "power1.out" });
        } catch {
          /* the readout is decoration; never let it block a path */
        }
      };

      let fellBack = false;
      const fallBack = (): void => {
        if (finished || started || curtain || fellBack) return;
        fellBack = true;
        hideReadout();
        root.classList.add("in-fallback");
      };
      /* A chunk that has not landed after 4s is not landing in time to be
         the first act; the CSS curtain takes the stage instead. */
      const fallbackTimer = window.setTimeout(fallBack, 4000);
      if (host) {
        void import("./curtain")
          .then((mod) => {
            /* Too late: the CSS fallback already took the stage, or the
               show already started against it. */
            if (finished || started || fellBack) return;
            window.clearTimeout(fallbackTimer);
            /* Mount now (hidden) so the first GL frame compiles while the
               counter finishes its run to 100. */
            curtain = mod.mount(host);
            window.clearInterval(loadTick);
            gsap.to(pace, {
              p: 100,
              duration: 0.4,
              ease: "power1.out",
              onUpdate: setPct,
              onComplete: () => {
                if (finished || started) return;
                hideReadout();
                /* The stylesheet gates the CSS invitation (words + glow)
                   on these classes — with real WebGL, the painted words
                   and the pool do the inviting. */
                root.classList.add("in-gl");
                gsap.to(host, { opacity: 1, duration: 0.6, ease: "power1.inOut" });
              },
            });
          })
          .catch(fallBack);
      } else {
        fallBack();
      }

      const reveal = (): void => {
        if (started || finished) return;
        started = true;
        /* Guarantee 4, armed here rather than at load: a visitor is allowed
           to look at a closed curtain for as long as they like. */
        watchdog = window.setTimeout(finish, WATCHDOG_MS);

        try {
          openBtn.removeEventListener("click", reveal);
          const gl = curtain;
          const pull = gl ? PULL_GL : PULL_CSS;

          const tl = gsap.timeline({ onComplete: () => fadeOut(FADE) });
          timeline = tl;

          /* The invitation leaves first — the frame empties, then the cloth
             moves. (The valance that once left with it was removed at the
             user's call.) */
          tl.to(openBtn, { opacity: 0, duration: CLEAR, ease: "power2.out" }, 0);
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

          let penEnd = CLEAR + pull * SIG_CUE;
          if (sigPaths.length > 0) {
            /* THE WRITE, rebuilt from the root (user call, after reading
               the whole mechanism): the traced-mask approach either
               dropped ink where the trace missed or, widened to
               compensate, revealed slivers of the neighbour letter early —
               both structural. No mask any more: each of the eight glyphs
               fades in across exactly its own strokes' window, paced by
               the invisible rails' lengths. Whole letters, on time. */
            const LIFT = 0.07;
            /* stroke index -> letter index: A(0-2) s(3) y(4-5) n(6-7)
               c(8) i(9-10) f(11-12) y(13-14). */
            const OWNER = [0, 0, 0, 1, 2, 2, 3, 3, 4, 5, 5, 6, 6, 7, 7];
            const lens = sigPaths.map((p) => p.getTotalLength());
            const total = lens.reduce((a, b) => a + b, 0) || 1;
            const letterStart: number[] = [];
            const letterEnd: number[] = [];
            let at = penEnd;
            sigPaths.forEach((_, i) => {
              const len = lens[i] ?? 0;
              const d = SIG_WRITE * (len / total);
              const owner = OWNER[i] ?? 7;
              if (letterStart[owner] === undefined) letterStart[owner] = at;
              letterEnd[owner] = at + d;
              at += d + LIFT;
            });
            /* Each glyph rises across its own writing window: complete
               ink from its first moment, materialising through exactly
               that letter's beat of the write. */
            sigLetters.forEach((el, k) => {
              const start = letterStart[k];
              const end = letterEnd[k];
              if (start === undefined || end === undefined) return;
              tl.to(el, { opacity: 1, duration: Math.max(0.2, end - start), ease: "power1.in" }, start);
            });
            penEnd = at - LIFT;
          }

          /* Hold on the finished picture — both the parted cloth and the
             completed word, whichever of the two lands last. */
          const settled = Math.max(CLEAR + pull, penEnd);
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
      /* The pool breathes brighter under a hovering pointer (or keyboard
         focus) — the light is the hover state now. */
      const inviteOn = (): void => curtain?.invite(true);
      const inviteOff = (): void => curtain?.invite(false);
      openBtn.addEventListener("pointerenter", inviteOn);
      openBtn.addEventListener("pointerleave", inviteOff);
      openBtn.addEventListener("focus", inviteOn);
      openBtn.addEventListener("blur", inviteOff);
      /* NO programmatic focus (probe catch): script-focus tripped
         :focus-visible and drew the site's green ring around the pool of
         light. A Tab still lands here first and earns the lawful ring;
         a mouse arrival sees only the light. */
    } catch {
      /* Guarantee 2. */
      finish();
    }
  });
}
