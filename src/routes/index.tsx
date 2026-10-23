import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { BookOpen, GraduationCap, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/home" });
  },
  head: () => ({
    meta: [
      { title: "Arab learn — মাদ্রাসা শিক্ষার্থীদের আরবি শেখা" },
      { name: "description", content: "সহজ পাঠ, শব্দভান্ডার ও বোর্ড পরীক্ষার প্রস্তুতি — এক জায়গায়।" },
      { property: "og:title", content: "Arab learn — আরবি শিখুন সহজে" },
      { property: "og:description", content: "সহজ পাঠ, শব্দভান্ডার ও বোর্ড পরীক্ষার প্রস্তুতি — এক জায়গায়।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const features = [
    { icon: BookOpen, title: "সহজ পাঠ", text: "ধাপে ধাপে আরবি ব্যাকরণ ও অনুবাদ" },
    { icon: GraduationCap, title: "পরীক্ষার প্রস্তুতি", text: "বোর্ড প্রশ্ন, MCQ ও সৃজনশীল" },
    { icon: Trophy, title: "প্রতিদিনের অগ্রগতি", text: "স্কোর, স্ট্রিক ও দুর্বল বিষয়" },
  ];
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background px-6 py-10">
      <Logo />
      <div className="mt-12 text-center">
        <p className="arabic text-4xl text-primary" lang="ar">تَعَلَّمِ الْعَرَبِيَّةَ</p>
        <h1 className="mt-4 text-3xl font-bold leading-snug text-foreground">আরবি শিখুন, আনন্দের সাথে</h1>
        <p className="mt-3 text-muted-foreground">মাদ্রাসা শিক্ষার্থীদের জন্য তৈরি একটি সহজ শেখার প্ল্যাটফর্ম।</p>
      </div>
      <div className="mt-10 space-y-3">
        {features.map((f) => (
          <div key={f.title} className="flex items-center gap-4 rounded-2xl border-2 border-border p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
              <f.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{f.title}</p>
              <p className="text-sm text-muted-foreground">{f.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-auto space-y-3 pt-10">
        <Link to="/auth" search={{ mode: "signup" }} className="btn-3d block w-full rounded-2xl bg-primary py-4 text-center text-lg font-bold text-primary-foreground">
          শুরু করুন
        </Link>
        <Link to="/auth" search={{ mode: "login" }} className="block w-full rounded-2xl border-2 border-border py-4 text-center text-lg font-bold text-secondary-foreground">
          আমার অ্যাকাউন্ট আছে
        </Link>
      </div>
    </div>
  );
}
