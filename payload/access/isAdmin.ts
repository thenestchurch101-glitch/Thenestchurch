import type { AccessArgs } from "payload";

export const isAdmin = ({ req }: AccessArgs) => {
  const user = req.user as { roles?: string[]; isSuperAdmin?: boolean } | null;

  if (!user) {
    return false;
  }

  return Boolean(user.isSuperAdmin || user.roles?.includes("admin"));
};
