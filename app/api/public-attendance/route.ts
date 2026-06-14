import configPromise from "@payload-config";
import { NextResponse, type NextRequest } from "next/server";
import type { Where } from "payload";
import { getPayload } from "payload";
import type { AttendanceRecord, Department, Member } from "@/payload-types";
import { isHoneypotTriggered } from "@/payload/utilities/honeypot";

const todayValue = new Date().toISOString().slice(0, 10);
const SEARCH_LIMIT = 40;

type AttendanceRecordWithMemberID = AttendanceRecord & {
  member: number | Member;
};

const takeString = (value: FormDataEntryValue | string | null) =>
  typeof value === "string" ? value.trim() : "";

const getDepartmentName = (department: number | Department | null | undefined) => {
  if (!department || typeof department === "number") {
    return "No department";
  }

  return department.name;
};

const buildMemberSearchWhere = async ({
  payload,
  query,
}: {
  payload: Awaited<ReturnType<typeof getPayload>>;
  query: string;
}): Promise<Where> => {
  const departmentsResult = await payload.find({
    collection: "departments",
    depth: 0,
    limit: 20,
    overrideAccess: true,
    pagination: false,
    where: {
      name: {
        like: query,
      },
    },
  });
  const departmentIDs = departmentsResult.docs.map((department) => department.id);
  const or: Where[] = [
    {
      fullName: {
        like: query,
      },
    },
    {
      firstName: {
        like: query,
      },
    },
    {
      lastName: {
        like: query,
      },
    },
    {
      phoneNumber: {
        like: query,
      },
    },
    {
      whatsappNumber: {
        like: query,
      },
    },
  ];

  if (departmentIDs.length > 0) {
    or.push({
      department: {
        in: departmentIDs,
      },
    });
  }

  return {
    or,
  };
};

export async function GET(request: NextRequest) {
  const query = takeString(request.nextUrl.searchParams.get("query"));
  const date = takeString(request.nextUrl.searchParams.get("date")) || todayValue;

  if (query.length < 2) {
    return NextResponse.json({
      members: [],
    });
  }

  const payload = await getPayload({
    config: configPromise,
    key: "thenestchurch-app",
  });
  const membersResult = await payload.find({
    collection: "members",
    depth: 0,
    limit: SEARCH_LIMIT,
    overrideAccess: true,
    pagination: false,
    sort: "fullName",
    where: await buildMemberSearchWhere({
      payload,
      query,
    }),
  });
  const members = membersResult.docs as Member[];
  const memberIDs = members.map((member) => member.id);
  const departmentIDs = [
    ...new Set(
      members
        .map((member) => member.department)
        .filter((department): department is number => typeof department === "number"),
    ),
  ];
  const departmentsResult = departmentIDs.length
    ? await payload.find({
        collection: "departments",
        depth: 0,
        limit: departmentIDs.length,
        overrideAccess: true,
        pagination: false,
        where: {
          id: {
            in: departmentIDs,
          },
        },
      })
    : { docs: [] as Department[] };
  const departmentNameByID = new Map(
    (departmentsResult.docs as Department[]).map((department) => [department.id, department.name]),
  );
  const attendanceResult = memberIDs.length
    ? await payload.find({
        collection: "attendance-records",
        depth: 0,
        limit: SEARCH_LIMIT,
        overrideAccess: true,
        pagination: false,
        where: {
          and: [
            {
              date: {
                equals: date,
              },
            },
            {
              member: {
                in: memberIDs,
              },
            },
          ],
        },
      })
    : { docs: [] as AttendanceRecordWithMemberID[] };
  const attendanceByMember = new Map<number, AttendanceRecordWithMemberID>();

  for (const record of attendanceResult.docs as AttendanceRecordWithMemberID[]) {
    const member = record.member;
    const memberID = typeof member === "number" ? member : member.id;
    attendanceByMember.set(memberID, record);
  }

  return NextResponse.json({
    members: members.map((member) => {
      const record = attendanceByMember.get(member.id);

      return {
        departmentName:
          typeof member.department === "number"
            ? departmentNameByID.get(member.department) ?? "No department"
            : getDepartmentName(member.department),
        firstName: member.firstName ?? "M",
        fullName: member.fullName ?? `${member.firstName} ${member.lastName}`.trim(),
        id: member.id,
        record: record
          ? {
              id: record.id,
              present: record.present,
            }
          : undefined,
      };
    }),
  });
}

export async function POST(request: NextRequest) {
  const payload = await getPayload({
    config: configPromise,
    key: "thenestchurch-app",
  });

  const formData = await request.formData();
  const wantsJSON =
    request.headers.get("accept")?.includes("application/json") ||
    request.headers.get("x-requested-with") === "attendance-autosave";

  if (isHoneypotTriggered(formData)) {
    if (wantsJSON) {
      return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
    }

    return NextResponse.redirect(new URL("/attendance/mark-attendance?saved=invalid", request.url), 303);
  }

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
    const writes: Promise<AttendanceRecord>[] = [];

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
        writes.push(payload.update({
          collection: "attendance-records",
          data: data as any,
          id: existingID,
          overrideAccess: true,
        }));
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

      writes.push(payload.create({
        collection: "attendance-records",
        data: {
          id: nextID,
          ...data,
        } as any,
        overrideAccess: true,
      }));

      nextID += 1;
    }

    const savedRecords = await Promise.all(writes);

    if (wantsJSON) {
      return NextResponse.json({
        saved: savedRecords.map((record) => ({
          id: record.id,
          member: typeof record.member === "number" ? record.member : record.member?.id,
          present: record.present,
        })),
      });
    }
  } catch {
    if (wantsJSON) {
      return NextResponse.json({ error: "Attendance could not be saved." }, { status: 400 });
    }

    return NextResponse.redirect(new URL("/attendance/mark-attendance?saved=invalid", request.url), 303);
  } finally {
    if (typeof previousDuplicateSetting === "undefined") {
      delete process.env.PAYLOAD_SKIP_ATTENDANCE_DUPLICATE_CHECK;
    } else {
      process.env.PAYLOAD_SKIP_ATTENDANCE_DUPLICATE_CHECK = previousDuplicateSetting;
    }
  }

  if (wantsJSON) {
    return NextResponse.json({ saved: [] });
  }

  return NextResponse.redirect(new URL("/attendance/mark-attendance?saved=1", request.url), 303);
}
