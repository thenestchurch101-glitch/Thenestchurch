import type { CollectionConfig } from "payload";
import { isAdminOrStaff } from "../access/isAdminOrStaff.ts";

export const ReportTemplates: CollectionConfig = {
  slug: "report-templates",
  access: {
    create: isAdminOrStaff,
    delete: isAdminOrStaff,
    read: ({ req }) => Boolean(req.user),
    update: isAdminOrStaff,
  },
  admin: {
    defaultColumns: ["title", "isActive", "updatedAt"],
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
      name: "applicableDepartments",
      type: "relationship",
      hasMany: true,
      relationTo: "departments",
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
