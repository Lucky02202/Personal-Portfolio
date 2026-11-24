import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Plus } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { getCollection } from "@/lib/admin/collections";
import { AdminHeader } from "@/components/admin/shell";
import { formatDate } from "@/lib/utils";

export default async function CollectionPage({ params }: PageProps<"/admin/[collection]">) {
  const { collection: key } = await params;
  const c = getCollection(key);
  if (!c) notFound();
  const { db } = await requireAdmin();

  let query = db.from(c.table).select("*");
  for (const o of c.order) query = query.order(o.column, { ascending: o.ascending });
  const { data, error } = await query;
  const rows = (data ?? []) as Record<string, unknown>[];

  return (
    <div className="max-w-5xl">
      <AdminHeader
        title={c.label}
        description={c.description}
        actions={
          <Link href={`/admin/${c.key}/new`} className="btn btn-primary btn-sm">
            <Plus size={14} /> New {c.singular}
          </Link>
        }
      />
      {error && <p className="mb-4 text-sm text-rose-400">{error.message}</p>}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-line text-left font-mono text-[11px] uppercase tracking-[0.06em] text-subtle">
            <tr>
              <th className="px-5 py-3 font-normal">{c.fields.find((f) => f.name === c.titleField)?.label ?? "Title"}</th>
              {c.columns.map((col) => (
                <th key={col.name} className="whitespace-nowrap px-3 py-3 font-normal">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={String(r.id)} className="hover:bg-surface">
                <td className="px-5 py-3.5">
                  <Link href={`/admin/${c.key}/${r.id}`} className="font-medium text-fg hover:text-accent">
                    {String(r[c.titleField] ?? "Untitled")}
                  </Link>
                </td>
                {c.columns.map((col) => {
                  const v = r[col.name];
                  return (
                    <td key={col.name} className="whitespace-nowrap px-3 py-3.5 text-muted">
                      {col.kind === "bool" ? (
                        v ? <Check size={14} className="text-accent" aria-label="Yes" /> : <span className="text-subtle">—</span>
                      ) : col.kind === "badge" ? (
                        <span className="chip">{String(v ?? "—")}</span>
                      ) : col.kind === "date" ? (
                        <span className="font-mono text-xs">{v ? formatDate(String(v)) : "—"}</span>
                      ) : (
                        String(v ?? "—")
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={c.columns.length + 1} className="px-5 py-12 text-center text-muted">
                  Nothing here yet.{" "}
                  <Link href={`/admin/${c.key}/new`} className="text-fg underline decoration-accent underline-offset-4">
                    Add the first {c.singular}
                  </Link>
                  .
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
