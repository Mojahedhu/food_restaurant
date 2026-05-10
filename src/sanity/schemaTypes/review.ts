import { CommentIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "review",
  title: "Reviews",
  type: "document",
  icon: CommentIcon,
  fields: [
    defineField({
      name: "food",
      title: "Food Item",
      type: "reference",
      to: [{ type: "food" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "user",
      title: "User",
      type: "reference",
      to: [{ type: "user" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "rating",
      title: "Rating",
      type: "number",
      validation: (Rule) => Rule.required().min(1).max(5).integer(),
    }),
    defineField({
      name: "approved",
      title: "Approved",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "comment",
      title: "Comment",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required().min(10).max(1000),
    }),
    // ✅ denormalized counters (fast reads)
    defineField({
      name: "likesCount",
      title: "Likes Count",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "dislikesCount",
      title: "Dislikes Count",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      userName: "user.name",
      foodName: "food.name",
      rating: "rating",
      comment: "comment",
      approved: "approved",
      createdAt: "createdAt",
    },
    prepare: ({ userName, foodName, rating, comment, approved, createdAt }) => {
      const approvedMark = approved ? "💹" : "⌛";

      return {
        title: `${approvedMark} ${userName || "Unknown user"} - ${rating}/5 🌟`,
        description:
          comment?.slice(0, 50) +
          (comment.length > 60 ? "..." : "") +
          ` • ${new Date(createdAt).toLocaleDateString()}`,
      };
    },
  },
  orderings: [
    {
      title: "Created Date (Newest First)",
      name: "createdDesc",
      by: [{ field: "createdAt", direction: "desc" }],
    },
    {
      title: "Rating (Highest First)",
      name: "ratingDesc",
      by: [{ field: "rating", direction: "desc" }],
    },
  ],
});
