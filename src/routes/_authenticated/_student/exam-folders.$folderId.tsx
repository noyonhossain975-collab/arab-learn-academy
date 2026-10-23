import { createFileRoute } from "@tanstack/react-router";
import { FolderView } from "@/components/exams/ExamBrowser";
import { LearningPending, LearningError } from "@/components/learning/LearningUI";
import { examHead, examTreeOptions } from "@/lib/exams";

export const Route = createFileRoute("/_authenticated/_student/exam-folders/$folderId")({
  loader: ({ context }) => context.queryClient.ensureQueryData(examTreeOptions(context.user.id)),
  head: () => examHead("পরীক্ষার বিষয়", "বিষয়, বছর ও শ্রেণি অনুযায়ী পরীক্ষা বেছে নিন।"),
  pendingComponent: LearningPending, errorComponent: LearningError, component: FolderPage,
});
function FolderPage() { const { folderId } = Route.useParams(), { user } = Route.useRouteContext(); return <FolderView key={folderId} folderId={folderId} userId={user.id} />; }
