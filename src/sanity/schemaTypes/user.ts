import { UserIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "user",
  title: "Users",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "password",
      title: "Password Hash",
      type: "string",
      description: "Hashed password for email/password authentication",
      hidden: true,
    }),
    defineField({
      name: "image",
      title: "Profile Image",
      type: "object",
      fields: [
        defineField({
          name: "source",
          title: "Image Source",
          type: "string",
          options: {
            list: [
              { title: "Upload", value: "asset" },
              { title: "External URL", value: "url" },
            ],
            layout: "radio",
          },
          initialValue: "url",
        }),

        defineField({
          name: "asset",
          title: "Uploaded Image",
          type: "image",
          hidden: ({ parent }) => parent?.source !== "asset",
          options: {
            hotspot: true,
          },
        }),

        defineField({
          name: "url",
          title: "Image URL",
          type: "url",
          hidden: ({ parent }) => parent?.source !== "url",
        }),
      ],
    }),
    defineField({
      name: "emailVerified",
      title: "Email Verified",
      type: "datetime",
      description: "Timestamp when the user's email was verified",
    }),
    defineField({
      name: "phoneNumber",
      title: "Phone Number",
      type: "string",
      validation: (Rule) =>
        Rule.regex(/^\+?[0-9]{10,}$/, {
          name: "phoneNumber",
        }),
    }),
    defineField({
      name: "bio",
      title: "Bio",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.max(200),
      description: "description about the user",
    }),
    defineField({
      name: "provider",
      title: "Auth Provider",
      type: "string",
      options: {
        list: [
          { title: "Credentials", value: "credentials" },
          { title: "Google", value: "google" },
        ],
      },
      initialValue: "credentials",
    }),
    defineField({
      name: "role",
      title: "User Role",
      type: "reference",
      to: [{ type: "userRole" }],
      description:
        "The role of the user in the application (default to 'User' role)",
      options: {
        filter: `_type == "userRole" && isActive == true`,
      },
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      readOnly: true,
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "walletBalance",
      title: "Wallet Balance",
      type: "number",
      description: "User's wallet credit from refunds and credits",
      initialValue: 0,
      validation: (Rule) => Rule.min(0),
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "email",
      media: "image",
      roleName: "role.name",
    },
    prepare: ({ title, subtitle, roleName }) => {
      return {
        title: `${title}${roleName ? ` (${roleName})` : ""}`,
        subtitle,
      };
    },
  },
});
