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
    // The line types itself only once the bell has landed: two things
    // arriving at once is neither of them arriving.
    install.start();
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

/* Reduced motion never reaches onEntranceComplete — bell.ts returns after its
   cross-fade — so the line takes its instant text here instead. */
if (reducedMotion) install.start();

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

/* Scene 5 is the only unpinned scene on the page, and the only one that owns
   pointer physics as well as a scrub. Built last so its ScrollTriggers are
   registered in document order behind the four pins above it; scene 2's
   fonts-ready ScrollTrigger.refresh() is global and re-measures this one too,
   which matters more here than anywhere else — the table's own height is what
   the scrub's window is derived from. */
let proof: ReturnType<typeof createProofScene> | null = null;

/* ── deferred scene build ──────────────────────────────────────────────────
   WHY THE PAGE USED TO TAKE SECONDS TO SHOW (profiled, dev and prod alike):
   building the four lower scenes synchronously at module evaluation cost
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
function buildLowerScenes(): void {
  requestAnimationFrame(() => {
    engine = createEngineScene();
    requestAnimationFrame(() => {
      turn = createTurnScene();
      requestAnimationFrame(() => {
        agents = createAgentsScene();
        requestAnimationFrame(() => {
          proof = createProofScene();
        });
      });
    });
  });
}
buildLowerScenes();

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
  window.setTimeout(once, 600);
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
    proof?.destroy();
  });
}
