import { connection } from "next/server";
import { getDownloads } from "@/lib/content/queries";
import { publicClient } from "@/lib/supabase/public";

/**
 * /downloads/:slug/file counts the download, then redirects to the file.
 * The counter can only be incremented through a SECURITY DEFINER function that
 * does nothing else, so anonymous visitors still can't write to the table.
 */
export async function GET(request: Request, ctx: RouteContext<"/downloads/[slug]/file">) {
  await connection();
  const { slug } = await ctx.params;
  const item = (await getDownloads()).find((d) => d.slug === slug);
  if (!item) return new Response("Not found", { status: 404 });

  const db = publicClient();
  if (db) {
    // Best effort: a failed counter should never block the download.
    await db.rpc("increment_download", { p_slug: slug }).then(
      () => undefined,
      () => undefined,
    );
  }

  return Response.redirect(new URL(item.file_url, request.url), 302);
}
