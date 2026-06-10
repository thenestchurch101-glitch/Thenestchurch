import configPromise from "@payload-config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { canAccessAdmin, createLocalReq, getPayload } from "payload";
import { hasAdminRole, type AdminRole } from "./adminRoles";

type AdminContextOptions = {
  allowedRoles?: AdminRole[];
};

export const getAdminContext = async (_key: string, options: AdminContextOptions = {}) => {
  const payload = await getPayload({
    config: configPromise,
    key: "thenestchurch-app",
  });
  const incomingHeaders = new Headers(await headers());
  const authResult = await payload.auth({
    canSetHeaders: false,
    headers: incomingHeaders,
  });
  const req = await createLocalReq(
    {
      req: {
        headers: incomingHeaders,
      },
      user: authResult.user ?? undefined,
    },
    payload,
  );

  try {
    await canAccessAdmin({
      req,
    });
  } catch {
    redirect("/admin/login");
  }

  if (!req.user) {
    redirect("/admin/login");
  }

  if (options.allowedRoles?.length) {
    const user = req.user as {
      isSuperAdmin?: boolean | null;
      roles?: AdminRole[];
    };

    if (!hasAdminRole(user, options.allowedRoles)) {
      redirect("/admin?error=forbidden");
    }
  }

  return {
    payload,
    req,
  };
};
