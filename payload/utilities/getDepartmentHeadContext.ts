import configPromise from "@payload-config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createLocalReq, getPayload } from "payload";
import { getAdminDepartmentID, isDepartmentLeadOnly } from "./adminRoles";
import type { Admin } from "@/payload-types";

export const getDepartmentHeadContext = async () => {
  const payload = await getPayload({
    config: configPromise,
    key: "thenestchurch-app",
  });
  const incomingHeaders = new Headers(await headers());
  const authResult = await payload.auth({
    canSetHeaders: false,
    headers: incomingHeaders,
  });
  const user = authResult.user as Admin | null;

  if (!user) {
    redirect("/department-head/login");
  }

  if (!isDepartmentLeadOnly(user)) {
    redirect("/department-head/login?error=wrongPortal");
  }

  const departmentID = getAdminDepartmentID(user);

  if (!departmentID) {
    redirect("/department-head/login?error=noDepartment");
  }

  const req = await createLocalReq(
    {
      req: {
        headers: incomingHeaders,
      },
      user,
    },
    payload,
  );

  return {
    departmentID,
    payload,
    req,
    user,
  };
};
