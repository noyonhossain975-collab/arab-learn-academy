export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <div className="arabic flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-2xl font-bold text-primary-foreground" lang="ar">
        ع
      </div>
      <span className="text-2xl font-bold text-primary">Arab learn</span>
    </div>
  );
}
