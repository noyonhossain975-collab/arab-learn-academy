export const REPORT_STATUS = { new: "নতুন", in_progress: "দেখা হচ্ছে", resolved: "সমাধান হয়েছে" } as const;
export type ReportStatus = keyof typeof REPORT_STATUS;
export const PLATFORMS = [{ value: "facebook", label: "Facebook" },{ value: "youtube", label: "YouTube" },{ value: "email", label: "ইমেইল" },{ value: "whatsapp", label: "WhatsApp" },{ value: "telegram", label: "Telegram" },{ value: "other", label: "অন্যান্য" }];
export function contactHref(platform: string, value: string): string | null {
  const clean = value.trim();
  if (platform === "email") { const email = clean.replace(/^mailto:/i, ""); return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? `mailto:${email}` : null; }
  if (platform === "whatsapp" && /^\+?[\d\s-]+$/.test(clean)) return `https://wa.me/${clean.replace(/\D/g, "")}`;
  try { const url = new URL(clean); return ["http:","https:"].includes(url.protocol) ? url.href : null; } catch { return null; }
}
export function unreadReply(report: { admin_reply: string | null; reply_seen_by_student: boolean }) { return !!report.admin_reply?.trim() && !report.reply_seen_by_student; }
export function validateWhatsApp(number: string, template: string): string | null {
  if (!/^\d{8,15}$/.test(number.replace(/[\s+-]/g,""))) return "দেশের কোডসহ সঠিক WhatsApp নম্বর দিন";
  const missing = ["plan","price","name","email"].filter(key => !template.includes(`{${key}}`));
  return missing.length ? `বার্তায় রাখুন: ${missing.map(k => `{${k}}`).join(", ")}` : null;
}