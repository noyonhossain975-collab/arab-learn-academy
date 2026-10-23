import { createFileRoute } from "@tanstack/react-router";
import { BlogArticle } from "@/components/settings/BlogReader";
import { LearningError, LearningPending } from "@/components/learning/LearningUI";
import { articleOptions } from "@/lib/student-settings";
import { learningHead } from "@/lib/learning";

export const Route = createFileRoute("/_authenticated/_student/blog/$slug")({
  loader: ({ context, params }) => context.queryClient.fetchQuery(articleOptions(params.slug)),
  head: ({ loaderData }) => {
    const head = learningHead(loaderData?.title ?? "লেখা পাওয়া যায়নি", "Arab learn-এর শিক্ষামূলক আর্টিকেল পড়ুন।");
    const image = loaderData?.cover_image_url;
    if (image?.startsWith("https://")) head.meta.push({ property: "og:image", content: image }, { name: "twitter:image", content: image });
    return head;
  },
  component: () => <BlogArticle slug={Route.useParams().slug} />,
  pendingComponent: LearningPending, errorComponent: LearningError,
});