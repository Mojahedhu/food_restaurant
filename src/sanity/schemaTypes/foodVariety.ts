import { defineField, defineType } from "sanity";

export default defineType({
  name: "foodVariety",
  title: "Food Varieties",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Variety Name",
      type: "string",
      description:
        "e.g., Veg, Non-Veg, Organic, Cold, Fresh, Gluten-Free, Vegan",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),
    defineField({
      name: "Order",
      title: "Display Order",
      type: "number",
      description: "Order in which variety appears (must be unique)",
      validation: (Rule) =>
        Rule.required().custom(async (value, context) => {
          if (value) "Order is required";

          const { document, getClient } = context;
          const client = getClient({ apiVersion: "2023-01-01" });

          // Get current document ID (remove draft prefix if present)
          const currentId = document?._id.replace(/^drafts\./, "");

          // Query to check if another food variety has the same order
          // Exclude both the published and draft versions of the current document

          const query = `*[_type == "foodVariety" && order == $order && !(_id in [$id, $draftId])][0]`;

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
      };
    },
  },
});
