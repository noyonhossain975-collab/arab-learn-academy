import type { ReactNode } from "react";

export function PageHeader({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 flex min-w-0 items-center justify-between gap-3 border-b-2 border-border bg-background px-5 py-4">
      <h1 dir="auto" className="min-w-0 break-words text-xl font-bold text-foreground">{title}</h1>
      {right}
    </header>
  );
}

export function ComingSoon({ text }: { text: string }) {
  return (
    <div className="m-5 rounded-2xl border-2 border-dashed border-border p-8 text-center text-muted-foreground">
      {text}
    </div>
  );
}
