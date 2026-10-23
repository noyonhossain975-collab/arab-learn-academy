import { createFileRoute } from "@tanstack/react-router";
import { LearningCatalog } from "@/components/learning/LearningCatalog";
import { LearningPending,LearningError } from "@/components/learning/LearningUI";
import { catalogOptions } from "@/lib/learning";

export const Route = createFileRoute("/_authenticated/_student/learn")({
  loader: ({context})=>context.queryClient.ensureQueryData(catalogOptions(context.user.id)),
  pendingComponent: LearningPending,
  errorComponent: LearningError,
  head: () => ({
    meta: [
      { title: "লেসন — Arab learn" },
      { name: "description", content: "Arab learn — শিখুন" },
      { property: "og:title", content: "লেসন — Arab learn" },
      { property: "og:description", content: "Arab learn — শিখুন" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Learn,
});
function Learn(){const {user}=Route.useRouteContext();return <LearningCatalog userId={user.id}/>;}
