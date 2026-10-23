import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, ShieldCheck, BookOpen, ChevronRight, BookmarkX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { StudentReports } from "@/components/StudentReports";
import { Button } from "@/components/ui/button";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { PremiumPlans } from "@/components/settings/PremiumPlans";
import { CommunityLinks } from "@/components/settings/CommunityLinks";
import { profileOptions, premiumOptions, communityOptions } from "@/lib/student-settings";
import { LearningError, LearningPending } from "@/components/learning/LearningUI";

export const Route = createFileRoute("/_authenticated/_student/settings")({
  loader: ({ context }) => Promise.all([
    context.queryClient.fetchQuery(profileOptions(context.user.id)),
    context.queryClient.fetchQuery(premiumOptions(context.user.id)),
    context.queryClient.fetchQuery(communityOptions),
  ]),
  pendingComponent: LearningPending,
  errorComponent: LearningError,
  head: () => ({
    meta: [
      { title: "সেটিংস — Arab learn" },
      { name: "description", content: "প্রোফাইল, থিম, প্রিমিয়াম প্ল্যান, কমিউনিটি ও ব্লগ।" },
      { property: "og:title", content: "সেটিংস — Arab learn" },
      { property: "og:description", content: "প্রোফাইল, থিম, প্রিমিয়াম প্ল্যান, কমিউনিটি ও ব্লগ।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Settings,
});

function Settings() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: isAdmin } = useQuery({ queryKey: ["is-admin"], queryFn: async () => (await supabase.rpc("is_admin")).data ?? false });
  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { mode: "login" }, replace: true });
  }
  return (
    <>
      <PageHeader title="সেটিংস" />
      <div className="space-y-6 p-5">
        <ProfileSettings userId={user.id} email={user.email ?? ""} />
        <PremiumPlans userId={user.id} email={user.email ?? ""} />
        <CommunityLinks />
        <div className="space-y-2">
          <Button asChild variant="outline" className="h-auto w-full justify-start py-3"><Link to="/blog"><BookOpen />ব্লগ ও আর্টিকেল<ChevronRight className="ml-auto" /></Link></Button>
          <Button asChild variant="outline" className="h-auto w-full justify-start py-3"><Link to="/mistakes"><BookmarkX />সংরক্ষিত ভুল<ChevronRight className="ml-auto" /></Link></Button>
        </div>
        {isAdmin && (
          <Link to="/admin" className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-primary py-3 font-bold text-primary">
            <ShieldCheck className="h-5 w-5" /> অ্যাডমিন প্যানেল
          </Link>
        )}
        <StudentReports userId={user.id} />
        <Button variant="outline" onClick={signOut} className="w-full border-destructive text-destructive">
          <LogOut className="h-5 w-5" /> লগ আউট
        </Button>
      </div>
    </>
  );
}
