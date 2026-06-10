import type { CollectionConfig, Where } from "payload";
import { canReadAbsenteeTracking } from "../access/canReadAbsenteeTracking.ts";
import { isAdminOrStaff } from "../access/isAdminOrStaff.ts";

const buildDuplicateWhere = ({
  date,
  memberID,
  serviceID,
}: {
  date: string;
  memberID: number | string;
  serviceID?: number | string;
}): Where => {
  if (serviceID) {
    return {
      and: [
        {
          member: {
            equals: memberID,
          },
        },
        {
          service: {
            equals: serviceID,
          },
        },
      ],
    };
  }

  return {
    and: [
      {
        member: {
          equals: memberID,
        },
      },
      {
        date: {
          equals: date,
        },
      },
      {
        service: {
          exists: false,
        },
      },
    ],
  };
};

const resolveRelationshipID = (value: unknown): number | string | undefined => {
  if (typeof value === "number" || typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object" && "id" in value) {
    const relationship = value as { id?: number | string };
    return relationship.id;
  }

  return undefined;
};

export const AttendanceRecords: CollectionConfig = {
  slug: "attendance-records",
  admin: {
    useAsTitle: "id",
    defaultColumns: ["member", "service", "date", "present"],
    group: "Operations",
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
          name: "member",
          type: "relationship",
          relationTo: "members",
          required: true,
        },
        {
          name: "service",
          type: "relationship",
          relationTo: "services",
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
          name: "present",
          type: "checkbox",
          defaultValue: true,
        },
      ],
    },
    {
      name: "notes",
      type: "textarea",
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, operation, originalDoc, req }) => {
        if (!data) {
          return data;
        }

        const memberID = resolveRelationshipID(data.member ?? originalDoc?.member);
        const serviceID = resolveRelationshipID(data.service ?? originalDoc?.service);

        if (serviceID && !data.date) {
          const service = await req.payload.findByID({
            collection: "services",
            id: serviceID,
            depth: 0,
          });

          if (service?.date) {
            data.date = service.date;
          }
        }

        const date = typeof data.date === "string" ? data.date : originalDoc?.date;

        if (!memberID || !date) {
          return data;
        }

        if (process.env.PAYLOAD_SKIP_ATTENDANCE_DUPLICATE_CHECK === "true") {
          return data;
        }

        const where = buildDuplicateWhere({
          date,
          memberID,
          serviceID,
        });

        if (operation === "update" && originalDoc?.id) {
          where.and?.push({
            id: {
              not_equals: originalDoc.id,
            },
          });
        }

        const duplicates = await req.payload.find({
          collection: "attendance-records",
          depth: 0,
          limit: 1,
          pagination: false,
          where,
        });

        if (duplicates.docs.length > 0) {
          throw new Error("An attendance record already exists for this member and service/date.");
        }

        return data;
      },
    ],
  },
};
