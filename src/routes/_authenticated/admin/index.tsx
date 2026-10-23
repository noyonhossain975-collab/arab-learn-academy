import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { AdminCard, AdminTitle } from "@/components/admin/AdminUI";
import { adminHead } from "@/lib/admin-head";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => adminHead("ড্যাশবোর্ড", "Arab learn ছাত্রদের নিবন্ধন, সক্রিয়তা ও সাবস্ক্রিপশনের সারসংক্ষেপ।"),
  component: AdminDashboard,
});

type Stats = {
  total_students: number;
  active_today: number;
  premium_students: number;
  expiring_7d: number;
  new_reports: number;
  inactive_7d: number;
};

const cards: { key: keyof Stats; label: string }[] = [
  { key: "total_students", label: "মোট ছাত্র" },
  { key: "active_today", label: "আজ সক্রিয়" },
  { key: "premium_students", label: "প্রিমিয়াম ছাত্র" },
  { key: "expiring_7d", label: "৭ দিনে মেয়াদ শেষ হবে" },
  { key: "new_reports", label: "অমীমাংসিত রিপোর্ট" },
  { key: "inactive_7d", label: "৭ দিন ধরে আসেনি" },
];

function AdminDashboard() {
  const [days, setDays] = useState(7);
  const stats = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_dashboard_stats");
      if (error) throw error;
      return data as unknown as Stats;
    },
  });
  const chart = useQuery({
    queryKey: ["admin", "chart", days],
    queryFn: async () => {
      const [s, a] = await Promise.all([
        supabase.rpc("admin_signups_per_day", { p_days: days }),
        supabase.rpc("admin_active_per_day", { p_days: days }),
      ]);
      if (s.error) throw s.error;
      if (a.error) throw a.error;
      return (s.data ?? []).map((row, i) => ({
        day: new Date(row.day).toLocaleDateString("bn-BD", { day: "numeric", month: "short" }),
        signups: Number(row.count),
        active: Number(a.data?.[i]?.count ?? 0),
      }));
    },
  });

  return (
    <>
      <AdminTitle title="ড্যাশবোর্ড" />
      <AdminCard className="mb-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">নিবন্ধন ও সক্রিয় ছাত্র</h2>
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            {[7, 30, 90].map((d) => (
              <Button variant={days === d ? "secondary" : "ghost"} size="sm" aria-pressed={days === d}
                key={d}
                onClick={() => setDays(d)}
                className={`rounded-md px-3 py-1 text-sm ${days === d ? "bg-background font-semibold shadow-sm" : "text-muted-foreground"}`}
              >
                {d.toLocaleString("bn-BD")} দিন
              </Button>
            ))}
          </div>
        </div>
        <div className="h-72">
          {chart.isLoading ? (
            <div className="h-full animate-pulse rounded-lg bg-muted" />
          ) : chart.error ? (
            <div role="alert" className="flex h-full flex-col items-center justify-center gap-3 text-destructive"><p>চার্টের তথ্য লোড হয়নি</p><Button variant="outline" onClick={() => chart.refetch()}>আবার চেষ্টা করুন</Button></div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart.data ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="signups" name="নতুন নিবন্ধন" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="active" name="সক্রিয় ছাত্র" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </AdminCard>
      {stats.error ? <div role="alert" className="flex flex-wrap items-center gap-3 text-destructive"><p>হিসাব লোড হয়নি</p><Button variant="outline" onClick={() => stats.refetch()}>আবার চেষ্টা করুন</Button></div> : <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {cards.map((c) => (
          <AdminCard key={c.key}>
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {stats.isLoading ? "…" : (stats.data?.[c.key] ?? 0).toLocaleString("bn-BD")}
            </p>
          </AdminCard>
        ))}
      </div>}
    </>
  );
}
