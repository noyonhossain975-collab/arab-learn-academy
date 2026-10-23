import { createFileRoute } from "@tanstack/react-router";
import { AdminSoon } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_authenticated/admin/exams")({
  component: () => <AdminSoon title="পরীক্ষা / প্রশ্নব্যাংক" phase="ফেজ ৩গ" />,
});
