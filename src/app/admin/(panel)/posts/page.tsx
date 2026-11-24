import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { AdminHeader } from "@/components/admin/shell";
import { PostsTable } from "@/components/admin/posts-table";

export const metadata = { title: "Posts" };

export default async function AdminPostsPage() {
  const { db } = await requireAdmin();
  const [{ data: posts, error }, { data: categories }] = await Promise.all([
    db.from("posts").select("id, title, slug, status, published_at, updated_at, category, featured").order("updated_at", { ascending: false }),
    db.from("categories").select("slug, name"),
  ]);

  return (
    <div className="max-w-5xl">
      <AdminHeader
        title="Posts"
        description="Drafts, scheduled and published articles."
        actions={
          <Link href="/admin/posts/new" className="btn btn-primary btn-sm">
            <Plus size={14} /> New post
          </Link>
        }
      />
      {error ? (
        <p className="text-sm text-rose-400">{error.message}</p>
      ) : (
        <PostsTable posts={posts ?? []} categories={Object.fromEntries((categories ?? []).map((c) => [c.slug, c.name]))} />
      )}
    </div>
  );
}
