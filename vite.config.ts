import { defineConfig, type Plugin } from "vite";

/** The pinned fallback for the nav's release badge — used only when the npm
 *  registry is unreachable at build time, so a network blip can never fail a
 *  deploy. Update opportunistically; the registry fetch below is what keeps
 *  the badge honest on every normal build. */
const VERSION_FALLBACK = "0.8.7";

/** The nav badge shows the PRODUCT's published version — @asyncify-hq/node,
 *  the same package the hero's install line installs — fetched from the npm
 *  registry at build time. The site repo builds alone on Cloudflare Pages, so
 *  it cannot read the platform repo's package.json; the registry is the one
 *  source that only ever names versions that actually shipped. */
async function releaseVersion(): Promise<string> {
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 5000);
    const res = await fetch("https://registry.npmjs.org/@asyncify-hq/node/latest", {
      signal: ctl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return VERSION_FALLBACK;
    const data = (await res.json()) as { version?: string };
    return typeof data.version === "string" && /^\d+\.\d+\.\d+/.test(data.version)
      ? data.version
      : VERSION_FALLBACK;
  } catch {
    return VERSION_FALLBACK;
  }
}

function versionBadge(version: string): Plugin {
  return {
    name: "asyncify-version-badge",
    transformIndexHtml(html) {
      return html.replaceAll("__ASYNCIFY_VERSION__", version);
    },
  };
}

export default defineConfig(async () => {
  const version = await releaseVersion();
  return {
    plugins: [versionBadge(version)],
    build: {
      target: "es2022",
      // Report anything over the perf budget in DESIGN.md §6 (150 KB gzip JS).
      chunkSizeWarningLimit: 500,
      cssCodeSplit: false,
      // Never base64-inline a font: it defeats HTTP caching and bloats the CSS
      // (a base64 woff2 does not gzip). Fonts stay as separate cacheable files.
      assetsInlineLimit: 0,
    },
    server: {
      port: 5180,
    },
    preview: {
      port: 5181,
    },
  };
});
