import type { CollectionConfig } from "payload";
import { isAdminOrStaff } from "../access/isAdminOrStaff.ts";

export const Departments: CollectionConfig = {
  slug: "departments",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "reportingChannel", "updatedAt"],
    group: "Church",
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
      name: "name",
      type: "text",
      required: true,
      unique: true,
    },
    {
      name: "slug",
      type: "text",
      unique: true,
      admin: {
        position: "sidebar",
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (typeof value === "string" && value.trim()) {
              return value.trim().toLowerCase().replace(/\s+/g, "-");
            }

            const name = typeof data?.name === "string" ? data.name : "";
            return name.trim().toLowerCase().replace(/\s+/g, "-");
          },
        ],
      },
    },
    {
      name: "description",
      type: "textarea",
    },
    {
      name: "reportingChannel",
      type: "text",
    },
    {
      name: "isActive",
      type: "checkbox",
      defaultValue: true,
    },
  ],
};
