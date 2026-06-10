import Link from "next/link";
import { notFound } from "next/navigation";
import type { AttendanceRecord, Department, Media, Member } from "@/payload-types";
import { hasAdminRole } from "@/payload/utilities/adminRoles";
import { getAdminContext } from "@/payload/utilities/getAdminContext";
import styles from "../members.module.css";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    updated?: string | string[];
  }>;
};

type AttendanceRecordWithMember = AttendanceRecord & {
  member: Member;
};

const getDepartmentName = (department: number | Department | null | undefined) => {
  if (!department || typeof department === "number") {
    return "Unassigned";
  }

  return department.name;
};

const formatDate = (value: string | null | undefined) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
  }).format(date);
};

const getInitials = (member: Member) =>
  `${member.firstName?.[0] ?? ""}${member.lastName?.[0] ?? ""}`.toUpperCase() || "M";

const getMediaUrl = (media: number | Media | null | undefined) => {
  if (!media || typeof media === "number") {
    return null;
  }

  return media.url ?? null;
};

export const dynamic = "force-dynamic";

export default async function MemberDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const updatedValue = await searchParams;
  const memberID = Number(id);

  if (!Number.isFinite(memberID)) {
    notFound();
  }

  const { req } = await getAdminContext("custom-admin-member-detail-page", {
    allowedRoles: ["admin", "staff", "absentee-viewer"],
  });
  const payload = req.payload;
  const canManageMembers = hasAdminRole(req.user, ["admin", "staff"]);

  try {
    const member = (await payload.findByID({
      collection: "members",
      depth: 1,
      id: memberID,
      req,
    })) as Member;

    const attendanceResult = await payload.find({
      collection: "attendance-records",
      depth: 1,
      limit: 500,
      pagination: false,
      req,
      sort: "-date",
      where: {
        member: {
          equals: memberID,
        },
      },
    });

    const attendanceRecords = attendanceResult.docs as AttendanceRecordWithMember[];

    return (
      <main className={styles.page}>
        <div className={styles.stack}>
          {(Array.isArray(updatedValue.updated) ? updatedValue.updated[0] : updatedValue.updated) === "1" ? (
            <div className={`${styles.banner} ${styles.bannerSuccess}`}>Member details updated.</div>
          ) : null}
          <section className={styles.hero}>
            <p className={styles.eyebrow}>Members</p>
            <h1 className={styles.title}>{member.fullName}</h1>
            <p className={styles.lede}>Member details and attendance records from the custom church management portal.</p>
            <div className={styles.actions}>
              <Link className={styles.secondaryButton} href={canManageMembers ? "/admin/members" : "/admin/attendance/absentees"}>
                {canManageMembers ? "Back To Members" : "Back To Absentees"}
              </Link>
              {canManageMembers ? (
                <>
                  <Link className={styles.primaryButton} href={`/admin/members/${member.id}/edit`}>
                    Edit Member
                  </Link>
                  <Link className={styles.ghostButton} href="/admin/attendance">
                    Attendance Register
                  </Link>
                </>
              ) : null}
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.profileHeader} />
            <div className={styles.profileBody}>
              <div className={styles.avatarRow}>
                <div className={styles.avatar}>
                  {getMediaUrl(member.profilePicture) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img alt={member.fullName ?? "Member"} src={getMediaUrl(member.profilePicture) ?? ""} />
                  ) : (
                    <span>{getInitials(member)}</span>
                  )}
                </div>
                <div className={styles.profileCopy}>
                  <h2>{member.fullName}</h2>
                  <p>{member.email || member.phoneNumber || member.whatsappNumber || "No contact details"}</p>
                  {member.nickname ? <p>&quot;{member.nickname}&quot;</p> : null}
                </div>
              </div>

              <div className={styles.detailGrid}>
                <section className={styles.detailCard}>
                  <h2 className={styles.panelTitle}>Personal Details</h2>
                  <div className={styles.detailList}>
                    <div className={styles.detailRow}>
                      <span className={styles.detailTerm}>Phone Number</span>
                      <span className={styles.detailValue}>{member.phoneNumber || "-"}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailTerm}>WhatsApp</span>
                      <span className={styles.detailValue}>{member.whatsappNumber || "-"}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailTerm}>Date of Birth</span>
                      <span className={styles.detailValue}>{formatDate(member.dateOfBirth)}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailTerm}>Nationality</span>
                      <span className={styles.detailValue}>{member.nationality || "-"}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailTerm}>Tribe</span>
                      <span className={styles.detailValue}>{member.tribe || "-"}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailTerm}>Marital Status</span>
                      <span className={styles.detailValue}>{member.maritalStatus || "-"}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailTerm}>Instagram</span>
                      <span className={styles.detailValue}>{member.instagramHandle || "-"}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailTerm}>Facebook</span>
                      <span className={styles.detailValue}>{member.facebookHandle || "-"}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailTerm}>X</span>
                      <span className={styles.detailValue}>{member.xHandle || "-"}</span>
                    </div>
                  </div>
                </section>

                <section className={styles.detailCard}>
                  <h2 className={styles.panelTitle}>Church Details</h2>
                  <div className={styles.detailList}>
                    <div className={styles.detailRow}>
                      <span className={styles.detailTerm}>Department</span>
                      <span className={styles.detailValue}>{getDepartmentName(member.department)}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailTerm}>Preferred Department</span>
                      <span className={styles.detailValue}>{getDepartmentName(member.preferredDepartment)}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailTerm}>Date Joined</span>
                      <span className={styles.detailValue}>{formatDate(member.dateJoined)}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailTerm}>Newcomer</span>
                      <span className={styles.detailValue}>{member.isNewComer ? "Yes" : "No"}</span>
                    </div>
                  </div>
                </section>

                <section className={styles.detailCard}>
                  <h2 className={styles.panelTitle}>Work And Interests</h2>
                  <div className={styles.detailList}>
                    <div className={styles.detailRow}>
                      <span className={styles.detailTerm}>Occupation</span>
                      <span className={styles.detailValue}>{member.occupation || "-"}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailTerm}>Company</span>
                      <span className={styles.detailValue}>{member.company || "-"}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailTerm}>Role</span>
                      <span className={styles.detailValue}>{member.role || "-"}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailTerm}>Skills</span>
                      <span className={styles.detailValue}>{member.skills || "-"}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailTerm}>Hobbies</span>
                      <span className={styles.detailValue}>{member.hobbies || "-"}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailTerm}>Favorite Verse</span>
                      <span className={styles.detailValue}>{member.favoriteVerse || "-"}</span>
                    </div>
                  </div>
                </section>
              </div>

              {member.homeAddress ? (
                <section className={styles.detailCard}>
                  <h2 className={styles.panelTitle}>Home Address</h2>
                  <p className={styles.panelText}>{member.homeAddress}</p>
                </section>
              ) : null}
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelPad}>
              <h2 className={styles.panelTitle}>Attendance Records</h2>
              <p className={styles.panelText}>
                {attendanceRecords.length} attendance record{attendanceRecords.length === 1 ? "" : "s"} found for this
                member.
              </p>

              {attendanceRecords.length === 0 ? (
                <div className={styles.emptyState}>No attendance records were found for this member.</div>
              ) : (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Service</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceRecords.map((attendance) => (
                        <tr key={attendance.id}>
                          <td>{formatDate(attendance.date)}</td>
                          <td>
                            <span
                              className={`${styles.pill} ${attendance.present ? styles.pillGold : styles.pillRed}`}
                            >
                              {attendance.present ? "Present" : "Absent"}
                            </span>
                          </td>
                          <td>
                            {attendance.service && typeof attendance.service !== "number"
                              ? attendance.service.name
                              : "Date-only record"}
                          </td>
                          <td>{attendance.notes || "-"}</td>
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
