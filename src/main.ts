/* ══════════════════════════════════════════════════════════════════════════
   asyncify.org — composition root
   Fonts, plugins, the motion preference, and the scene boot. Nothing else
   belongs in here; each scene owns its own file.
   ══════════════════════════════════════════════════════════════════════════ */

/* Self-hosted, latin subset, font-display: swap. Only the weights listed in
   BRAND.md §3 — every extra weight is ~15KB of woff2 nobody asked for. */
import "@fontsource/geist-sans/latin-400.css";
import "@fontsource/geist-sans/latin-500.css";
import "@fontsource/geist-sans/latin-600.css";
import "@fontsource/geist-mono/latin-400.css";
/* One display voice, for one word: "agentic" lands in the bridge in an italic
   serif -- the new era arriving in a new typeface. Used nowhere else. */
import "@fontsource/instrument-serif/400-italic.css";
import "@fontsource/geist-mono/latin-500.css";

import "./styles.css";

import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { RoughEase } from "gsap/EasePack";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

import { createAgentsScene } from "./agents";
import { createBellScene } from "./bell";
import { EDIT_PIN_VH, createEditScene } from "./edit";
import { createEngineScene } from "./engine";
import { createHangingHeadline } from "./headline";
import { createInstallLine } from "./install";
import { createProofScene } from "./proof";
import { createTurnScene } from "./turn";

/* Individual imports, never `gsap/all` — that pulls every plugin into the
   bundle. Budget is in DESIGN.md §6.

   Draggable and InertiaPlugin are the last two on the list and the only two
   the page pays for a single scene: scene 5's torn-off receipts are real paper
   you can pick up and throw. They cost about 15KB gzipped between them, which
   the budget has room for, and the alternative — hand-rolled pointer physics
   for a throw with bounds and friction — would cost more than that in code
   nobody has debugged. InertiaPlugin is registered rather than imported by
   proof.ts because Draggable reaches for it by name (`inertia: true`). */
gsap.registerPlugin(
  Draggable,
  DrawSVGPlugin,
  InertiaPlugin,
  ScrollToPlugin,
  RoughEase,
  MotionPathPlugin,
  ScrollTrigger,
  SplitText,
);

/* The nav's Install link GLIDES to the headline rather than teleporting
   (user call: "it should scroll and take me"). The href stays a real
   anchor — no-JS and reduced-motion readers get the browser's own jump —
   and the glide only runs for readers who get motion at all. autoKill so
   a reader's own wheel input takes the scroll back instantly. */
if (window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
  document.querySelector<HTMLAnchorElement>('.nav-links a[href="#headline"]')?.addEventListener(
    "click",
    (e) => {
      e.preventDefault();
      gsap.to(window, {
        scrollTo: { y: "#headline", offsetY: 24, autoKill: true },
        duration: 0.8,
        ease: "power2.inOut",
      });
    },
  );
}

/* GSAP defaults, so nothing in this codebase can accidentally ship a linear
   0.5s tween. The house curve is expo-out. */
gsap.defaults({ ease: "power2.out", duration: 0.4 });

const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const reducedMotion = motionQuery.matches;

/* Two hero collaborators, wired here rather than to each other: the headline
   owns its word boxes and their physics, the bell owns the story beats, and
   neither imports the other. The bell's entrance borrows the words; the bell's
   ring tells the composition root where the pressure wave started, and the
   headline decides what that means for type. */
const headline = createHangingHeadline({ reducedMotion });

