/* ══════════════════════════════════════════════════════════════════════════
   asyncify.org — /contact
   The page sends a real message and narrates the send. Nothing here fakes a
   delivery: the packet flies while the POST is in the air, and the receipt is
   printed from what came back — the server's id and a clock the browser read
   itself. If the request fails the page says `held` and hands over a mailto.

   The form works with this file absent: it is a native POST to the same
   endpoint. This module only intercepts the submit to show the machinery.
   ══════════════════════════════════════════════════════════════════════════ */

/* Self-hosted, latin subset. Only the weights this page sets (BRAND.md §3).
   cssCodeSplit is off, so these resolve into the site's single stylesheet
   alongside the ones main.ts imports — the shared faces cost nothing twice. */
import "@fontsource/geist-sans/latin-400.css";
import "@fontsource/geist-sans/latin-500.css";
import "@fontsource/geist-mono/latin-400.css";
import "@fontsource/geist-mono/latin-500.css";

import "./styles.css";

/* Core only. No DrawSVG: the wire's rest state is *drawn*, so nothing needs
   to trace itself, and a non-scaling stroke cannot hold a partial drawSVG
   range anyway (DESIGN.md §3). No ScrollTrigger, no MotionPath — the packet
   walks the path with getPointAtLength, authored at 0,0 in the path's own
   coordinate space so no matrix has to align it (DESIGN.md §6). */
import { gsap } from "gsap";

/* ── boot ──────────────────────────────────────────────────────────────── */

function q<T extends Element>(sel: string): T {
  const el = document.querySelector<T>(sel);
  if (!el) throw new Error(`contact: missing element ${sel}`);
  return el;
}

function must(ok: boolean, what: string): void {
  if (!ok) throw new Error(`contact: ${what}`);
}

const form = q<HTMLFormElement>("#ct-form");
const send = q<HTMLButtonElement>("#ct-send");
const fromInput = q<HTMLInputElement>("#ct-from");
const nameInput = q<HTMLInputElement>("#ct-name");
const messageInput = q<HTMLTextAreaElement>("#ct-message");
const honeypot = q<HTMLInputElement>("#ct-company");
const receipt = q<HTMLElement>("#ct-receipt");
const clip = q<HTMLElement>("#ct-clip");
const dot = q<HTMLElement>("#ct-rcpt-dot");
const msOut = q<HTMLElement>("#ct-rcpt-ms");
const idOut = q<HTMLElement>("#ct-rcpt-id");
const meter = q<HTMLElement>("#ct-meter");
q<HTMLElement>(".ct-head"); /* the request line exists — q throws if not */
const bell = q<SVGGElement>("#ct-bell");
const clapper = q<SVGCircleElement>("#ct-clapper");

const statusEls = new Map<string, HTMLElement>();
for (const el of document.querySelectorAll<HTMLElement>(".ct-st")) {
  const key = el.dataset["st"];
  if (key) statusEls.set(key, el);
}

/* Colors come out of the tokens, never out of this file (BRAND.md §1). The
   box blink needs resolved values because gsap interpolates numbers, not
   `var()` references. */
const rootStyle = getComputedStyle(document.documentElement);
const token = (name: string): string => rootStyle.getPropertyValue(name).trim();
const GREEN = token("--green");
const CANVAS = token("--canvas");

/* Whatever the browser calls --green once it has parsed it, so the assert
   below compares like with like without a hex ever appearing here. */
const greenComputed = ((): string => {
  const probe = document.createElement("span");
  probe.style.backgroundColor = GREEN;
  document.body.appendChild(probe);
  const value = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return value;
})();

/* ── asserts ───────────────────────────────────────────────────────────────
   Every condition below reads the DOM, so none of them can fold to a
   constant at build time and prune the rest of this module (DESIGN.md §3).
   ─────────────────────────────────────────────────────────────────────── */

must(GREEN !== "" && CANVAS !== "", "color tokens did not resolve");

must(form.method.toLowerCase() === "post", "the form is not a POST");
must(
  new URL(form.action, location.href).pathname === "/api/contact",
  "the form does not post to /api/contact",
);
must(send.type === "submit", "the send button is not the form's submit");

/* The bell must swing about the point a thread would hold: its body's top
   centre, which is the local origin the rotation below pivots on. */
