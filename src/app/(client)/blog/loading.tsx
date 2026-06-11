import { BreadcrumbSkeleton } from "../restaurants/_components/breadcrumbSkeleton";
import { BlogGridSkeleton } from "./_components/blogGridSkeleton";
import { BlogHeaderSkeleton } from "./_components/blogHeader";

export default function BlogPageSkeleton() {
  return (
    <div className="container mx-auto px-4 pb-8">
      <BreadcrumbSkeleton />

      <BlogHeaderSkeleton />

      <BlogGridSkeleton count={8} />
    </div>
  );
}
