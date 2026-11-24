import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { AdminShell } from "@/components/admin/shell";
import { SetupNotice } from "@/components/admin/setup-notice";

/**
 * Every page under /admin (except /admin/login) renders inside <Gate>, which
 * verifies the session and admin membership on the server before anything else.
 * The gate reads cookies, so it lives inside a Suspense boundary (Cache Components).
 */
// The admin is always request-time (it reads the session), so skip instant-navigation validation.
export const instant = false;

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <Gate>{children}</Gate>
    </Suspense>
  );
}

async function Gate({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured) {
    return (
      <AdminShell email={null}>
        <div className="max-w-xl">
          <SetupNotice />
        </div>
      </AdminShell>
    );
  }
  const { user } = await requireAdmin();
  return <AdminShell email={user.email}>{children}</AdminShell>;
}

function ShellSkeleton() {
  return (
    <div className="flex min-h-dvh" aria-busy="true">
      <div className="hidden w-60 border-r border-line md:block" />
      <div className="flex-1 p-10">
        <div className="h-8 w-48 animate-pulse rounded bg-surface-hover" />
      </div>
    </div>
  );
}
