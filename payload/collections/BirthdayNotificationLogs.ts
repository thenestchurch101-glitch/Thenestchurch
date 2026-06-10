import type { CollectionConfig } from "payload";
import { isAdminOrStaff } from "../access/isAdminOrStaff.ts";

export const BirthdayNotificationLogs: CollectionConfig = {
  slug: "birthday-notification-logs",
  access: {
    create: isAdminOrStaff,
    delete: isAdminOrStaff,
    read: isAdminOrStaff,
    update: isAdminOrStaff,
  },
  admin: {
    defaultColumns: ["member", "recipientEmail", "status", "runDate", "createdAt"],
    group: "Operations",
    useAsTitle: "recipientEmail",
  },
  timestamps: true,
  fields: [
    {
      name: "runDate",
      type: "date",
      required: true,
    },
    {
      name: "member",
      type: "relationship",
      relationTo: "members",
    },
    {
      name: "recipientEmail",
      type: "email",
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "sent",
      options: [
        { label: "Sent", value: "sent" },
        { label: "Skipped", value: "skipped" },
        { label: "Failed", value: "failed" },
      ],
    },
    {
      name: "message",
      type: "textarea",
    },
    {
      name: "dryRun",
      type: "checkbox",
      defaultValue: false,
    },
  ],
};
