import type { CollectionConfig } from "payload";
import { canReadAbsenteeTracking } from "../access/canReadAbsenteeTracking.ts";
import { isAdminOrStaff } from "../access/isAdminOrStaff.ts";

export const Members: CollectionConfig = {
  slug: "members",
  admin: {
    useAsTitle: "fullName",
    defaultColumns: ["fullName", "email", "phoneNumber", "department", "isNewComer"],
    group: "Church",
  },
  access: {
    create: isAdminOrStaff,
    delete: isAdminOrStaff,
    read: canReadAbsenteeTracking,
    update: isAdminOrStaff,
  },
  timestamps: true,
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "firstName",
          type: "text",
          required: true,
        },
        {
          name: "middleName",
          type: "text",
        },
        {
          name: "lastName",
          type: "text",
          required: true,
        },
      ],
    },
    {
      name: "fullName",
      type: "text",
      admin: {
        hidden: true,
      },
      hooks: {
        beforeChange: [
          ({ siblingData }) => {
            return [siblingData.firstName, siblingData.middleName, siblingData.lastName]
              .filter(Boolean)
              .join(" ")
              .trim();
          },
        ],
      },
    },
    {
      type: "row",
      fields: [
        {
          name: "email",
          type: "email",
          unique: true,
        },
        {
          name: "phoneNumber",
          type: "text",
        },
        {
          name: "whatsappNumber",
          type: "text",
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "department",
          type: "relationship",
          relationTo: "departments",
        },
        {
          name: "preferredDepartment",
          type: "relationship",
          relationTo: "departments",
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "isNewComer",
          type: "checkbox",
          defaultValue: true,
        },
        {
          name: "dateOfBirth",
          type: "date",
        },
        {
          name: "dateJoined",
          type: "date",
          defaultValue: () => new Date().toISOString().slice(0, 10),
        },
      ],
    },
    {
      name: "profilePicture",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "legacyProfilePictureUrl",
      type: "text",
      admin: {
        description: "Original Django profile image path retained when no local media file was imported.",
      },
    },
    {
      name: "nickname",
      type: "text",
    },
    {
      name: "nationality",
      type: "text",
    },
    {
      name: "tribe",
      type: "text",
    },
    {
      name: "maritalStatus",
      type: "text",
    },
    {
      type: "row",
      fields: [
        {
          name: "instagramHandle",
          type: "text",
        },
        {
          name: "facebookHandle",
          type: "text",
        },
        {
          name: "xHandle",
          type: "text",
          label: "X Handle",
        },
      ],
    },
    {
      name: "homeAddress",
      type: "textarea",
    },
    {
      name: "bornAgain",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "yearsAChristian",
      type: "text",
    },
    {
      name: "previousChurch",
      type: "text",
    },
    {
      name: "wantsDepartment",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "occupation",
      type: "text",
    },
    {
      name: "institution",
      type: "text",
    },
    {
      name: "course",
      type: "text",
    },
    {
      name: "company",
      type: "text",
    },
    {
      name: "role",
      type: "text",
    },
    {
      name: "skills",
      type: "textarea",
    },
    {
      name: "hobbies",
      type: "textarea",
    },
    {
      name: "favoriteVerse",
      type: "text",
    },
    {
      name: "churchInterests",
      type: "textarea",
    },
    {
      name: "availableDays",
      type: "select",
      hasMany: true,
      options: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
    },
  ],
};
