import type { AccessArgs } from "payload";

export const isAuthenticated = ({ req }: AccessArgs) => Boolean(req.user);
