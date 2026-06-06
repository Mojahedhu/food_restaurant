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
      name: "food",
      title: "Food",
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

    /**
     * =========================================================
     * Optimistic mutation tracking
     * =========================================================
     */

    defineField({
      name: "mutationId",
      title: "Mutation ID",
      type: "string",
      readOnly: true,
      validation: (Rule) => Rule.required(),
    }),
  ],

  preview: {
    select: {
      userName: "user.name",
      reviewText: "review.comment",
      reactionType: "type",
      foodName: "food.name",
    },
    prepare: ({ userName, reviewText, reactionType, foodName }) => {
      return {
        title: `${reactionType === "like" ? "👍" : "👎"} ${userName || "Unknown user"}`,
        description: [
          foodName,
          reviewText
            ? reviewText?.slice(0, 50) + (reviewText.length > 60 ? "..." : "")
            : "No review text",
        ]
          .filter(Boolean)
          .join(" • "),
      };
    },
  },

  // ⚠️ enforce uniqueness at query level (important), after deterministic id no need for uniqueness at query level
});
