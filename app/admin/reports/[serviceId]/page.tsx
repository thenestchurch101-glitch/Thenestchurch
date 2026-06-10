import Link from "next/link";
import { notFound } from "next/navigation";
import type { AttendanceRecord, Department, Member, Service, ServiceReport } from "@/payload-types";
import { getAdminContext } from "@/payload/utilities/getAdminContext";
import styles from "../reports.module.css";

type PageProps = {
  params: Promise<{
    serviceId: string;
  }>;
  searchParams: Promise<{
    created?: string | string[];
    saved?: string | string[];
  }>;
};

type AttendanceRecordWithMember = AttendanceRecord & {
  member: Member;
};

type ServiceReportWithRelations = ServiceReport & {
  department: Department;
  service: Service;
  submittedBy?: {
    email?: string | null;
    name?: string | null;
  } | number | null;
};

const takeString = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-NG", {
    dateStyle: "long",
  }).format(new Date(value));

const getDepartmentName = (department: number | Department | null | undefined) => {
  if (!department || typeof department === "number") {
    return "Unassigned";
  }

  return department.name;
};

export const dynamic = "force-dynamic";

export default async function ReportOverviewPage({
  params,
  searchParams,
}: PageProps) {
  const { serviceId } = await params;
  const query = await searchParams;
  const saved = takeString(query.saved);
  const created = takeString(query.created);
  const serviceID = Number(serviceId);

  if (!Number.isFinite(serviceID)) {
    notFound();
  }

  const { req } = await getAdminContext("custom-admin-report-overview-page", {
    allowedRoles: ["admin", "staff"],
  });
  const payload = req.payload;

  try {
    const service = (await payload.findByID({
      collection: "services",
      depth: 0,
      id: serviceID,
      req,
    })) as Service;

    const [reportsResult, attendanceResult, departmentsResult, membersResult] = await Promise.all([
      payload.find({
        collection: "service-reports",
        depth: 1,
        limit: 500,
        pagination: false,
        req,
        sort: "-createdAt",
        where: {
          service: {
            equals: serviceID,
          },
        },
      }),
      payload.find({
        collection: "attendance-records",
        depth: 1,
        limit: 5000,
        pagination: false,
        req,
        where: {
          and: [
            {
              date: {
                equals: service.date,
              },
            },
            {
              present: {
                equals: true,
              },
            },
          ],
        },
      }),
      payload.find({
        collection: "departments",
        depth: 0,
        limit: 500,
        pagination: false,
        req,
        sort: "name",
      }),
      payload.find({
        collection: "members",
        depth: 1,
        limit: 500,
        pagination: false,
        req,
        sort: "fullName",
      }),
    ]);

    const reports = reportsResult.docs as ServiceReportWithRelations[];
    const attendanceRecords = attendanceResult.docs as AttendanceRecordWithMember[];
    const departments = departmentsResult.docs as Department[];
    const members = membersResult.docs as Member[];
    const reportsByDepartment = new Map<number, ServiceReportWithRelations>();

    for (const report of reports) {
      if (report.department && typeof report.department !== "number") {
        reportsByDepartment.set(report.department.id, report);
      }
    }

    const attendanceSummary = {
      totalPresent: attendanceRecords.length,
    };

    const attendanceByDepartment = new Map<string, { count: number }>();

    for (const record of attendanceRecords) {
      const member = record.member;

      if (!member || typeof member === "number") {
        continue;
      }

      const departmentName = getDepartmentName(member.department);
      const counts = attendanceByDepartment.get(departmentName) ?? { count: 0 };
      counts.count += 1;
      attendanceByDepartment.set(departmentName, counts);
    }

    const departmentStats = departments.map((department) => {
      const totalMembers = members.filter((member) => {
        if (!member.department || typeof member.department === "number") {
          return false;
        }

        return member.department.id === department.id;
      }).length;
      const attendanceCount = attendanceRecords.filter((record) => {
        const member = record.member;
        return member && typeof member !== "number" && member.department && typeof member.department !== "number"
          ? member.department.id === department.id
          : false;
      }).length;
      const report = reportsByDepartment.get(department.id);

      return {
        attendanceCount,
        attendanceRate: totalMembers > 0 ? Math.round((attendanceCount / totalMembers) * 1000) / 10 : 0,
        department,
        report,
        totalMembers,
      };
    });

    const pendingDepartments = departments.filter((department) => !reportsByDepartment.has(department.id));

    return (
      <main className={styles.page}>
        <div className={styles.stack}>
        <section className={styles.hero}>
            <p className={styles.eyebrow}>Reports</p>
            <h1 className={styles.title}>{service.name}</h1>
            <p className={styles.lede}>
              {formatDate(service.date)}
              {service.startTime ? ` at ${service.startTime}` : ""} - department reports and attendance summary.
            </p>
            <div className={styles.actions}>
              <Link className={styles.secondaryButton} href="/admin/reports">
                Back To Services
              </Link>
              <Link className={styles.primaryButton} href={`/admin/reports/submit?service=${service.id}`}>
                Submit Report
              </Link>
            </div>
          </section>

          {created === "service" ? (
            <div className={`${styles.banner} ${styles.bannerSuccess}`}>Service created successfully.</div>
          ) : null}
          {saved === "1" ? (
            <div className={`${styles.banner} ${styles.bannerSuccess}`}>Service report submitted successfully.</div>
          ) : null}

          <section className={styles.panel}>
            <div className={styles.panelPad}>
              <h2 className={styles.panelTitle}>Key Metrics</h2>
              <div className={styles.stats}>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Attendance</span>
                  <span className={styles.statValue}>{attendanceSummary.totalPresent}</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Dept Reports</span>
                  <span className={styles.statValue}>{reports.length}</span>
                </div>
              </div>
            </div>
          </section>

          <div className={styles.grid}>
            <section className={styles.panel}>
              <div className={styles.panelPad}>
                <h2 className={styles.panelTitle}>Department Reports</h2>
                {reports.length === 0 ? (
                  <div className={styles.emptyState}>No department reports have been submitted for this service yet.</div>
                ) : (
                  <div className={styles.list}>
                    {reports.map((report) => (
                      <article className={styles.reportCard} key={report.id}>
                        <div className={styles.reportHeader}>
                          <div>
                            <span className={styles.serviceName}>
                              {report.department && typeof report.department !== "number" ? report.department.name : "Department"}
                            </span>
                            <p className={styles.reportMeta}>
                              {report.submittedBy && typeof report.submittedBy !== "number"
                                ? report.submittedBy.name || report.submittedBy.email || "Admin"
                                : "Admin"}
                            </p>
                          </div>
                          <div className={styles.actions}>
                            <span className={`${styles.pill} ${report.isApproved ? styles.pillGreen : styles.pillGold}`}>
                              {report.isApproved ? "Approved" : "Pending"}
                            </span>
                          </div>
                        </div>

                        <div className={styles.actions}>
                          <span className={`${styles.pill} ${styles.pillBlue}`}>{report.departmentAttendance ?? 0} attendance</span>
                          <span className={`${styles.pill} ${styles.pillBlue}`}>{report.volunteersCount ?? 0} volunteers</span>
                        </div>

                        <div className={styles.reportBody}>{report.reportContent}</div>

                        {report.attachmentUrl ? (
                          <a className={styles.ghostButton} href={report.attachmentUrl} rel="noreferrer" target="_blank">
                            Open Attachment
                          </a>
                        ) : null}
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <aside className={styles.stack}>
              <section className={styles.panel}>
                <div className={styles.panelPad}>
                  <h2 className={styles.panelTitle}>Department Statistics</h2>
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Department</th>
                          <th>Attendance</th>
                          <th>Rate</th>
                          <th>Report</th>
                        </tr>
                      </thead>
                      <tbody>
                        {departmentStats.map((item) => (
                          <tr key={item.department.id}>
                            <td>{item.department.name}</td>
                            <td>
                              {item.attendanceCount}/{item.totalMembers}
                            </td>
                            <td>{item.attendanceRate}%</td>
                            <td>
                              <span className={`${styles.pill} ${item.report ? styles.pillGreen : styles.pillRed}`}>
                                {item.report ? "Submitted" : "Pending"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              <section className={styles.panel}>
                <div className={styles.panelPad}>
                  <h2 className={styles.panelTitle}>Attendance By Department</h2>
                  {attendanceByDepartment.size === 0 ? (
                    <div className={styles.emptyState}>No attendance records were saved for this service date.</div>
                  ) : (
                    <div className={styles.list}>
                      {[...attendanceByDepartment.entries()]
                        .sort((left, right) => right[1].count - left[1].count || left[0].localeCompare(right[0]))
                        .map(([name, data]) => (
                          <article className={styles.reportCard} key={name}>
                            <span className={styles.serviceName}>{name}</span>
                            <div className={styles.actions}>
                              <span className={`${styles.pill} ${styles.pillBlue}`}>{data.count} present</span>
                            </div>
                          </article>
                        ))}
                    </div>
                  )}
                </div>
              </section>

              <section className={styles.panel}>
                <div className={styles.panelPad}>
                  <h2 className={styles.panelTitle}>Pending Departments</h2>
                  {pendingDepartments.length === 0 ? (
                    <div className={styles.emptyState}>Every department has submitted a report for this service.</div>
                  ) : (
                    <div className={styles.list}>
                      {pendingDepartments.map((department) => (
                        <article className={styles.reportCard} key={department.id}>
                          <span className={styles.serviceName}>{department.name}</span>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section className={styles.panel}>
                <div className={styles.panelPad}>
                  <h2 className={styles.panelTitle}>Migration Status</h2>
                  <p className={styles.panelText}>
                    The old Django overview also showed donations, prayer requests, testimonies, events, livestreams, and counseling. Those
                    modules are not migrated into Payload yet, so this overview currently focuses on attendance and department reports.
                  </p>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>
    );
  } catch {
    notFound();
  }
}
