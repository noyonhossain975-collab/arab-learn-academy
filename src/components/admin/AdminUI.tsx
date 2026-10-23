import type { ReactNode } from "react";

export function AdminTitle({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      {children}
    </div>
  );
}

export function AdminCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-border bg-card p-5 shadow-sm ${className}`}>{children}</div>;
}

export function AdminSoon({ title, phase }: { title: string; phase: string }) {
  return (
    <>
      <AdminTitle title={title} />
      <AdminCard className="text-center text-muted-foreground">এই পেজটি {phase}-এ তৈরি হবে।</AdminCard>
    </>
  );
}

export function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("bn-BD", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Dhaka" });
}
