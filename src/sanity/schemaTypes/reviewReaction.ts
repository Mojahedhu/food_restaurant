import { CommentIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "reviewReaction",
  title: "Review Reactions",
  type: "document",
  icon: CommentIcon,
  fields: [
    defineField({
      name: "review",
      title: "Review",
      type: "reference",
      to: [{ type: "review" }],
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
      name: "type",
      title: "Reaction Type",
      type: "string",
      options: {
        list: [
          { title: "Like", value: "like" },
          { title: "Dislike", value: "dislike" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "createdAt",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],

  preview: {
    select: {
      userName: "user.name",
      reviewText: "review.comment",
      reactionType: "type",
    },
    prepare: ({ userName, reviewText, reactionType }) => {
      return {
        title: `${reactionType === "like" ? "👍" : "👎"} ${userName || "Unknown user"}`,
        description: reviewText
          ? reviewText?.slice(0, 50) + (reviewText.length > 60 ? "..." : "")
          : "No review text",
      };
    },
  },

  // ⚠️ enforce uniqueness at query level (important)
});
