import { createFileRoute, Outlet } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/_authenticated/_student")({
  component: StudentLayout,
});

function StudentLayout() {
  return (
    <div className="min-h-screen bg-background md:pl-60">
      <BottomNav />
      <main className="mx-auto max-w-md pb-24 md:max-w-2xl md:pb-8">
        <Outlet />
      </main>
    </div>
  );
}
