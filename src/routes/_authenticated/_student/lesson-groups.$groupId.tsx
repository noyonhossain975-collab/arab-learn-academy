import { createFileRoute } from "@tanstack/react-router";
import { GroupReader } from "@/components/learning/GroupReader";
import { LearningPending,LearningError } from "@/components/learning/LearningUI";
import { groupOptions,learningHead } from "@/lib/learning";
export const Route=createFileRoute("/_authenticated/_student/lesson-groups/$groupId")({
 loader:({params,context})=>context.queryClient.ensureQueryData(groupOptions(params.groupId,context.user.id)),
 head:({loaderData})=>learningHead(loaderData?.group?.title??"আরবি পাঠের গ্রুপ","Arab learn-এর ধারাবাহিক আরবি পাঠ ও শেখার অগ্রগতি।"),
 pendingComponent:LearningPending,errorComponent:LearningError,component:GroupPage,
});
function GroupPage(){const {groupId}=Route.useParams(),{user}=Route.useRouteContext();return <GroupReader groupId={groupId} userId={user.id}/>;}