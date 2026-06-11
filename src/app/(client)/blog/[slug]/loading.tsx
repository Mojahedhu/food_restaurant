import React from "react";
import BlogHeroSkeleton from "./_components/blogHeroSkeleton";
import BlogPostBodySkeleton from "./_components/blogPostBodySkeleton";
import BlogSearchSkeleton from "./_components/blogSearchSkeleton";
import BlogNewsletterSkeleton from "./_components/blogNewsSkeleton";
import BlogLatestPostsSkeleton from "./_components/blogLatestPostsSkeleton";

function BlogDetailsSkeletonPage() {
  return (
    <div className="bg-gray-50/50 min-h-screen">
      <BlogHeroSkeleton />
      <div className="mx-auto px-4 pb-12 lg:pb-16 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            <BlogPostBodySkeleton />
          </div>
          <div className="lg:col-span-4 space-y-8">
            <BlogSearchSkeleton />
            <BlogLatestPostsSkeleton />
            <BlogNewsletterSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlogDetailsSkeletonPage;
