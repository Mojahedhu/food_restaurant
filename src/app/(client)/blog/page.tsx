import { Breadcrumb } from "@/components/common/breadcrumb";
import { fetchBlogPosts } from "@/lib/data/blog";
import BlogClient from "./blog-client";

interface BlogPageProps {
  searchParams: Promise<{
    search?: string;
  }>;
}

async function BlogPage(props: BlogPageProps) {
  const searchParams = await props.searchParams;
  const search = searchParams.search || "";

  // Outer Effect Read directly from the Server!
  const { posts, totalCount } = await fetchBlogPosts(1, search);

  return (
    <div className="container mx-auto px-4 pb-8">
      <Breadcrumb
        className="mb-8 bg-transparent"
        items={[{ label: "Blog", href: "/blog" }]}
      />
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Our Blog</h1>
        <p className="text-muted-foreground text-lg">
          Latest news, updates, and stories from Quick Food.
        </p>
      </div>

      {/* Mount the interactive Client shell */}
      <BlogClient initialPosts={posts} initialTotal={totalCount} />
    </div>
  );
}

export default BlogPage;
