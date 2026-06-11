import { getPostDetailsBySlug } from "@/lib/sanityFunctions";
import BlogPostBody from "./_components/blogPostBody";
import BlogHero from "./_components/blogHero";
import BlogSearchBox from "./_components/blogSearchBox";
import BlogLatestPosts from "./_components/blogLatestPosts";
import BlogNewsletter from "./_components/blogNews";

import BlogDetailsSkeletonPage from "./loading";

interface BlogDetailsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogDetailsPage({
  params,
}: BlogDetailsPageProps) {
  const { slug } = await params;
  const blog = await getPostDetailsBySlug(slug);
  const { title, author, publishedAt } = blog;

  if (!blog) {
    return <BlogDetailsSkeletonPage />;
  }
  return (
    <div className="bg-gray-50/50 min-h-screen">
      <BlogHero
        title={title ?? ""}
        authorName={author?.name ?? ""}
        publishedAt={publishedAt || ""}
        slug={slug}
      />
      <div className="mx-auto px-4 pb-12 lg:pb-16 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            <BlogPostBody
              value={blog.body ?? []}
              postTitle={blog.title ?? ""}
              author={author!}
            />
          </div>
          <div className="lg:col-span-4 space-y-8">
            <BlogSearchBox />
            <BlogLatestPosts />
            <BlogNewsletter />
          </div>
        </div>
      </div>
    </div>
  );
}
