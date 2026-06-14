"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Member } from "@/payload-types";
import { getAdminContext } from "@/payload/utilities/getAdminContext";
import { isHoneypotTriggered } from "@/payload/utilities/honeypot";

const buildRedirectURL = ({
  date,
  department,
  page,
  query,
  saved,
  service,
}: {
  date?: string;
  department?: string;
  page?: string;
  query?: string;
  saved: string;
  service?: string;
}) => {
  const params = new URLSearchParams();

  if (service) {
    params.set("service", service);
  }

  if (date) {
    params.set("date", date);
  }

  if (department) {
    params.set("department", department);
  }

  if (query) {
    params.set("query", query);
  }

  if (page) {
    params.set("page", page);
  }

  params.set("saved", saved);

  return `/admin/attendance?${params.toString()}`;
};

export const saveAttendanceRecords = async (formData: FormData) => {
  if (isHoneypotTriggered(formData)) {
    redirect(
      buildRedirectURL({
        saved: "invalid",
      }),
    );
  }

  const { req } = await getAdminContext("attendance-register-save", {
    allowedRoles: ["admin", "staff"],
  });
  const payload = req.payload;

  const service = formData.get("service");
  const serviceID = typeof service === "string" && service ? service : undefined;
  const dateValue = formData.get("date");
  const date = typeof dateValue === "string" ? dateValue : "";
  const departmentValue = formData.get("department");
  const department = typeof departmentValue === "string" ? departmentValue : "";
  const queryValue = formData.get("query");
  const query = typeof queryValue === "string" ? queryValue : "";
  const pageValue = formData.get("page");
  const page = typeof pageValue === "string" ? pageValue : "";
  const bulkStatusValue = formData.get("bulkStatus");
  const bulkStatus =
    bulkStatusValue === "present" || bulkStatusValue === "absent" ? bulkStatusValue : undefined;
  const memberIDs = formData.getAll("memberIds").filter((value): value is string => typeof value === "string");

  if (!date) {
    redirect(
      buildRedirectURL({
        date,
        department,
        page,
        query,
        saved: "missing-date",
        service: serviceID,
      }),
    );
  }

  for (const memberID of memberIDs) {
    const existingID = formData.get(`existing_${memberID}`);
    const present = bulkStatus
      ? bulkStatus === "present"
      : formData.get(`present_${memberID}`) === "on";
    const notes = formData.get(`notes_${memberID}`);

    const baseData = {
      date,
      member: Number(memberID),
      notes: typeof notes === "string" ? notes.trim() : "",
      present,
      service: serviceID ? Number(serviceID) : undefined,
    };

    if (typeof existingID === "string" && existingID) {
      await payload.update({
        id: Number(existingID),
        collection: "attendance-records",
        data: baseData,
        depth: 0,
        req,
      });

      continue;
    }

    await payload.create({
      collection: "attendance-records",
      data: baseData,
      depth: 0,
      req,
    });
  }

  revalidatePath("/admin/attendance");
  redirect(
    buildRedirectURL({
      date,
      department,
      page,
      query,
      saved: bulkStatus === "present" ? "bulk-present" : bulkStatus === "absent" ? "bulk-absent" : "1",
      service: serviceID,
    }),
  );
};

export const quickMarkAttendance = async (formData: FormData) => {
  if (isHoneypotTriggered(formData)) {
    redirect(
      buildRedirectURL({
        saved: "invalid",
      }),
    );
  }

  const { req } = await getAdminContext("attendance-register-quick-mark", {
    allowedRoles: ["admin", "staff"],
  });
  const payload = req.payload;

  const memberValue = formData.get("member");
  const memberID = typeof memberValue === "string" ? Number(memberValue) : Number.NaN;
  const serviceValue = formData.get("service");
  const serviceID = typeof serviceValue === "string" && serviceValue ? Number(serviceValue) : undefined;
  const dateValue = formData.get("date");
  const date = typeof dateValue === "string" ? dateValue : "";
  const departmentValue = formData.get("department");
  const department = typeof departmentValue === "string" ? departmentValue : "";
  const queryValue = formData.get("query");
  const query = typeof queryValue === "string" ? queryValue : "";
  const pageValue = formData.get("page");
  const page = typeof pageValue === "string" ? pageValue : "";

  if (!date || !Number.isFinite(memberID)) {
    redirect(
      buildRedirectURL({
        date,
        department,
        page,
        query,
        saved: "invalid",
        service: typeof serviceValue === "string" ? serviceValue : undefined,
      }),
    );
  }

  const existing = await payload.find({
    collection: "attendance-records",
    depth: 0,
    limit: 1,
    pagination: false,
    req,
    where: serviceID
      ? {
          and: [
            {
              member: {
                equals: memberID,
              },
            },
            {
              service: {
                equals: serviceID,
              },
            },
          ],
        }
      : {
          and: [
            {
              member: {
                equals: memberID,
              },
            },
            {
              date: {
                equals: date,
              },
            },
            {
              service: {
                exists: false,
              },
            },
          ],
        },
  });

  if (existing.docs[0]) {
    await payload.update({
      id: existing.docs[0].id,
      collection: "attendance-records",
      data: {
        date,
        member: memberID,
        present: true,
        service: serviceID,
      },
      depth: 0,
      req,
    });
  } else {
    await payload.create({
      collection: "attendance-records",
      data: {
        date,
        member: memberID,
        present: true,
        service: serviceID,
      },
      depth: 0,
      req,
    });
  }

  revalidatePath("/admin/attendance");
  redirect(
    buildRedirectURL({
      date,
      department,
      page,
      query,
      saved: "quick",
      service: typeof serviceValue === "string" ? serviceValue : undefined,
    }),
  );
};

export type AttendanceMemberRow = Member;
