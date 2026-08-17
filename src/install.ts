/* ══════════════════════════════════════════════════════════════════════════
   THE INSTALL LINE  —  "the first delivery is to your clipboard"
   ──────────────────────────────────────────────────────────────────────────
   One line of terminal text under the hero copy. It types itself once the
   bell's entrance has landed, it switches package on a tab, and copying it
   rings the bell: the clipboard is the first channel asyncify delivers to,
   so the moment it lands gets the same delivered-dot every other channel
   gets in this scene.

   Two things are load-bearing and neither is in this file:

     1. The width of the box is reserved in CSS, in `ch` of the mono font, for
        the longest command there is. Nothing here measures anything, and
        nothing here may make the line wider than that reservation — which is
        why the tail of a command is the only part that ever changes.
     2. The cursor blinks by CSS class, not by tween, and only between runs.
        A caret blinking under a moving caret reads as two cursors.

   The typing itself is a wall-clock loop on setInterval rather than a GSAP
   timeline: it mutates text, has no scrubbable state, and must be killable
   mid-character from a click. Anything a user can interrupt restarts clean
   (DESIGN.md §3) — `run()` below is the only writer of the visible text, so
   there is exactly one thing to kill.
   ══════════════════════════════════════════════════════════════════════════ */

import { gsap } from "gsap";

/* ══════════════════════════════════════════════════════════════════════════
   TUNING
   ══════════════════════════════════════════════════════════════════════════ */

/** Every command shares this head; a tab switch is a tail swap, never a
 *  rewrite of the whole line. */
const PREFIX = "npm i @asyncify-hq/";

/* Milliseconds per character. Typing is the slowest of the three because it
   is the one the reader is asked to read; erasing is the fastest because it
   is a correction, not a sentence; the retype sits between the two so the new
   package name arrives without making the switch feel slower than it was to
   ask for. 28ms ≈ 36 chars/s — fast enough to finish the longest tail in
   0.34s, slow enough to read as a hand rather than a paste. */
const TYPE_MS = 28;
const ERASE_MS = 18;
const RETYPE_MS = 24;

/** How long the copied receipt stands before the affordance goes back to
 *  offering. Long enough to be read after the eye returns from the bell. */
const REVERT_MS = 2400;

/* ══════════════════════════════════════════════════════════════════════════
   SCENE
   ══════════════════════════════════════════════════════════════════════════ */

export interface InstallLineOptions {
  /** When true: the command is already typed, nothing blinks. See DESIGN §3. */
  reducedMotion: boolean;
  /** A copy landed. The hero owns what that looks like; this file only says
   *  that it happened. */
  ring: () => void;
}

export interface InstallLine {
  /** Start typing. Called when the entrance has landed, once. */
  start(): void;
  destroy(): void;
}

function q<T extends Element>(root: ParentNode, sel: string): T {
  const el = root.querySelector<T>(sel);
  if (!el) throw new Error(`[install] missing element: ${sel}`);
  return el;
}

