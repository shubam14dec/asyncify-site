# asyncify — Brand

The taste contract. Every slice of asyncify.org is measured against this file.
If a value is not in here, it does not go on the page.

---

## 1. Color tokens

All tokens live in `src/styles.css` under `:root`. Never hardcode a hex in a component.

| Token | Value | Role |
| --- | --- | --- |
| `--canvas` | `#0a0a0a` | Page background. The only background the page ever has. |
| `--surface` | `#111111` | Raised surfaces (chips, cards, inputs). Elevation is color, never shadow. |
| `--hairline` | `#262626` | Default 1px border. The structural line of the whole site. |
| `--hairline-strong` | `#3f3f3f` | Hover / focus border, active dividers. |
| `--text` | `#ededed` | Primary text, headlines, bell strokes. |
| `--text-dim` | `#a1a1a1` | Secondary text, sublines, nav links. |
| `--text-faint` | `#6e6e6e` | Receipts, timestamps, idle status dots, captions. |
| `--green` | `#3dd68c` | **THE accent.** Rationed — see §2. |
| `--green-soft` | `rgba(61,214,140,0.25)` | `::selection` only. |
| `--amber` | `#ffb224` | Retry / backoff moments only. Never decoration, never success. |

### Grays are a ladder, not a palette

`#0a0a0a → #111111 → #262626 → #3f3f3f → #6e6e6e → #a1a1a1 → #ededed`

Seven steps. If a shade you want is not on the ladder, you want a step that already exists.
No warm grays. No cool grays. No opacity-faked grays over the canvas for *text* (opacity is
fine for motion, not for a resting color).

---

## 2. The rationing law (the single most important rule here)

`--green` is the color of **a message that arrived**. It appears in exactly three places
across the entire site:

1. **The bell's ring and ripple** — the moment of emission, plus the rim glint that tells you
   the bell is metal and alive.
2. **Delivered moments and receipts** — a channel status dot flipping to green, a
   `delivered · 214ms` receipt, a success state in a later scene.
3. **The single final CTA** at the bottom of the page. One green button on the whole site.

The brand mark dot after the wordmark is the one sanctioned exception: it *is* the
delivered-dot, used as identity.

**Green is never:** a heading, a link, an underline, a border on a normal element, a
gradient stop, a hover state, an icon tint, a bullet, or a divider. If you are reaching for
green to make something "pop," the layout is wrong.

`--amber` follows the same law with a smaller domain: retry, backoff, degraded. Never
"warning" as decoration.

---

## 3. Type

**Geist Sans** — 400 / 500 / 600, self-hosted via `@fontsource/geist-sans`.
**Geist Mono** — 400 / 500, self-hosted via `@fontsource/geist-mono`.

| Role | Family | Size | Weight | Tracking | Notes |
| --- | --- | --- | --- | --- | --- |
| Display / hero | Geist Sans | `clamp(2rem, min(5vw, 8.2vh), 4.75rem)` (32–76px) | 400 | `-0.02em` | Line-height 1.06. Never 600 at display size. The `vh` term is not optional — see below. |
| Section head | Geist Sans | 32–44px | 500 | `-0.02em` | |
| Body / subline | Geist Sans | 16–18px | 400 | `0` | Line-height 1.55, `--text-dim`. Measure ≤ 62ch. |
| Button / nav | Geist Sans | 14–15px | 500 | `-0.005em` | |
| **All numbers** | Geist Mono | inherit | 400 | `0` | `font-variant-numeric: tabular-nums`. |
| Receipts / status | Geist Mono | 11–12px | 400 | `0.01em` | `--text-faint`. |
| Chip labels | Geist Mono | 12px | 500 | `0.01em` | Lowercase, always. |
| Code | Geist Mono | 13–14px | 400 | `0` | |

**Display type is capped by viewport height, not just width.** A full-viewport
scene has a fixed vertical budget: nav + scene + copy + hint. Size the headline off `vw`
alone and on a 1536×674 laptop it eats the scene's band and pushes the CTA below the fold.
Every full-height section on this site sizes its display type, its vertical margins, and its
paddings with a `vh` term.

**Mono is for measurement, not for costume.** Numbers, durations, IDs, channel names, code,
receipts. It is not a way to say "we are a developer tool" on a marketing headline.

**Weight, not color, is emphasis.** No gradient text. Ever.

---

## 4. Shape and space

- **Radius:** `6px` for chips, buttons, inputs, pills. `16px` for cards and panels. Nothing else.
  Two values, no third. Never a pill/full radius next to a 6px radius.
- **Spacing:** 4px base. Use `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128`. Nothing between steps.
- **Borders:** `1px solid var(--hairline)`. Every box on this site is defined by a hairline.
- **Shadows:** none. Zero. `box-shadow` does not appear in this codebase except as a focus ring
  (`0 0 0 2px` flat, no blur). Depth comes from `--canvas → --surface → --hairline`.
- **Stroke weights (SVG scenes):** `1.25px` primary silhouette, `1px` secondary detail,
  `1px` accent detail. Always `vector-effect: non-scaling-stroke` so the hairline reads the
  same regardless of how far the scene is scaled.

---

## 5. Layout

- **Text column:** `max-width: 1080px`, centered, `--page-pad` gutters (24px mobile, 32px desktop).
- **Scenes:** full-bleed. A scene may use the whole viewport width; its *copy* may not.
- **Hero:** `min-height: 100dvh` (never `100vh` — iOS address bar).
- **Breakpoints:** `768px` (mobile → tablet), `1024px` (→ desktop). Two. That is enough.

---

## 6. Voice

Short declaratives. Present tense. The product does the thing; we do not "empower you to".
Numbers are real or explicitly mocked. No exclamation marks. No "seamless", "effortless",
"revolutionize", "unleash". The channel names are lowercase because that is how they appear
in the API.
