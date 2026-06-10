import type { GlobalConfig } from "payload";
import { isAdminOrStaff } from "../access/isAdminOrStaff.ts";

export const BirthdayNotificationSettings: GlobalConfig = {
  slug: "birthday-notification-settings",
  access: {
    read: isAdminOrStaff,
    update: isAdminOrStaff,
  },
  admin: {
    group: "Operations",
  },
  fields: [
    {
      name: "enabled",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "sendTime",
      type: "text",
      defaultValue: "08:00",
      admin: {
        description: "Lagos local time in HH:mm format.",
      },
    },
    {
      name: "adminNotificationEmails",
      type: "textarea",
      admin: {
        description: "Comma or line separated email addresses for birthday run summaries.",
      },
    },
    {
      name: "lastRun",
      type: "date",
      admin: {
        readOnly: true,
      },
    },
    {
      name: "memberEmailSubject",
      type: "text",
      defaultValue: "Happy birthday from The Nest Church",
    },
    {
      name: "memberEmailBody",
      type: "textarea",
      defaultValue:
        "Dear {{firstName}},\n\nHappy birthday from The Nest Church. We celebrate God's goodness in your life today and pray that this new year is filled with grace, joy, and strength.\n\nWith love,\nThe Nest Church",
    },
    {
      name: "adminSummarySubject",
      type: "text",
      defaultValue: "Birthday notification summary for {{date}}",
    },
    {
      name: "adminSummaryBody",
      type: "textarea",
      defaultValue:
        "Birthday notifications were processed for {{date}}.\n\nSent: {{sentCount}}\nSkipped: {{skippedCount}}\nFailed: {{failedCount}}\n\nMembers:\n{{memberList}}",
    },
  ],
};
