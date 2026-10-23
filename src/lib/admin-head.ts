export function adminHead(title: string, description: string) {
  const fullTitle = `${title} — Arab learn অ্যাডমিন`;
  return { meta: [
    { title: fullTitle }, { name: "description", content: description },
    { property: "og:title", content: fullTitle }, { property: "og:description", content: description },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] };
}