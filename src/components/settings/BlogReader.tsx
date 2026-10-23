import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen } from "lucide-react";
import { blogOptions, articleOptions } from "@/lib/student-settings";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { sanitizeHtml, withAutoDir } from "@/lib/content";

function Back({ article = false }: { article?: boolean }) { return <Button asChild variant="ghost"><Link to={article ? "/blog" : "/settings"}><ArrowLeft />{article ? "সব লেখা" : "সেটিংস"}</Link></Button>; }
const date = (value: string | null) => value ? new Date(value).toLocaleDateString("bn-BD", { timeZone: "Asia/Dhaka" }) : "";
export function BlogList() {
  const { data } = useSuspenseQuery(blogOptions);
  return <><PageHeader title="ব্লগ ও আর্টিকেল" /><div className="space-y-5 p-5"><Back />{data.length ? <div className="space-y-4">{data.map(post => <article key={post.id} className="overflow-hidden rounded-lg border border-border bg-card">
    {post.cover_image_url && <Link to="/blog/$slug" params={{ slug: post.slug }}><img src={post.cover_image_url} alt={post.title} loading="lazy" className="aspect-video w-full object-cover" /></Link>}
    <div className="space-y-2 p-4"><p className="text-xs text-muted-foreground">{date(post.published_at)}</p><h2 className="break-words text-lg font-bold" dir="auto"><Link to="/blog/$slug" params={{ slug: post.slug }}>{post.title}</Link></h2><Button asChild variant="link" className="px-0"><Link to="/blog/$slug" params={{ slug: post.slug }}>পড়ুন</Link></Button></div>
  </article>)}</div> : <div className="py-10 text-center"><BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground" /><p>এখনো কোনো লেখা প্রকাশিত হয়নি</p></div>}</div></>;
}
export function BlogArticle({ slug }: { slug: string }) {
  const { data } = useSuspenseQuery(articleOptions(slug));
  if (!data) return <div className="space-y-4 p-5"><Back article /><p>লেখাটি পাওয়া যায়নি বা এখন প্রকাশিত নেই</p></div>;
  return <article className="space-y-5 p-5"><Back article /><header className="space-y-3"><h1 dir="auto" className="break-words text-2xl font-bold leading-relaxed">{data.title}</h1><p className="text-sm text-muted-foreground">{date(data.published_at)}</p></header>{data.cover_image_url && <img src={data.cover_image_url} alt={data.title} className="aspect-video w-full rounded-lg object-cover" />}<div dir="auto" className="lesson-content lesson-reader break-words" dangerouslySetInnerHTML={{ __html: withAutoDir(sanitizeHtml(data.content)) }} /></article>;
}