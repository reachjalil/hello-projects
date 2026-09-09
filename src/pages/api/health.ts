import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
export const prerender = false;
export const GET: APIRoute = async () => {
  try {
    await env.DB.prepare("SELECT id FROM hellos LIMIT 1").all();
    return Response.json({ status: "ok", database: "connected" });
  } catch {
    return Response.json(
      { status: "unavailable", database: "not-ready" },
      { status: 503 },
    );
  }
};
