import Link from "next/link";
import { notFound } from "next/navigation";
import type { Department, Member } from "@/payload-types";
import { getAdminContext } from "@/payload/utilities/getAdminContext";
import styles from "../departments.module.css";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-NG", {
    dateStyle: "long",
  }).format(new Date(value));

export const dynamic = "force-dynamic";

export default async function DepartmentDetailPage({
  params,
}: PageProps) {
  const departmentID = Number((await params).id);

  if (!Number.isFinite(departmentID)) {
    notFound();
  }

  const { req } = await getAdminContext("custom-admin-department-detail-page", {
    allowedRoles: ["admin", "staff"],
  });
  const payload = req.payload;

  try {
    const [department, membersResult] = await Promise.all([
      payload.findByID({
        collection: "departments",
        depth: 0,
        id: departmentID,
        req,
      }),
      payload.find({
        collection: "members",
        depth: 1,
        limit: 500,
        pagination: false,
        req,
        sort: "fullName",
        where: {
          department: {
            equals: departmentID,
          },
        },
      }),
    ]);

    const dept = department as Department;
    const members = membersResult.docs as Member[];

    return (
      <main className={styles.page}>
        <div className={styles.stack}>
          <section className={styles.hero}>
            <p className={styles.eyebrow}>Departments</p>
            <h1 className={styles.title}>{dept.name}</h1>
            <p className={styles.lede}>Department information, reporting channel, and assigned member roster.</p>
            <div className={styles.actions}>
              <Link className={styles.secondaryButton} href="/admin/departments">
                Back To Departments
              </Link>
              <Link className={styles.ghostButton} href="/admin/departments/report">
                Department Report
              </Link>
            </div>
          </section>

          <div className={styles.detailGrid}>
            <section className={styles.detailCard}>
              <h2 className={styles.panelTitle}>Department Information</h2>
              <div className={styles.detailList}>
                <div className={styles.detailRow}>
                  <span className={styles.detailTerm}>Description</span>
                  <span className={styles.detailValue}>{dept.description || "No description provided"}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailTerm}>Reporting Channel</span>
                  <span className={styles.detailValue}>{dept.reportingChannel || "Not specified"}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailTerm}>Created On</span>
                  <span className={styles.detailValue}>{formatDate(dept.createdAt)}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailTerm}>Status</span>
                  <span className={styles.detailValue}>{dept.isActive ? "Active" : "Inactive"}</span>
                </div>
              </div>
            </section>

            <section className={styles.detailCard}>
              <h2 className={styles.panelTitle}>Members</h2>
              <div className={styles.stats}>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Assigned Members</span>
                  <span className={styles.statValue}>{members.length}</span>
                </div>
              </div>
            </section>
          </div>

          <section className={styles.panel}>
            <div className={styles.panelPad}>
              <h2 className={styles.panelTitle}>Member Roster</h2>
              {members.length === 0 ? (
                <div className={styles.emptyState}>No members are currently assigned to this department.</div>
              ) : (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Contact</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member) => (
                        <tr key={member.id}>
                          <td>
                            <span className={styles.memberName}>{member.fullName}</span>
                            <span className={styles.memberMeta}>{member.email || "No email"}</span>
                          </td>
                          <td>{member.phoneNumber || member.whatsappNumber || "No phone"}</td>
                          <td>
                            <span className={`${styles.pill} ${styles.pillGold}`}>
                              {member.isNewComer ? "Newcomer" : "Regular member"}
                            </span>
                          </td>
                          <td>
                            <Link className={styles.secondaryButton} href={`/admin/members/${member.id}`}>
                              View Member
                            </Link>
                          </td>
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
  } catch {
    notFound();
  }
}
