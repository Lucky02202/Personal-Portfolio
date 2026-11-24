import { requireAdmin } from "@/lib/admin/auth";
import { AdminHeader } from "@/components/admin/shell";
import { MessageList } from "@/components/admin/message-list";
import type { Message } from "@/lib/types";

export const metadata = { title: "Inbox" };

export default async function MessagesPage() {
  const { db } = await requireAdmin();
  const { data, error } = await db.from("messages").select("*").order("created_at", { ascending: false }).limit(200);
  return (
    <div className="max-w-4xl">
      <AdminHeader title="Inbox" description="Messages from the contact form. Only admins can read these." />
      {error ? <p className="text-sm text-rose-400">{error.message}</p> : <MessageList messages={(data ?? []) as Message[]} />}
    </div>
  );
}
