# asyncify — Design rules

`BRAND.md` says what the tokens are. This file says how to behave with them.

---

## 1. Elevation

| Do | Don't |
| --- | --- |
| Raise with color: `--canvas` → `--surface`, then a `--hairline` border. | Add a `box-shadow`. There are no shadows on this site. |
| Signal hover by moving `--hairline` → `--hairline-strong` or `--text`. | Signal hover by tinting the background green. |
| Group with a 1px divider or with space. | Wrap everything in a card. Nested cards are always wrong. |

Focus rings are the only exception to the no-shadow rule: `box-shadow: 0 0 0 2px rgba(61,214,140,.35)`
with zero blur, on `:focus-visible` only.

## 2. Color

| Do | Don't |
| --- | --- |
| Keep green for emission, delivery, and the one final CTA (BRAND §2). | Use green as a heading color, link color, or hover tint. |
| Use the gray ladder for every non-accent decision. | Introduce a new gray because "this one needed to be slightly lighter". |
| Use amber only for retry / backoff / degraded. | Use amber as a second accent for visual interest. |
| `::selection { background: rgba(61,214,140,.25); }` | Leave the browser's default blue selection on a near-black page. |

Scrollbar: 10px track on `--canvas`, thumb `--hairline` → `--hairline-strong` on hover, no
arrows. `scrollbar-color` for Firefox, `::-webkit-scrollbar-*` for the rest.

## 3. Motion

**Every animation must answer "what does this communicate?" in one sentence.** Hierarchy,
storytelling, feedback, or state change. "It looked cool" is not an answer — delete it.

### Durations

| Kind | Duration | Ease |
| --- | --- | --- |
| Press feedback (`:active`) | 100–160ms | `ease-out` |
| Hover, color, border | 150–200ms | `ease` |
| Micro UI (chip pop, receipt fade, dot flip) | 150–250ms | `expo.out` / `cubic-bezier(.16,1,.3,1)` |
| Entrance sequences | ≤ 1.3s total | `expo.out`, staggered 30–60ms |
| Story beats (the ring, a scene reveal) | may run 0.9–3s | `expo.out` at the head, `power1.inOut` for travel |
| Ambient loops (sway, glint, scroll hint) | 3–7s | `sine.inOut` / `linear` |

### Laws

- **No bounce, no elastic, no `back.out`. Ever.** Overshoot on a hairline dark UI reads as
  a bug. The one sanctioned overshoot is the delivered-dot's `1.4× → 1` pop-settle, and it is
  a scale on a 6px circle, authored as two `power2` tweens — not an elastic ease.
- **Never `ease-in` on anything a user triggered.** It delays the frame the user is watching.
- **Never animate layout.** `transform` and `opacity` only, plus SVG `stroke-dashoffset`,
  `stroke`, and `d`-free path draws. No `width`, `height`, `top`, `margin`, `padding`.
- **Never `transition: all`.** Name the properties.
- **Never animate from `scale(0)`.** `0.9`–`0.95` plus opacity. Things do not appear from nothing.
- **Anything that rests at `drawSVG: "0% 0%"` must have `stroke-linecap: butt`.** A zero-length
  dash with a *round* cap is not nothing — SVG paints it as a filled circle of stroke-width
  diameter at the path's start point. A scene whose rest state is "nothing drawn yet" therefore
  starts with one stray dot per undrawn stroke, scattered wherever those paths happen to begin.
  At 1–1.25px, `butt` and `round` are visually identical, so this costs nothing. (Cost us a
  bug report on scene 2: ~20 dots, one of them floating above the schematic on the
  not-yet-drawn timeline strip.)
