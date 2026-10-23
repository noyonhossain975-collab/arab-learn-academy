import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/_authenticated/_student/home")({
  head: () => ({
    meta: [
      { title: "হোম — Arab learn" },
      { name: "description", content: "আজকের পড়া শুরু করুন।" },
      { property: "og:title", content: "হোম — Arab learn" },
      { property: "og:description", content: "আজকের পড়া শুরু করুন।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Home,
});

function Home() {
  const { user } = Route.useRouteContext();
  const { data: profile } = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => (await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle()).data,
  });
  return (
    <div className="px-5 py-5">
      <div className="flex items-center justify-between">
        <Logo className="justify-start" />
        <div className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 font-bold text-secondary-foreground">
          <Flame className="h-5 w-5 text-chart-3" /> ০
        </div>
      </div>
      <div className="mt-8 rounded-3xl bg-primary p-6 text-primary-foreground">
        <p className="text-lg">আসসালামু আলাইকুম,</p>
        <p className="text-2xl font-bold">{profile?.full_name ?? "শিক্ষার্থী"}</p>
        <p className="arabic mt-3 text-3xl" lang="ar">بِسْمِ اللّٰهِ</p>
      </div>
      <p className="mt-6 text-center text-muted-foreground">পাঠ, পরীক্ষা ও অগ্রগতি পরের ধাপগুলোতে যুক্ত হবে।</p>
    </div>
  );
}
