import Link from "next/link";
import type { AttendanceRecord, Department, Member } from "@/payload-types";
import { getAdminContext } from "@/payload/utilities/getAdminContext";
import styles from "../departments.module.css";

type AttendanceRecordWithMember = AttendanceRecord & {
  member: Member;
};

export const dynamic = "force-dynamic";

export default async function DepartmentReportPage() {
  const { req } = await getAdminContext("custom-admin-department-report-page", {
    allowedRoles: ["admin", "staff"],
  });
  const payload = req.payload;

  const [departmentsResult, membersResult, attendanceResult] = await Promise.all([
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
    payload.find({
      collection: "attendance-records",
      depth: 1,
      limit: 5000,
      pagination: false,
      req,
      where: {
        present: {
          equals: true,
        },
      },
    }),
  ]);

  const departments = departmentsResult.docs as Department[];
  const members = membersResult.docs as Member[];
  const attendanceRecords = attendanceResult.docs as AttendanceRecordWithMember[];

  const rows = departments.map((department) => {
    const departmentMembers = members.filter((member) => {
      if (!member.department || typeof member.department === "number") {
        return false;
      }

      return member.department.id === department.id;
    });

    const presentMemberIDs = new Set<number>();

    for (const record of attendanceRecords) {
      const member = record.member;

      if (!member || typeof member === "number" || !member.department || typeof member.department === "number") {
        continue;
      }

      if (member.department.id === department.id) {
        presentMemberIDs.add(member.id);
      }
    }

    const attendanceRate = departmentMembers.length
      ? Math.round((presentMemberIDs.size / departmentMembers.length) * 1000) / 10
      : 0;

    return {
      attendanceRate,
      department,
      memberCount: departmentMembers.length,
      presentCount: presentMemberIDs.size,
    };
  });

  return (
    <main className={styles.page}>
      <div className={styles.stack}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Departments</p>
          <h1 className={styles.title}>Department Report</h1>
          <p className={styles.lede}>Cross-department summary of member count, attendance reach, and reporting channels.</p>
          <div className={styles.actions}>
            <Link className={styles.secondaryButton} href="/admin/departments">
              Back To Departments
            </Link>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelPad}>
            <h2 className={styles.panelTitle}>Department Summary Table</h2>
            {rows.length === 0 ? (
              <div className={styles.emptyState}>No departments are available yet.</div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Department Name</th>
                      <th>Number Of Members</th>
                      <th>Attendance Rate</th>
                      <th>Reporting Channel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.department.id}>
                        <td>
                          <span className={styles.memberName}>{row.department.name}</span>
                        </td>
                        <td>{row.memberCount}</td>
                        <td>{row.attendanceRate}%</td>
                        <td>{row.department.reportingChannel || "Not specified"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
