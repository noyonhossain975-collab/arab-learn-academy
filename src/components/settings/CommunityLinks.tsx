import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowUpRight, Mail, Users } from "lucide-react";
import { communityOptions } from "@/lib/student-settings";
import { contactHref } from "@/lib/site-settings";
import { Button } from "@/components/ui/button";

export function CommunityLinks() {
  const { data } = useSuspenseQuery(communityOptions);
  const links = data.flatMap(link => { const href = contactHref(link.platform, link.url); return href ? [{ ...link, href }] : []; });
  return <section className="space-y-3 border-b border-border pb-6"><h2 className="flex items-center gap-2 text-lg font-bold"><Users className="text-primary" />আমাদের কমিউনিটি</h2>
    {links.length ? <div className="flex flex-wrap gap-2">{links.map(link => <Button asChild variant="outline" key={link.id} className="h-auto min-h-9 max-w-full whitespace-normal py-2 text-left"><a href={link.href} target={link.platform === "email" ? undefined : "_blank"} rel="noopener noreferrer">{link.platform === "email" ? <Mail /> : <ArrowUpRight />}<span className="break-words">{link.title}</span></a></Button>)}</div> : <p className="text-sm text-muted-foreground">কমিউনিটি লিংক শিগগিরই আসবে</p>}
  </section>;
}