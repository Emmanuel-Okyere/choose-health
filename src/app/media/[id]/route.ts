import { sql } from "@/lib/db";

// Serves product photos stored in Postgres. Every upload gets a new id, so the
// response can be cached forever by browsers and the CDN.
export async function GET(_request: Request, ctx: RouteContext<"/media/[id]">) {
  const { id } = await ctx.params;
  const imageId = Number(id);
  if (!Number.isInteger(imageId) || imageId <= 0) return new Response("Not found", { status: 404 });

  const [img] = await sql<{ data: Buffer; contentType: string }[]>`
    SELECT data, content_type FROM product_images WHERE id = ${imageId}`;
  if (!img) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(img.data), {
    headers: {
      "Content-Type": img.contentType,
      "Content-Length": String(img.data.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
