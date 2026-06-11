import { Breadcrumb } from "@/components/common/breadcrumb";
import { dateFormatter } from "@/lib/utils";

import { Calendar, User } from "lucide-react";

interface BlogHeroProps {
  title: string;
  authorName: string;
  publishedAt: string;
  slug: string;
}

function BlogHero({ title, authorName, publishedAt, slug }: BlogHeroProps) {
  return (
    <div
      className="relative w-full py-12 md:py-20 flex items-center justify-center bg-cover bg-center text-white mb-12"
      style={{ backgroundImage: `url("/bg/single_blog_banner.jpg")` }}
    >
      <div className="absolute inset-0 bg-orange-800/90"></div>
      <div className="mx-auto relative px-4 text-center z-10 max-w-4xl">
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          <span className="px-3 py-1 bg-white/20 text-white backdrop-blur-sm text-xs font-bold uppercase tracking-wider rounded-full border border-white/30"></span>
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-8 leading-tight text-white drop-shadow-md">
          {title}
        </h1>
        <div className="flex items-center justify-center gap-6 text-white/90 text-sm md:text-base mx-auto max-w-2xl">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <span className="font-medium">{dateFormatter(publishedAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <span className="font-medium hover:text-white transition-colors cursor-pointer underline-offset-4 hover:underline">
              {authorName}
            </span>
          </div>
        </div>

        <Breadcrumb
          className="border-b border-border mt-8 bg-transparent p-0 border-none [&_li]:text-white/80 [&_a]:text-white/80 [&_a]:hover:text-white [&_span]:text-white justify-center"
          items={[
            { label: "Blog", href: "/blog" },
            { label: title, href: `/blog/${slug}` },
          ]}
        />
      </div>
    </div>
  );
}

export default BlogHero;