- **`vector-effect: non-scaling-stroke` makes `stroke-dasharray` SCREEN-relative.** Chrome
  computes the stroke of such a path in screen space, and the dash pattern goes with it — so
  dash lengths stop being user units and become CSS pixels. Two consequences, and the second
  one is a trap:
  - A hand-authored dash pattern (a frayed end, a dotted guide) keeps the same look at every
    camera zoom. That is a feature; use it.
  - **DrawSVG cannot express a partial range on such a path.** It converts percentages into
    user units via `getTotalLength()`, and those numbers are then read as pixels. A wire drawn
    at 0.85 scale and told to hold `"0% 95%"` renders **fully solid** — the 5% it meant to hide
    is smaller than the error. `"0% 0%"`, `"0% 100%"` and `"50% 50%"` still work, because zero
    and everything are the same number in both spaces, which is exactly why the whole scene
    can draw itself and nobody notices.
  - So: to shorten a non-scaling stroke *to a specific point*, do not tween drawSVG. Cut the
    path into pieces at that point and cross-fade or dissolve a piece. (Cost us the first
    version of scene 2's network drop: the wire's severed end never pulled back, and the
    dashed fray sat underneath a solid line, invisible.)
- **A glyph outside the self-hosted subset is a MEASUREMENT bug, not a typographic
  one.** The latin faces cover `U+0000-00FF` plus a short list (check the package's own
  `unicode.json`, never guess): `·` U+00B7 and `º` U+00BA are in; `✓` U+2713, `≥` U+2265,
  `№` U+2116 and **`→` U+2192** are not. An out-of-subset character is painted by a
  *fallback* face, so it has an advance the scene's `monoWidth()` arithmetic cannot know —
  every width assert over that string is then a coin toss. Ticks are drawn paths; arrows
  on a mono printout are `->`. (Found in A16 slice C: two receipt lines had `→`.)
- **A boot assert whose condition folds to `true` deletes the rest of the scene, silently.**
  Rollup evaluates constant comparisons at build time. `if (0.44 > 0.35) throw` becomes an
  unconditional throw, and everything after it in that function is dead code — so the
  bundle *shrinks* and the scene never runs. The tell is cheap: build once with
  `vite build --minify false` and grep the output for element handles that lost their
  binding (`q(svg, "#x");` with no `const x =`). Zero of those means no assert fires and
  nothing was pruned. Run it whenever a slice adds asserts; a bundle that got smaller
  after you added code is the alarm.
- **Transform origins are explicit.** A bell rotates from its thread pivot, not its center. A
  clapper rotates from its yoke. A ripple grows from the mouth. Every `svgOrigin` /
  `transform-origin` in this codebase is written out and commented.
- **Interruptible beats restart cleanly.** A repeatable sequence (the ring) kills its timeline
  and resets every element it touches before rebuilding. No half-drawn paths left on screen.
- **Physics is simulated, not faked.** Where an object should feel like an object (the bell on
  its thread), run a real damped-oscillator integration on `gsap.ticker` with named, commented
  constants — not a keyframed swing.
- **The stylesheet owns the first paint.** An element whose hidden rest state is applied
  by JavaScript paints its RAW MARKUP for every frame before that JS runs — the hero svg's
  authored markup is the finished drawing, and it flashed whole (green clapper ball and
  all) on every reload until the svg's rest-hide moved into the stylesheet. Rule: if a
  thing must not be seen before its entrance, the stylesheet hides it and the entrance
  reveals it; boot-time `gsap.set` hiding is always too late.
- **Scroll endpoints that mean "when that scene arrives" are stated by reference, not
  arithmetic.** `end: "top -85%"` is a guess about the layout between two sections; the layout
  changed by ~140px and the guess silently missed, so scene 4's pin engaged while the bridge
  wire was still 4% from done and the hand-off tore. `endTrigger: "#scene-agents", end: "top
  top"` states the intent itself — the timeline ends at the moment the next scene pins,
  whatever the page between them does. Any scrub whose finale must coincide with another
  element's arrival gets an `endTrigger` on that element, never a tuned offset.

### `prefers-reduced-motion`

Reduced motion is a **designed still state**, not a disabled one. The rule: the user must
still receive every piece of information the motion carried, delivered by opacity and color
instead of position and time.

