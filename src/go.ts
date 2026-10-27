/* ══════════════════════════════════════════════════════════════════════════
   go.asyncify.org — /go.html
   The Go design: the production architecture re-expressed in Go's
   concurrency model. One tall page, plain scroll, the same motion contract as
   journey.ts: no pinning, no scrub — a section arrives with a 12px rise and a
   fade, once, as it crosses 80% of the viewport.

   The rise is per SECTION, never per code block: a page this code-heavy
   whose listings drifted in one by one would make the reader wait on the
   very thing they came to read. A section is one idea, so it arrives whole.

   Everything on this page is legible with this file absent. The hidden rest
   state is a class THIS module adds (`st-motion`, journey's own), so a
   browser with JavaScript off never hides a word of it.
   ══════════════════════════════════════════════════════════════════════════ */

/* Self-hosted, latin subset. Only the weights this page sets (BRAND.md §3):
   400 body, 500 nav and the honesty section's leads, 600 section titles, mono
   400/500, and the Instrument italic the headline's accent word wears.
   cssCodeSplit is off, so these resolve into the site's single stylesheet —
   the shared faces cost nothing twice. */
import "@fontsource/geist-sans/latin-400.css";
import "@fontsource/geist-sans/latin-500.css";
import "@fontsource/geist-sans/latin-600.css";
import "@fontsource/geist-mono/latin-400.css";
import "@fontsource/geist-mono/latin-500.css";
import "@fontsource/instrument-serif/400-italic.css";

import "./styles.css";

/* Core plus ScrollTrigger, imported individually — never `gsap/all`
   (DESIGN.md §6). */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* The eight sections. The hero and the finale are not here: the hero belongs
   to the load, and the finale is short enough to be on screen with the last
   section's tail. */
const RISE_SELECTOR = ".gl-sec";

const risers = Array.from(document.querySelectorAll<HTMLElement>(RISE_SELECTOR));

/* Reads the DOM, so it cannot fold to a constant at build time and prune the
   rest of this module (DESIGN.md §3). */
if (risers.length === 0) throw new Error("go: no sections to reveal");

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

  /* `once`: this is information, not decoration (DESIGN.md §7). Transform and
     opacity only, so nothing here triggers layout. */
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
  /* The designed still (DESIGN.md §3), not a disabled one: `st-motion` is
     never added, so every section is already on screen in reading order.
     Nothing to build. */
});
