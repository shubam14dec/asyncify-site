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
const bellSvg = q<SVGSVGElement>(".ct-btn-bell");
const sendLabel = q<HTMLElement>("#ct-send-label");
const sendDone = q<HTMLElement>("#ct-send-done");
const sendEnv = q<SVGSVGElement>("#ct-send-env");

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

/* ── state ─────────────────────────────────────────────────────────────── */

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

let inFlight = false;

/** THE PACKING (user call, scene 2's digest one size down): a dot lifts from
 *  each field that holds a value and the set converges into the send button —
 *  the message visibly assembled from its parts. Runs beside the real POST;
 *  it is the narrative floor that keeps a fast round-trip legible, and the
 *  receipt still prints only from what the server answered. */
function packFields(): Promise<void> {
  if (reduced) return Promise.resolve();
  const sources = [fromInput, nameInput, messageInput].filter(
    (el) => el.value.trim().length > 0,
  );
  /* The words AND the bell step aside and the envelope takes the button
     (user calls): the packing happens inside the machine's own control. */
  gsap.to([sendLabel, sendDone, bellSvg], { opacity: 0, duration: 0.15, ease: "power1.out" });
  gsap.to(sendEnv, { opacity: 1, duration: 0.25, ease: "power1.out", delay: 0.1 });
  const target = sendEnv.getBoundingClientRect();
  const tx = target.left + target.width / 2;
  const ty = target.top + target.height / 2;
  const dots: HTMLElement[] = [];
  return new Promise<void>((resolve) => {
    const tl = gsap.timeline({
      onComplete: () => {
        for (const d of dots) d.remove();
        resolve();
      },
    });
    /* The dots pack into the envelope where it now lives: the button. */
    sources.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const sx = r.left + 12; /* the value column's own inset */
      const sy = r.top + Math.min(r.height, 24) / 2;
      const dot = document.createElement("span");
      dot.className = "ct-pack-dot";
      dot.style.left = `${sx}px`;
      dot.style.top = `${sy}px`;
      document.body.appendChild(dot);
      dots.push(dot);
      const at = i * 0.09;
      tl.to(dot, { opacity: 1, duration: 0.12, ease: "power1.out" }, at);
      tl.to(
        dot,
        { x: tx - sx, y: ty - sy, scale: 0.5, duration: 0.5, ease: "power2.in" },
        at + 0.1,
      );
      tl.to(dot, { opacity: 0, duration: 0.1, ease: "power1.in" }, at + 0.53);
    });
  });
}

/** THE DEPARTURE IS THE SENT CLAIM (user call), so it plays only on the
 *  server's yes: the sealed envelope leaves the button and rides off the
 *  RIGHT edge of the screen — lit full green as it goes, the digest's own
 *  delivery flash — while the bell strikes. `sent` holds the button for a
 *  beat, then `send message` returns and the button is re-armed. */
