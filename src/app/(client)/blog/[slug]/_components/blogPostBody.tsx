// components/blog/PostBody.tsx

import { PortableText } from "@portabletext/react";
import { createPortableTextComponents } from "./portableTextComponents";
import { PostBodyBlock } from "../../../../../../types/sanityTypes";
import AuthorCard from "./authorCard";
import { PostAuthor } from "../../../../../../types/sanityTypes";

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
      <PortableText
        value={value}
        components={createPortableTextComponents(postTitle)}
      />
      <AuthorCard author={author} />
    </article>
  );
}
