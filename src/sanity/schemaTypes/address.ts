import { HomeIcon } from "lucide-react";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "address",
  title: "Address",
  type: "document",
  icon: HomeIcon,
  fields: [
    defineField({
      name: "user",
      title: "User",
      type: "reference",
      to: [{ type: "user" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "type",
      title: "Address Type",
      type: "string",
      options: {
        list: [
          { title: "Home", value: "home" },
          { title: "Work", value: "work" },
          { title: "Other", value: "other" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description: "Label for the address",
    }),
    defineField({
      name: "street",
      title: "Street Address",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "apartment",
      title: "Apartment/Suite",
      type: "string",
    }),
    defineField({
      name: "city",
      title: "City",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "state",
      title: "State",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "zipCode",
      title: "Zip Code",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "country",
      title: "Country",
      type: "string",
      initialValue: "United States",
    }),
    defineField({
      name: "phone",
      title: "Phone Number",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "instructions",
      title: "Delivery Instructions",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "isDefault",
      title: "Default Address",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      street: "street",
      city: "city",
      state: "state",
      type: "type",
      isDefault: "isDefault",
    },
    prepare: ({ street, city, state, type, isDefault }) => ({
      title: `${street}`,
      subtitle: `${city}, ${state}${isDefault ? " (Default)" : ""}`,
      description: type,
    }),
  },
});
