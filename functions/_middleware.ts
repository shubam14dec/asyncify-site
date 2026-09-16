/* story.asyncify.org serves the build timeline at its ROOT. The page is built
   as /story.html on the one Pages project that also serves asyncify.org, so
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
  if (url.hostname === "story.asyncify.org" && url.pathname === "/") {
    /* A Request built FROM the incoming one keeps its headers (the fetch
       contract's second argument is a RequestInit, not a Request — the
       Request constructor is the sanctioned way to rewrite just the URL). */
    return context.env.ASSETS.fetch(new Request(new URL("/story.html", url), context.request));
  }
  return context.next();
}
