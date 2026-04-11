import { LemonIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "ingredient",
  title: "Ingredient",
  type: "document",
  icon: LemonIcon,
  fields: [
    defineField({
      name: "name",
      title: "Ingredient Name",
      type: "string",
      description: "e.g., Tomato, Cheese, Chicken, Basil",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Descriptions",
      type: "text",
      description: "Additional details about the ingredient",
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Order in which ingredient appears (must be unique)",
      validation: (Rule) =>
        Rule.required().custom(async (value, context) => {
          if (!value) return "Order is required";

          const { document, getClient } = context;
          const client = getClient({ apiVersion: "2023-01-01" });

          // Get current document ID (remove draft prefix if present)
          const currentId = document?._id.replace(/^drafts\./, "");

          // Query to check if another ingredient has the same order
          // Exclude both the published and draft versions of the current document

          const query = `*[_type == "ingredient" && order == $order && !(_id in [$id, $draftId])][0]`;

          const params = {
            order: value,
            id: currentId,
            draftId: `drafts.${currentId}`,
          };

          const existingDoc = await client.fetch(query, params);

          if (existingDoc) {
            return `Order ${value} is already assigned to ${existingDoc.name}`;
          }
          return true;
        }),
    }),
  ],
  preview: {
    select: {
      title: "name",
      order: "order",
    },
    prepare(selection) {
      const { title, order } = selection;
      return {
        title: `${order ? `[${order}] ` : ""}${title}`,
        media: LemonIcon,
      };
    },
  },
});