function departAndRestore(): void {
  const settle = (): void => {
    gsap.to(sendDone, { opacity: 1, duration: 0.2, ease: "power1.out" });
    gsap.delayedCall(1.4, () => {
      gsap.to(sendDone, { opacity: 0, duration: 0.2, ease: "power1.in" });
      gsap.to([sendLabel, bellSvg], { opacity: 1, duration: 0.25, ease: "power1.out", delay: 0.15 });
      send.disabled = false;
      inFlight = false;
      /* The bell returns WITH the words (user call) — and strikes once as
         it does: delivered, at your service again. */
      if (!reduced) gsap.delayedCall(0.45, ringBell);
    });
  };
  if (reduced) {
    gsap.set(sendLabel, { opacity: 0 });
    gsap.set(sendEnv, { opacity: 0 });
    settle();
    return;
  }
  const r = sendEnv.getBoundingClientRect();
  /* A fixed-position twin takes over for the flight: the card clips its
     overflow, and an envelope leaving the SCREEN cannot live inside it.
     Under the envelope rides the greeting (user call) — the message wears
     its address — and the flight runs slow enough to read it. */
  const flight = document.createElement("div");
  flight.className = "ct-flight";
  flight.setAttribute("aria-hidden", "true");
  flight.innerHTML =
    '<svg class="ct-env is-lit" viewBox="-14 -10 28 20">' +
    '<rect x="-13" y="-9" width="26" height="18" rx="2" /><path d="M -13 -9 L 0 2 L 13 -9" /></svg>' +
    '<span class="ct-flight-hello">Hello Shubam</span>';
  flight.style.left = `${r.left + r.width / 2 - 46}px`;
  flight.style.top = `${r.top + r.height / 2 - 11}px`;
  document.body.appendChild(flight);
  gsap.set(sendEnv, { opacity: 0 });
  gsap.set(flight, { opacity: 1 });
  gsap.to(flight, {
    x: window.innerWidth - r.left + 140,
    duration: 1.15,
    ease: "power1.in",
    onComplete: () => {
      flight.remove();
      settle();
    },
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
let ringing = false;

function ringBell(): void {
  if (reduced || ringing) return;
  ringing = true;
  const tl = gsap.timeline({
    onComplete: () => {
      ringing = false;
    },
  });
  tl.to(bell, { rotation: 9, duration: 0.14, ease: "power2.in", svgOrigin: "0 0" }, 0);
  tl.to(bell, { rotation: -6, duration: 0.28, ease: "power1.inOut", svgOrigin: "0 0" }, 0.14);
  tl.to(bell, { rotation: 3.5, duration: 0.26, ease: "power1.inOut", svgOrigin: "0 0" }, 0.42);
  tl.to(bell, { rotation: -1.5, duration: 0.22, ease: "power1.inOut", svgOrigin: "0 0" }, 0.68);
  tl.to(bell, { rotation: 0, duration: 0.28, ease: "power1.out", svgOrigin: "0 0" }, 0.9);
  /* The strike lands where the swing first reverses. */
  tl.to(clapper, { fill: "#ffffff", scale: 1.3, duration: 0.1, ease: "power2.out", svgOrigin: "0 17.5" }, 0.12);
  tl.to(clapper, { fill: CANVAS, scale: 1, duration: 0.4, ease: "power2.out", svgOrigin: "0 17.5" }, 0.22);
}

/* THE ARRIVAL PULSE (the hybrid's second half): a reader who navigated here
   from inside the site arrived AS a message, and the brand's delivered-dot
   beats once to receive them — scale only, because the dot's resting breath
   already owns its opacity. Same-origin referrer is the whole test: an
   external visitor gets no claim of having been delivered. */
if (!reduced) {
  try {
    if (document.referrer && new URL(document.referrer).origin === location.origin) {
      gsap.fromTo(
        q<HTMLElement>(".brand-dot"),
        { scale: 1.35 },
        { scale: 1, duration: 0.5, ease: "power2.out", delay: 0.2 },
      );
    }
  } catch {
    /* an unparseable referrer is an external one */
  }
}

/* The hover's motion IS the bell (user call, replacing the scale): a fine
   pointer arriving on a live button gets the strike — the same one the
   click and the envelope's hand-off play, and the `ringing` guard keeps
   overlapping triggers from double-swinging. */
if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
  send.addEventListener("pointerenter", () => {
    if (send.disabled || inFlight) return;
    ringBell();
  });
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
  el.addEventListener("input", () => {
    const ok = usable();
    row.classList.toggle("is-ok", ok);
    /* The nudge clears the moment the field holds something usable. */
    if (ok) row.classList.remove("is-missing");
  });
}

/* The JS path owns validation and its wording (user call: the browser's
   "please fill in this field" bubble is not this page's voice). With
   JavaScript off this attribute is never set, so the native POST keeps the
   native guard. */
form.noValidate = true;

function markMissing(el: HTMLElement, missing: boolean): void {
  el.closest<HTMLElement>(".ct-row")?.classList.toggle("is-missing", missing);
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
  const missFrom = !EMAIL.test(from);
  const missMsg = message.length === 0;
  markMissing(fromInput, missFrom);
  markMissing(messageInput, missMsg);
  if (missFrom || missMsg) {
    (missFrom ? fromInput : messageInput).focus();
    return;
  }

  inFlight = true;
  send.disabled = true;

  /* The bell no longer rings on the click itself — it answers the envelope's
     arrival, inside packFields' timeline: strike follows delivery-into-hand. */
  void Promise.all([packFields(), post()]).then(([, sent]) => {
    if (sent.ok) {
      msOut.textContent = String(sent.ms);
      idOut.textContent = sent.id.slice(0, 10) || "unknown";
      /* The envelope departs, `sent` holds the button, `send message`
         returns re-armed — and the fields EMPTY (user calls): the envelope
         took the values, so paper still showing them would contradict the
         story. Only on success. */
      departAndRestore();
      form.reset();
      for (const row of document.querySelectorAll(".ct-row.is-ok")) {
        row.classList.remove("is-ok");
      }
      meter.textContent = "0 / 2000";
      printReceipt(false);
      return;
    }
    /* No fake success, ever — and the envelope does NOT leave: a held
       message stays with its sender. The words return, the receipt says
       what is true, and the button comes back for a retry. */
    gsap.to(sendEnv, { opacity: 0, duration: 0.2, ease: "power1.in" });
    gsap.to([sendLabel, bellSvg], { opacity: 1, duration: 0.25, ease: "power1.out", delay: 0.15 });
    printReceipt(true);
    send.disabled = false;
    inFlight = false;
  });
});
