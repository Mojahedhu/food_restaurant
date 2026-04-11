import { defineField, defineType } from "sanity";

export default defineType({
  name: "order",
  title: "Order",
  type: "document",
  fields: [
    {
      name: "orderNumber",
      type: "string",
      title: "Order Number",
      description: "Unique order number (auto-generated)",
      readOnly: true,
    },
    {
      name: "user",
      type: "reference",
      title: "User",
      to: [{ type: "user" }],
      validation: (Rule) => Rule.required(),
    },
    {
      name: "userEmail",
      type: "string",
      title: "User Email",
      validation: (Rule) => Rule.required().email(),
    },
    {
      name: "userName",
      type: "string",
      title: "User Name",
    },
    {
      name: "items",
      type: "array",
      title: "Order Items",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "foodId",
              type: "string",
              title: "Food ID",
              validation: (rule) => rule.required(),
            },
            {
              name: "name",
              type: "string",
              title: "Item Name",
              validation: (rule) => rule.required(),
            },
            {
              name: "image",
              type: "url",
              title: "Item Image",
              description: "Url to the food item image",
            },
            {
              name: "price",
              type: "number",
              title: "Price",
              validation: (rule) => rule.required().min(0),
            },
            {
              name: "quantity",
              title: "Quantity",
              type: "number",
              validation: (rule) => rule.required().min(1),
            },
            {
              name: "size",
              type: "string",
              title: "Size",
            },
            {
              name: "variety",
              type: "string",
              title: "Variety",
            },
          ],
          preview: {
            select: {
              title: "name",
              quantity: "quantity",
              price: "price",
            },
            prepare: ({ title, quantity, price }) => {
              return {
                title: `${quantity}X ${title}`,
                subtitle: `$${(price * quantity).toFixed(2)}`,
              };
            },
          },
        },
      ],
      validation: (rule) => rule.required().min(1),
    },
    {
      name: "deliveryAddress",
      type: "object",
      title: "Delivery Address",
      fields: [
        {
          name: "type",
          title: "Type",
          type: "string",
        },
        {
          name: "label",
          title: "Label",
          type: "string",
        },
        {
          name: "street",
          title: "Street",
          type: "string",
          validation: (rule) => rule.required(),
        },
        {
          name: "apartment",
          title: "Apartment/Suite",
          type: "string",
        },
        {
          name: "city",
          title: "City",
          type: "string",
          validation: (rule) => rule.required(),
        },
        {
          name: "state",
          title: "State",
          type: "string",
          validation: (rule) => rule.required(),
        },
        {
          name: "zipCode",
          title: "Zip Code",
          type: "string",
          validation: (rule) => rule.required(),
        },
        {
          name: "country",
          title: "Country",
          type: "string",
        },
        {
          name: "phone",
          title: "Phone",
          type: "string",
          validation: (rule) => rule.required(),
        },
        {
          name: "instructions",
          title: "Delivery Instructions",
          type: "text",
          rows: 2,
        },
      ],
      validation: (rule) => rule.required(),
    },
    {
      name: "subtotal",
      type: "number",
      title: "Subtotal",
      validation: (rule) => rule.required().min(0),
    },
    {
      name: "deliveryFee",
      type: "number",
      title: "Delivery Fee",
      validation: (rule) => rule.required().min(0),
    },
    {
      name: "tax",
      type: "number",
      title: "Tax",
      validation: (rule) => rule.required().min(0),
    },
    {
      name: "total",
      type: "number",
      title: "Total Amount",
      validation: (rule) => rule.required().min(0),
    },
    {
      name: "originalTotal",
      type: "number",
      title: "Original Total",
      description:
        "Original order total before modifications (for refund tracking)",
      readOnly: true,
    },
    {
      name: "paymentMethod",
      type: "string",
      title: "Payment Method",
      options: {
        list: [
          { title: "Online (Stripe)", value: "online" },
          { title: "Cash on delivery", value: "cod" },
        ],
      },
      validation: (rule) => rule.required(),
    },
    {
      name: "paymentStatus",
      type: "string",
      title: "Payment Status",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Paid", value: "paid" },
          { title: "Failed", value: "failed" },
        ],
      },
      initialValue: "pending",
      validation: (rule) => rule.required().min(0),
    },
    {
      name: "status",
      type: "reference",
      title: "Order status",
      to: [{ type: "orderStatus" }],
      validation: (rule) => rule.required(),
      options: {
        filter: "isActive == true",
      },
    },
    {
      name: "estimatedDeliveryTime",
      type: "string",
      title: "Estimated Delivery Time",
      validation: (rule) => rule.required().min(0),
      description: `e.g., "30-45 minutes"`,
    },
    {
      name: "notes",
      type: "text",
      title: "Order Notes",
      description: "Internal notes about the order",
      rows: 3,
    },
    {
      name: "StripeSessionId",
      type: "string",
      title: "Stripe Session ID",
      description: "Strip Checkout session ID",
      readOnly: true,
    },
    {
      name: "stripePaymentIntent",
      type: "string",
      title: "Stripe Payment Intent",
      description: "Stripe Payment Intent ID",
      readOnly: true,
    },
  ],
  preview: {
    select: {
      orderNumber: "orderNumber",
      userEmail: "userEmail",
      total: "total",
      status: "status.title",
      createdAt: "_createdAt",
    },
    prepare: ({ orderNumber, userEmail, total, status, createdAt }) => {
      return {
        title: orderNumber || "New Order",
        subtitle: `${userEmail} • $${total?.toFixed(2)} • ${status || "No Status"}`,
        description: new Date(createdAt).toLocaleDateString(),
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
      title: "Total Amount (Highest First)",
      name: "totalDesc",
      by: [{ field: "total", direction: "desc" }],
    },
  ],
});
