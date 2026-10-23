import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { profileOptions, themePreference, usesDarkTheme } from "@/lib/student-settings";

export function ThemeController({ userId }: { userId: string | null }) {
  const { data } = useQuery({ ...profileOptions(userId ?? ""), enabled: !!userId });
  const preference = themePreference(data?.theme_pref ?? "default");
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => document.documentElement.classList.toggle("dark", usesDarkTheme(preference, media.matches));
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [preference]);
  return null;
}