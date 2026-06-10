import type { CollectionConfig } from "payload";
import { isAdmin } from "../access/isAdmin.ts";

export const Admins: CollectionConfig = {
  slug: "admins",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "roles", "department"],
    group: "Admin",
  },
  auth: true,
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: isAdmin,
    update: isAdmin,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "roles",
      type: "select",
      hasMany: true,
      required: true,
      defaultValue: ["staff"],
      options: [
        {
          label: "Admin",
          value: "admin",
        },
        {
          label: "Staff",
          value: "staff",
        },
        {
          label: "Department Lead",
          value: "department-lead",
        },
        {
          label: "Absentee Viewer",
          value: "absentee-viewer",
        },
      ],
    },
    {
      name: "isSuperAdmin",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "department",
      type: "relationship",
      relationTo: "departments",
    },
  ],
};
