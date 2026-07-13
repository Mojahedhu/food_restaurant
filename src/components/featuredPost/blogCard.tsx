import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { Badge } from "../ui/badge";
import { ArrowRight, CalendarIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { PostCard } from "../../../types/sanityTypes";

const BlogCard = ({
  post,
  props,
}: {
  post: PostCard;
  props?: React.ComponentProps<"div">;
}) => {
  return (
    <Card
      {...props}
      className="overflow-hidden flex flex-col h-full hover:shadow-lg hover-effect py-0"
    >
      <div className="relative h-48 w-full">
        {post.mainImage ? (
          <Image
            src={urlFor(post.mainImage).url()}
            alt={"Post Image"}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover transition-transform duration-300 hover:scale-110"
            loading="eager"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-muted">
            No Image
          </div>
        )}
        {/* Categories Overlay */}
        {post.categories && post.categories.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
            {post.categories.slice(0, 2).map((cat, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="bg-white/90 hover:bg-white text-xs font-bold shadow-sm backdrop-blur-sm"
              >
                {cat.title}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center text-xs text-muted-foreground mb-2">
          <CalendarIcon className="mr-1 h-3 w-3" />
          {new Date(post.publishedAt!).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>

        <h3 className="text-xl font-semibold leading-tight line-clamp-2 hover:text-primary">
          <Link href={`/blog/${post.slug?.current}`}>{post.title}</Link>
        </h3>
      </CardHeader>
      <CardContent className="p-4 pt-0 grow py-0">
        {post.author && (
          <div className="flex items-center gap-2">
            {post.author.image ? (
              <div className="relative w-6 h-6 rounded-full overflow-hidden">
                <Image
                  src={urlFor(post.author.image).url()}
                  alt={"Author Image"}
                  fill
                  sizes="24px"
                  className="object-cover"
                />
              </div>
            ) : null}
            <p className="text-sm text-muted-foreground">
              By{" "}
              <span className="font-medium text-foreground">
                {post.author.name}
              </span>
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-0 pb-2">
        <Button
          asChild
          variant="link"
          className="px-0 text-primary font-bold group hover:no-underline"
        >
          <Link
            href={`/blog/${post.slug?.current}`}
            className="flex items-center gap-2 px-3 py-2"
          >
            Read More
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BlogCard;
