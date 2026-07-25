import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

/* ── Polyfills SSR ────────────────────────────────────
 * Certaines librairies (sonner, recharts…) accèdent à
 * window/document pendant l'import sans garde.          */
if (typeof globalThis !== "undefined" && !("window" in globalThis)) {
  const g = globalThis as unknown as Record<string, unknown>;
  const noop = () => {};
  const def = (key: string, value: unknown) => { if (!(key in g)) g[key] = value; };

  def("window", globalThis);
  def("self", globalThis);
  def("global", globalThis);
  def("document", {
    documentElement: { style: {} },
    createElement: () => ({ style: {} as CSSStyleDeclaration, appendChild: noop, setAttribute: noop }),
    createTextNode: () => ({}) as Text,
    head: { appendChild: noop },
    getElementsByTagName: () => [{ appendChild: noop }],
  });
  def("navigator", { userAgent: "Node", platform: "Node" });
  def("location", { href: "", origin: "", pathname: "/", search: "" });
  def("localStorage", {
    getItem: () => null, setItem: noop, removeItem: noop, clear: noop,
    get length() { return 0; }, key: () => null,
  });
  def("addEventListener", noop);
  def("removeEventListener", noop);
  def("matchMedia", () => ({
    matches: false, media: "",
    addEventListener: noop, removeEventListener: noop,
    addListener: noop, removeListener: noop,
    onchange: null, dispatchEvent: () => false,
  }));
  def("screen", {
    width: 1024, height: 768, availWidth: 1024, availHeight: 768,
    colorDepth: 24, pixelDepth: 24,
    deviceXDPI: 96, logicalXDPI: 96,
    availLeft: 0, availTop: 0,
  });
  def("cancelAnimationFrame", noop);
  def("requestAnimationFrame", (cb: FrameRequestCallback) => {
    if (typeof setImmediate === "function") return setImmediate(() => cb(0));
    return setTimeout(() => cb(0), 0);
  });
}

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
