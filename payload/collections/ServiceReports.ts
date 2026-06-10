import type { CollectionConfig, Where } from "payload";
import { isAdmin } from "../access/isAdmin.ts";
import { hasAdminRole, getAdminDepartmentID, isDepartmentLeadOnly } from "../utilities/adminRoles.ts";

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

const buildDuplicateWhere = ({
  departmentID,
  serviceID,
}: {
  departmentID: number | string;
  serviceID: number | string;
}): Where => ({
  and: [
    {
      service: {
        equals: serviceID,
      },
    },
    {
      department: {
        equals: departmentID,
      },
    },
  ],
});

export const ServiceReports: CollectionConfig = {
  slug: "service-reports",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "service", "department", "isApproved", "createdAt"],
    group: "Operations",
  },
  access: {
    create: ({ data, req }) => {
      if (hasAdminRole(req.user, ["admin", "staff"])) {
        return true;
      }

      if (!isDepartmentLeadOnly(req.user)) {
        return false;
      }

      const departmentID = getAdminDepartmentID(req.user);
      const requestedDepartmentID = resolveRelationshipID(data?.department);
      return Boolean(departmentID && requestedDepartmentID && String(departmentID) === String(requestedDepartmentID));
    },
    delete: isAdmin,
    read: ({ req }) => {
      if (hasAdminRole(req.user, ["admin", "staff"])) {
        return true;
      }

      if (!isDepartmentLeadOnly(req.user)) {
        return false;
      }

      const departmentID = getAdminDepartmentID(req.user);
      return departmentID
        ? {
            department: {
              equals: departmentID,
            },
          }
        : false;
    },
    update: ({ req }) => {
      if (hasAdminRole(req.user, ["admin", "staff"])) {
        return true;
      }

      if (!isDepartmentLeadOnly(req.user)) {
        return false;
      }

      const departmentID = getAdminDepartmentID(req.user);
      return departmentID
        ? {
            department: {
              equals: departmentID,
            },
          }
        : false;
    },
  },
  timestamps: true,
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      type: "row",
      fields: [
        {
          name: "service",
          type: "relationship",
          relationTo: "services",
          required: true,
        },
        {
          name: "department",
          type: "relationship",
          relationTo: "departments",
          required: true,
        },
      ],
    },
    {
      name: "submittedBy",
      type: "relationship",
      relationTo: "admins",
      admin: {
        readOnly: true,
      },
    },
    {
      name: "reportContent",
      type: "textarea",
      required: true,
    },
    {
      type: "row",
      fields: [
        {
          name: "departmentAttendance",
          type: "number",
          defaultValue: 0,
          min: 0,
        },
        {
          name: "volunteersCount",
          type: "number",
          defaultValue: 0,
          min: 0,
        },
      ],
    },
    {
      name: "attachmentUrl",
      type: "text",
    },
    {
      type: "row",
      fields: [
        {
          name: "isApproved",
          type: "checkbox",
          defaultValue: false,
        },
        {
          name: "approvedBy",
          type: "relationship",
          relationTo: "admins",
        },
        {
          name: "approvedAt",
          type: "date",
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation, originalDoc, req }) => {
        if (!data) {
          return data;
        }

        if (req.user && !data.submittedBy && operation === "create") {
          data.submittedBy = req.user.id;
        }

        const leadOnly = isDepartmentLeadOnly(req.user);

        if (leadOnly) {
          const userDepartmentID = getAdminDepartmentID(req.user);
          const reportDepartmentID = resolveRelationshipID(data.department ?? originalDoc?.department);

          if (!userDepartmentID || !reportDepartmentID || String(userDepartmentID) !== String(reportDepartmentID)) {
            throw new Error("Department leads can only submit reports for their own department.");
          }

          if (data.isApproved !== undefined && data.isApproved !== originalDoc?.isApproved) {
            throw new Error("Department leads cannot approve reports.");
          }

          data.isApproved = originalDoc?.isApproved ?? false;
          data.approvedBy = originalDoc?.approvedBy ?? null;
          data.approvedAt = originalDoc?.approvedAt ?? null;
        }

        if (!leadOnly && data.isApproved && hasAdminRole(req.user, ["admin", "staff"])) {
          data.approvedAt = data.approvedAt ?? new Date().toISOString();
          data.approvedBy = data.approvedBy ?? req.user?.id;
        } else if (!leadOnly) {
          data.approvedAt = null;
        }

        if (!data.title) {
          data.title = "Department service report";
        }

        return data;
      },
    ],
    beforeValidate: [
      async ({ data, operation, originalDoc, req }) => {
        if (!data) {
          return data;
        }

        const serviceID = resolveRelationshipID(data.service ?? originalDoc?.service);
        const departmentID = resolveRelationshipID(data.department ?? originalDoc?.department);

        if (!serviceID || !departmentID) {
          return data;
        }

        const where = buildDuplicateWhere({
          departmentID,
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
          collection: "service-reports",
          depth: 0,
          limit: 1,
          pagination: false,
          req,
          where,
        });

        if (duplicates.docs.length > 0) {
          throw new Error("A report for this department has already been submitted for the selected service.");
        }

        return data;
      },
    ],
  },
};
