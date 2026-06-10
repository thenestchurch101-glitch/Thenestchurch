import type { CollectionConfig } from "payload";
import { isAdminOrStaff } from "../access/isAdminOrStaff.ts";

export const Services: CollectionConfig = {
  slug: "services",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "serviceType", "date", "startTime", "isActive"],
    group: "Operations",
  },
  access: {
    create: isAdminOrStaff,
    delete: isAdminOrStaff,
    read: ({ req }) => Boolean(req.user),
    update: isAdminOrStaff,
  },
  timestamps: true,
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
        },
        {
          name: "serviceType",
          type: "select",
          required: true,
          defaultValue: "sunday-service",
          options: [
            {
              label: "Sunday Service",
              value: "sunday-service",
            },
            {
              label: "Midweek Service",
              value: "midweek-service",
            },
            {
              label: "Prayer Meeting",
              value: "prayer-meeting",
            },
            {
              label: "Special Program",
              value: "special-program",
            },
            {
              label: "Other",
              value: "other",
            },
          ],
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "date",
          type: "date",
          required: true,
          admin: {
            date: {
              pickerAppearance: "dayOnly",
            },
          },
        },
        {
          name: "startTime",
          type: "text",
        },
        {
          name: "endTime",
          type: "text",
        },
      ],
    },
    {
      name: "notes",
      type: "textarea",
    },
    {
      name: "isActive",
      type: "checkbox",
      defaultValue: true,
    },
  ],
};
