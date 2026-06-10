import type { AccessArgs } from "payload";
import { hasAdminRole } from "../utilities/adminRoles.ts";

export const canReadAbsenteeTracking = ({ req }: AccessArgs) =>
  hasAdminRole(req.user, ["admin", "staff", "absentee-viewer"]);
