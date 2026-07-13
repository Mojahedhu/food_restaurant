import React from "react";
import BlogHeroSkeleton from "./_components/skeleton/blogHeroSkeleton";
import BlogPostBodySkeleton from "./_components/skeleton/blogPostBodySkeleton";
import BlogSearchSkeleton from "./_components/skeleton/blogSearchSkeleton";
import BlogNewsletterSkeleton from "./_components/skeleton/blogNewsSkeleton";
import BlogLatestPostsSkeleton from "./_components/skeleton/blogLatestPostsSkeleton";

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
