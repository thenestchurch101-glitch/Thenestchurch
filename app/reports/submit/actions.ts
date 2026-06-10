"use server";

import configPromise from "@payload-config";
import { redirect } from "next/navigation";
import { getPayload } from "payload";

const takeString = (value: FormDataEntryValue | null) => (typeof value === "string" ? value.trim() : "");

export async function submitPublicServiceReport(formData: FormData) {
  const payload = await getPayload({
    config: configPromise,
    key: "thenestchurch-app",
  });

  const service = Number(takeString(formData.get("service")));
  const department = Number(takeString(formData.get("department")));
  const title = takeString(formData.get("title"));
  const reportContent = takeString(formData.get("reportContent"));
  const attachmentUrl = takeString(formData.get("attachmentUrl"));
  const departmentAttendance = Math.max(0, Number(takeString(formData.get("departmentAttendance"))) || 0);
  const volunteersCount = Math.max(0, Number(takeString(formData.get("volunteersCount"))) || 0);

  if (!Number.isFinite(service) || !Number.isFinite(department) || !reportContent) {
    redirect("/reports/submit?saved=invalid");
  }

  try {
    await payload.create({
      collection: "service-reports",
      data: {
        attachmentUrl: attachmentUrl || undefined,
        department,
        departmentAttendance,
        reportContent,
        service,
        title: title || "Department service report",
        volunteersCount,
      },
      overrideAccess: true,
    });
  } catch {
    redirect("/reports/submit?saved=duplicate");
  }

  redirect("/reports/submit?saved=1");
}
