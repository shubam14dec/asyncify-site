/* ══════════════════════════════════════════════════════════════════════════
   POST /api/contact — the only endpoint this site has.

   It takes the compose card's message and sends it as one email through
   Resend. Two body encodings, because the page must work twice: contact.ts
   posts JSON and wants JSON back; the same <form> with JavaScript off posts
   url-encoded and needs a page to land on.

   The API key lives only in the Pages environment (RESEND_API_KEY). It is
   never logged, never echoed, and no fallback value exists anywhere in this
   repo — a deploy without the binding fails loudly, which is correct.
   ══════════════════════════════════════════════════════════════════════════ */

/* Minimal local types. Pages' own `PagesFunction` generic ships with
   @cloudflare/workers-types, and this repo carries no type packages on
   purpose — the shape below is all this handler uses, and it keeps
   `tsc --noEmit` green against the root tsconfig's DOM lib. */
interface Env {
  RESEND_API_KEY: string;
}

interface RequestContext {
  request: Request;
  env: Env;
}

/** The visitor's submission, after both encodings have been flattened. */
interface Submission {
  from: string;
  name: string;
  message: string;
  company: string;
}

const TO = "shubamp981@gmail.com";

/* Resend's shared sender for accounts with no verified domain, and it stays
   that way here on purpose — NOT a deploy-day placeholder. asyncify.org will
   be domain-verified in the company Resend account that carries the
   platform's own outbound; this endpoint runs on a personal account whose
   only recipient is its own owner, so the domain never lands here and the
   sender line is only ever read by the one person it is addressed to. */
const FROM = "Asyncify Contact <onboarding@resend.dev>";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const MAX_FROM = 200;
const MAX_NAME = 100;
const MAX_MESSAGE = 2000;

/* ── request parsing ───────────────────────────────────────────────────── */

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

async function readSubmission(request: Request): Promise<Submission> {
  const type = (request.headers.get("content-type") ?? "").toLowerCase();

  if (type.includes("application/json")) {
    const body: unknown = await request.json();
    const record = (body ?? {}) as Record<string, unknown>;
    return {
      from: str(record["from"]),
      name: str(record["name"]),
      message: str(record["message"]),
      company: str(record["company"]),
    };
  }

  const form = await request.formData();
  const get = (key: string): string => str(form.get(key));
  return {
    from: get("from"),
    name: get("name"),
    message: get("message"),
    company: get("company"),
  };
}

function wantsJson(request: Request): boolean {
  return (request.headers.get("content-type") ?? "").toLowerCase().includes("application/json");
}

/** The first thing wrong with the submission, or null. */
function firstProblem(s: Submission): string | null {
  if (s.from.length === 0 || s.from.length > MAX_FROM || !EMAIL.test(s.from)) {
    return "a valid from address is required";
  }
  if (s.name.length > MAX_NAME) return "that name is too long";
  if (s.message.length === 0) return "the message is empty";
  if (s.message.length > MAX_MESSAGE) return "the message is too long";
  return null;
}

/* ── responses ─────────────────────────────────────────────────────────── */

function json(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

/* The no-JS landing. Self-contained, in the site's colors and its mono voice,
   because a Pages Function cannot reach the built stylesheet. No exclamation
   marks, no green except the delivered dot — the same law the page obeys. */
function page(title: string, line: string, extra: string, status: number): Response {
  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="color-scheme" content="dark" />
<title>${title} — Asyncify</title>
<style>
  html,body{margin:0;background:#0a0a0a;color:#a1a1a1;}
  body{min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:24px;
       font-family:ui-monospace,"SF Mono",Menlo,Consolas,monospace;font-size:13px;line-height:1.6;
       letter-spacing:0.01em;-webkit-font-smoothing:antialiased;}
  .card{max-width:420px;width:100%;padding:20px;background:#111;border:1px solid #262626;border-radius:16px;}
  .head{display:flex;align-items:center;gap:10px;color:#ededed;}
  .dot{width:6px;height:6px;border-radius:50%;background:#3dd68c;opacity:.55;flex:none;}
  .dot.held{background:#ffb224;}
  .rest{margin:10px 0 0;color:#6e6e6e;}
  a{color:#ededed;text-decoration:none;border-bottom:1px solid #3f3f3f;}
</style>
</head><body>
  <div class="card">
    <p class="head"><span class="dot${status === 200 ? "" : " held"}"></span><span>${line}</span></p>
    <p class="rest">${extra}</p>
  </div>
</body></html>`;
  return new Response(html, {
    status,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function ok(request: Request, id: string): Response {
  return wantsJson(request)
    ? json({ ok: true, id }, 200)
    : page(
        "Delivered",
        "delivered · thank you — I read every one",
        `<a href="/">back to asyncify.org</a>`,
        200,
      );
}

function held(request: Request, error: string, status: number): Response {
  return wantsJson(request)
    ? json({ ok: false, error }, status)
    : page(
        "Held",
        "held · could not send",
        `${error} — <a href="mailto:${TO}">email me directly</a>, or go <a href="/">back to asyncify.org</a>`,
        status,
      );
}

/* ── the handler ───────────────────────────────────────────────────────── */

export async function onRequestPost(context: RequestContext): Promise<Response> {
  const { request, env } = context;

  let submission: Submission;
  try {
    submission = await readSubmission(request);
  } catch {
    return held(request, "that submission could not be read", 400);
  }

  /* The honeypot. A filled trap gets the SAME success shape as a real send
     and nothing is sent — a bot that can tell the two apart learns which
     field to leave alone next time. */
  if (submission.company.length > 0) {
    return ok(request, "held-by-filter");
  }

  const problem = firstProblem(submission);
  if (problem !== null) return held(request, problem, 400);

  if (!env.RESEND_API_KEY) {
    return held(request, "the mail route is not configured", 500);
  }

  const who = submission.name.length > 0 ? submission.name : submission.from;
  const signature = submission.name.length > 0 ? submission.name : "anonymous";

  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: submission.from,
        subject: `asyncify.org contact — ${who}`,
        text: `${submission.message}\n\n— ${signature} <${submission.from}>`,
      }),
    });
  } catch {
    return held(request, "the mail route did not answer", 502);
  }

  if (!response.ok) {
    /* Deliberately coarse: the provider's body can quote the submission back,
       and nothing about this request belongs in a log or a reply. */
    return held(request, "the mail route refused the message", 502);
  }

  const result = (await response.json()) as { id?: unknown };
  const id = typeof result.id === "string" ? result.id : "";
  return ok(request, id);
}
