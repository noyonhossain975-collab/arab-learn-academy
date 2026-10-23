import { Link } from "@tanstack/react-router";
import { BarChart3, BookOpen, FileText, Home, Settings } from "lucide-react";

const items = [
  { to: "/home", label: "হোম", icon: Home },
  { to: "/learn", label: "শিখুন", icon: BookOpen },
  { to: "/exams", label: "পরীক্ষা", icon: FileText },
  { to: "/dashboard", label: "অগ্রগতি", icon: BarChart3 },
  { to: "/settings", label: "সেটিংস", icon: Settings },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-border bg-background">
      <div className="mx-auto flex max-w-md justify-around px-2 py-2">
        {items.map((it) => (
          <Link
            key={it.to}
            to={it.to}
            className="flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-xs font-semibold text-muted-foreground"
            activeProps={{ className: "bg-secondary text-secondary-foreground" }}
          >
            <it.icon className="h-6 w-6" />
            {it.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
