"use server";

import configPromise from "@payload-config";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { generatePayloadCookie, getPayload } from "payload";
import { isDepartmentLeadOnly } from "@/payload/utilities/adminRoles";
import { isHoneypotTriggered } from "@/payload/utilities/honeypot";

export const loginAdmin = async (formData: FormData) => {
  if (isHoneypotTriggered(formData)) {
    redirect("/admin/login?error=invalid");
  }

  const email = formData.get("email");
  const password = formData.get("password");
  let nextPath = "/admin";

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    redirect("/admin/login?error=missing");
  }

  try {
    const payload = await getPayload({
      config: configPromise,
      key: "thenestchurch-app",
    });
    const result = await payload.login({
      collection: "admins",
      data: {
        email,
        password,
      },
    });
    const authConfig = payload.collections.admins?.config.auth;

    if (!authConfig || !result.token) {
      redirect("/admin/login?error=invalid");
    }

    const cookieExpiration = authConfig.tokenExpiration ? new Date(Date.now() + authConfig.tokenExpiration) : undefined;
    const payloadCookie = generatePayloadCookie({
      collectionAuthConfig: authConfig,
      cookiePrefix: payload.config.cookiePrefix,
      expires: cookieExpiration,
      returnCookieAsObject: true,
      token: result.token,
    });

    if (payloadCookie.value) {
      const cookieStore = await cookies();
      const sameSite =
        authConfig.cookies.sameSite === "None"
          ? "none"
          : authConfig.cookies.sameSite === "Strict"
            ? "strict"
            : "lax";

      cookieStore.set(payloadCookie.name, payloadCookie.value, {
        domain: authConfig.cookies.domain,
        expires: payloadCookie.expires ? new Date(payloadCookie.expires) : undefined,
        httpOnly: true,
        sameSite,
        secure: authConfig.cookies.secure || false,
      });
    }

    if (isDepartmentLeadOnly(result.user)) {
      nextPath = "/department-head/reports/submit";
    }
  } catch {
    redirect("/admin/login?error=invalid");
  }

  redirect(nextPath);
};
