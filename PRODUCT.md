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

`asyncify.org` — the marketing site. Single page, five scenes, Persuade mode.
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

## The story (five scenes, in order)

1. **The bell rings.** Your product has something to say. One event, one API call.
   *(Shipped — the hero.)*
2. **The engine delivers everywhere.** The fan-out: channels, retries, receipts, preferences.
3. **Notifications become two-way.** The user replies. The message comes back in.
4. **Agents answer, with receipts.** An agent reads the reply, calls tools, and shows its work.
5. **The single green CTA.** The only green button on the site.

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
