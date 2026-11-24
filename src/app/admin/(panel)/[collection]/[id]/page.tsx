import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { getCollection } from "@/lib/admin/collections";
import { RecordForm } from "@/components/admin/record-form";

export default async function RecordPage({ params }: PageProps<"/admin/[collection]/[id]">) {
  const { collection: key, id } = await params;
  const c = getCollection(key);
  if (!c) notFound();
  const { db } = await requireAdmin();
  const isNew = id === "new";

  let row: Record<string, unknown> | null = null;
  if (!isNew) {
    const { data } = await db.from(c.table).select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    row = data;
  }

  return (
    <div className="max-w-3xl">
      <Link href={`/admin/${c.key}`} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeft size={14} /> {c.label}
      </Link>
      <h1 className="mb-8 mt-4 text-2xl font-semibold tracking-[-0.03em] text-fg">
        {isNew ? `New ${c.singular}` : String(row?.[c.titleField] ?? `Edit ${c.singular}`)}
      </h1>
      <RecordForm key={id} collectionKey={c.key} id={isNew ? null : id} row={row} />
    </div>
  );
}
