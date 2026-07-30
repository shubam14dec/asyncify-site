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
import { SplitText } from "gsap/SplitText";

import { createBellScene } from "./bell";

/* Individual imports, never `gsap/all` — that pulls every plugin into the
   bundle. Budget is in DESIGN.md §6. */
gsap.registerPlugin(DrawSVGPlugin, MotionPathPlugin, SplitText);

/* GSAP defaults, so nothing in this codebase can accidentally ship a linear
   0.5s tween. The house curve is expo-out. */
gsap.defaults({ ease: "power2.out", duration: 0.4 });

const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const scene = createBellScene({ reducedMotion: motionQuery.matches });

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
  import.meta.hot.dispose(() => scene.destroy());
}
