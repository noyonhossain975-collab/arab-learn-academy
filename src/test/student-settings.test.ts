import { describe, expect, it } from "vitest";
import { purchaseHref, usesDarkTheme, themePreference, validateAvatar } from "@/lib/student-settings";

describe("student settings rules", () => {
  it("includes the chosen plan, price, student name and email in the WhatsApp message", () => {
    const href = purchaseHref("+880 1700-000000", "{plan} | {price} | {name} | {email}", { plan: "৩ মাস", price: 249, name: "নয়ন", email: "student@example.com" });
    expect(href).not.toBeNull();
    const url = new URL(href ?? "https://invalid.example");
    expect(url.pathname).toBe("/8801700000000");
    expect(url.searchParams.get("text")).toBe("৩ মাস | 249 | নয়ন | student@example.com");
  });
  it("does not offer payment to a placeholder WhatsApp number", () => {
    expect(purchaseHref("8801XXXXXXXXX", "{plan} {price} {name} {email}", { plan: "মাস", price: 99, name: "নাম", email: "a@example.com" })).toBeNull();
  });
  it("supports light, dark and following the device", () => {
    expect(usesDarkTheme("light", true)).toBe(false);
    expect(usesDarkTheme("dark", false)).toBe(true);
    expect(usesDarkTheme("default", true)).toBe(true);
    expect(usesDarkTheme("default", false)).toBe(false);
    expect(themePreference("system")).toBe("default");
  });
  it("accepts supported profile images up to two MB", () => {
    expect(validateAvatar({ type: "image/png", size: 2 * 1024 * 1024 })).toBeNull();
    expect(validateAvatar({ type: "image/jpeg", size: 2 * 1024 * 1024 + 1 })).not.toBeNull();
    expect(validateAvatar({ type: "image/svg+xml", size: 100 })).not.toBeNull();
  });
});