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
    defineField({
      name: "adminReply",
      title: "Admin Reply",
      type: "text",
      rows: 3,
      description: "Official response from the restaurant administration.",
      validation: (Rule) => Rule.max(1000),
    }),
  ],
  preview: {
    select: {
      userName: "user.name",
      foodName: "food.name",
      rating: "rating",
      comment: "comment",
      approved: "approved",
      createdAt: "_createdAt",
    },
    prepare: ({ userName, foodName, rating, comment, approved, createdAt }) => {
      const approvedMark = approved ? "💹" : "⌛";
      const shortComment = comment
        ? comment.slice(0, 50) + (comment.length > 60 ? "..." : "")
        : "No comment";

      const formattedDate = createdAt
        ? new Date(createdAt).toLocaleDateString()
        : "Unknown date";

      return {
        title: `${approvedMark} ${userName || "Unknown user"} - ${rating}/5 🌟`,
        description: [foodName, `${shortComment} • ${formattedDate}`]
          .filter(Boolean)
          .join(" • "),
      };
    },
  },
  orderings: [
    {
      title: "Created Date (Newest First)",
      name: "createdDesc",
      by: [{ field: "_createdAt", direction: "desc" }],
    },
    {
      title: "Rating (Highest First)",
      name: "ratingDesc",
      by: [{ field: "rating", direction: "desc" }],
    },
    {
      title: "Most Liked",
      name: "likesDesc",
      by: [{ field: "likesCount", direction: "desc" }],
    },
  ],
});
