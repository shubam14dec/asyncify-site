# Asyncify — landing page

The landing page for [Asyncify](https://github.com/shubam14dec/Scalable-Notification-System) —
notification infrastructure with AI agents that answer back.

Asyncify is a horizontally scalable, multi-channel notification platform
built from scratch. Your app makes **one API call**; Asyncify works out who
to notify, on which channels, and delivers it reliably — priority lanes so
an OTP never waits behind a marketing blast, retries with backoff, provider
failover, digests, and a dead-letter queue for replay.

And delivery is only half the story: when your users reply — from email,
Telegram, Slack, or the in-app inbox — the reply rides the same wire back
into an **AI agent** you control. Any model, your system prompt, traced tool
calls, guardrailed approvals, grounded answers, and human handoff when it
matters. Delivered was just the beginning; Asyncify listens for what comes
back.

**Channels:** email, SMS, push, in-app (live WebSocket + durable inbox),
Telegram, Slack.

**SDKs:** `@asyncify-hq/node` · `@asyncify-hq/react` ·
`@asyncify-hq/react-native` · `@asyncify-hq/cli` · `@asyncify-hq/agent`

```bash
npm i @asyncify-hq/node
```

## This repo

The page itself: a scroll-driven story that draws the platform live —
built with Vite, vanilla TypeScript, GSAP, and hand-authored SVG. No
framework, no stock illustration. Design rules live in
[`DESIGN.md`](DESIGN.md) and [`BRAND.md`](BRAND.md).

```bash
npm install
npm run dev        # http://localhost:5180
npm run preview    # http://localhost:5181 (serves dist/)
npm run build      # production build in dist/
```
