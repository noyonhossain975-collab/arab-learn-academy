import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { AdminTitle } from "@/components/admin/AdminUI";
import { ExamManager } from "@/components/admin/exams/ExamManager";

export const Route = createFileRoute("/_authenticated/admin/exams")({
  validateSearch: (s: Record<string, unknown>): { folder?: string; question?: string } => ({ folder: typeof s.folder === "string" && s.folder ? s.folder : undefined, question: typeof s.question === "string" && s.question ? s.question : undefined }),
  head: () => ({ meta: [
    { title: "পরীক্ষা ও প্রশ্ন পরিচালনা — Arab learn" },
    { name: "description", content: "Arab learn পরীক্ষার ফোল্ডার, বহুনির্বাচনি ও সৃজনশীল প্রশ্ন পরিচালনা।" },
    { property: "og:title", content: "পরীক্ষা ও প্রশ্ন পরিচালনা — Arab learn" },
    { property: "og:description", content: "পরীক্ষার ফোল্ডার ও প্রশ্ন পরিচালনা।" },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" },
  ] }),
  component: ExamsAdmin,
});
function ExamsAdmin() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/admin/exams" });
  return <><AdminTitle title="পরীক্ষা / প্রশ্নব্যাংক" /><ExamManager folderId={search.folder} questionId={search.question} go={(folder,question) => navigate({ search: { folder,question } })} /></>;
}
