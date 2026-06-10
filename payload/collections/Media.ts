import type { CollectionConfig } from "payload";
import { isAdminOrStaff } from "../access/isAdminOrStaff.ts";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    create: isAdminOrStaff,
    delete: isAdminOrStaff,
    read: () => true,
    update: isAdminOrStaff,
  },
  admin: {
    group: "Church",
    useAsTitle: "alt",
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
    {
      name: "legacyPath",
      type: "text",
      admin: {
        description: "Original Django media path retained during import when the file is not available locally.",
      },
    },
  ],
  upload: {
    mimeTypes: ["image/*"],
    staticDir: "public/uploads",
  },
};
