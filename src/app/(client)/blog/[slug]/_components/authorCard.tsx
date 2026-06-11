import { Facebook, Instagram, Twitter, UserCircle } from "lucide-react";
import { PostAuthor } from "../../../../../../types/sanityTypes";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";

interface AuthorCardProps {
  author: PostAuthor;
}

function AuthorCard({ author }: AuthorCardProps) {
  return (
    <div className="mt-16 p-8 bg-gray-50 rounded-xl border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
      {/* left Author avatar */}
      <div className="relative w-24 h-24 rounded-full overflow-hidden shrink-0 border-4 border-white shadow-sm">
        {author?.image ? (
          <Image
            src={urlFor(author.image).url()}
            alt={author.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
            className="object-cover"
          />
        ) : (
          <UserCircle className="w-full h-full text-muted-foreground" />
        )}
      </div>
      {/* right side info */}
      <div>
        <h3 className="text-xl font-bold mb-2">About {author?.name}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed mb-4">
          {author.bio}
        </p>
        <div className="flex gap-4 justify-center md:justify-start">
          <a
            href="#"
            className="text-gray-400 hover:text-primary transition-colors"
          >
            <Facebook className="h-5 w-5" />
          </a>
          <a
            href="#"
            className="text-gray-400 hover:text-primary transition-colors"
          >
            <Twitter className="h-5 w-5" />
          </a>
          <a
            href="#"
            className="text-gray-400 hover:text-primary transition-colors"
          >
            <Instagram className="h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default AuthorCard;
