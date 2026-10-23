import { createFileRoute } from "@tanstack/react-router";
import { AdminSoon } from "@/components/admin/AdminUI";
import { adminHead } from "@/lib/admin-head";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  head: () => adminHead("সাইট সেটিংস", "Arab learn যোগাযোগ, পেমেন্টের তথ্য ও ব্লগ পরিচালনা।"),
  component: () => <AdminSoon title="সাইট সেটিংস" phase="ফেজ ৩ঘ" />,
});
