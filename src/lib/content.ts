import DOMPurify from "dompurify";

/** Sanitize lesson/blog HTML. Browser-only (call from effects/handlers/client routes). */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ADD_ATTR: ["dir", "colspan", "rowspan"],
    FORBID_TAGS: ["style", "script", "iframe", "form", "input"],
  });
}

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Plain text -> paragraphs (split on blank lines). Text that already looks like HTML is only sanitized. */
export function textToHtml(text: string): string {
  const t = text.trim();
  if (/<\/?[a-z][\s\S]*>/i.test(t)) return sanitizeHtml(t);
  return t
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p dir="auto">${escape(p).replace(/\r?\n/g, "<br>")}</p>`)
    .join("");
}

/** Give every paragraph/heading without an explicit direction dir="auto" so Arabic renders RTL. */
export function withAutoDir(html: string): string {
  return html.replace(/<(p|h[1-6]|li|td|th)(?![^>]*\bdir=)([^>]*)>/gi, '<$1 dir="auto"$2>');
}