export function createInstallLine(opts: InstallLineOptions): InstallLine {
  const { reducedMotion } = opts;
  const doc = document;

  const line = q<HTMLButtonElement>(doc, "#install-line");
  const cmdEl = q<HTMLElement>(doc, "#install-cmd");
  const cursor = q<HTMLElement>(doc, "#install-cursor");
  const fb = q<HTMLElement>(doc, "#install-fb");
  const fbText = q<HTMLElement>(doc, "#install-fb-text");
  const fbDot = q<HTMLElement>(doc, "#install-fb-dot");
  const live = q<HTMLElement>(doc, "#install-live");
  const tabs = Array.from(doc.querySelectorAll<HTMLButtonElement>(".install-tab"));

  const commandFor = (pkg: string) => PREFIX + pkg;

  /* ── the doodle ────────────────────────────────────────────────────────────
     A hand-drawn wire from the screen's left edge to the line (user ask,
     scene 4's "click here" grammar): in from the edge, ONE cursive loop
     mid-flight, then a level glide whose arrowhead lands 12px short of the
     box. All geometry is measured from the line's own rect in hero-pixel
     coordinates — the copy column re-centres at every width, so nothing here
     can be authored as constants. The head's barbs are set ±26° about the
     measured end tangent (the scene-4 lesson: an eyeballed head reads
     broken). Drawn once, after the command finishes typing; a resize after
     that re-measures and re-sets the finished state. */
  const doodle = doc.querySelector<SVGSVGElement>("#install-doodle");
  const doodleWire = doodle?.querySelector<SVGPathElement>("#install-doodle-wire") ?? null;
  const doodleHead = doodle?.querySelector<SVGPathElement>("#install-doodle-head") ?? null;
  const doodleNote = doodle?.querySelector<SVGTextElement>("#install-doodle-note") ?? null;
  let doodleDrawn = false;
  let doodleRaf = 0;

  function doodleGeometry(): void {
    if (!doodle || !doodleWire || !doodleHead || !doodleNote) return;
    const hero = doc.querySelector<HTMLElement>("#hero");
    if (!hero) return;
    const hr = hero.getBoundingClientRect();
    const lr = line.getBoundingClientRect();
    if (lr.width < 2) return;
    doodle.setAttribute("viewBox", `0 0 ${hr.width.toFixed(0)} ${hr.height.toFixed(0)}`);
    const cy = lr.top + lr.height / 2 - hr.top;
    const tx = lr.left - hr.left - 14;
    /* The reference is a handwritten pigtail (user's sketch): the stroke
       ITSELF rises into one self-crossing loop and falls out of it toward
       the target -- not a circle attached to a line (the first draft's
       mistake, caught by the user along with its screen-edge start).
       Authored as cubics in a 250-wide local frame whose origin sits 250px
       left of the box at the line's own height -- "start from somewhere
       between", mid-field -- then a glide that arrives horizontal. */
    const ox = tx - 250;
    const oy = cy - 58;
    const P = (x: number, y: number) => `${(ox + x).toFixed(1)} ${(oy + y).toFixed(1)}`;
    doodleWire.setAttribute(
      "d",
      [
        `M ${P(0, 58)}`,
        /* rise from the start up over the loop's crown */
        `C ${P(36, 30)} ${P(86, 6)} ${P(98, 34)}`,
        /* down the loop's right side, around the bottom, back left */
        `C ${P(106, 58)} ${P(64, 78)} ${P(50, 54)}`,
        /* up the left side and OUT through its own stroke -- the crossing */
        `C ${P(38, 34)} ${P(58, 16)} ${P(84, 30)}`,
        /* the glide: falls out of the loop and levels off at the box */
        `C ${P(130, 52)} ${P(208, 58)} ${P(250, 58)}`,
      ].join(" "),
    );
    /* Barbs ±26° about the measured end tangent, 7.5px long. */
    const L = doodleWire.getTotalLength();
    const p1 = doodleWire.getPointAtLength(Math.max(0, L - 6));
    const p2 = doodleWire.getPointAtLength(L);
    const theta = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const barb = (sign: number) => {
      const a = theta + Math.PI + sign * (26 * Math.PI) / 180;
      return `${(p2.x + 7.5 * Math.cos(a)).toFixed(1)} ${(p2.y + 7.5 * Math.sin(a)).toFixed(1)}`;
    };
    doodleHead.setAttribute(
      "d",
      `M ${barb(1)} L ${p2.x.toFixed(1)} ${p2.y.toFixed(1)} L ${barb(-1)}`,
    );
    /* The caption stands over the loop's crown. */
    doodleNote.setAttribute("x", (ox + 70).toFixed(1));
    doodleNote.setAttribute("y", (oy - 10).toFixed(1));
  }

  function drawDoodle(): void {
    if (doodleDrawn || !doodleWire || !doodleHead || !doodleNote) return;
    doodleDrawn = true;
    doodleGeometry();
    if (reducedMotion) {
      gsap.set([doodleWire, doodleHead], { drawSVG: "0% 100%" });
      gsap.set(doodleNote, { opacity: 1 });
      return;
    }
    gsap.set([doodleWire, doodleHead], { drawSVG: "0% 0%" });
    const tl = gsap.timeline();
    tl.to(doodleWire, { drawSVG: "0% 100%", duration: 1.15, ease: "power2.inOut" }, 0);
    tl.to(doodleHead, { drawSVG: "0% 100%", duration: 0.28, ease: "power2.out" }, 1.1);
    tl.to(doodleNote, { opacity: 1, duration: 0.6, ease: "power1.out" }, 0.55);
  }

  function onDoodleResize(): void {
    cancelAnimationFrame(doodleRaf);
    doodleRaf = requestAnimationFrame(() => {
      if (!doodleDrawn) return;
      /* Past the entrance: geometry refreshes in its finished state. */
      doodleGeometry();
      if (doodleWire && doodleHead) gsap.set([doodleWire, doodleHead], { drawSVG: "0% 100%" });
    });
  }
  window.addEventListener("resize", onDoodleResize);

  let active = tabs.find((t) => t.getAttribute("aria-pressed") === "true") ?? tabs[0];
  let started = false;

  /* The one piece of state: what is on screen right now. `cmdEl.textContent`
     is written from here and nowhere else. */
  let text = "";
  let runTimer = 0;
  let revertTimer = 0;
  let liveRaf = 0;
  let dotTl: gsap.core.Timeline | null = null;

  /* ── typing ────────────────────────────────────────────────────────────── */

  function stopRun(): void {
    if (runTimer) {
      clearInterval(runTimer);
      runTimer = 0;
    }
  }

  /** Walk the visible text one character at a time until it IS `target`, then
   *  hand over. Direction is implied by the target: a target that starts with
   *  what is already there grows, anything else shrinks. That is what makes
   *  erase-to-prefix and type-the-tail the same loop, and what makes an
   *  interrupted run safe to abandon at any character — the next run reads
   *  wherever it was left and walks on from there. */
  function run(target: string, stepMs: number, done?: () => void): void {
    stopRun();
    setBlink(false);
    if (text === target) {
      done?.();
      return;
    }
    runTimer = window.setInterval(() => {
      text = target.startsWith(text) ? target.slice(0, text.length + 1) : text.slice(0, -1);
      cmdEl.textContent = text;
      if (text === target) {
        stopRun();
        done?.();
      }
    }, stepMs);
  }

  function setBlink(on: boolean): void {
    cursor.classList.toggle("is-blinking", on && !reducedMotion);
  }

  function settle(): void {
    setBlink(true);
  }

  function show(pkg: string): void {
    const target = commandFor(pkg);
    if (reducedMotion) {
      stopRun();
      text = target;
      cmdEl.textContent = text;
      return;
    }
    // Back to the shared head first: the reader watches the package name
    // change, not the whole command retype itself.
    run(PREFIX, ERASE_MS, () => run(target, RETYPE_MS, settle));
  }

  function start(): void {
    if (started) return;
    started = true;
    const target = commandFor(active?.dataset.pkg ?? "node");
    if (reducedMotion) {
      text = target;
      cmdEl.textContent = text;
      drawDoodle();
      return;
    }
    run(target, TYPE_MS, () => {
      settle();
      drawDoodle();
    });
  }

  /* ── the copy ──────────────────────────────────────────────────────────── */

  /** Clipboard without the permissioned API: a real selection in a real
   *  field, because `execCommand("copy")` copies the selection or nothing.
   *  Off-screen rather than hidden — `display:none` cannot be selected. */
  function copyFallback(value: string): boolean {
    const ta = doc.createElement("textarea");
    ta.value = value;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    ta.style.opacity = "0";
    doc.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = doc.execCommand("copy");
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }

  function revert(): void {
    revertTimer = 0;
    fb.classList.remove("is-copied");
    fbText.textContent = "copy";
    dotTl?.kill();
    dotTl = null;
    gsap.set(fbDot, { opacity: 0, scale: 1 });
    live.textContent = "";
  }

  function delivered(): void {
    // A second copy inside the window is a second delivery: take the receipt
    // down to nothing and rebuild it, rather than extend a stale one.
    if (revertTimer) {
      clearTimeout(revertTimer);
      revert();
    }
    fbText.textContent = "copied · delivered";
    fb.classList.add("is-copied");

    dotTl?.kill();
    if (reducedMotion) {
      gsap.set(fbDot, { opacity: 1, scale: 1 });
    } else {
      // The one sanctioned overshoot on this site, at the same 1.4× and the
      // same two power2 tweens the channel dots use when a packet lands.
      dotTl = gsap
        .timeline()
        .fromTo(fbDot, { opacity: 0, scale: 1 }, { opacity: 1, duration: 0.12, ease: "power2.out" })
        .to(fbDot, { scale: 1.4, duration: 0.09, ease: "power2.out" }, 0)
        .to(fbDot, { scale: 1, duration: 0.09, ease: "power2.inOut" }, 0.09);
    }

    // Screen readers get the delivery too. Emptied now and filled on the next
    // frame, so a repeat copy is two mutations of the live region and
    // therefore a second announcement rather than an unchanged string.
    live.textContent = "";
    cancelAnimationFrame(liveRaf);
    liveRaf = requestAnimationFrame(() => {
      live.textContent = "copied";
    });

    opts.ring();
    revertTimer = window.setTimeout(revert, REVERT_MS);
  }

  async function onCopy(): Promise<void> {
    const value = commandFor(active?.dataset.pkg ?? "node");
    let ok = false;
    try {
      await navigator.clipboard.writeText(value);
      ok = true;
    } catch {
      ok = copyFallback(value);
    }
    // Nothing was delivered, so nothing may claim it was: no receipt, no ring.
    if (ok) delivered();
  }

  /* ── wiring ────────────────────────────────────────────────────────────── */

  function onTab(ev: Event): void {
    const tab = ev.currentTarget as HTMLButtonElement;
    const pkg = tab.dataset.pkg;
    if (!pkg || tab === active) return;
    active = tab;
    for (const t of tabs) t.setAttribute("aria-pressed", String(t === active));
    // A tab pressed before the entrance lands only chooses what start() will
    // type; the line is still empty and must not be written behind it.
    if (started) show(pkg);
  }

  function onLineClick(): void {
    void onCopy();
  }

  line.addEventListener("click", onLineClick);
  for (const t of tabs) t.addEventListener("click", onTab);

  function destroy(): void {
    stopRun();
    window.removeEventListener("resize", onDoodleResize);
    cancelAnimationFrame(doodleRaf);
    if (revertTimer) clearTimeout(revertTimer);
    cancelAnimationFrame(liveRaf);
    dotTl?.kill();
    line.removeEventListener("click", onLineClick);
    for (const t of tabs) t.removeEventListener("click", onTab);
  }

  return { start, destroy };
}
