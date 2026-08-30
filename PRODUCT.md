# asyncify — Product context

Durable context for anyone (human or agent) building on asyncify.org.
Read this before `DESIGN.md`; read `BRAND.md` before writing a single hex value.

---

## What it is

**asyncify** is notification infrastructure. One API call fans a message out across every
channel a user can be reached on — email, sms, push, in-app, telegram, slack — with
per-channel delivery receipts, retries, and preferences handled for you.

The second half of the product is what makes it different: notifications are **two-way**.
A user can reply to a notification, and an **agent** picks it up, acts, and reports back with
a receipt of what it did. Novu delivers messages. asyncify delivers messages and then answers
them.

## Surface

`asyncify.org` — the marketing site. Single page, six scenes, Persuade mode.
Not the dashboard, not the docs. This repo is only the landing page.

## Audience

Developers evaluating notification and agent infrastructure. Concretely: a backend or
platform engineer who has been asked to "add notifications" and is now comparing us against
Novu, Knock, Courier, and rolling it themselves.

They are technical buyers. That means:

- They distrust marketing adjectives and trust artifacts — latencies, payloads, receipts, code.
- They will read the hero, scroll once, and decide whether to open the docs. The first
  viewport is 90% of the sale.
- They are on a large screen, in a dark editor theme, at work.
- They have seen a thousand SaaS landing pages this year. Anything templated reads as a
  product that is also templated.

## The story (six scenes, in order)

1. **The bell rings.** Your product has something to say. One event, one API call. The hero,
   and the only scene above the fold.
2. **The scale.** The fan-out, drawn as a machine: priority lanes so an OTP never waits behind
   a marketing blast, retries with backoff, provider failover, a dead-letter queue. The burst
   is absorbed and nothing is dropped.
3. **The turn.** *Delivered was just the beginning.* The notification lands in the user's
   inbox, they reply to it, and the reply travels back in on the same wire.
4. **Agents.** *It answers. You stay in control.* An agent of yours reads the reply, remembers,
   looks things up, waits for a human on the one action that matters, and answers back in the
   thread the reply was written in — with a receipt for the send.
5. **The edit.** *Prompt edits are deploys.* One line of an agent's prompt changes, and the
   reader watches that one line travel eight stations before it can reach anybody: judged
   evals, a CI gate that catches a regression, the customer's own pre-save check, a canary
   judged against the version it replaces, model routing, two gates around the brain, and
   per-customer limits. The quality ladder is a journey here rather than a feature list, and
   the scene lands with the version rail printing itself as a receipt the reader can tear off.
6. **Proof, and the CTA.** *Don't take my word. See the proof.* The claims above, checked
   against real numbers — then the single green button, the only one on the site.

Each scene is one idea. If a scene needs two ideas, it is two scenes.

## Personality

**Engineered. Quiet-confident. Terminal-native premium.**

- *Engineered* — the page behaves like a well-built system. The bell is a real pendulum
  simulation, not a keyframed wobble. The receipts show real-looking latencies. Nothing on
  the page is a decorative lie.
- *Quiet-confident* — near-black canvas, hairline borders, one accent used maybe eight times
  on the whole page. We do not shout. The restraint is the flex.
- *Terminal-native* — Geist Mono for anything measurable, lowercase channel names, the
  aesthetic of a good CLI. Not skeuomorphic terminals; the *discipline* of a terminal.
- *Premium* — in the Resend / Linear family: obsessive spacing, real physics, zero filler.
  But delivery-green, not violet. Violet is the AI-infra default and we are not that.

## Register

The page speaks the way the product's own logs speak.

- `delivered · 214ms`, not "Lightning fast delivery!"
- `email · sms · push · in-app · telegram · slack`, lowercase, as they appear in the API.
- Headline copy is a short declarative sentence, not a value-prop sandwich.

## What this page is not

Not a feature grid. Not a pricing page. Not a comparison table. Not a testimonial wall.
It is one demonstration, told in five moves, ending in one button.
