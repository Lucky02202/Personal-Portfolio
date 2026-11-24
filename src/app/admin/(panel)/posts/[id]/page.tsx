import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { PostEditor } from "@/components/admin/post-editor";
import type { Category, Post } from "@/lib/types";

export const metadata = { title: "Editor" };

export default async function EditPostPage({ params }: PageProps<"/admin/posts/[id]">) {
  const { db } = await requireAdmin();
  const { id } = await params;
  const isNew = id === "new";

  const [postRes, catRes, tagRes] = await Promise.all([
    isNew ? Promise.resolve({ data: null }) : db.from("posts").select("*").eq("id", id).maybeSingle(),
    db.from("categories").select("*").order("sort"),
    db.from("posts").select("tags"),
  ]);
  if (!isNew && !postRes.data) notFound();

  const allTags = [...new Set((tagRes.data ?? []).flatMap((r) => r.tags as string[]))].sort();
  const post = postRes.data as Post | null;
  const initial = post
    ? (({ id: _id, created_at: _c, updated_at: _u, ...rest }) => (void _id, void _c, void _u, rest))(post)
    : null;

  return (
    <PostEditor
      key={id}
      id={isNew ? null : id}
      initial={initial}
      categories={(catRes.data ?? []) as Category[]}
      allTags={allTags}
    />
  );
}
