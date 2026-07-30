/* ══════════════════════════════════════════════════════════════════════════
   POINTER  —  one cursor-velocity estimate, shared by every scene
   ──────────────────────────────────────────────────────────────────────────
   Two things on this page are pushed around by the cursor: the bell on its
   thread, and the words of the headline on theirs. They must read the SAME
   number, produced the SAME way, from ONE listener — otherwise a 1000 Hz
   gaming mouse and a 60 Hz trackpad disagree about what "a fast sweep" is,
   and they disagree *differently* in each scene.

   Two rules make the estimate honest, and both are load-bearing:

   1. It is a sliding-window average, not a frame-to-frame difference. A
      single jittery sample cannot spike it.
   2. It EXPIRES. A cursor parked next to a reactive object reports zero, not
      the speed it arrived at.

   Consumers apply it as a RATE on their own ticker (`v · dt`), never as a
   per-event impulse — that is what makes the deposited energy independent of
   how often the device reports.
   ══════════════════════════════════════════════════════════════════════════ */

/** How many recent samples the velocity estimate averages over. 5 smooths out
 *  single-frame jitter without adding perceptible lag. */
const SAMPLES = 5;

/** If no pointermove for this long, velocity reads zero. Without it, a cursor
 *  that stops next to the bell keeps pushing on stale samples forever. */
const STALE_MS = 90;

export interface PointerHandle {
  /** Last known cursor position, in client (viewport) pixels. */
  readonly clientX: number;
  readonly clientY: number;
  /** Horizontal speed in px/s. Reads 0 once the pointer has been still. */
  readonly vx: number;
  /** Forget the velocity history — e.g. at the start of a drag, where the
   *  samples from *before* the grab must not be handed to the gesture. */
  reset(): void;
  /** Drop this consumer. The window listener goes away with the last one. */
  release(): void;
}

/* ── module state: exactly one listener, however many consumers ──────────── */

let refs = 0;
let clientX = 0;
let clientY = 0;
let rawVX = 0;
let lastMoveT = -1e9;
const samples: { x: number; t: number }[] = [];
const subscribers = new Set<() => void>();

function onPointerMove(e: PointerEvent): void {
  const now = performance.now();
  clientX = e.clientX;
  clientY = e.clientY;

  samples.push({ x: e.clientX, t: now });
  if (samples.length > SAMPLES) samples.shift();
  const first = samples[0]!;
  const span = (now - first.t) / 1000;
  // Guard the divisor: two samples in the same millisecond would otherwise
  // report a velocity in the tens of thousands.
  rawVX = span > 0.004 ? (e.clientX - first.x) / span : 0;
  lastMoveT = now;

  // State is fully updated before anyone is told, so every subscriber sees
  // the same frame of truth.
  for (const notify of subscribers) notify();
}

/** Take a handle on the shared pointer. `onMove` (optional) fires after the
 *  shared state has been updated. */
export function acquirePointer(onMove?: () => void): PointerHandle {
  if (refs === 0) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
  }
  refs++;
  if (onMove) subscribers.add(onMove);

  let released = false;

  return {
    get clientX() {
      return clientX;
    },
    get clientY() {
      return clientY;
    },
    get vx() {
      return performance.now() - lastMoveT > STALE_MS ? 0 : rawVX;
    },
    reset(): void {
      samples.length = 0;
      rawVX = 0;
    },
    release(): void {
      if (released) return;
      released = true;
      if (onMove) subscribers.delete(onMove);
      refs--;
      if (refs === 0) {
        window.removeEventListener("pointermove", onPointerMove);
        samples.length = 0;
        rawVX = 0;
      }
    },
  };
}
