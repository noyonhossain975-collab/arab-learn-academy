import logo from "@/assets/arab-learn-logo-clean.png.asset.json";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img src={logo.url} alt="Arab learn" className="h-10 w-auto max-w-full dark:rounded-lg dark:bg-foreground dark:px-2 dark:py-1" />
    </div>
  );
}
