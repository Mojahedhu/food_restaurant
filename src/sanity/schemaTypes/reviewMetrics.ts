import { defineField, defineType } from "sanity";

export default defineType({
  title: "Review Metrics",
  name: "reviewMetrics",
  type: "document",

  fields: [
    defineField({
      name: "review",
      type: "reference",
      to: [{ type: "review" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "food",
      type: "reference",
      to: [{ type: "food" }],
      validation: (Rule) => Rule.required(),
    }),

    /**
     * =========================================================
     * Authoritative aggregate counters
     * =========================================================
     */

    // ✅ denormalized counters (fast reads)
    defineField({
      name: "likesCount",
      title: "Likes Count",
      type: "number",
      initialValue: 0,
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: "dislikesCount",
      title: "Dislikes Count",
      type: "number",
      initialValue: 0,
      validation: (rule) => rule.min(0),
    }),
  ],

  preview: {
    select: {
      foodImage: "review.food.images",
      foodName: "review.food.name",
      likesCount: "likesCount",
      dislikesCount: "dislikesCount",
    },
    prepare: ({ foodImage, foodName, likesCount, dislikesCount }) => {
      return {
        title: `${foodName ?? "Unknown Food"} Metrics`,
        subtitle: `👍 ${likesCount ?? 0} • 👎 ${dislikesCount ?? 0}`,
        media: foodImage[0],
      };
    },
  },
});
