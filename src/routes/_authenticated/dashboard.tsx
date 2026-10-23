import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, ComingSoon } from "@/components/PageHeader";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "অগ্রগতি — Arab learn" },
      { name: "description", content: "Arab learn — অগ্রগতি" },
      { property: "og:title", content: "অগ্রগতি — Arab learn" },
      { property: "og:description", content: "Arab learn — অগ্রগতি" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <>
      <PageHeader title="অগ্রগতি" />
      <ComingSoon text="আপনার স্কোর ও স্ট্রিক শীঘ্রই দেখা যাবে।" />
    </>
  ),
});
