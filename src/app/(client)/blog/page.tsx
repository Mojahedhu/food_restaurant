import { Breadcrumb } from "@/components/common/breadcrumb";
import BlogCard from "@/components/featuredPost/blogCard";
import { getAllPosts } from "@/lib/sanityFunctions";
import BlogPageSkeleton from "./loading";

async function BlogPage() {
  const blog = await getAllPosts();

  if (!blog) {
    return <BlogPageSkeleton />;
  }

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {blog.map((post) => (
          <BlogCard key={post._id} post={post} />
        ))}
      </div>
    </div>
  );
}

export default BlogPage;
