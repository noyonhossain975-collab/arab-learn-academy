import { useSuspenseQuery } from "@tanstack/react-query";
import { Check, Crown, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { premiumOptions, profileOptions, purchaseHref } from "@/lib/student-settings";

export function PremiumPlans({ userId, email }: { userId: string; email: string }) {
  const { data } = useSuspenseQuery(premiumOptions(userId));
  const { data: profile } = useSuspenseQuery(profileOptions(userId));
  const date = data.subscription?.expires_at ? new Date(data.subscription.expires_at).toLocaleDateString("bn-BD", { timeZone: "Asia/Dhaka" }) : null;
  return <section className="space-y-4 border-b border-border pb-6" id="premium">
    <div className="flex items-center gap-2"><Crown className="text-chart-3" /><h2 className="text-lg font-bold">প্রিমিয়াম প্ল্যান</h2></div>
    <div className="border-l-4 border-primary bg-secondary p-3 text-secondary-foreground"><p className="font-bold">{data.active ? "প্রিমিয়াম সক্রিয়" : "ফ্রি অ্যাকাউন্ট"}</p>{date && <p className="mt-1 text-sm">{data.active ? "মেয়াদ শেষ হবে" : data.subscription?.status === "cancelled" ? "বাতিল প্ল্যানের মেয়াদ" : "আগের মেয়াদ শেষ"}: {date}</p>}</div>
    {!data.plans.length && <p className="text-sm text-muted-foreground">এখন কোনো প্ল্যান পাওয়া যাচ্ছে না</p>}
    {data.plans.map(plan => {
      const href = purchaseHref(data.number, data.template, { plan: plan.name, price: plan.price, name: profile.full_name ?? "শিক্ষার্থী", email });
      const features = Array.isArray(plan.features) ? plan.features.filter((f): f is string => typeof f === "string") : [];
      return <article key={plan.id} className="space-y-4 rounded-lg border-2 border-border bg-card p-4"><div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-bold">{plan.name}</h3><p className="mt-1 text-sm text-muted-foreground">{plan.duration_days.toLocaleString("bn-BD")} দিন</p></div><p className="text-2xl font-bold">৳{plan.price.toLocaleString("bn-BD")}</p></div>
        {!!features.length && <ul className="space-y-2 text-sm">{features.map((f, i) => <li key={i} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary" /><span className="min-w-0 break-words">{f}</span></li>)}</ul>}
        {href ? <Button asChild className="w-full"><a href={href} target="_blank" rel="noopener noreferrer"><MessageCircle />{data.active ? "মেয়াদ বাড়াও" : "প্ল্যান কিনুন"}</a></Button> : <p className="text-sm text-muted-foreground">পেমেন্টের WhatsApp নম্বর এখনো চালু হয়নি</p>}
      </article>;
    })}
  </section>;
}