const scene = createBellScene({
  reducedMotion,
  headlineWords: headline.words,
  onEntranceComplete: () => {
    headline.activate();
    /* SCENE 2 BUILDS RIGHT HERE — after the bell lands, before the typing
       begins. This is the one moment a main-thread block is invisible: the
       entrance has finished (nothing mid-flight to freeze), the typing has
       not started (nothing to stall), and the reader sees a beat of
       stillness under a landed bell. In exchange, the first scene below
       the fold exists seconds before any human can scroll to it — the
       permanent fix for "I scrolled and scene 2 was black" (user report,
       three rounds of scheduling tuning). */
    const firstScene = sceneBuilders.shift();
    if (firstScene) firstScene();
    // The line types itself only once the bell has landed: two things
    // arriving at once is neither of them arriving.
    install.start();
    /* The REMAINING scenes (3-6) wait out the hero's whole opening:
       typing ~0.75s, the Install-now doodle to ~2.4s, the SDKs flick to
       ~3.1s, the unprompted demo ring closing at ~4.5s. They are only
       reachable through scene 2's 4-screen pin, so the clocked chain —
       plus the scroll flush below — always beats the viewport there. */
    window.setTimeout(buildNextSceneWhenIdle, 4600);
  },
  onRing: (x, y) => headline.resonate(x, y),
});

/* The third hero collaborator, and the only one that talks back to the bell:
   the clipboard is the first channel asyncify delivers to, so a copy is a
   delivery and rings it. Built after the scene because it holds the ring;
   the scene's entrance callback holds `start()` and does not fire until
   t = 1.30s, long after this line has run. */
const heroInstallRoot = document.querySelector<HTMLElement>("#hero .install");
if (!heroInstallRoot) throw new Error("[main] hero install block missing");
const heroField = document.querySelector<HTMLElement>("#hero");
const install = createInstallLine({
  root: heroInstallRoot,
  reducedMotion,
  ring: () => scene.ring(),
  doodleField: heroField ?? undefined,
});

/* The finale's reprise of the line (scene 5). No bell within reach, so the
   ring is a no-op; the "Install now" doodle reprises too (user call). It types
   when the finale block first comes on stage (the same moment proof.ts plays
   its staggered rise), watched with an IntersectionObserver rather than a
   ScrollTrigger because nothing here needs scroll-linked TIME — only "it is
   on stage now", once. */
const finaleInstallRoot = document.querySelector<HTMLElement>(".prf-finale .install");
const finaleField = document.querySelector<HTMLElement>(".prf-finale");
const installFinale = finaleInstallRoot
  ? createInstallLine({
      root: finaleInstallRoot,
      reducedMotion,
      ring: () => {},
      doodleField: finaleField ?? undefined,
    })
  : null;
let finaleIo: IntersectionObserver | null = null;
if (installFinale && finaleInstallRoot) {
  if (reducedMotion) {
    installFinale.start();
  } else {
    finaleIo = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          installFinale.start();
          finaleIo?.disconnect();
          finaleIo = null;
        }
      },
      { threshold: 0.6 },
    );
    finaleIo.observe(finaleInstallRoot);
  }
}



/* Scene 2 is independent of the hero — it neither reads from it nor writes to
   it. It also owns its own media gating (gsap.matchMedia), because the choice
   between a pinned scrub and a still figure depends on viewport width as well
   as on the motion preference, and width can change after boot. */
let engine: ReturnType<typeof createEngineScene> | null = null;

/* Scene 3 owns the bridge line above it as well as its own pin — the two are
   one narrative move, and the bridge exists only to hand over to the scene.
   Built after scene 2 so its ScrollTriggers are registered in document order;
   scene 2's fonts-ready ScrollTrigger.refresh() is global and re-measures
   these too, which is why this file does not ask for a second one. */
let turn: ReturnType<typeof createTurnScene> | null = null;

/* Scene 4 owns the second bridge as well as its own pin, exactly as scene 3
   owns the first — the two are one narrative move and the bridge exists only
   to hand over. Built after scene 3 so its ScrollTriggers are registered in
   document order; the fonts-ready ScrollTrigger.refresh() scene 2 asks for is
   global and re-measures these too. */
let agents: ReturnType<typeof createAgentsScene> | null = null;

/* Scene 5 owns one pin and no bridge — scene 4 hands over to it directly.
   Built after scene 4 so its ScrollTriggers are registered in document order;
   scene 2's fonts-ready ScrollTrigger.refresh() is global and re-measures this
   one too. */
