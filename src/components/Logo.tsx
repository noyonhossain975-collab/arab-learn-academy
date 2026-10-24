import logo from "@/assets/arab-learn-logo.png.asset.json";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img src={logo.url} alt="Arab learn" className="h-12 w-auto rounded-xl" />
    </div>
  );
}
