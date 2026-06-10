import Link from "next/link";
import type { Department, Service, ServiceReport } from "@/payload-types";
import { getAdminContext } from "@/payload/utilities/getAdminContext";
import styles from "./reports.module.css";

type ServiceReportWithRelations = ServiceReport & {
  department: Department;
  service: Service;
};

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const { req } = await getAdminContext("custom-admin-reports-page", {
    allowedRoles: ["admin", "staff"],
  });
  const payload = req.payload;

  const [servicesResult, departmentsResult, reportsResult] = await Promise.all([
    payload.find({
      collection: "services",
      depth: 0,
      limit: 200,
      pagination: false,
      req,
      sort: "-date",
    }),
    payload.find({
      collection: "departments",
      depth: 0,
      limit: 200,
      pagination: false,
      req,
      sort: "name",
      where: {
        isActive: {
          equals: true,
        },
      },
    }),
    payload.find({
      collection: "service-reports",
      depth: 1,
      limit: 1000,
      pagination: false,
      req,
      sort: "-createdAt",
    }),
  ]);

  const services = servicesResult.docs as Service[];
  const departments = departmentsResult.docs as Department[];
  const reports = reportsResult.docs as ServiceReportWithRelations[];
  const reportCountByService = new Map<number, number>();

  for (const report of reports) {
    if (!report.service || typeof report.service === "number") {
      continue;
    }

    reportCountByService.set(report.service.id, (reportCountByService.get(report.service.id) ?? 0) + 1);
  }

  return (
    <main className={styles.page}>
      <div className={styles.stack}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Reports</p>
          <h1 className={styles.title}>Service Reports</h1>
          <p className={styles.lede}>
            Select a service to review attendance and department submissions, or submit a fresh report for the latest service.
          </p>
          <div className={styles.actions}>
            <Link className={styles.primaryButton} href="/admin/reports/services/new">
              Create Service
            </Link>
            <Link className={styles.primaryButton} href="/admin/reports/submit">
              Submit Report
            </Link>
            <Link className={styles.ghostButton} href="/admin/attendance">
              Attendance Register
            </Link>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelPad}>
            <h2 className={styles.panelTitle}>Snapshot</h2>
            <div className={styles.stats}>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Services</span>
                <span className={styles.statValue}>{services.length}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Departments</span>
                <span className={styles.statValue}>{departments.length}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Reports Submitted</span>
                <span className={styles.statValue}>{reports.length}</span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelPad}>
            <h2 className={styles.panelTitle}>All Services</h2>

            {services.length === 0 ? (
              <div className={styles.emptyState}>No services have been created yet.</div>
            ) : (
              <div className={styles.list}>
                {services.map((service) => {
                  const reportsCount = reportCountByService.get(service.id) ?? 0;
                  const pendingCount = Math.max(0, departments.length - reportsCount);

                  return (
                    <article className={styles.listCard} key={service.id}>
                      <div>
                        <span className={styles.serviceName}>{service.name}</span>
                        <span className={styles.serviceMeta}>
                          {new Intl.DateTimeFormat("en-NG", { dateStyle: "long" }).format(new Date(service.date))}
                          {service.startTime ? ` at ${service.startTime}` : ""}
                        </span>
                        <div className={styles.actions} style={{ marginTop: 12 }}>
                          <span className={`${styles.pill} ${styles.pillBlue}`}>{reportsCount} reports</span>
                          <span className={`${styles.pill} ${pendingCount > 0 ? styles.pillGold : styles.pillGreen}`}>
                            {pendingCount} pending
                          </span>
                        </div>
                      </div>

                      <div className={styles.actions}>
                        <Link className={styles.primaryButton} href={`/admin/reports/submit?service=${service.id}`}>
                          New Report
                        </Link>
                        <Link className={styles.secondaryButton} href={`/admin/reports/${service.id}`}>
                          View Overview
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
