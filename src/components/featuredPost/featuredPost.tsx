import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import { Button } from "../ui/button";
import Link from "next/link";
import { Post } from "../../../sanity.types";
import BlogCard from "./blogCard";

const FeaturedPost = async () => {
  const query = groq`*[_type == "post" && isFeatured == true] 
  | order(publishedAt desc) [0...4] {
  _id,
  title,
  slug,
  mainImage,
  publishedAt,
  author->{name, image},
  categories[]->{title, slug}
}`;

  const post: Post[] = await client.fetch(query);

  if (!post || post.length === 0) {
    return null;
  }

  return (
    <section className="py-12 lg:py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Featured Posts</h2>
          <p className="text-muted-foreground mt-2">
            Check out our latest blog posts and news
          </p>
        </div>

        <Button variant="outline" asChild>
          <Link href="/blog">View All Posts</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {post.map((post) => (
          <BlogCard key={post._id} post={post} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedPost;
