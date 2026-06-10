import type { Admin } from "@/payload-types";

export type AdminRole = Admin["roles"][number];

type AdminLike = {
  department?: Admin["department"];
  isSuperAdmin?: boolean | null;
  roles?: AdminRole[];
} | null | undefined;

export const hasAdminRole = (user: AdminLike, allowedRoles: AdminRole[]) => {
  if (!user) {
    return false;
  }

  if (user.isSuperAdmin) {
    return true;
  }

  return allowedRoles.some((role) => user.roles?.includes(role));
};

export const isDepartmentLeadOnly = (user: AdminLike) => {
  if (!user || user.isSuperAdmin) {
    return false;
  }

  const roles = user.roles ?? [];

  return roles.includes("department-lead") && !roles.includes("admin") && !roles.includes("staff");
};

export const isAbsenteeViewerOnly = (user: AdminLike) => {
  if (!user || user.isSuperAdmin) {
    return false;
  }

  const roles = user.roles ?? [];

  return roles.includes("absentee-viewer") && !roles.includes("admin") && !roles.includes("staff");
};

export const getAdminDepartmentID = (user: AdminLike) => {
  const department = user?.department;

  if (!department) {
    return null;
  }

  if (typeof department === "number") {
    return department;
  }

  return department.id ?? null;
};