must(bell.querySelector(".ct-bellbody") !== null, "the button's bell has no body");
must(clip.contains(receipt), "the receipt is not inside its clip");
must(getComputedStyle(receipt).transform !== "none", "the receipt is not parked above its slot");
must(getComputedStyle(dot).opacity === "0", "the delivered-dot is lit before a delivery");

/* display:none would be the easy way to hide the honeypot and the wrong one:
   some bots read the computed style and skip anything not rendered. */
must(getComputedStyle(honeypot).display !== "none", "the honeypot is display:none");
must(honeypot.tabIndex === -1, "the honeypot is in the tab order");
must(honeypot.autocomplete === "off", "the honeypot has autocomplete on");
must(honeypot.getBoundingClientRect().right < 0, "the honeypot is on screen");

/* The rationing law, enforced where it applies: one green element in the
   compose card, and it is the CTA. (The masthead's brand dot and the
   receipt's delivered-dot are BRAND §2's sanctioned uses and live outside
   this card, which is exactly why the scope is the card.) */
const greens = Array.from(form.querySelectorAll<HTMLElement>("*")).filter(
  (el) => getComputedStyle(el).backgroundColor === greenComputed,
);
must(greens.length === 1, `${greens.length} green elements in the compose card, expected 1`);
must(greens[0] === send, "the green element in the compose card is not the send button");

must(statusEls.size === 5, `${statusEls.size} status words, expected 5`);
for (const word of ["ready", "queued", "sending", "delivered", "held"]) {
  must(statusEls.has(word), `the status word "${word}" is missing`);
}

/* ── state ─────────────────────────────────────────────────────────────── */

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

let current = statusEls.get("ready") as HTMLElement;
let inFlight = false;

/** Two stacked spans, crossfaded. The site never rewrites one element's text
 *  while it is animating — a status that swaps characters flickers, one that
 *  dissolves into the next reads as a state change. */
function status(next: string): void {
  const el = statusEls.get(next);
  if (!el || el === current) return;
  const from = current;
  current = el;
  gsap.to(from, { opacity: 0, duration: 0.18, ease: "power1.out", overwrite: "auto" });
  gsap.to(el, { opacity: 1, duration: 0.18, ease: "power1.out", overwrite: "auto" });
}

/** A narrative beat: the queued/sending words need a moment to be read even
 *  when the round-trip is quick — the receipt still prints only from the
 *  REAL response, this just keeps the story legible. */
function wait(seconds: number): Promise<void> {
  return new Promise<void>((resolve) => {
    gsap.delayedCall(seconds, resolve);
  });
}

/** The receipt comes down out of the mouth on a transform alone — the slot's
 *  height is reserved in the stylesheet, so printing costs no layout. */
