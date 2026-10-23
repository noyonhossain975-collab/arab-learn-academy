import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, ExternalLink, FileQuestion, Flag, LayoutDashboard, LogOut, Settings, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const { data } = await supabase.rpc("is_admin");
    if (!data) throw redirect({ to: "/home" });
  },
  head: () => ({
    meta: [
      { title: "অ্যাডমিন প্যানেল — Arab learn" },
      { name: "description", content: "Arab learn অ্যাডমিন প্যানেল" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const nav = [
  { to: "/admin", label: "ড্যাশবোর্ড", icon: LayoutDashboard, exact: true },
  { to: "/admin/lessons", label: "লেসন", icon: BookOpen },
  { to: "/admin/exams", label: "পরীক্ষা / প্রশ্নব্যাংক", icon: FileQuestion },
  { to: "/admin/management", label: "ম্যানেজমেন্ট", icon: Users },
  { to: "/admin/reports", label: "রিপোর্ট", icon: Flag, badge: true },
  { to: "/admin/settings", label: "সাইট সেটিংস", icon: Settings },
] as const;

function AdminLayout() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: newReports = 0 } = useQuery({
    queryKey: ["admin", "new-reports"],
    queryFn: async () => (await supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "new")).count ?? 0,
  });
  const { data: profile } = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => (await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle()).data,
  });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { mode: "login" }, replace: true });
  }

  return (
    <div className="min-h-screen bg-muted md:flex">
      <aside className="bg-sidebar text-sidebar-foreground md:fixed md:inset-y-0 md:w-64">
        <div className="px-6 py-5 text-xl font-bold">
          Arab learn <span className="text-sm font-normal opacity-70">অ্যাডমিন</span>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: "exact" in n }}
              className="flex shrink-0 items-center gap-3 rounded-lg px-4 py-2.5 text-sm opacity-80 hover:bg-sidebar-accent"
              activeProps={{ className: "bg-sidebar-accent font-semibold opacity-100" }}
            >
              <n.icon className="h-5 w-5" />
              <span className="flex-1">{n.label}</span>
              {"badge" in n && newReports > 0 && (
                <span className="rounded-full bg-sidebar-primary px-2 text-xs font-bold text-sidebar-primary-foreground">{newReports}</span>
              )}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 md:ml-64">
        <header className="flex flex-wrap items-center justify-end gap-4 border-b border-border bg-background px-6 py-3 text-sm">
          <span className="mr-auto font-semibold">{profile?.full_name ?? user.email}</span>
          <Link to="/home" className="flex items-center gap-1 text-primary">
            ছাত্রদের সাইট দেখো <ExternalLink className="h-4 w-4" />
          </Link>
          <button onClick={signOut} className="flex items-center gap-1 text-destructive">
            <LogOut className="h-4 w-4" /> লগ আউট
          </button>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
