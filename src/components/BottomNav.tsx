import { Link } from "@tanstack/react-router";
import { BookOpen, FileText, Home, Settings } from "lucide-react";
import { Logo } from "@/components/Logo";

// Keep exactly four student destinations.
const items = [
  { to: "/home", label: "হোম", icon: Home },
  { to: "/learn", label: "লেসন", icon: BookOpen },
  { to: "/exams", label: "পরীক্ষা", icon: FileText },
  { to: "/settings", label: "সেটিংস", icon: Settings },
] as const;

export function BottomNav() {
  return (
    <nav aria-label="প্রধান মেনু" className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-border bg-background md:inset-y-0 md:left-0 md:right-auto md:w-60 md:border-r-2 md:border-t-0">
      <div className="hidden px-5 py-6 md:block">
        <Logo className="justify-start" />
      </div>
      <div className="mx-auto flex max-w-md justify-around px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:mx-0 md:max-w-none md:flex-col md:gap-2 md:px-3 md:pb-2">
        {items.map((it) => (
          <Link
            key={it.to}
            to={it.to}
            className="flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-xs font-semibold text-muted-foreground md:flex-none md:flex-row md:gap-3 md:px-4 md:py-3 md:text-base"
            activeProps={{ className: "bg-secondary text-secondary-foreground", "aria-current": "page" }}
          >
            <it.icon className="h-6 w-6" />
            {it.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
