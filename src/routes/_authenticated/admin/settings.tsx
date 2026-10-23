import { createFileRoute } from "@tanstack/react-router";
import { SiteSettingsAdmin } from "@/components/admin/SiteSettingsAdmin";
import { adminHead } from "@/lib/admin-head";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  head: () => adminHead("সাইট সেটিংস", "Arab learn যোগাযোগ, পেমেন্টের তথ্য ও ব্লগ পরিচালনা।"),
  component: SiteSettingsAdmin,
});
