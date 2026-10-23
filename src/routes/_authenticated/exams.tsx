import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, ComingSoon } from "@/components/PageHeader";

export const Route = createFileRoute("/_authenticated/exams")({
  head: () => ({
    meta: [
      { title: "পরীক্ষা — Arab learn" },
      { name: "description", content: "Arab learn — পরীক্ষা" },
      { property: "og:title", content: "পরীক্ষা — Arab learn" },
      { property: "og:description", content: "Arab learn — পরীক্ষা" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <>
      <PageHeader title="পরীক্ষা" />
      <ComingSoon text="পরীক্ষার অংশ শীঘ্রই আসছে।" />
    </>
  ),
});