function printReceipt(held: boolean): void {
  receipt.classList.toggle("is-held", held);
  /* A held send re-enables the button, so this can run twice. Reset what the
     last print left behind before rebuilding — no half-lit dot carried over. */
  gsap.set(dot, { opacity: 0, scale: 1 });

  if (reduced) {
    gsap.set(receipt, { yPercent: 0 });
    gsap.fromTo(receipt, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power1.out" });
    gsap.to(dot, { opacity: held ? 1 : 0.55, duration: 0.2, ease: "power1.out" });
    return;
  }

  /* One timeline, because the dot's beat has to land WHEN THE PAPER IS OUT.
     A delayed fromTo would apply its from-values at creation instead — the
     flash would happen at t=0, above the mouth, where nobody can see it.
     `immediateRender: false` is what holds it back to its position. */
  const tl = gsap.timeline();
  tl.set(receipt, { opacity: 1 }, 0);
  tl.fromTo(receipt, { yPercent: -160 }, { yPercent: 0, duration: 0.72, ease: "power2.out" }, 0);

  if (held) {
    tl.to(dot, { opacity: 1, duration: 0.24, ease: "power1.out" }, 0.34);
    return;
  }

  /* The sanctioned delivery moment (BRAND §2): full green, the 1.35→1 settle
     authored as power2 tweens — never an elastic — and then down to a resting
     0.55, so the dot keeps something to say the next time one arrives. */
  tl.fromTo(
    dot,
    { opacity: 1, scale: 1.35 },
    { scale: 1, duration: 0.32, ease: "power2.out", immediateRender: false },
    0.34,
  );
  tl.to(dot, { opacity: 0.55, duration: 0.6, ease: "power2.out" }, 0.34);
}

/** ONE strike, damped to stillness — never a loop (DESIGN law). The bell in
 *  the send button swings about its top-centre (where a thread would hold
 *  it), and the clapper flashes pure white with a small pop, the hero's own
 *  strike (BRAND §1 note). Fired by the click itself (user call): pressing
 *  send IS ringing the bell — the receipt still carries the truth about
 *  whether the message arrived. */
function ringBell(): void {
  if (reduced) return;
  const tl = gsap.timeline();
  tl.to(bell, { rotation: 9, duration: 0.14, ease: "power2.in", svgOrigin: "0 0" }, 0);
  tl.to(bell, { rotation: -6, duration: 0.28, ease: "power1.inOut", svgOrigin: "0 0" }, 0.14);
  tl.to(bell, { rotation: 3.5, duration: 0.26, ease: "power1.inOut", svgOrigin: "0 0" }, 0.42);
  tl.to(bell, { rotation: -1.5, duration: 0.22, ease: "power1.inOut", svgOrigin: "0 0" }, 0.68);
  tl.to(bell, { rotation: 0, duration: 0.28, ease: "power1.out", svgOrigin: "0 0" }, 0.9);
  /* The strike lands where the swing first reverses. */
  tl.to(clapper, { fill: "#ffffff", scale: 1.3, duration: 0.1, ease: "power2.out", svgOrigin: "0 17.5" }, 0.12);
  tl.to(clapper, { fill: CANVAS, scale: 1, duration: 0.4, ease: "power2.out", svgOrigin: "0 17.5" }, 0.22);
}

type ContactReply = { ok?: boolean; id?: string; error?: string };
type Sent = { ok: boolean; id: string; ms: number };

async function post(): Promise<Sent> {
  const began = performance.now();
  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        from: fromInput.value.trim(),
        name: nameInput.value.trim(),
        message: messageInput.value.trim(),
        company: "",
      }),
    });
    const ms = Math.max(1, Math.round(performance.now() - began));
    if (!res.ok) return { ok: false, id: "", ms };
    const body = (await res.json()) as ContactReply;
    return { ok: body.ok === true, id: typeof body.id === "string" ? body.id : "", ms };
  } catch {
    return { ok: false, id: "", ms: Math.max(1, Math.round(performance.now() - began)) };
  }
}

/* A shape check, not a validity ruling — the server checks again, and the
   browser's own required/type=email is what reports the problem to the user. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* ── the instrumented rows ─────────────────────────────────────────────────
   A field holding a usable value earns its drawn tick (the row's is-ok), and
   the payload row keeps a live character count against the server's own cap.
   Pure state → class/text; the transitions live in the stylesheet. */
function arm(el: HTMLInputElement | HTMLTextAreaElement, usable: () => boolean): void {
  const row = el.closest<HTMLElement>(".ct-row");
  if (!row) return;
  el.addEventListener("input", () => row.classList.toggle("is-ok", usable()));
}
arm(fromInput, () => EMAIL.test(fromInput.value.trim()));
arm(messageInput, () => messageInput.value.trim().length > 0);
messageInput.addEventListener("input", () => {
  meter.textContent = `${messageInput.value.length} / 2000`;
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (inFlight) return;

  const from = fromInput.value.trim();
  const message = messageInput.value.trim();
  if (!EMAIL.test(from) || message.length === 0) {
    form.reportValidity();
    (EMAIL.test(from) ? messageInput : fromInput).focus();
    return;
  }

  inFlight = true;
  send.disabled = true;

  ringBell();
  status("queued");
  gsap.delayedCall(0.26, () => status("sending"));

  void Promise.all([wait(reduced ? 0 : 0.9), post()]).then(([, sent]) => {
    if (sent.ok) {
      msOut.textContent = String(sent.ms);
      idOut.textContent = sent.id.slice(0, 10) || "unknown";
      status("delivered");
      printReceipt(false);
      return;
    }
    /* No fake success, ever. The word changes, the receipt says what is true,
       and the button comes back so they can try again. */
    status("held");
    printReceipt(true);
    send.disabled = false;
    inFlight = false;
  });
});
