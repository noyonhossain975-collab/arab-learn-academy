import { Link } from "@tanstack/react-router";
import { BookOpen, FileText, Home, Settings, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

// Keep exactly four student destinations.
const items = [
  { to: "/home", label: "হোম", icon: Home },
  { to: "/learn", label: "লেসন", icon: BookOpen },
  { to: "/exams", label: "পরীক্ষা", icon: FileText },
  { to: "/settings", label: "সেটিংস", icon: Settings },
] as const;

export function BottomNav({ collapsed = false, onToggle }: { collapsed?: boolean; onToggle?: () => void }) {
  return (
    <nav aria-label="প্রধান মেনু" className={`fixed inset-x-0 bottom-0 z-40 border-t-2 border-border bg-background transition-[width] duration-300 md:inset-y-0 md:left-0 md:right-auto md:flex md:flex-col md:border-r-2 md:border-t-0 ${collapsed ? "md:w-20" : "md:w-64"}`}>
      <div className={`hidden items-center gap-2 py-6 md:flex ${collapsed ? "justify-center px-2" : "justify-between px-5"}`}>
        {!collapsed && <Logo className="min-w-0 justify-start" />}
        <Button variant="ghost" size="icon" onClick={onToggle} aria-label={collapsed ? "মেনু বড় করুন" : "মেনু ছোট করুন"} title={collapsed ? "মেনু বড় করুন" : "মেনু ছোট করুন"} className="shrink-0">
          {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </Button>
      </div>
      <div className="mx-auto flex max-w-md justify-around px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:mx-0 md:max-w-none md:flex-col md:gap-2 md:px-3 md:pb-2">
        {items.map((it) => (
          <Link
            key={it.to}
            to={it.to}
            title={it.label}
            className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted md:flex-none md:flex-row md:gap-3 md:py-3 md:text-base ${collapsed ? "md:justify-center md:px-0" : "md:px-4"}`}
            activeProps={{ className: "bg-secondary text-secondary-foreground", "aria-current": "page" }}
          >
            <it.icon className="h-6 w-6 shrink-0" />
            <span className={collapsed ? "md:sr-only" : ""}>{it.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
