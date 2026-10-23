import { createFileRoute } from "@tanstack/react-router";
import { VocabularyReader } from "@/components/learning/VocabularyReader";
import { LearningPending,LearningError } from "@/components/learning/LearningUI";
import { vocabularyOptions,learningHead } from "@/lib/learning";
export const Route=createFileRoute("/_authenticated/_student/vocabulary/$topicId")({
 loader:({params,context})=>context.queryClient.fetchQuery(vocabularyOptions(params.topicId,context.user.id)),
 head:({loaderData})=>learningHead(loaderData?.topic?.title??"আরবি শব্দভান্ডার","Arab learn-এর আরবি শব্দ, বাংলা উচ্চারণ ও অর্থ।"),
 pendingComponent:LearningPending,errorComponent:LearningError,component:VocabularyPage,
});
function VocabularyPage(){const {topicId}=Route.useParams(),{user}=Route.useRouteContext();return <VocabularyReader key={topicId} topicId={topicId} userId={user.id}/>;}