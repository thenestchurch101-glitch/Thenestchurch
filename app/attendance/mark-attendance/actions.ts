"use server";

import configPromise from "@payload-config";
import { redirect } from "next/navigation";
import { getPayload } from "payload";

const todayValue = new Date().toISOString().slice(0, 10);

export async function savePublicAttendance(formData: FormData) {
  const payload = await getPayload({
    config: configPromise,
    key: "thenestchurch-app",
  });

  const date = typeof formData.get("date") === "string" ? String(formData.get("date")) : todayValue;
  const memberIDs = formData
    .getAll("memberIds")
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));
  const presentSet = new Set(
    formData
      .getAll("presentMembers")
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value)),
  );

  const previousDuplicateSetting = process.env.PAYLOAD_SKIP_ATTENDANCE_DUPLICATE_CHECK;
  process.env.PAYLOAD_SKIP_ATTENDANCE_DUPLICATE_CHECK = "true";

  try {
    let nextID: number | undefined;

    for (const memberID of memberIDs) {
      const existingValue = formData.get(`existing_${memberID}`);
      const existingID = typeof existingValue === "string" && existingValue ? Number(existingValue) : null;
      const present = presentSet.has(memberID);

      if (!present && !existingID) {
        continue;
      }

      const data = {
        date,
        member: memberID,
        present,
      };

      if (existingID && Number.isFinite(existingID)) {
        await payload.update({
          collection: "attendance-records",
          data: data as any,
          id: existingID,
          overrideAccess: true,
        });
        continue;
      }

      if (typeof nextID === "undefined") {
        const latest = await payload.find({
          collection: "attendance-records",
          depth: 0,
          limit: 1,
          overrideAccess: true,
          pagination: false,
          sort: "-id",
        });
        nextID = Number(latest.docs[0]?.id ?? 0) + 1;
      }

      await payload.create({
        collection: "attendance-records",
        data: {
          id: nextID,
          ...data,
        } as any,
        overrideAccess: true,
      });

      nextID += 1;
    }
  } finally {
    if (typeof previousDuplicateSetting === "undefined") {
      delete process.env.PAYLOAD_SKIP_ATTENDANCE_DUPLICATE_CHECK;
    } else {
      process.env.PAYLOAD_SKIP_ATTENDANCE_DUPLICATE_CHECK = previousDuplicateSetting;
    }
  }

  redirect("/attendance/mark-attendance?saved=1");
}