let edit: ReturnType<typeof createEditScene> | null = null;

/* Scene 6 is the only unpinned scene on the page, and the only one that owns
   pointer physics as well as a scrub. Built last so its ScrollTriggers are
   registered in document order behind the four pins above it; scene 2's
   fonts-ready ScrollTrigger.refresh() is global and re-measures this one too,
   which matters more here than anywhere else — the table's own height is what
   the scrub's window is derived from. */
let proof: ReturnType<typeof createProofScene> | null = null;

/* ── deferred scene build ──────────────────────────────────────────────────
   WHY THE PAGE USED TO TAKE SECONDS TO SHOW (profiled, dev and prod alike):
   building the five lower scenes synchronously at module evaluation cost
   ~4-9s of main-thread layout work — every ScrollTrigger created after the
   document leaves "loading" refreshes on creation, each refresh of a pinned
   scrub reverts and re-renders its timeline, and every aligned motionPath
   tween init forces a full layout of a five-SVG page (getGlobalMatrix).
   None of that is above the fold: the hero (bell, headline, install line)
   is independent of all four. So the module finishes with the hero only —
   first paint arrives with the stylesheet — and the heavy scenes build one
   per animation frame right after, in document order, well inside the
   seconds the reader spends with the bell. The build chain starts on the
   first frame AFTER first paint; a reader cannot physically scroll past the
   hero before scene 2 exists. */
/* ── the scroll reservation ────────────────────────────────────────────────
   Each pinned scene's ScrollTrigger adds a pin spacer (its PIN_HEIGHTS x
   100vh) only when the scene BUILDS — so with deferred builds the page
   loaded ~9 screens short and grew as scenes arrived, and the scrollbar
   thumb visibly shrank a beat after load (user report). A placeholder at
   the end of <main> reserves that height from the first frame and pays it
   back share by share as each scene's real spacer lands: the thumb is the
   same size at 0ms as at rest. Desktop-with-motion only — that is the same
   media gate the pins themselves live behind. */
/* engine, turn, agents, EDIT, proof — each scene's PIN_HEIGHTS x 100, in
   document order. The edit's share is IMPORTED rather than written out: that
   scene is being built a slice at a time, so the scroll it reserves moves with
   SLICE_END, and a literal here would drift out of date silently — the exact
   failure this array exists to prevent (a thumb that shrinks a beat after
   load). It is the only entry that can move; the other four are settled. */
const PIN_SHARES_VH = [400, 230, 300, EDIT_PIN_VH, 150];
const reservePins = window.matchMedia(
  "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
).matches;
let pinReserve: HTMLElement | null = null;
let reservedVh = PIN_SHARES_VH.reduce((a, b) => a + b, 0);
if (reservePins) {
  pinReserve = document.createElement("div");
  pinReserve.setAttribute("aria-hidden", "true");
  pinReserve.style.height = `${reservedVh}vh`;
  document.querySelector("main")?.appendChild(pinReserve);
}
function payBackReserve(shareVh: number): void {
  if (!pinReserve) return;
  reservedVh = Math.max(0, reservedVh - shareVh);
  if (reservedVh === 0) {
    pinReserve.remove();
    pinReserve = null;
  } else {
    pinReserve.style.height = `${reservedVh}vh`;
  }
}

const sceneBuilders: Array<() => void> = [
  () => {
    engine = createEngineScene();
    payBackReserve(PIN_SHARES_VH[0]!);
  },
  () => {
    turn = createTurnScene();
    payBackReserve(PIN_SHARES_VH[1]!);
  },
  () => {
    agents = createAgentsScene();
    payBackReserve(PIN_SHARES_VH[2]!);
  },
  () => {
    edit = createEditScene();
    payBackReserve(PIN_SHARES_VH[3]!);
  },
  () => {
    proof = createProofScene();
    payBackReserve(PIN_SHARES_VH[4]!);
  },
];

