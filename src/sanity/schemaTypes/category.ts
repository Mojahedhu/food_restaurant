import { defineField, defineType, validation } from "sanity";

export default defineType({
  name: "category",
  title: "Categories",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),
    defineField({
      name: "image",
      title: "Category Image",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Order in which category appears (must be unique)",
      validation: (Rule) =>
        Rule.required().custom(async (value, context) => {
          if (!value) return "Order is required";
          const { document, getClient } = context;
          const client = getClient({ apiVersion: "2023-01-01" });
          // Get the current document ID (remove draft prefix if present)
          const currentId = document?._id?.replace(/^drafts\./, "");

          // Query to check if another category has the same order
          // Exclude both the published and draft versions of the current document
          const query = `*[_type == "category" && order == $order && !( _id in [$id, $draftId] )][0]`;
          const params = {
            order: value,
            id: currentId,
            draftId: `drafts.${currentId}`,
          };
          const existingDoc = await client.fetch(query, params);
          if (existingDoc) {
            return `Order ${value} is already assigned to "${existingDoc.name}"`;
          }

          return true;
        }),
    }),
    defineField({
      name: "isActive",
      title: "Is Active",
      type: "boolean",
      description: "Toggle to activate/deactivate this category",
      initialValue: true,
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "name",
      media: "image",
      order: "order",
      isActive: "isActive",
    },
    prepare(selection) {
      const { title, order, isActive, media } = selection;

      return {
        title: `${order ? `[${order}] ` : ""}${title}`,
        isActive: isActive === true ? "Active" : " ",
        media,
      };
    },
  },
});
