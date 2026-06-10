import type { AccessArgs } from "payload";
import { isAdmin } from "./isAdmin.ts";

export const isAdminOrFirstUser = async ({ req }: AccessArgs) => {
  if (isAdmin({ req })) {
    return true;
  }

  const count = await req.payload.count({
    collection: "admins",
    where: {},
  });

  return count.totalDocs === 0;
};
