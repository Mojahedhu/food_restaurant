import { defineField, defineType } from "sanity";

export default defineType({
  name: "post",
  title: "Post",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "author" }],
      // validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "mainImage",
      title: "Main image",
      type: "image",
      options: {
        hotspot: true,
      },
      //   fields: [
      //     defineField({
      //       name: "alt",
      //       type: "string",
      //       title: "Alternative text",
      //       description: "Used for accessibility and SEO",
      //       validation: (Rule) => Rule.required(),
      //     }),
      //   ],
      //   validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      of: [{ type: "reference", to: [{ type: "blogCategory" }] }],
    }),
    defineField({
      name: "isFeatured",
      title: "Is Featured",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [
        {
          type: "block",
        },
        {
          type: "image",
          options: { hotspot: true },
        },
        {
          type: "object",
          name: "twoUpImages",
          title: "Two Images (Side by Side)",

          fields: [
            {
              name: "image1",
              title: "First Image",
              type: "image",
              options: { hotspot: true },
            },
            {
              name: "image2",
              title: "Second Image",
              type: "image",
              options: { hotspot: true },
            },
            {
              name: "caption",
              title: "Caption",
              type: "string",
            },
          ],
          preview: {
            select: {
              image1: "image1",
              image2: "image2",
            },
            prepare: ({ image1, image2 }) => {
              return {
                title: "Tow Images",
                media: image1 || image2,
              };
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      author: "author.name",
      media: "mainImage",
      isFeatured: "isFeatured",
    },
    prepare: (selection) => {
      const { author, isFeatured } = selection;
      return {
        ...selection,
        subtitle: `${isFeatured ? "🌟Featured" : ""} ${author ? `by ${author}` : ""}`,
      };
    },
  },
});
