import { createFileRoute } from "@tanstack/react-router";
import { ExamRunner } from "@/components/exams/ExamRunner";
import { LearningPending, LearningError } from "@/components/learning/LearningUI";
import { examHead, folderQuestionsOptions } from "@/lib/exams";

export const Route = createFileRoute("/_authenticated/_student/exam/$folderId")({
  loader: ({ params, context }) => context.queryClient.fetchQuery(folderQuestionsOptions(params.folderId, context.user.id)),
  head: () => examHead("পরীক্ষা চলছে", "প্রশ্নের উত্তর দিন, সঙ্গে সঙ্গে ফলাফল ও ব্যাখ্যা দেখুন।"),
  pendingComponent: LearningPending, errorComponent: LearningError, component: ExamPage,
});
function ExamPage() { const { folderId } = Route.useParams(), { user } = Route.useRouteContext(); return <ExamRunner key={folderId} folderId={folderId} userId={user.id} />; }
