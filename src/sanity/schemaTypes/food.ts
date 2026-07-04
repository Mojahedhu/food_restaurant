import { defineField, defineType } from "sanity";

export default defineType({
  name: "food",
  title: "Food Items",
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
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "price",
      title: "Price",
      type: "number",
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "varieties",
      title: "Food Varieties",
      type: "array",
      of: [{ type: "reference", to: [{ type: "foodVariety" }] }],
      description: "e.g., Veg, Organic, Gluten-Free",
    }),
    defineField({
      name: "enableAllSizes",
      title: "Enable All Sizes",
      type: "boolean",
      description: "If enabled, all sizes will be enabled for this food item.",
      initialValue: false,
    }),
    defineField({
      name: "sizes",
      title: "Available Sizes",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "size",
              title: "Size",
              type: "reference",
              to: [{ type: "size" }],
              validation: (Rule) => Rule.required(),
            },
          ],
          preview: {
            select: {
              sizeName: "size.name",
              serveSize: "serveSize.name",
            },
            prepare({ sizeName, serveSize }) {
              return {
                title: `${sizeName}${serveSize ? ` (Serves: ${serveSize})` : ""}`,
                subtitle: serveSize
                  ? `Price will be base price x ${serveSize}`
                  : "",
              };
            },
          },
        },
      ],
      description:
        'Price for each size will be calculated as: Base Price × Serve Size. Note: If "Enable All Sizes" is true, this field will be ignored.',
      hidden: ({ document }) => document?.enableAllSizes === true,
    }),
    defineField({
      name: "images",
      title: "Product Images",
      type: "array",
      of: [
        {
          type: "image",
          options: {
            hotspot: true, // Enables visual cropping in Sanity Studio
          },
        },
      ],
      description:
        "Upload up to 6 images. The first image in the grid will be used as the primary cover image.",
      validation: (Rule) =>
        Rule.required()
          .min(1)
          .max(6)
          .error("A product must have between 1 and 6 images."),
    }),
    defineField({
      name: "ingredients",
      title: "Ingredients",
      type: "array",
      of: [{ type: "reference", to: [{ type: "ingredient" }] }],
      description: "Link ingredients to this food item",
    }),
    defineField({
      name: "preparationTime",
      title: "Preparation Time (minutes)",
      type: "number",
    }),
    defineField({
      name: "spiceLevel",
      title: "Spice Level",
      type: "string",
      options: {
        list: [
          { title: "Mild", value: "mild" },
          { title: "Medium", value: "medium" },
          { title: "Hot", value: "hot" },
          { title: "Extra Hot", value: "extra-Hot" },
        ],
      },
    }),
    defineField({
      name: "available",
      title: "Available",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "featured",
      title: "Featured Item",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "ratingCount",
      type: "number",
      initialValue: 0,
      validation: (Rule) => Rule.required().min(0),
    }),

    defineField({
      name: "ratingSum",
      type: "number",
      initialValue: 0,
      validation: (Rule) => Rule.required().min(0),
    }),

    defineField({
      name: "weightedRating",
      type: "number",
      initialValue: 0,
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "ratingAverage",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description:
        "Order in which the food item will be displayed (must be unique)",
      initialValue: 0,
      validation: (Rule) =>
        Rule.required().custom(async (value, context) => {
          if (!value) return "Order is required";

          const { document, getClient } = context;
          const client = getClient({ apiVersion: "2023-01-01" });
          // Get current document ID (remove draft prefix if present)
          const currentId = document?._id.replace(/^drafts\./, "");

          // Query to check if another food item has the same order
          // Exclude both the published and draft versions of the current document

          const query = `*[_type == "food" && order == $order && !(_id in [$id, $draftId])][0]`;
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
      subtitle: "category.name",
      images: "images",
    },
    prepare: (selection) => {
      const { title, subtitle, images } = selection;
      return {
        title,
        subtitle,
        media: images && images.length > 0 ? images[0] : undefined,
      };
    },
  },
});
