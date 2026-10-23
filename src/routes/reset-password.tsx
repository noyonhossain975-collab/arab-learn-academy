import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "নতুন পাসওয়ার্ড — Arab learn" },
      { name: "description", content: "আপনার Arab learn অ্যাকাউন্টের নতুন পাসওয়ার্ড দিন।" },
      { property: "og:title", content: "নতুন পাসওয়ার্ড — Arab learn" },
      { property: "og:description", content: "আপনার Arab learn অ্যাকাউন্টের নতুন পাসওয়ার্ড দিন।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("পাসওয়ার্ড পরিবর্তন হয়েছে");
    navigate({ to: "/home", replace: true });
  }

  return (
    <div className="mx-auto min-h-screen max-w-md px-6 py-10">
      <Logo />
      <h1 className="mt-10 text-center text-2xl font-bold">নতুন পাসওয়ার্ড দিন</h1>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <Input aria-label="নতুন পাসওয়ার্ড" type="password" autoComplete="new-password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="নতুন পাসওয়ার্ড" className="h-12 rounded-xl border-2" />
        <Button type="submit" disabled={busy} className="btn-3d h-auto w-full rounded-2xl py-4 text-lg font-bold">
          সংরক্ষণ করুন
        </Button>
      </form>
    </div>
  );
}