| Full motion | Reduced motion |
| --- | --- |
| Thread draws, bell traces itself, headline words rise | Everything cross-fades in, 400ms |
| Bell sways, clapper lags, rim glint travels | Bell is still. Glint holds at a low static opacity. |
| Cursor pendulum physics | Not started. `gsap.ticker` callback is never registered. |
| Ring: clapper strike, ripple, paths draw, dots travel | Paths, green dots, and receipts fade in at once (200ms), hold, fade out |
| Scroll hint drains on a loop | Static 1px line at rest opacity |

Detect once with `matchMedia('(prefers-reduced-motion: reduce)')` and branch at the top of the
scene, not with `if (reduced)` scattered inside tweens.

## 4. Typography behavior

- Headlines are **balanced**: `text-wrap: balance`. Sublines are `text-wrap: pretty`.
- Display type never exceeds 2 lines at desktop. If it does, the font size is wrong, not the copy.
- Tracking floor is `-0.02em` at display, `0` at body. Never letterspace body text.
- Numbers are `tabular-nums` everywhere so a receipt changing from `98ms` to `214ms` does not
  shift the layout.

## 5. Interaction

- Every pressable element has `:active { transform: scale(.97) }` with a 140ms `ease-out`
  transition on `transform` only.
- Hover effects are gated behind `@media (hover: hover) and (pointer: fine)` so a tap on
  mobile does not leave a stuck hover state.
- Every interactive element has a visible `:focus-visible` ring. Keyboard users get the same
  affordances: the bell is a `<button>`-role element and rings on `Enter` / `Space`.
- Touch targets are ≥ 40px. The bell's hit path is deliberately larger than its outline.

## 6. Performance budget

- **Nothing below the fold builds before first paint.** The four lower scenes
  cost seconds of main-thread layout to construct (every ScrollTrigger created
  after parsing self-refreshes; refreshing a pinned scrub reverts and
  re-renders its timeline; every aligned motionPath init forces layout of a
  five-SVG page). The hero owes none of that: main.ts builds it alone, paints,
  then builds scenes 2-5 one per animation frame. First paint went 10.3s to
  0.4s the day this rule was written.
- **motionPath never uses `align` here.** Every packet is a circle authored at cx/cy 0
  in its path's own coordinate space, so the path's absolute coordinates centre it on
  the stroke by construction. `align` computes the same thing through getGlobalMatrix —
  one forced full-document reflow per tween init — and with ~40 aligned tweens it WAS
  the page's entire multi-second build cost (profiled; removing it cut scene builds
  3-4x). If a future packet genuinely lives in a different transform space, fix the
  authoring, not the plugin flag.
- **`invalidateOnRefresh` stays off on the big scrubs.** Explicit-constant
  fromTo pairs make invalidation a no-op re-parse with a very real re-init
  bill. If a tween ever genuinely needs re-measuring on refresh, give THAT
  tween function-based values and flip the flag on its own trigger, not the
  scene's.

| Metric | Budget |
| --- | --- |
| JS, gzipped | **< 150 KB** |
| CSS, gzipped | < 12 KB |
| Frame rate during the hero ring | 60fps on a mid-tier laptop |
| Console errors / warnings | 0 |
| Layout-triggering animated properties | 0 |

Fonts are self-hosted woff2, `font-display: swap`, latin subset only. Only the weights listed
in BRAND §3 are imported. GSAP plugins are imported individually (`gsap/DrawSVGPlugin`), never
`gsap/all`.

## 7. Anti-patterns (hard bans on this site)

- Gradient text.
- Colored side-stripes (`border-left: 3px solid …`) on cards, callouts, or list items.
- Glassmorphism / `backdrop-filter` as decoration.
- A tracked-uppercase eyebrow over every section. At most one per three sections.
- A bouncing scroll chevron. The hero uses a draining 1px line.
- Div-based fake screenshots and fake terminal windows.
- Three equal feature cards as a page structure.
- Infinite micro-animations on informational content.
- Section numbers (01 / 02 / 03) where the order carries no meaning.