/* Build the next scene when the browser is IDLE, not merely on the next
   frame: a scene build is a long task (0.5-2.5s of ScrollTrigger and
   motionPath layout work), and chained through rAF the four of them froze
   the main thread straight through the entrance — the bell traced in
   stutters and the page read as still loading (user report, twice). The
   chain now starts from onEntranceComplete, so the entrance owns the main
   thread outright, and each build waits for an idle gap (capped so the
   page is never more than ~1.5s from having its next scene). */
function buildNextSceneWhenIdle(): void {
  const next = sceneBuilders.shift();
  if (!next) return;
  /* NOT requestIdleCallback (tried): an animating page has idle time inside
     every 60fps frame, so rIC fired mid-entrance and the multi-second build
     froze the choreography — the exact lag it was meant to prevent (user
     report). The chain is now clocked instead: each build waits 400ms after
     the previous one finished, which is ~24 painted frames for the bell's
     sway, the typing and the ring to breathe between blocks. */
  window.setTimeout(() => {
    next();
    buildNextSceneWhenIdle();
  }, 400);
}

/* The one hole in "after the entrance": a reader who scrolls during the
   quiet window meets unbuilt scenes. The first draft flushed ALL FOUR in one
   synchronous block — a multi-second freeze landing exactly as scene 2
   entered the viewport, seen as a long black screen (user report). Now the
   flush is scroll-aware: the NEXT scene builds synchronously (that is the
   one the wheel is heading into), and the rest drain with an 80ms breath
   between blocks so the scroll keeps painting between them. The clocked
   chain's own timers stay armed — the queue is shared and shift() makes
   every builder run exactly once, so a timer firing into a drained queue is
   a no-op. */
function expediteSceneBuilds(): void {
  window.removeEventListener("wheel", expediteSceneBuilds);
  window.removeEventListener("touchmove", expediteSceneBuilds);
  window.removeEventListener("scroll", expediteSceneBuilds);
  const first = sceneBuilders.shift();
  if (first) first();
  const drain = (): void => {
    const b = sceneBuilders.shift();
    if (!b) return;
    b();
    window.setTimeout(drain, 80);
  };
  window.setTimeout(drain, 80);
}
window.addEventListener("wheel", expediteSceneBuilds, { passive: true, once: true });
window.addEventListener("touchmove", expediteSceneBuilds, { passive: true, once: true });
window.addEventListener("scroll", expediteSceneBuilds, { passive: true, once: true });

/* Reduced motion never reaches onEntranceComplete — bell.ts returns after its
   cross-fade — so the install line takes its instant text here and the scene
   chain starts directly. AFTER the builder definitions above, deliberately:
   this branch runs synchronously at module evaluation, and calling into the
   chain from up beside the bell wiring hit the builders' const TDZ — a
   ReferenceError that killed the whole module, a dead page for every
   reduced-motion visitor (found by the still-crops review agent). */
if (reducedMotion) {
  install.start();
  buildNextSceneWhenIdle();
}

/* The entrance runs once. Waiting for the first font frame avoids the
   headline re-flowing underneath a mid-flight SplitText. */
function boot(): void {
  scene.playEntrance();
}

if (document.fonts?.status === "loaded") {
  boot();
} else if (document.fonts?.ready) {
  // Cap the wait: a slow font must never hold the hero hostage.
  let booted = false;
  const once = () => {
    if (booted) return;
    booted = true;
    boot();
  };
  void document.fonts.ready.then(once);
  window.setTimeout(once, 300);
} else {
  boot();
}

/* Vite HMR: tear the scene down so ticker callbacks and listeners do not
   accumulate across edits. */
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    scene.destroy();
    headline.destroy();
    install.destroy();
    installFinale?.destroy();
    finaleIo?.disconnect();
    engine?.destroy();
    turn?.destroy();
    agents?.destroy();
    edit?.destroy();
    proof?.destroy();
  });
}
