import { createFileRoute } from "@tanstack/react-router";
import { MistakesList } from "@/components/exams/MistakesList";
import { LearningPending, LearningError } from "@/components/learning/LearningUI";
import { examHead, examTreeOptions, mistakesOptions } from "@/lib/exams";

export const Route = createFileRoute("/_authenticated/_student/mistakes")({
  loader: ({ context }) => Promise.all([context.queryClient.fetchQuery(mistakesOptions(context.user.id)), context.queryClient.ensureQueryData(examTreeOptions(context.user.id))]),
  head: () => examHead("সংরক্ষিত ভুল", "ভুল হওয়া প্রশ্নগুলো আবার অনুশীলন করুন।"),
  pendingComponent: LearningPending, errorComponent: LearningError, component: MistakesPage,
});
function MistakesPage() { const { user } = Route.useRouteContext(); return <MistakesList userId={user.id} />; }
