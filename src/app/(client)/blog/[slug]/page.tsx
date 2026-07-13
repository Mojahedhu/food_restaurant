import { getPostDetailsBySlug } from "@/lib/sanityFunctions";
import BlogPostBody from "./_components/blogPostBody";
import BlogHero from "./_components/blogHero";
import BlogSearchBox from "./_components/blogSearchBox";
import BlogLatestPosts from "./_components/blogLatestPosts";
import BlogNewsletter from "./_components/blogNews";

import { notFound } from "next/navigation";
import { Metadata } from "next";
import { urlFor } from "@/sanity/lib/image";

interface BlogDetailsPageProps {
  params: Promise<{ slug: string }>;
}

// 1. Dynamic SEO Metadata Generation
export async function generateMetadata({
  params,
}: BlogDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;

  // Next.js automatically dedupes this fetch with the one in the component body
  const blog = await getPostDetailsBySlug(slug);
  if (!blog) {
    return { title: "Post Not Found" };
  }
  const imageUrl = blog.mainImage
    ? urlFor(blog.mainImage).width(1200).height(630).url()
    : undefined;
  return {
    title: blog.title,
    description: "Read our latest article on Quick Food.",
    openGraph: {
      title: blog.title,
      type: "article",
      publishedTime: blog.publishedAt,
      authors: [blog.author?.name || "Quick Food Team"],
      images: imageUrl
        ? [{ url: imageUrl, width: 1200, height: 630, alt: blog.title }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function BlogDetailsPage({
  params,
}: BlogDetailsPageProps) {
  const { slug } = await params;

  // 2. Idiomatic Next.js 404 Handling (Do not return skeleton on error)
  const blog = await getPostDetailsBySlug(slug);

  if (!blog) {
    return notFound();
  }

  const { title, author, publishedAt } = blog;

  return (
    <div className="bg-gray-50/50 min-h-screen">
      <BlogHero
        title={title ?? ""}
        authorName={author?.name ?? "Unknown Author"}
        publishedAt={publishedAt || new Date().toISOString()}
        slug={slug}
        mainImage={blog.mainImage}
      />
      <div className="mx-auto px-4 pb-12 lg:pb-16 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Article Content */}
          <main className="lg:col-span-8">
            <BlogPostBody
              value={blog.body ?? []}
              postTitle={blog.title ?? ""}
              author={author!}
            />
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            <BlogSearchBox />
            <BlogLatestPosts />
            <BlogNewsletter />
          </aside>
        </div>
      </div>
    </div>
  );
}
