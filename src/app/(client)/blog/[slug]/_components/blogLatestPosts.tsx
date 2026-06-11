import { getLatestPosts } from "@/lib/sanityFunctions";
import BlogLatestPostCard from "./blogLatestPostCard";

async function BlogLatestPosts() {
  const posts = await getLatestPosts();
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="font-bold text-lg mb-6 border-l-4 border-primary pl-3">
        Latest Posts
      </h3>
      <div className="space-y-6">
        {posts.map((post) => (
          <BlogLatestPostCard key={post._id} post={post} />
        ))}
      </div>
    </div>
  );
}

export default BlogLatestPosts;
