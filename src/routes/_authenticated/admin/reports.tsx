import { createFileRoute } from "@tanstack/react-router";
import { AdminSoon } from "@/components/admin/AdminUI";
import { adminHead } from "@/lib/admin-head";

export const Route = createFileRoute("/_authenticated/admin/reports")({
  head: () => adminHead("রিপোর্ট পরিচালনা", "Arab learn শিক্ষার্থীদের প্রশ্ন ও বার্তার রিপোর্ট।"),
  component: () => <AdminSoon title="রিপোর্ট" phase="ফেজ ৩ঘ" />,
});
