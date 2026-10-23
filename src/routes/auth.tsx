import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { cloneElement, isValidElement, useEffect, useId, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

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

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) void navigate({ to: "/home", replace: true });
    });
    return () => { active = false; };
  }, [navigate]);

  async function googleLogin() {
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth?mode=login` } });
      if (error) throw error;
    } catch { toast.error("Google দিয়ে লগইন শুরু হয়নি। আবার চেষ্টা করুন।"); }
    finally { setBusy(false); }
  }

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
          options: { emailRedirectTo: window.location.origin + "/auth?mode=login", data: { full_name: name.trim() } },
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
          <Button variant="link" onClick={() => { setSent(null); setMode("login"); }} className="mt-4 w-full font-bold">
            লগইন পেজে ফিরে যান
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-4">
          {mode === "signup" && (
            <Field label="আপনার নাম">
              <Input autoComplete="name" required maxLength={100} value={name} onChange={(e) => setName(e.target.value)} className="h-12 rounded-xl border-2" />
            </Field>
          )}
          <Field label="ইমেইল">
            <Input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-xl border-2" />
          </Field>
          {mode !== "forgot" && (
            <Field label="পাসওয়ার্ড">
              <Input type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={mode === "signup" ? 6 : undefined} required value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-xl border-2" />
            </Field>
          )}
          {mode === "login" && (
            <Button variant="link" type="button" onClick={() => setMode("forgot")} className="h-auto px-0 text-sm font-semibold">
              পাসওয়ার্ড ভুলে গেছেন?
            </Button>
          )}
          <Button type="submit" disabled={busy} className="btn-3d h-auto w-full whitespace-normal rounded-2xl py-4 text-lg font-bold">
            {busy ? "অপেক্ষা করুন..." : buttons[mode]}
          </Button>
          {mode !== "forgot" && <Button type="button" variant="outline" disabled={busy} onClick={googleLogin} className="h-auto w-full rounded-2xl border-2 py-3 font-bold"><span aria-hidden="true" className="font-serif text-xl">G</span>Google দিয়ে লগইন</Button>}
        </form>
      )}

      <p className="mt-8 text-center text-muted-foreground">
        {mode === "signup" ? (
          <>অ্যাকাউন্ট আছে? <Button variant="link" onClick={() => { setSent(null); setMode("login"); }} className="px-1 font-bold">লগইন করুন</Button></>
        ) : (
          <>নতুন? <Button variant="link" onClick={() => { setSent(null); setMode("signup"); }} className="px-1 font-bold">অ্যাকাউন্ট খুলুন</Button></>
        )}
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const id = useId();
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-base">{label}</Label>
      <div id={`${id}-field`}>{isValidElement<{ id?: string }>(children) ? cloneElement(children, { id }) : children}</div>
    </div>
  );
}

function translate(msg: string) {
  if (/invalid login/i.test(msg)) return "ইমেইল বা পাসওয়ার্ড ভুল";
  if (/already registered/i.test(msg)) return "এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে";
  if (/is invalid/i.test(msg)) return "ইমেইল ঠিকানাটি সঠিক নয়";
  if (/not confirmed/i.test(msg)) return "ইমেইল এখনো নিশ্চিত করা হয়নি — ইনবক্স দেখুন";
  if (/rate limit|too many/i.test(msg)) return "অনেকবার চেষ্টা হয়েছে। একটু পরে আবার চেষ্টা করুন।";
  if (/network|fetch/i.test(msg)) return "ইন্টারনেট সংযোগ দেখুন, তারপর আবার চেষ্টা করুন।";
  if (/পাসওয়ার্ড/.test(msg)) return msg;
  return "কাজটি হয়নি। আবার চেষ্টা করুন।";
}
