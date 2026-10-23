import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminCard, AdminTitle, fmtDate } from "@/components/admin/AdminUI";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/admin/management")({
  component: Management,
});

const methods = [
  { v: "bkash", l: "বিকাশ" },
  { v: "nagad", l: "নগদ" },
  { v: "other", l: "অন্যান্য" },
];
const methodLabel = (v: string | null) => methods.find((m) => m.v === v)?.l ?? "—";

function Management() {
  return (
    <>
      <AdminTitle title="ম্যানেজমেন্ট" />
      <Tabs defaultValue="subs">
        <TabsList>
          <TabsTrigger value="subs">সাবস্ক্রিপশন</TabsTrigger>
          <TabsTrigger value="students">ছাত্র তালিকা</TabsTrigger>
          <TabsTrigger value="plans">প্ল্যান</TabsTrigger>
        </TabsList>
        <TabsContent value="subs"><Subscriptions /></TabsContent>
        <TabsContent value="students"><Students /></TabsContent>
        <TabsContent value="plans"><Plans /></TabsContent>
      </Tabs>
    </>
  );
}

function usePlans(all = false) {
  return useQuery({
    queryKey: ["admin", "plans"],
    queryFn: async () => {
      const { data, error } = await supabase.from("plans").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
    select: (d) => (all ? d : d.filter((p) => p.is_active)),
  });
}

/* ---------- সাবস্ক্রিপশন ---------- */
function Subscriptions() {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [searched, setSearched] = useState("");
  const [planId, setPlanId] = useState("");
  const [method, setMethod] = useState("bkash");
  const [note, setNote] = useState("");
  const plans = usePlans();

  const student = useQuery({
    queryKey: ["admin", "student", searched],
    enabled: !!searched,
    queryFn: async () => {
      const { data: p, error } = await supabase.from("profiles").select("*").ilike("email", searched).maybeSingle();
      if (error) throw error;
      if (!p) return null;
      const { data: subs } = await supabase
        .from("subscriptions").select("*").eq("user_id", p.id).eq("status", "active")
        .gt("expires_at", new Date().toISOString()).order("expires_at", { ascending: false });
      return { ...p, activeSub: subs?.[0] ?? null };
    },
  });

  const recent = useQuery({
    queryKey: ["admin", "recent-subs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("subscriptions").select("*").order("created_at", { ascending: false }).limit(20);
      if (error) throw error;
      const ids = [...new Set(data.map((s) => s.user_id))];
      const { data: profs } = ids.length ? await supabase.from("profiles").select("id, full_name, email").in("id", ids) : { data: [] };
      return data.map((s) => ({ ...s, profile: profs?.find((p) => p.id === s.user_id) }));
    },
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin"] });
  };

  const activate = useMutation({
    mutationFn: async () => {
      if (!planId) throw new Error("একটি প্ল্যান বেছে নিন");
      const { error } = await supabase.rpc("admin_set_subscription", {
        p_email: searched, p_plan_id: planId, p_payment_method: method, p_note: note,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("প্রিমিয়াম চালু হয়েছে"); setNote(""); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const cancel = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc("admin_cancel_subscription", { p_user_id: userId });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("প্রিমিয়াম বন্ধ করা হয়েছে"); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const s = student.data;
  const planName = (id: string | null) => plans.data?.find((p) => p.id === id)?.name ?? "—";

  return (
    <div className="mt-4 space-y-6">
      <AdminCard>
        <form onSubmit={(e) => { e.preventDefault(); setSearched(email.trim()); }} className="flex gap-2">
          <Input type="email" placeholder="ছাত্রের ইমেইল লিখুন" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit">খুঁজুন</Button>
        </form>

        {searched && student.isLoading && <p className="mt-4 text-muted-foreground">খোঁজা হচ্ছে…</p>}
        {searched && !student.isLoading && !s && <p className="mt-4 text-destructive">এই ইমেইলে কোনো ছাত্র পাওয়া যায়নি।</p>}

        {s && (
          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            <div className="space-y-1 rounded-lg bg-muted p-4 text-sm">
              <p className="text-lg font-bold">{s.full_name ?? "—"}</p>
              <p>{s.email}</p>
              <p>যোগ দিয়েছে: {fmtDate(s.created_at)}</p>
              <p>শেষ দেখা: {fmtDate(s.last_seen_at)}</p>
              <p className="pt-2 font-semibold">
                {s.activeSub ? <span className="text-primary">প্রিমিয়াম — মেয়াদ {fmtDate(s.activeSub.expires_at)} পর্যন্ত</span> : <span className="text-muted-foreground">ফ্রি ছাত্র</span>}
              </p>
              {s.activeSub && (
                <label className="flex items-center gap-3 pt-3">
                  <Switch
                    checked={false}
                    onCheckedChange={() => { if (confirm("এই ছাত্রের প্রিমিয়াম এখনই বন্ধ করবেন?")) cancel.mutate(s.id); }}
                  />
                  প্রিমিয়াম বন্ধ করো
                </label>
              )}
            </div>
            <div className="space-y-3">
              <select value={planId} onChange={(e) => setPlanId(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3">
                <option value="">প্ল্যান বেছে নিন</option>
                {plans.data?.map((p) => <option key={p.id} value={p.id}>{p.name} — ৳{p.price} ({p.duration_days} দিন)</option>)}
              </select>
              <div className="flex gap-2">
                {methods.map((m) => (
                  <button key={m.v} type="button" onClick={() => setMethod(m.v)}
                    className={`flex-1 rounded-md border px-3 py-2 text-sm ${method === m.v ? "border-primary bg-secondary font-semibold" : "border-input"}`}>
                    {m.l}
                  </button>
                ))}
              </div>
              <Input placeholder="নোট (যেমন: ট্রানজেকশন আইডি)" value={note} onChange={(e) => setNote(e.target.value)} />
              <Button className="w-full" disabled={activate.isPending} onClick={() => activate.mutate()}>
                প্রিমিয়াম চালু করো
              </Button>
              {s.activeSub && <p className="text-xs text-muted-foreground">আগের মেয়াদ শেষ হওয়ার তারিখের সাথে নতুন দিন যোগ হবে।</p>}
            </div>
          </div>
        )}
      </AdminCard>

      <AdminCard>
        <h2 className="mb-3 font-semibold">সাম্প্রতিক অ্যাক্টিভেশন</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr><th className="py-2">ছাত্র</th><th>প্ল্যান</th><th>তারিখ</th><th>মেয়াদ</th><th>মাধ্যম</th><th>অবস্থা</th><th>নোট</th></tr>
            </thead>
            <tbody>
              {recent.data?.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="py-2">{r.profile?.full_name ?? "—"}<div className="text-xs text-muted-foreground">{r.profile?.email}</div></td>
                  <td>{planName(r.plan_id)}</td>
                  <td>{fmtDate(r.created_at)}</td>
                  <td>{fmtDate(r.expires_at)}</td>
                  <td>{methodLabel(r.payment_method)}</td>
                  <td>{r.status === "active" && new Date(r.expires_at) > new Date() ? "চালু" : r.status === "cancelled" ? "বন্ধ" : "শেষ"}</td>
                  <td className="max-w-40 truncate">{r.payment_note}</td>
                </tr>
              ))}
              {recent.data?.length === 0 && <tr><td colSpan={7} className="py-6 text-center text-muted-foreground">এখনো কোনো অ্যাক্টিভেশন নেই</td></tr>}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  );
}

/* ---------- ছাত্র তালিকা ---------- */
const PAGE = 20;
function Students() {
  const [q, setQ] = useState("");
  const [term, setTerm] = useState("");
  const [page, setPage] = useState(0);

  const list = useQuery({
    queryKey: ["admin", "students", term, page],
    queryFn: async () => {
      let query = supabase.from("profiles").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(page * PAGE, page * PAGE + PAGE - 1);
      if (term) {
        const t = term.replace(/[%,()]/g, "");
        query = query.or(`full_name.ilike.%${t}%,email.ilike.%${t}%`);
      }
      const { data, count, error } = await query;
      if (error) throw error;
      const ids = data.map((p) => p.id);
      const { data: subs } = ids.length
        ? await supabase.from("subscriptions").select("user_id, expires_at").in("user_id", ids).eq("status", "active").gt("expires_at", new Date().toISOString())
        : { data: [] };
      return { rows: data.map((p) => ({ ...p, premiumUntil: subs?.filter((s) => s.user_id === p.id).map((s) => s.expires_at).sort().at(-1) })), count: count ?? 0 };
    },
  });
  const pages = Math.max(1, Math.ceil((list.data?.count ?? 0) / PAGE));

  return (
    <AdminCard className="mt-4">
      <form onSubmit={(e) => { e.preventDefault(); setPage(0); setTerm(q.trim()); }} className="mb-4 flex gap-2">
        <Input placeholder="নাম বা ইমেইল দিয়ে খুঁজুন" value={q} onChange={(e) => setQ(e.target.value)} />
        <Button type="submit">খুঁজুন</Button>
      </form>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground">
            <tr><th className="py-2">নাম</th><th>ইমেইল</th><th>যোগ দিয়েছে</th><th>শেষ দেখা</th><th>প্রিমিয়াম</th></tr>
          </thead>
          <tbody>
            {list.data?.rows.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="py-2">{p.full_name ?? "—"}</td>
                <td>{p.email}</td>
                <td>{fmtDate(p.created_at)}</td>
                <td>{fmtDate(p.last_seen_at)}</td>
                <td>{p.premiumUntil ? <span className="font-semibold text-primary">{fmtDate(p.premiumUntil)} পর্যন্ত</span> : "ফ্রি"}</td>
              </tr>
            ))}
            {list.isLoading && <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">লোড হচ্ছে…</td></tr>}
            {list.data?.rows.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">কোনো ছাত্র পাওয়া যায়নি</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">মোট {(list.data?.count ?? 0).toLocaleString("bn-BD")} জন</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>আগে</Button>
          <span>{(page + 1).toLocaleString("bn-BD")} / {pages.toLocaleString("bn-BD")}</span>
          <Button variant="outline" size="sm" disabled={page + 1 >= pages} onClick={() => setPage(page + 1)}>পরে</Button>
        </div>
      </div>
    </AdminCard>
  );
}

/* ---------- প্ল্যান ---------- */
function Plans() {
  const plans = usePlans(true);
  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-3">
      {plans.data?.map((p) => <PlanEditor key={p.id} plan={p} />)}
    </div>
  );
}

type Plan = { id: string; name: string; duration_days: number; price: number; features: unknown; is_active: boolean };

function PlanEditor({ plan }: { plan: Plan }) {
  const qc = useQueryClient();
  const [name, setName] = useState(plan.name);
  const [days, setDays] = useState(String(plan.duration_days));
  const [price, setPrice] = useState(String(plan.price));
  const [features, setFeatures] = useState(Array.isArray(plan.features) ? (plan.features as string[]).join("\n") : "");
  const [active, setActive] = useState(plan.is_active);

  const save = useMutation({
    mutationFn: async () => {
      const d = parseInt(days, 10);
      const pr = Number(price);
      if (!name.trim() || !(d > 0) || !(pr >= 0)) throw new Error("নাম, দিন ও দাম সঠিকভাবে লিখুন");
      const { error } = await supabase.from("plans").update({
        name: name.trim(), duration_days: d, price: pr, is_active: active,
        features: features.split("\n").map((f) => f.trim()).filter(Boolean),
      }).eq("id", plan.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("প্ল্যান সংরক্ষণ হয়েছে"); qc.invalidateQueries({ queryKey: ["admin", "plans"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminCard className="space-y-3">
      <label className="block text-sm">নাম<Input value={name} onChange={(e) => setName(e.target.value)} /></label>
      <div className="grid grid-cols-2 gap-2">
        <label className="block text-sm">মেয়াদ (দিন)<Input type="number" value={days} onChange={(e) => setDays(e.target.value)} /></label>
        <label className="block text-sm">দাম (৳)<Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} /></label>
      </div>
      <label className="block text-sm">সুবিধাসমূহ (প্রতি লাইনে একটি)<Textarea rows={5} value={features} onChange={(e) => setFeatures(e.target.value)} /></label>
      <label className="flex items-center gap-3 text-sm"><Switch checked={active} onCheckedChange={setActive} /> চালু আছে</label>
      <Button className="w-full" disabled={save.isPending} onClick={() => save.mutate()}>সংরক্ষণ করো</Button>
    </AdminCard>
  );
}
