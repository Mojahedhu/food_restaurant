import Link from "next/link";
import { LatestPost } from "../../../../../../types/sanityTypes";
import Image from "next/image";
import { Utensils } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";

interface BlogLatestPostCardProps {
  post: LatestPost;
}
function BlogLatestPostCard({ post }: BlogLatestPostCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex gap-4 items-start"
      key={post._id}
    >
      <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
        {post.mainImage ? (
          <Image
            src={urlFor(post.mainImage).url()}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <Utensils className="w-full h-full text-primary" />
        )}
      </div>
      <div>
        <h4 className="font-medium text-gray-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-2">
          {post.title}
        </h4>
        <div className="text-xs text-muted-foreground">
          {new Date(post.publishedAt).toLocaleDateString()}
        </div>
      </div>
    </Link>
  );
}

export default BlogLatestPostCard;
