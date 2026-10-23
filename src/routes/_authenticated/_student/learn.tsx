import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, ComingSoon } from "@/components/PageHeader";

export const Route = createFileRoute("/_authenticated/_student/learn")({
  head: () => ({
    meta: [
      { title: "শিখুন — Arab learn" },
      { name: "description", content: "Arab learn — শিখুন" },
      { property: "og:title", content: "শিখুন — Arab learn" },
      { property: "og:description", content: "Arab learn — শিখুন" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <>
      <PageHeader title="শিখুন" />
      <ComingSoon text="পাঠ ও শব্দভান্ডার শীঘ্রই আসছে।" />
    </>
  ),
});
