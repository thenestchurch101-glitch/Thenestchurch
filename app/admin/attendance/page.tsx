import Link from "next/link";
import type { Where } from "payload";
import { AdminPagination } from "@/components/admin-pagination";
import type { AttendanceRecord, Department, Member, Service } from "@/payload-types";
import { getAdminContext } from "@/payload/utilities/getAdminContext";
import { quickMarkAttendance, saveAttendanceRecords } from "./actions";
import styles from "./page.module.css";

type SearchParams = Promise<{
  department?: string | string[];
  date?: string | string[];
  query?: string | string[];
  saved?: string | string[];
  service?: string | string[];
  page?: string | string[];
}>;

type AttendanceRecordWithRelations = AttendanceRecord & {
  member: Member;
  service?: Service | number | null;
};

const takeString = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const formatDateValue = (value: string) => {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "full",
  }).format(parsed);
};

const todayValue = new Date().toISOString().slice(0, 10);
const clampPage = (value: string | undefined) => {
  const parsed = Number.parseInt(value ?? "", 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
};

const getDepartmentName = (department: number | Department | null | undefined) => {
  if (!department || typeof department === "number") {
    return "Unassigned";
  }

  return department.name;
};

const buildMemberWhere = ({
  departmentID,
  query,
}: {
  departmentID?: number;
  query: string;
}): Where | undefined => {
  const trimmed = query.trim();
  const conditions: Where[] = [];

  if (departmentID) {
    conditions.push({
      department: {
        equals: departmentID,
      },
    });
  }

  if (trimmed) {
    conditions.push({
      or: [
        {
          fullName: {
            like: trimmed,
          },
        },
        {
          email: {
            like: trimmed,
          },
        },
        {
          phoneNumber: {
            like: trimmed,
          },
        },
        {
          whatsappNumber: {
            like: trimmed,
          },
        },
      ],
    });
  }

  if (conditions.length === 0) {
    return undefined;
  }

  if (conditions.length === 1) {
    return conditions[0];
  }

  return {
    and: conditions,
  };
};

const buildAttendanceWhere = ({
  date,
  serviceID,
}: {
  date: string;
  serviceID?: number;
}): Where => {
  if (serviceID) {
    return {
      service: {
        equals: serviceID,
      },
    };
  }

  return {
    and: [
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
  };
};

const getStatusBanner = (saved: string | undefined) => {
  switch (saved) {
    case "1":
      return {
        className: `${styles.banner} ${styles.bannerSuccess}`,
        message: "Attendance register saved.",
      };
    case "quick":
      return {
        className: `${styles.banner} ${styles.bannerSuccess}`,
        message: "Member marked present.",
      };
    case "bulk-present":
      return {
        className: `${styles.banner} ${styles.bannerSuccess}`,
        message: "All visible members were marked present and saved.",
      };
    case "bulk-absent":
      return {
        className: `${styles.banner} ${styles.bannerWarn}`,
        message: "All visible members were marked absent and saved.",
      };
    case "missing-date":
      return {
        className: `${styles.banner} ${styles.bannerWarn}`,
        message: "Choose a date before saving attendance.",
      };
    case "invalid":
      return {
        className: `${styles.banner} ${styles.bannerWarn}`,
        message: "The quick-mark request was incomplete.",
      };
    default:
      return null;
  }
};

export const dynamic = "force-dynamic";

export default async function AttendanceRegisterPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const requestedDepartment = takeString(params.department);
  const requestedService = takeString(params.service);
  const requestedDate = takeString(params.date) ?? todayValue;
  const query = takeString(params.query) ?? "";
  const saved = takeString(params.saved);
  const currentPage = clampPage(takeString(params.page));
  const pageSize = 25;
  const banner = getStatusBanner(saved);

  const { req } = await getAdminContext("attendance-register-page", {
    allowedRoles: ["admin", "staff"],
  });
  const payload = req.payload;

  const servicesResult = await payload.find({
    collection: "services",
    depth: 0,
    limit: 24,
    pagination: false,
    req,
    sort: "-date",
    where: {
      isActive: {
        equals: true,
      },
    },
  });
  const departmentsResult = await payload.find({
    collection: "departments",
    depth: 0,
    limit: 100,
    pagination: false,
    req,
    sort: "name",
    where: {
      isActive: {
        equals: true,
      },
    },
  });

  const services = servicesResult.docs as Service[];
  const departments = departmentsResult.docs as Department[];
  const selectedService = requestedService
    ? services.find((service) => String(service.id) === requestedService)
    : undefined;
  const activeDate = selectedService?.date ?? requestedDate;
  const selectedDepartment = requestedDepartment
    ? departments.find((department) => String(department.id) === requestedDepartment)
    : undefined;
  const memberWhere = buildMemberWhere({
    departmentID: selectedDepartment?.id,
    query,
  });

  const membersResult = await payload.find({
    collection: "members",
    depth: 1,
    limit: 1000,
    pagination: false,
    req,
    sort: "fullName",
    where: memberWhere,
  });

  const totalMembers = membersResult.docs.length;
  const totalPages = Math.max(1, Math.ceil(totalMembers / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedMembers = membersResult.docs.slice((safePage - 1) * pageSize, safePage * pageSize);
  const attendanceWhere = buildAttendanceWhere({
    date: activeDate,
    serviceID: selectedService?.id,
  });

  const [attendanceResult, attendanceSummary] = await Promise.all([
    payload.find({
      collection: "attendance-records",
      depth: 1,
      limit: 200,
      pagination: false,
      req,
      sort: "member",
      where: {
        and: [
          attendanceWhere,
          {
            member: {
              in: pagedMembers.map((member) => member.id),
            },
          },
        ],
      },
    }),
    payload.find({
      collection: "attendance-records",
      depth: 1,
      limit: 5000,
      pagination: false,
      req,
      where: attendanceWhere,
    }),
  ]);

  const attendanceByMember = new Map<number, AttendanceRecordWithRelations>();

  for (const record of attendanceResult.docs as AttendanceRecordWithRelations[]) {
    const member = record.member;

    if (member && typeof member !== "number") {
      attendanceByMember.set(member.id, record);
    }
  }

  const summary = {
    present: attendanceSummary.docs.filter((record) => record.present).length,
    total: attendanceSummary.docs.length,
    visibleSaved: attendanceResult.docs.length,
    visitors: attendanceSummary.docs.filter((record) => {
      const member = record.member;
      return typeof member !== "number" && Boolean(member.isNewComer);
    }).length,
  };
  const departmentSummary = new Map<string, { present: number; total: number }>();

  for (const member of pagedMembers) {
    const departmentName = getDepartmentName(member.department);
    const existing = departmentSummary.get(departmentName) ?? { present: 0, total: 0 };
    existing.total += 1;

    if (attendanceByMember.get(member.id)?.present) {
      existing.present += 1;
    }

    departmentSummary.set(departmentName, existing);
  }

  const departmentBreakdown = [...departmentSummary.entries()]
    .map(([name, counts]) => ({
      name,
      ...counts,
    }))
    .sort((left, right) => right.total - left.total || left.name.localeCompare(right.name))
    .slice(0, 6);

  return (
    <div className={styles.page}>
      <div className={styles.stack}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Internal Operations</p>
          <h1 className={styles.title}>Attendance Register</h1>
          <p className={styles.lede}>
            Mark members present and work from a single service/date register instead of raw collection CRUD.
          </p>
        </section>

        {banner ? <div className={banner.className}>{banner.message}</div> : null}

        <div className={styles.grid}>
          <aside className={styles.stack}>
            <section className={styles.panel}>
              <div className={styles.panelPad}>
                <h2 className={styles.panelTitle}>Register Filters</h2>
                <p className={styles.panelText}>Choose a service or work date-only, then narrow the member list.</p>
                <form className={styles.filterForm} action="/admin/attendance" method="get">
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel} htmlFor="service">
                      Service
                    </label>
                    <select className={styles.select} id="service" name="service" defaultValue={requestedService ?? ""}>
                      <option value="">Date-only register</option>
                      {services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name} · {service.date}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel} htmlFor="date">
                      Date
                    </label>
                    <input className={styles.input} id="date" name="date" type="date" defaultValue={activeDate} />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel} htmlFor="department">
                      Department
                    </label>
                    <select
                      className={styles.select}
                      id="department"
                      name="department"
                      defaultValue={requestedDepartment ?? ""}
                    >
                      <option value="">All departments</option>
                      {departments.map((department) => (
                        <option key={department.id} value={department.id}>
                          {department.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel} htmlFor="query">
                      Member Search
                    </label>
                    <input
                      className={styles.input}
                      id="query"
                      name="query"
                      type="search"
                      placeholder="Name, email, or phone"
                      defaultValue={query}
                    />
                  </div>

                  <div className={styles.actions}>
                    <button className={styles.primaryButton} type="submit">
                      Load Register
                    </button>
                    <Link className={styles.secondaryButton} href="/admin/attendance/absentees">
                      Track Absentees
                    </Link>
                    <Link className={styles.secondaryButton} href="/admin/collections/services/create">
                      New Service
                    </Link>
                  </div>
                </form>
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelPad}>
                <h2 className={styles.panelTitle}>Session Snapshot</h2>
                <div className={styles.stats}>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>Register Date</span>
                    <span className={styles.statValue}>{formatDateValue(activeDate)}</span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>Selected Service</span>
                    <span className={styles.statValue}>{selectedService?.name ?? "Date-only"}</span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>Department Filter</span>
                    <span className={styles.statValue}>{selectedDepartment?.name ?? "All"}</span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>Present Count</span>
                    <span className={styles.statValue}>{summary.present}</span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>Newcomers Present</span>
                    <span className={styles.statValue}>{summary.visitors}</span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>Saved Records</span>
                    <span className={styles.statValue}>{summary.total}</span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>Visible Saved</span>
                    <span className={styles.statValue}>{summary.visibleSaved}</span>
                  </div>
                </div>
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelPad}>
                <h2 className={styles.panelTitle}>Visible Department Split</h2>
                {departmentBreakdown.length === 0 ? (
                  <p className={styles.panelText}>No members are visible under the current filters.</p>
                ) : (
                  <div className={styles.breakdown}>
                    {departmentBreakdown.map((item) => (
                      <div className={styles.breakdownRow} key={item.name}>
                        <span className={styles.breakdownLabel}>{item.name}</span>
                        <span className={styles.breakdownValue}>
                          {item.present}/{item.total}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelPad}>
                <h2 className={styles.panelTitle}>Operator Notes</h2>
                <ol className={styles.helperList}>
                  <li>Pick the service first whenever the attendance belongs to a defined church service.</li>
                  <li>Use date-only mode for ad hoc meetings or backfilling older records.</li>
                  <li>Quick Mark saves one member immediately; Save Register writes every visible row.</li>
                </ol>
              </div>
            </section>
          </aside>

          <section className={styles.panel}>
            <div className={styles.panelPad}>
              <h2 className={styles.panelTitle}>Member Register</h2>
              <p className={styles.panelText}>
                {membersResult.docs.length} member{membersResult.docs.length === 1 ? "" : "s"} matched. You are editing{" "}
                {selectedService ? selectedService.name : "a date-only register"} for {formatDateValue(activeDate)}.
              </p>

              {membersResult.docs.length === 0 ? (
                <div className={styles.emptyState}>No members matched the current search.</div>
              ) : (
                <form action={saveAttendanceRecords} className={styles.batchForm}>
                  <input name="date" type="hidden" value={activeDate} />
                  <input name="department" type="hidden" value={requestedDepartment ?? ""} />
                  <input name="query" type="hidden" value={query} />
                  <input name="page" type="hidden" value={String(safePage)} />
                  <input name="service" type="hidden" value={selectedService?.id ?? ""} />

                  <div className={styles.actions}>
                    <button className={styles.primaryButton} type="submit">
                      Save Register
                    </button>
                    <button
                      className={styles.secondaryButton}
                      name="bulkStatus"
                      type="submit"
                      value="present"
                    >
                      Mark Visible Present
                    </button>
                    <button
                      className={styles.secondaryButton}
                      name="bulkStatus"
                      type="submit"
                      value="absent"
                    >
                      Mark Visible Absent
                    </button>
                    <Link
                      className={styles.ghostButton}
                      href={`/admin/collections/attendance-records?where[date][equals]=${encodeURIComponent(activeDate)}`}
                    >
                      Open Raw Records
                    </Link>
                  </div>

                  <AdminPagination
                    currentPage={safePage}
                    pageSize={pageSize}
                    pathname="/admin/attendance"
                    searchParams={{
                      date: activeDate,
                      department: requestedDepartment ?? "",
                      query,
                      service: requestedService ?? "",
                    }}
                    totalItems={totalMembers}
                  />
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Member</th>
                          <th>Department</th>
                          <th>Current Status</th>
                          <th>Present</th>
                          <th>Notes</th>
                          <th>Quick Mark</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedMembers.map((member) => {
                          const record = attendanceByMember.get(member.id);

                          return (
                            <tr key={member.id}>
                              <td>
                                <input name="memberIds" type="hidden" value={member.id} />
                                <input name={`existing_${member.id}`} type="hidden" value={record?.id ?? ""} />
                                <span className={styles.memberName}>{member.fullName}</span>
                                <span className={styles.memberMeta}>
                                  {member.email || member.phoneNumber || member.whatsappNumber || "No contact details"}
                                </span>
                              </td>
                              <td>{getDepartmentName(member.department)}</td>
                              <td>
                                <span
                                  className={`${styles.pill} ${record?.present ? styles.pillPresent : styles.pillMissing}`}
                                >
                                  {record ? (record.present ? "Present saved" : "Marked absent") : "Not yet saved"}
                                </span>
                              </td>
                              <td>
                                <label className={styles.checkWrap}>
                                  <input
                                    defaultChecked={record?.present ?? false}
                                    name={`present_${member.id}`}
                                    type="checkbox"
                                  />
                                  Present
                                </label>
                              </td>
                              <td>
                                <textarea
                                  className={styles.textarea}
                                  defaultValue={record?.notes ?? ""}
                                  name={`notes_${member.id}`}
                                />
                              </td>
                              <td>
                                <button
                                  className={styles.secondaryButton}
                                  formAction={quickMarkAttendance}
                                  name="member"
                                  type="submit"
                                  value={member.id}
                                >
                                  Quick Mark
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </form>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
