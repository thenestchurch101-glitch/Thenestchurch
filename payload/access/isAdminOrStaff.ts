import type { AccessArgs } from "payload";
import { hasAdminRole } from "../utilities/adminRoles.ts";

export const isAdminOrStaff = ({ req }: AccessArgs) => hasAdminRole(req.user, ["admin", "staff"]);
