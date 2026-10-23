import { createFileRoute } from "@tanstack/react-router";
import { AdminSoon } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: () => <AdminSoon title="সাইট সেটিংস" phase="ফেজ ৩ঘ" />,
});
