/* ══════════════════════════════════════════════════════════════════════════
   story.asyncify.org — /story.html
   The product's build timeline. One tall page, plain scroll: no pinning, no
   scrub, nothing that takes the scrollbar away from the reader. The only
   motion is an entry arriving — a 12px rise and a fade, once, as it crosses
   80% of the viewport.

   Everything on this page is legible with this file absent. The hidden rest
   state is a class THIS module adds (`st-motion`), so a browser with
   JavaScript off never hides a word of it.
   ══════════════════════════════════════════════════════════════════════════ */

/* Self-hosted, latin subset. Only the weights this page sets (BRAND.md §3):
   400 body, 500 nav, 600 entry titles, mono 400/500, and the Instrument
   italic the headline's accent word wears. cssCodeSplit is off, so these
   resolve into the site's single stylesheet — the shared faces cost nothing
   twice. */
import "@fontsource/geist-sans/latin-400.css";
import "@fontsource/geist-sans/latin-500.css";
import "@fontsource/geist-sans/latin-600.css";
import "@fontsource/geist-mono/latin-400.css";
import "@fontsource/geist-mono/latin-500.css";
import "@fontsource/instrument-serif/400-italic.css";

import "./styles.css";

/* Core plus ScrollTrigger, imported individually — never `gsap/all`
   (DESIGN.md §6). No DrawSVG, no MotionPath, no Draggable: this page has no
   drawings and nothing to throw. */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* Every kind of entry that arrives: the six figures, the three kinds of
   timeline entry, and the ledger as ONE block — 38 rows fading in one at a
   time would be a list that stutters, not a list that arrives. The test
   strip is NOT here (user call, 2026-09-17): it sits at the top of the
   page and belongs to the load, not to the scroll. */
const RISE_SELECTOR = ".st-stat, .st-era, .st-mark, .st-beat, .st-ledger-list";

const risers = Array.from(document.querySelectorAll<HTMLElement>(RISE_SELECTOR));

/* Reads the DOM, so it cannot fold to a constant at build time and prune the
   rest of this module (DESIGN.md §3). */
if (risers.length === 0) throw new Error("story: no entries to reveal");

/* ── media gating ──────────────────────────────────────────────────────────
   One matchMedia owns the choice, and it owns the hidden rest state with it:
   the class goes on inside the motion branch and comes off when that context
   reverts, so turning reduced motion on mid-page leaves a finished page
   rather than a hidden one.
   ─────────────────────────────────────────────────────────────────────── */

const mm = gsap.matchMedia();

mm.add("(prefers-reduced-motion: no-preference)", () => {
  /* The stylesheet — not a boot-time gsap.set — owns the hidden rest state
     (DESIGN.md §3). Both classes go on in the same synchronous block, so the
     rule `.st-motion .st-rise` is live before the first tween is built. */
  for (const el of risers) el.classList.add("st-rise");
  document.documentElement.classList.add("st-motion");

  /* `once` because this is information, not decoration — an entry that
     re-animates every time it is scrolled past is an infinite micro-animation
     on informational content (DESIGN.md §7). Transform and opacity only, so
     nothing here triggers layout. The stagger groups whatever crosses the
     line together; it is not a per-element delay down the page. */
  const batch = ScrollTrigger.batch(risers, {
    start: "top 80%",
    once: true,
    onEnter: (entries) => {
      gsap.fromTo(
        entries,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.06,
          overwrite: true,
        },
      );
    },
  });

  return () => {
    for (const trigger of batch) trigger.kill();
    for (const el of risers) el.classList.remove("st-rise");
    document.documentElement.classList.remove("st-motion");
  };
});

mm.add("(prefers-reduced-motion: reduce)", () => {
  /* The designed still (DESIGN.md §3), not a disabled one: nothing is hidden
     to begin with — `st-motion` is never added — so every entry is already on
     screen, and the order the rise would have carried is said out loud by the
     date on each one. Nothing to build. */
});
