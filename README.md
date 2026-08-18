# Asyncify — the landing page

The scroll-driven story for [Asyncify](https://github.com/shubam14dec/Scalable-Notification-System) —
a horizontally scalable, multi-channel notification platform with AI agents
that answer back. This repo is the page itself: five pinned scenes that walk
a message from *your app has something to say* to *and now it can hear the
answer*, drawn live as you scroll.

**Stack:** Vite · vanilla TypeScript · GSAP (ScrollTrigger, DrawSVG,
MotionPath, Draggable + Inertia, SplitText) · hand-authored SVG. No
framework, no component library, no stock illustration — every wire, bell,
receipt and stamp is drawn in code.

## The five scenes

1. **The bell** — a physical bell on a thread (real damped-oscillator
   physics, not keyframes). Ring it and one call fans out to six channels
   with per-channel delivery receipts. Copying the `npm i` line is the
   page's first delivery: it rings the bell.
2. **The engine** — the delivery machinery under scroll: queues, priority
   lanes, retry ladders with backoff, failover, digest, and a dead-letter
   queue — every mechanism labeled with its real name from the platform.
3. **The turn** — delivered was just the beginning. A user replies from a
   drawn phone; the reply rides the same wire back and docks in a queue.
   Every event string on screen (`conversation-inbound`,
   `websocket event: message.changed`) is verified against platform source.
4. **Agents** — the reply lands in an agent: traced tool calls, guardrailed
   approvals, grounded answers, and a capability checklist that ticks only
   when each claim has been demonstrated on screen.
5. **Proof** — the receipts: eval runs, a full turn trace, human handoff,
   cost curves — printed by scroll onto a table, notarised with a drawn
   seal, and torn off a deli ticket dispenser to get there.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
```

## The discipline

The page holds itself to written laws — [`DESIGN.md`](DESIGN.md) and
[`BRAND.md`](BRAND.md) — enforced by boot-time asserts where arithmetic can
check them:

- **Scrubs are pure functions of scroll.** Explicit `fromTo` pairs,
  `immediateRender: false`, no randomness, no wall-clock reads — any scroll
  position renders the same frame, forward or backward, forever.
- **Two regimes, never mixed.** Scroll owns choreography; the pointer owns
  wall-clock life (the bell's swing, dragging receipts, tearing the ticket).
- **Geometry is measured, not tuned.** Cross-scene wires are computed from
  measured boxes at runtime; scroll endpoints are stated by reference
  (`endTrigger`), never as offsets that rot when layout moves.
- **Green is rationed.** It marks deliveries, one selection highlight, and
  a single CTA — nothing else on a near-black page gets the accent.
- **First paint is honest.** The stylesheet owns every rest-hidden state,
  scenes below the fold build after the hero's choreography (profiled from
  a 10.3s boot down to ~0.4s first paint), and the scrollbar reserves the
  pinned scenes' height so it never jumps.

## Status

Built from scratch alongside the platform, as its front door. The story the
page tells — one API call out, provider failover, replies riding back, and
production-ready agents answering them — is the platform, drawn.
