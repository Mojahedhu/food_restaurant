import { defineField, defineType } from "sanity";

export default defineType({
  name: "banner",
  title: "Banners",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "bannerImage",
      title: "Banner Image",
      type: "image",
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "buttonTitle",
      title: "Button Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "buttonHref",
      title: "Button Link",
      type: "string",
      description: "URL or path for the button (e.g., /menu, /category/pizza)",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "active",
      title: "Active",
      type: "boolean",
      description: "Toggle to show/hide this banner",
      initialValue: true,
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Order in which the banner should appear",
      validation: (Rule) => Rule.required().min(0),
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "description",
      media: "bannerImage",
      active: "active",
    },
    prepare(selection) {
      const { title, subtitle, active, media } = selection;

      return {
        title: `${title}${active ? "" : "(Inactive)"}`,
        subtitle,
        media,
      };
    },
  },
});
