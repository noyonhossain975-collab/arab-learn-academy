import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/_authenticated/_student/settings")({
  head: () => ({
    meta: [
      { title: "সেটিংস — Arab learn" },
      { name: "description", content: "আপনার অ্যাকাউন্ট সেটিংস।" },
      { property: "og:title", content: "সেটিংস — Arab learn" },
      { property: "og:description", content: "আপনার অ্যাকাউন্ট সেটিংস।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Settings,
});

function Settings() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const qc = useQueryClient();
  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { mode: "login" }, replace: true });
  }
  return (
    <>
      <PageHeader title="সেটিংস" />
      <div className="space-y-4 p-5">
        <div className="rounded-2xl border-2 border-border p-4">
          <p className="text-sm text-muted-foreground">ইমেইল</p>
          <p className="font-semibold">{user.email}</p>
        </div>
        <button onClick={signOut} className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-destructive py-3 font-bold text-destructive">
          <LogOut className="h-5 w-5" /> লগ আউট
        </button>
      </div>
    </>
  );
}
