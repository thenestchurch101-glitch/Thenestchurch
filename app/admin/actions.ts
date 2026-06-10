"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("payload-token");
  redirect("/admin/login");
}
