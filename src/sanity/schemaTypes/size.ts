import { CaseIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "size",
  title: "Sizes",
  type: "document",
  icon: CaseIcon,
  fields: [
    defineField({
      name: "name",
      title: "Size Name",
      type: "string",
      description: "e.g., Small, Medium, Large, Extra Large",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "code",
      title: "Code Size",
      type: "string",
      description: "e.g., S, M, L, XL",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),
    defineField({
      name: "serveSize",
      title: "Serve Size",
      type: "number",
      description: "Number of people this size can serve",
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Order in which size appears (must be unique)",
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "code",
      order: "order",
    },
    prepare: (selection) => {
      const { title, subtitle, order } = selection;
      return {
        title: `${order ? `[${order}] ` : ""}${title}`,
        subtitle: subtitle,
        media: CaseIcon,
      };
    },
  },
});
