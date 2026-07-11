"use server";

import { redirect } from "next/navigation";
import { getAdminContext } from "@/payload/utilities/getAdminContext";

const takeString = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
};

export async function saveBirthdayEmailSettings(formData: FormData) {
  const sendTime = takeString(formData, "sendTime") || "08:00";

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(sendTime)) {
    redirect("/admin/members/birthdays/settings?saved=invalid");
  }

  const { req } = await getAdminContext("birthday-email-settings-action", {
    allowedRoles: ["admin", "staff"],
  });

  await req.payload.updateGlobal({
    slug: "birthday-notification-settings",
    data: {
      adminNotificationEmails: takeString(formData, "adminNotificationEmails"),
      adminSummaryBody: takeString(formData, "adminSummaryBody"),
      adminSummarySubject: takeString(formData, "adminSummarySubject"),
      enabled: formData.get("enabled") === "on",
      memberEmailBody: takeString(formData, "memberEmailBody"),
      memberEmailSubject: takeString(formData, "memberEmailSubject"),
      sendTime,
    },
    req,
  });

  redirect("/admin/members/birthdays/settings?saved=1");
}
