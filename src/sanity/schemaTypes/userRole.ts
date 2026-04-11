import { ControlsIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "userRole",
  title: "User Role",
  type: "document",
  icon: ControlsIcon,
  fields: [
    defineField({
      name: "name",
      title: "Role Name",
      type: "string",
      validation: (Rule) => Rule.required(),
      description: "The name of the role (e.g., Admin, User, Delivery Boy)",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 50,
      },
      validation: (Rule) => Rule.required(),
      description:
        "The unique identifier for the role (e.g., admin, user, delivery_boy)",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      description: "Description of what this role can do",
    }),
    defineField({
      name: "isActive",
      title: "Is Active",
      type: "boolean",
      initialValue: true,
      description: "Whether this role can be assigned to users",
    }),
    defineField({
      name: "priority",
      title: "Priority Level",
      type: "number",
      validation: (Rule) => Rule.required().min(0).max(100),
      initialValue: 10,
      description: "Priority of the role (higher number = higher priority)",
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      readOnly: true,
      initialValue: () => new Date().toISOString(),
      description: "Timestamp when the role was created",
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "description",
      isActive: "isActive",
      priority: "priority",
    },
    prepare: ({ title, subtitle, isActive, priority }) => {
      return {
        title: `${title}${!isActive ? " (Inactive)" : ""}`,
        subtitle: `Priority: ${priority} - ${subtitle || "No description"}`,
      };
    },
  },
});
