import type { CollectionConfig } from "payload";
import { isAdminOrStaff } from "../access/isAdminOrStaff.ts";

export const ReportInstructions: CollectionConfig = {
  slug: "report-instructions",
  access: {
    create: isAdminOrStaff,
    delete: isAdminOrStaff,
    read: ({ req }) => Boolean(req.user),
    update: isAdminOrStaff,
  },
  admin: {
    defaultColumns: ["title", "department", "isActive", "updatedAt"],
    group: "Operations",
    useAsTitle: "title",
  },
  timestamps: true,
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "department",
      type: "relationship",
      relationTo: "departments",
      required: true,
      unique: true,
    },
    {
      name: "content",
      type: "textarea",
      required: true,
    },
    {
      name: "isActive",
      type: "checkbox",
      defaultValue: true,
    },
  ],
};
