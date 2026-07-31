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
import "@fontsource/geist-mono/latin-500.css";

import "./styles.css";

import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

import { createBellScene } from "./bell";
import { createEngineScene } from "./engine";
import { createHangingHeadline } from "./headline";
import { createTurnScene } from "./turn";

/* Individual imports, never `gsap/all` — that pulls every plugin into the
   bundle. Budget is in DESIGN.md §6. */
gsap.registerPlugin(DrawSVGPlugin, MotionPathPlugin, ScrollTrigger, SplitText);

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
  onEntranceComplete: () => headline.activate(),
  onRing: (x, y) => headline.resonate(x, y),
});

/* Scene 2 is independent of the hero — it neither reads from it nor writes to
   it. It also owns its own media gating (gsap.matchMedia), because the choice
   between a pinned scrub and a still figure depends on viewport width as well
   as on the motion preference, and width can change after boot. */
const engine = createEngineScene();

/* Scene 3 owns the bridge line above it as well as its own pin — the two are
   one narrative move, and the bridge exists only to hand over to the scene.
   Built after scene 2 so its ScrollTriggers are registered in document order;
   scene 2's fonts-ready ScrollTrigger.refresh() is global and re-measures
   these too, which is why this file does not ask for a second one. */
const turn = createTurnScene();

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
    engine.destroy();
    turn.destroy();
  });
}
