"use server";

import { redirect } from "next/navigation";
import { getAdminContext } from "@/payload/utilities/getAdminContext";

const takeString = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value : "";

export async function submitServiceReport(formData: FormData) {
  const serviceID = Number(takeString(formData.get("service")));
  const departmentID = Number(takeString(formData.get("department")));
  const title = takeString(formData.get("title")).trim();
  const reportContent = takeString(formData.get("reportContent")).trim();
  const attachmentUrl = takeString(formData.get("attachmentUrl")).trim();
  const departmentAttendance = Number(takeString(formData.get("departmentAttendance")) || "0");
  const volunteersCount = Number(takeString(formData.get("volunteersCount")) || "0");

  const { req } = await getAdminContext("submit-service-report-action", {
    allowedRoles: ["admin", "staff"],
  });

  if (!Number.isFinite(serviceID) || !Number.isFinite(departmentID) || !reportContent) {
    redirect("/admin/reports/submit?saved=invalid");
  }

  try {
    await req.payload.create({
      collection: "service-reports",
      data: {
        attachmentUrl: attachmentUrl || undefined,
        department: departmentID,
        departmentAttendance: Number.isFinite(departmentAttendance) ? Math.max(0, departmentAttendance) : 0,
        reportContent,
        service: serviceID,
        submittedBy: req.user?.id,
        title: title || "Department service report",
        volunteersCount: Number.isFinite(volunteersCount) ? Math.max(0, volunteersCount) : 0,
      },
      req,
    });
  } catch {
    redirect(`/admin/reports/submit?service=${serviceID}&saved=duplicate`);
  }

  redirect(`/admin/reports/${serviceID}?saved=1`);
}

export async function createService(formData: FormData) {
  const takeString = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value.trim() : "";
  };

  const name = takeString("name");
  const serviceType = takeString("serviceType");
  const date = takeString("date");
  const startTime = takeString("startTime");
  const endTime = takeString("endTime");
  const notes = takeString("notes");
  const isActive = takeString("isActive") === "on";

  if (!name || !serviceType || !date) {
    redirect("/admin/reports/services/new?saved=invalid");
  }

  const { req } = await getAdminContext("create-service-action", {
    allowedRoles: ["admin", "staff"],
  });

  const service = await req.payload.create({
    collection: "services",
    data: {
      date,
      endTime: endTime || undefined,
      isActive,
      name,
      notes: notes || undefined,
      serviceType: serviceType as "sunday-service" | "midweek-service" | "prayer-meeting" | "special-program" | "other",
      startTime: startTime || undefined,
    },
    req,
  });

  redirect(`/admin/reports/${service.id}?created=service`);
}
