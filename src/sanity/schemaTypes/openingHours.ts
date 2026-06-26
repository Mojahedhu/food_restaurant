import { defineField, defineType } from "sanity";

export default defineType({
  name: "openingHours",
  title: "Opening Hours",
  type: "document",
  initialValue: () => ({
    name: "Standard Hours",
    schedule: [
      { day: "monday", openTime: "10:00", closeTime: "23:00", isClosed: false },
      {
        day: "tuesday",
        openTime: "10:00",
        closeTime: "23:00",
        isClosed: false,
      },
      {
        day: "wednesday",
        openTime: "10:00",
        closeTime: "23:00",
        isClosed: false,
      },
      {
        day: "thursday",
        openTime: "10:00",
        closeTime: "23:00",
        isClosed: false,
      },
      { day: "friday", openTime: "10:00", closeTime: "23:00", isClosed: false },
      {
        day: "saturday",
        openTime: "10:00",
        closeTime: "23:00",
        isClosed: false,
      },
      { day: "sunday", openTime: "10:00", closeTime: "23:00", isClosed: false },
    ],
  }),
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description: "e.g., 'Standard Hours', 'Weekend Hours', 'Holiday Hours'",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "schedule",
      title: "Schedule",
      type: "array",
      initialValue: [
        {
          day: "monday",
          openTime: "10:00",
          closeTime: "23:00",
          isClosed: false,
        },
        {
          day: "tuesday",
          openTime: "10:00",
          closeTime: "23:00",
          isClosed: false,
        },
        {
          day: "wednesday",
          openTime: "10:00",
          closeTime: "23:00",
          isClosed: false,
        },
        {
          day: "thursday",
          openTime: "10:00",
          closeTime: "23:00",
          isClosed: false,
        },
        {
          day: "friday",
          openTime: "10:00",
          closeTime: "23:00",
          isClosed: false,
        },
        {
          day: "saturday",
          openTime: "10:00",
          closeTime: "23:00",
          isClosed: false,
        },
        {
          day: "sunday",
          openTime: "10:00",
          closeTime: "23:00",
          isClosed: false,
        },
      ],
      of: [
        {
          type: "object",
          fields: [
            {
              name: "day",
              title: "Day",
              type: "string",
              options: {
                list: [
                  { title: "Monday", value: "monday" },
                  { title: "Tuesday", value: "tuesday" },
                  { title: "Wednesday", value: "wednesday" },
                  { title: "Thursday", value: "thursday" },
                  { title: "Friday", value: "friday" },
                  { title: "Saturday", value: "saturday" },
                  { title: "Sunday", value: "sunday" },
                ],
              },
              validation: (Rule) => Rule.required(),
            },
            {
              name: "openTime",
              title: "Opening Time",
              type: "string",
              description: "Format HH:MM (24-hour format)",
              validation: (Rule) =>
                Rule.required().regex(/^([0-1]\d|2[0-3]):[0-5]\d$/, {
                  name: "24-hour time format (HH:MM)",
                  invert: false,
                }),
            },
            {
              name: "closeTime",
              title: "Closing Time",
              type: "string",
              description: "Format HH:MM (24-hour format)",
              validation: (Rule) =>
                Rule.required().regex(/^([0-1]\d|2[0-3]):[0-5]\d$/, {
                  name: "24-hour time format (HH:MM)",
                  invert: false,
                }),
            },
            {
              name: "isClosed",
              title: "Closed",
              type: "boolean",
              initialValue: false,
              description: "Is the restaurant closed on this day",
            },
          ],
          preview: {
            select: {
              day: "day",
              openTime: "openTime",
              closeTime: "closeTime",
              isClosed: "isClosed",
            },
            prepare: ({ day, openTime, closeTime, isClosed }) => {
              return {
                title: day.charAt(0).toUpperCase() + day.slice(1),
                subtitle: isClosed ? "Closed" : `${openTime} - ${closeTime}`,
              };
            },
          },
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",

      description: "Optional description for this schedule",
    }),
  ],
  preview: {
    select: {
      title: "name",
      description: "description",
    },
    prepare: ({ title, description }) => {
      return {
        title,
        subtitle: description || "Opening hours schedule",
      };
    },
  },
});
