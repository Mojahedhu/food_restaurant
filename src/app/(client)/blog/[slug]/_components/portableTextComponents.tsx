import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import {
  PortableTextImageBlock,
  TwoUpImagesBlock,
} from "@/../types/sanityTypes";
import { PortableTextComponents } from "next-sanity";

export function createPortableTextComponents(
  postTitle: string,
): PortableTextComponents {
  return {
    types: {
      image: ({ value }: { value: PortableTextImageBlock }) => {
        const image = value;

        return (
          <div className="relative w-full aspect-video mb-10 rounded-lg overflow-hidden group">
            <Image
              src={urlFor(image).url()}
              alt={postTitle}
              fill
              sizes="100vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
              loading="eager"
            />
          </div>
        );
      },

      twoUpImages: ({ value }: { value: TwoUpImagesBlock }) => {
        const { image1, image2, caption } = value;
        return (
          <div className="my-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-md group">
                {image1 && (
                  <Image
                    src={urlFor(image1).url()}
                    alt="first image"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                    loading="lazy"
                  />
                )}
              </div>
              <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-md group">
                {image2 && (
                  <Image
                    src={urlFor(image2).url()}
                    alt="second image"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                    loading="eager"
                  />
                )}
              </div>
            </div>

            {caption && <p className="sr-only">{caption}</p>}
          </div>
        );
      },
    },

    block: {
      h1: ({ children }) => (
        <h1 className="text-4xl font-bold mt-10 mb-4">{children}</h1>
      ),

      h2: ({ children }) => (
        <h2 className="text-3xl font-bold mt-8 mb-4">{children}</h2>
      ),

      h3: ({ children }) => (
        <h3 className="text-2xl font-semibold mt-8 mb-3">{children}</h3>
      ),

      h4: ({ children }) => (
        <h4 className="text-xl font-semibold mt-6 mb-2">{children}</h4>
      ),

      blockquote: ({ children }) => (
        <blockquote className="border-l-4 border-primary pl-4 italic my-6 text-muted-foreground">
          {children}
        </blockquote>
      ),

      normal: ({ children }) => (
        <p className="leading-8 text-base text-muted-foreground mb-4">
          {children}
        </p>
      ),
    },

    list: {
      bullet: ({ children }) => (
        <ul className="list-disc pl-6 space-y-2 my-4">{children}</ul>
      ),

      number: ({ children }) => (
        <ol className="list-decimal pl-6 space-y-2 my-4">{children}</ol>
      ),
    },

    listItem: {
      bullet: ({ children }) => <li className="leading-7">{children}</li>,

      number: ({ children }) => <li className="leading-7">{children}</li>,
    },

    marks: {
      link: ({ children, value }) => {
        const href = value?.href;
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-4"
          >
            {children}
          </a>
        );
      },
    },
  };
}
