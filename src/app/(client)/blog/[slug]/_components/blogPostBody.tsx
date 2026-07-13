// components/blog/PostBody.tsx

import { PortableText } from "@portabletext/react";
import { createPortableTextComponents } from "./portableTextComponents";
import { PostBodyBlock } from "@/../types/sanityTypes";
import AuthorCard from "./authorCard";
import { PostAuthor } from "@/../types/sanityTypes";
import BlogShareButtons from "./blogShareButtons";

interface PostBodyProps {
  value: PostBodyBlock[];
  postTitle: string;
  author: PostAuthor;
}

export default function BlogPostBody({
  value,
  postTitle,
  author,
}: PostBodyProps) {
  return (
    <article className="bg-white p-6 md:p-10 rounded-xl shadow-sm border border-gray-100">
      {/* Blog Body Text (Tailwind Prose Styling wrapper) */}
      <div className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-xl">
        <PortableText
          value={value}
          components={createPortableTextComponents(postTitle)}
        />
      </div>

      {/* Social Share Buttons */}
      <BlogShareButtons title={postTitle} />

      {/* Author Details */}
      {author && <AuthorCard author={author} />}
    </article>
  );
}
