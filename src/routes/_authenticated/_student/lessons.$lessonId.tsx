import { createFileRoute } from "@tanstack/react-router";
import { LessonReader } from "@/components/learning/LessonReader";
import { LearningPending,LearningError } from "@/components/learning/LearningUI";
import { lessonOptions,learningHead } from "@/lib/learning";
export const Route=createFileRoute("/_authenticated/_student/lessons/$lessonId")({
 loader:({params,context})=>context.queryClient.fetchQuery(lessonOptions(params.lessonId,context.user.id)),
 head:({loaderData})=>learningHead(loaderData?.lesson.title??"আরবি পাঠ","Arab learn-এর বাংলা ও আরবি পাঠ পড়ুন।"),
 pendingComponent:LearningPending,errorComponent:LearningError,component:LessonPage,
});
function LessonPage(){const {lessonId}=Route.useParams(),{user}=Route.useRouteContext();return <LessonReader key={lessonId} lessonId={lessonId} userId={user.id}/>;}