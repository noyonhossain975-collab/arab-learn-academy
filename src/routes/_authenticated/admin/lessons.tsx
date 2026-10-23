import { createFileRoute } from "@tanstack/react-router";
import { AdminSoon } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_authenticated/admin/lessons")({
  component: () => <AdminSoon title="লেসন" phase="ফেজ ৩খ" />,
});
