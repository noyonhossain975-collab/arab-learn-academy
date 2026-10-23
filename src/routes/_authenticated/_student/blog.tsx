import { createFileRoute } from "@tanstack/react-router";
import { BlogList } from "@/components/settings/BlogReader";
import { LearningError, LearningPending } from "@/components/learning/LearningUI";
import { blogOptions } from "@/lib/student-settings";
import { learningHead } from "@/lib/learning";

export const Route = createFileRoute("/_authenticated/_student/blog")({
  loader: ({ context }) => context.queryClient.fetchQuery(blogOptions),
  head: () => learningHead("ব্লগ ও আর্টিকেল", "Arab learn-এর প্রকাশিত বাংলা ও আরবি শিক্ষামূলক লেখা পড়ুন।"),
  component: BlogList, pendingComponent: LearningPending, errorComponent: LearningError,
});