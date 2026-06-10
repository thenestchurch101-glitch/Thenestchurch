import configPromise from "@payload-config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";
import type { Admin } from "@/payload-types";
import { hasAdminRole, isDepartmentLeadOnly, type AdminRole } from "@/payload/utilities/adminRoles";
import { AdminSidebar } from "./admin-sidebar";
import styles from "./admin-layout.module.css";

const navItems: {
  allowedRoles: AdminRole[];
  href: string;
  label: string;
}[] = [
  {
    allowedRoles: ["admin", "staff", "absentee-viewer"],
    href: "/admin",
    label: "Dashboard",
  },
  {
    allowedRoles: ["admin", "staff"],
    href: "/admin/members",
    label: "Members",
  },
  {
    allowedRoles: ["admin", "staff"],
    href: "/admin/reports",
    label: "Reports",
  },
  {
    allowedRoles: ["admin", "staff"],
    href: "/admin/departments",
    label: "Departments",
  },
  {
    allowedRoles: ["admin", "staff"],
    href: "/admin/attendance",
    label: "Attendance",
  },
  {
    allowedRoles: ["admin", "staff", "absentee-viewer"],
    href: "/admin/attendance/absentees",
    label: "Absentees",
  },
];

const getCurrentAdminUser = async (incomingHeaders: Headers) => {
  try {
    const payload = await getPayload({
      config: configPromise,
      key: "thenestchurch-app",
    });
    const authResult = await payload.auth({
      canSetHeaders: false,
      headers: new Headers(incomingHeaders),
    });

    return (authResult.user ?? null) as Admin | null;
  } catch {
    return null;
  }
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const incomingHeaders = await headers();
  const currentPath = incomingHeaders.get("x-current-path") ?? "";

  if (currentPath.startsWith("/admin/login")) {
    return <>{children}</>;
  }

  const user = await getCurrentAdminUser(incomingHeaders);

  if (isDepartmentLeadOnly(user)) {
    redirect("/department-head/reports/submit");
  }

  const visibleNavItems = user
    ? navItems
        .filter((item) => hasAdminRole(user, item.allowedRoles))
        .map(({ href, label }) => ({ href, label }))
    : navItems.map(({ href, label }) => ({ href, label }));

  return (
    <div className={styles.container}>
      <AdminSidebar user={user} navItems={visibleNavItems} />
      <div className={styles.mainArea}>
        {/* Content Header (Desktop) */}
        <header className={styles.contentHeader}>
          <h1 className={styles.headerTitle}>System Panel</h1>
          <div className={styles.headerMeta}>
            <span className={styles.dateBadge}>
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </header>

        {/* Dynamic page contents */}
        <main className={styles.pageBody}>{children}</main>
      </div>
    </div>
  );
}
