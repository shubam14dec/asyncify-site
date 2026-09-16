/* journey.asyncify.org serves the build timeline at its ROOT. The page is
   built as /journey.html on the one Pages project that also serves asyncify.org, so
   without this the subdomain's "/" would answer with the home page. Only that
   one hostname and that one path are rewritten; everything else — assets, the
   contact endpoint, apex traffic — falls straight through.

   Local types, like functions/api/contact.ts: this repo carries no
   @cloudflare/workers-types on purpose, and the shape below is all this
   handler uses. */
interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

interface MiddlewareContext {
  request: Request;
  env: Env;
  next: () => Promise<Response>;
}

export async function onRequest(context: MiddlewareContext): Promise<Response> {
  const url = new URL(context.request.url);
  if (url.hostname === "journey.asyncify.org" && url.pathname === "/") {
    /* A Request built FROM the incoming one keeps its headers (the fetch
       contract's second argument is a RequestInit, not a Request — the
       Request constructor is the sanctioned way to rewrite just the URL).
       The CLEAN url, never "/journey.html": ASSETS reproduces the
       project's clean-URL behavior, so asking for the .html path returns
       the 308 that Pages sends publicly — and this handler would hand
       that redirect to the visitor instead of the page (live bug,
       2026-09-17: journey.asyncify.org/ bounced to /journey). */
    return context.env.ASSETS.fetch(new Request(new URL("/journey", url), context.request));
  }
  return context.next();
}
