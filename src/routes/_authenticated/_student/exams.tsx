import { createFileRoute } from "@tanstack/react-router";
import { ExamHome } from "@/components/exams/ExamBrowser";
import { LearningPending, LearningError } from "@/components/learning/LearningUI";
import { examHead, examTreeOptions } from "@/lib/exams";

export const Route = createFileRoute("/_authenticated/_student/exams")({
  loader: ({ context }) => context.queryClient.ensureQueryData(examTreeOptions(context.user.id)),
  head: () => examHead("পরীক্ষা", "বোর্ড পরীক্ষা, তাহকীক পরীক্ষা ও আরবি প্রশ্নব্যাংক অনুশীলন করুন।"),
  pendingComponent: LearningPending, errorComponent: LearningError, component: ExamsPage,
});
function ExamsPage() { const { user } = Route.useRouteContext(); return <ExamHome userId={user.id} />; }
