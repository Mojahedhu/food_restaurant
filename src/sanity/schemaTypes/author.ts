import { UserIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "author",
  title: "Author",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      name: "user",
      title: "User",
      description: "Select a system user to associate with this author profile",
      type: "reference",
      to: [{ type: "user" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description: "Override the user's name for display (optional).",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      description: "Override the user's profile image (optional).",
    }),
    defineField({
      name: "bio",
      title: "Bio",
      type: "text",
      description: "Short biography of the author",
    }),
  ],
  preview: {
    select: {
      title: "name",
      userTitle: "user.email",
      media: "image",
      userMedia: "user.image",
    },
    prepare: ({ title, userTitle, media, userMedia }) => {
      return {
        title: title || userTitle || "Unnamed Author",
        subtitle: title ? `Linked to: ${userTitle}` : "Using User Name",
        media: media || userMedia,
      };
    },
  },
});
