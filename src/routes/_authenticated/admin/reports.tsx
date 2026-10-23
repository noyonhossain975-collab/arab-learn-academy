import { createFileRoute } from "@tanstack/react-router";
import { ReportsAdmin } from "@/components/admin/ReportsAdmin";
import { adminHead } from "@/lib/admin-head";

export const Route = createFileRoute("/_authenticated/admin/reports")({
  head: () => adminHead("রিপোর্ট পরিচালনা", "Arab learn শিক্ষার্থীদের প্রশ্ন ও বার্তার রিপোর্ট।"),
  component: ReportsAdmin,
});
