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
const sendLabel = q<HTMLElement>("#ct-send-label");
const sendDone = q<HTMLElement>("#ct-send-done");

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
  /* The envelope births at the card's own centre; the button is where it is
     handed over. Both read fresh — the page may have been resized. */
  const card = form.getBoundingClientRect();
  const ex = card.left + card.width / 2;
  const ey = card.top + card.height * 0.52;
  const target = send.getBoundingClientRect();
  const tx = target.left + target.width / 2;
  const ty = target.top + target.height / 2;

  const dots: HTMLElement[] = [];
  /* Scene 2's #digest-env, verbatim: one rect, one fold. */
  const env = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  env.setAttribute("class", "ct-env");
  env.setAttribute("viewBox", "-14 -10 28 20");
  env.setAttribute("aria-hidden", "true");
  env.innerHTML =
    '<rect x="-13" y="-9" width="26" height="18" rx="2" /><path d="M -13 -9 L 0 2 L 13 -9" />';
  env.style.left = `${ex - 15}px`;
  env.style.top = `${ey - 11}px`;
  document.body.appendChild(env);

  return new Promise<void>((resolve) => {
    const tl = gsap.timeline({
      onComplete: () => {
        for (const d of dots) d.remove();
        env.remove();
        resolve();
      },
    });
    /* The dots pack INTO the envelope, not the button. */
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
        { x: ex - sx, y: ey - sy, scale: 0.5, duration: 0.45, ease: "power2.in" },
        at + 0.1,
      );
      tl.to(dot, { opacity: 0, duration: 0.1, ease: "power1.in" }, at + 0.48);
    });
    /* The envelope arrives as the dots do (scene 2's own entry: 0.9 → 1). */
    tl.fromTo(
      env,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.45, ease: "power2.out", immediateRender: false },
      0.3,
    );
    /* Sealed, it is HANDED to the send button. */
    tl.to(env, { x: tx - ex, y: ty - ey, duration: 0.6, ease: "power1.inOut" }, 1.0);
    /* The hand-off: the digest's own green flash — and the bell answers. */
    tl.call(
      () => {
        env.classList.add("is-lit");
        ringBell();
      },
      undefined,
      1.5,
    );
    tl.to(env, { opacity: 0, scale: 0.6, duration: 0.25, ease: "power1.in" }, 1.62);
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

/* Page-transition telemetry, main.ts's twin: silent unless a transition
   dies, then one console.debug names the reason. */
window.addEventListener("pagereveal", (e: Event) => {
  const vt = (
    e as Event & {
      viewTransition?: { ready: Promise<void>; finished: Promise<void> };
    }
  ).viewTransition;
  if (vt) {
    /* Both promises — an unhandled `ready` on a skipped transition surfaces
       as an uncaught AbortError (his paste proved it). */
    vt.ready.catch(() => {});
    vt.finished.catch((err: DOMException) =>
      console.debug("[vt] transition skipped:", err.name, err.message),
    );
    /* main.ts's twin: GSAP holds its breath while the scene change runs, so
       nothing competes with the transition for frames — and the arrival
       pulse lands, as designed, a beat after the page has settled. */
    gsap.globalTimeline.pause();
    const resume = (): void => {
      gsap.globalTimeline.resume();
    };
    vt.finished.then(resume, resume);
    return;
  }
  try {
    if (document.referrer && new URL(document.referrer).origin === location.origin) {
      console.debug("[vt] no transition armed for a same-site arrival");
    }
  } catch {
    /* external referrer */
  }
});

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
      /* The button says so itself (user call): the label dissolves into
         `sent` — but only because the server said it was. */
      gsap.to(sendLabel, { opacity: 0, duration: 0.18, ease: "power1.out" });
      gsap.to(sendDone, { opacity: 1, duration: 0.18, ease: "power1.out" });
      /* And the fields EMPTY (user call): the envelope took the values, so
         paper that still showed them would contradict the story. Only on
         success — a held send keeps everything, so a retry costs nothing. */
      form.reset();
      for (const row of document.querySelectorAll(".ct-row.is-ok")) {
        row.classList.remove("is-ok");
      }
      meter.textContent = "0 / 2000";
      printReceipt(false);
      return;
    }
    /* No fake success, ever. The receipt says what is true, and the button
       comes back so they can try again. */
    printReceipt(true);
    send.disabled = false;
    inFlight = false;
  });
});
