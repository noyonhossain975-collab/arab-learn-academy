import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/_authenticated/_student")({
  component: StudentLayout,
});

const KEY = "arab-learn:sidebar-collapsed";

function StudentLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const wide = useRouterState({ select: (s) => s.location.pathname === "/home" });
  useEffect(() => { try { setCollapsed(localStorage.getItem(KEY) === "1"); } catch { /* optional */ } }, []);
  const toggle = () => setCollapsed((c) => { try { localStorage.setItem(KEY, c ? "0" : "1"); } catch { /* optional */ } return !c; });
  return (
    <div className={`min-h-screen bg-background transition-[padding] duration-300 ${collapsed ? "md:pl-20" : "md:pl-64"}`}>
      <BottomNav collapsed={collapsed} onToggle={toggle} />
      <main className={`mx-auto min-w-0 max-w-md pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-10 ${wide ? "md:max-w-7xl" : "md:max-w-3xl"}`}>
        <Outlet />
      </main>
    </div>
  );
}
