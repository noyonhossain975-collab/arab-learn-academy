import { createFileRoute } from "@tanstack/react-router";
import { AdminSoon } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_authenticated/admin/reports")({
  component: () => <AdminSoon title="রিপোর্ট" phase="ফেজ ৩ঘ" />,
});
