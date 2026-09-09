import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { visitorHash, visitorId } from "../../lib/demo";
export const prerender = false;
export const POST: APIRoute = async ({ request }) => {
  const origin = new URL(request.url).origin;
  if (request.headers.get("origin") !== origin)
    return new Response("Open the demo page before adding a hello.", {
      status: 403,
    });
  const id = visitorId(request);
  if (!id)
    return new Response(
      "Reload the demo page to initialize your browser cookie.",
      { status: 400 },
    );
  try {
    const key = await visitorHash(id);
    const recordId = crypto.randomUUID();
    await env.DB.prepare("INSERT INTO hellos(id,visitor_id) VALUES(?,?)")
      .bind(recordId, key)
      .run();
    return new Response(null, {
      status: 303,
      headers: { Location: `/?saved=${recordId}` },
    });
  } catch (error) {
    const limited = String(error).includes("DEMO_RATE_LIMIT");
    return new Response(null, {
      status: 303,
      headers: {
        Location: limited ? "/?error=rate-limit" : "/?error=database",
      },
    });
  }
};
