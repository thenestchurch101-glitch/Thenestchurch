"use server";

import { redirect } from "next/navigation";
import { getDepartmentHeadContext } from "@/payload/utilities/getDepartmentHeadContext";
import { isHoneypotTriggered } from "@/payload/utilities/honeypot";

const takeString = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value : "";

export async function submitDepartmentHeadReport(formData: FormData) {
  if (isHoneypotTriggered(formData)) {
    redirect("/department-head/reports/submit?saved=invalid");
  }

  const serviceID = Number(takeString(formData.get("service")));
  const title = takeString(formData.get("title")).trim();
  const reportContent = takeString(formData.get("reportContent")).trim();
  const attachmentUrl = takeString(formData.get("attachmentUrl")).trim();
  const departmentAttendance = Number(takeString(formData.get("departmentAttendance")) || "0");
  const volunteersCount = Number(takeString(formData.get("volunteersCount")) || "0");

  const { departmentID, req } = await getDepartmentHeadContext();

  if (!Number.isFinite(serviceID) || !reportContent) {
    redirect("/department-head/reports/submit?saved=invalid");
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
    redirect(`/department-head/reports/submit?service=${serviceID}&saved=duplicate`);
  }

  redirect(`/department-head/reports/submit?service=${serviceID}&saved=1`);
}
