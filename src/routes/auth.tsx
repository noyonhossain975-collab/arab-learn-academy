import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";

type Mode = "login" | "signup" | "forgot";

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>): { mode?: Mode } => ({
    mode: s['mode'] === "signup" || s['mode'] === "forgot" ? s['mode'] : "login",
  }),
  head: () => ({
    meta: [
      { title: "লগইন / সাইন আপ — Arab learn" },
      { name: "description", content: "Arab learn-এ লগইন করুন বা নতুন অ্যাকাউন্ট খুলুন।" },
      { property: "og:title", content: "লগইন — Arab learn" },
      { property: "og:description", content: "Arab learn-এ লগইন করুন বা নতুন অ্যাকাউন্ট খুলুন।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode = "login" } = Route.useSearch();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  const setMode = (m: Mode) => navigate({ to: "/auth", search: { mode: m }, replace: true });

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/home", replace: true });
      } else if (mode === "signup") {
        if (password.length < 6) throw new Error("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/home", data: { full_name: name } },
        });
        if (error) throw error;
        if (data.session) navigate({ to: "/home", replace: true });
        else setSent("আপনার ইমেইলে একটি নিশ্চিতকরণ লিংক পাঠানো হয়েছে। লিংকে ক্লিক করে লগইন করুন।");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password",
        });
        if (error) throw error;
        setSent("পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে।");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(translate(msg));
    } finally {
      setBusy(false);
    }
  }

  const titles: Record<Mode, string> = { login: "আবার স্বাগতম!", signup: "নতুন অ্যাকাউন্ট খুলুন", forgot: "পাসওয়ার্ড ভুলে গেছেন?" };
  const buttons: Record<Mode, string> = { login: "লগইন", signup: "সাইন আপ", forgot: "রিসেট লিংক পাঠান" };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background px-6 py-10">
      <Link to="/"><Logo /></Link>
      <h1 className="mt-10 text-center text-2xl font-bold text-foreground">{titles[mode]}</h1>

      {sent ? (
        <div className="mt-8 rounded-2xl border-2 border-primary bg-secondary p-5 text-center text-secondary-foreground">
          {sent}
          <button onClick={() => { setSent(null); setMode("login"); }} className="mt-4 block w-full font-bold text-primary">
            লগইন পেজে ফিরে যান
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-4">
          {mode === "signup" && (
            <Field label="আপনার নাম">
              <Input required value={name} onChange={(e) => setName(e.target.value)} className="h-12 rounded-xl border-2" />
            </Field>
          )}
          <Field label="ইমেইল">
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-xl border-2" />
          </Field>
          {mode !== "forgot" && (
            <Field label="পাসওয়ার্ড">
              <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-xl border-2" />
            </Field>
          )}
          {mode === "login" && (
            <button type="button" onClick={() => setMode("forgot")} className="text-sm font-semibold text-primary">
              পাসওয়ার্ড ভুলে গেছেন?
            </button>
          )}
          <button disabled={busy} className="btn-3d w-full rounded-2xl bg-primary py-4 text-lg font-bold text-primary-foreground disabled:opacity-60">
            {busy ? "অপেক্ষা করুন..." : buttons[mode]}
          </button>
        </form>
      )}

      <p className="mt-8 text-center text-muted-foreground">
        {mode === "signup" ? (
          <>অ্যাকাউন্ট আছে? <button onClick={() => setMode("login")} className="font-bold text-primary">লগইন করুন</button></>
        ) : (
          <>নতুন? <button onClick={() => setMode("signup")} className="font-bold text-primary">অ্যাকাউন্ট খুলুন</button></>
        )}
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-base">{label}</Label>
      {children}
    </div>
  );
}

function translate(msg: string) {
  if (/invalid login/i.test(msg)) return "ইমেইল বা পাসওয়ার্ড ভুল";
  if (/already registered/i.test(msg)) return "এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে";
  if (/is invalid/i.test(msg)) return "ইমেইল ঠিকানাটি সঠিক নয়";
  if (/not confirmed/i.test(msg)) return "ইমেইল এখনো নিশ্চিত করা হয়নি — ইনবক্স দেখুন";
  return msg;
}
