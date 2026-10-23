import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AdminTitle } from "@/components/admin/AdminUI";
import { GroupsList } from "@/components/admin/lessons/GroupsList";
import { GroupLessons } from "@/components/admin/lessons/GroupLessons";
import { LessonEditor } from "@/components/admin/lessons/LessonEditor";
import { VocabTopics } from "@/components/admin/lessons/VocabTopics";
import { TopicWords } from "@/components/admin/lessons/TopicWords";
import { adminHead } from "@/lib/admin-head";

type Search = { tab: "arabic" | "vocab"; group?: string; lesson?: string; topic?: string };

export const Route = createFileRoute("/_authenticated/admin/lessons")({
  head: () => adminHead("লেসন পরিচালনা", "Arab learn আরবি পাঠ ও শব্দভান্ডার পরিচালনা।"),
  validateSearch: (s: Record<string, unknown>): Search => {
    const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);
    const out: Search = { tab: s["tab"] === "vocab" ? "vocab" : "arabic" };
    const group = str(s["group"]), lesson = str(s["lesson"]), topic = str(s["topic"]);
    if (group) out.group = group;
    if (lesson) out.lesson = lesson;
    if (topic) out.topic = topic;
    return out;
  },
  component: LessonsAdmin,
});

function LessonsAdmin() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/admin/lessons" });
  const go = (s: Search) => navigate({ search: s });

  return (
    <>
      <AdminTitle title="লেসন" />
      <div className="mb-5 flex gap-1 rounded-lg bg-background p-1 shadow-sm sm:w-fit">
        {(["arabic", "vocab"] as const).map((t) => (
          <button
            key={t}
            onClick={() => go({ tab: t })}
            className={`flex-1 rounded-md px-5 py-2 text-sm ${search.tab === t ? "bg-primary font-semibold text-primary-foreground" : "text-muted-foreground"}`}
          >
            {t === "arabic" ? "আরবি শিক্ষা" : "শব্দভান্ডার"}
          </button>
        ))}
      </div>

      {search.tab === "arabic" ? (
        search.group && search.lesson ? (
          <LessonEditor groupId={search.group} lessonId={search.lesson} onBack={() => go({ tab: "arabic", group: search.group! })} />
        ) : search.group ? (
          <GroupLessons
            groupId={search.group}
            onBack={() => go({ tab: "arabic" })}
            onEdit={(id) => go({ tab: "arabic", group: search.group!, lesson: id })}
          />
        ) : (
          <GroupsList onOpen={(id) => go({ tab: "arabic", group: id })} />
        )
      ) : search.topic ? (
        <TopicWords topicId={search.topic} onBack={() => go({ tab: "vocab" })} />
      ) : (
        <VocabTopics onOpen={(id) => go({ tab: "vocab", topic: id })} />
      )}
    </>
  );
}
