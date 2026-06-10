import type { Department, ReportInstruction, ReportTemplate, Service } from "@/payload-types";
import { getDepartmentHeadContext } from "@/payload/utilities/getDepartmentHeadContext";
import { submitDepartmentHeadReport } from "./actions";
import styles from "@/app/admin/reports/reports.module.css";

type SearchParams = Promise<{
  saved?: string | string[];
  service?: string | string[];
}>;

const takeString = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const getBanner = (value: string | undefined) => {
  switch (value) {
    case "duplicate":
      return {
        className: `${styles.banner} ${styles.bannerWarn}`,
        message: "A report for your department and that service already exists.",
      };
    case "invalid":
      return {
        className: `${styles.banner} ${styles.bannerWarn}`,
        message: "Choose a service and complete the report content.",
      };
    case "1":
      return {
        className: `${styles.banner} ${styles.bannerSuccess}`,
        message: "Service report submitted successfully.",
      };
    default:
      return null;
  }
};

export const dynamic = "force-dynamic";

export default async function DepartmentHeadSubmitReportPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const requestedService = takeString(params.service);
  const banner = getBanner(takeString(params.saved));
  const { departmentID, req, user } = await getDepartmentHeadContext();
  const payload = req.payload;

  const [servicesResult, departmentsResult, instructionsResult, templatesResult] = await Promise.all([
    payload.find({
      collection: "services",
      depth: 0,
      limit: 200,
      pagination: false,
      req,
      sort: "-date",
      where: {
        isActive: {
          equals: true,
        },
      },
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
      collection: "report-instructions",
      depth: 1,
      limit: 100,
      pagination: false,
      req,
      sort: "title",
      where: {
        isActive: {
          equals: true,
        },
      },
    }),
    payload.find({
      collection: "report-templates",
      depth: 1,
      limit: 100,
      pagination: false,
      req,
      sort: "title",
      where: {
        isActive: {
          equals: true,
        },
      },
    }),
  ]);

  const services = servicesResult.docs as Service[];
  const selectedDepartment = (departmentsResult.docs as Department[]).find((department) => department.id === departmentID);
  const instructions = (instructionsResult.docs as ReportInstruction[]).filter((instruction) => {
    if (!instruction.department || typeof instruction.department === "number") {
      return true;
    }

    return instruction.department.id === departmentID;
  });
  const templates = (templatesResult.docs as ReportTemplate[]).filter((template) => {
    if (!template.applicableDepartments || template.applicableDepartments.length === 0) {
      return true;
    }

    return template.applicableDepartments.some((department) => {
      const id = typeof department === "number" ? department : department.id;
      return id === departmentID;
    });
  });
  const firstTemplate = templates[0]?.content ?? "";

  return (
    <main className={styles.page}>
      <div className={styles.stack}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Department Head Portal</p>
          <h1 className={styles.title}>Submit Service Report</h1>
          <p className={styles.lede}>
            {selectedDepartment?.name ?? "Your department"} report submission for {user.name || user.email}.
          </p>
        </section>

        {banner ? <div className={banner.className}>{banner.message}</div> : null}

        <div className={styles.grid}>
          <aside className={styles.stack}>
            <section className={styles.panel}>
              <div className={styles.panelPad}>
                <h2 className={styles.panelTitle}>Report Guidance</h2>
                <ol className={styles.panelText}>
                  <li>Choose the service first.</li>
                  <li>Submit one report for your department per service.</li>
                  <li>Include key activities, highlights, challenges, and follow-up notes.</li>
                </ol>
                {instructions.length > 0 ? (
                  <div className={styles.list}>
                    {instructions.map((instruction) => (
                      <article className={styles.reportCard} key={instruction.id}>
                        <span className={styles.serviceName}>{instruction.title}</span>
                        <p className={styles.panelText}>{instruction.content}</p>
                      </article>
                    ))}
                  </div>
                ) : null}
                {templates.length > 0 ? (
                  <div className={styles.list}>
                    <h3 className={styles.panelTitle}>Templates</h3>
                    {templates.map((template) => (
                      <article className={styles.reportCard} key={template.id}>
                        <span className={styles.serviceName}>{template.title}</span>
                        <pre className={styles.templateText}>{template.content}</pre>
                      </article>
                    ))}
                  </div>
                ) : null}
              </div>
            </section>
          </aside>

          <section className={styles.panel}>
            <div className={styles.panelPad}>
              <h2 className={styles.panelTitle}>Department Submission</h2>
              <form action={submitDepartmentHeadReport} className={styles.form}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="title">
                    Report Title
                  </label>
                  <input className={styles.input} id="title" name="title" placeholder="e.g. Choir Department Report" type="text" />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="service">
                    Service
                  </label>
                  <select className={styles.select} defaultValue={requestedService ?? ""} id="service" name="service">
                    <option value="">Select service</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} - {service.date}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="departmentName">
                    Department
                  </label>
                  <input
                    className={styles.input}
                    id="departmentName"
                    readOnly
                    value={selectedDepartment?.name ?? `Department ${departmentID}`}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="reportContent">
                    Report Content
                  </label>
                  <textarea
                    className={styles.textarea}
                    defaultValue={firstTemplate}
                    id="reportContent"
                    name="reportContent"
                    placeholder="Summarize the department's activities, observations, highlights, and issues."
                  />
                </div>

                <div className={styles.grid} style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel} htmlFor="departmentAttendance">
                      Department Attendance
                    </label>
                    <input className={styles.input} id="departmentAttendance" min={0} name="departmentAttendance" type="number" />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel} htmlFor="volunteersCount">
                      Volunteers Count
                    </label>
                    <input className={styles.input} id="volunteersCount" min={0} name="volunteersCount" type="number" />
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="attachmentUrl">
                    Attachment URL
                  </label>
                  <input className={styles.input} id="attachmentUrl" name="attachmentUrl" placeholder="https://..." type="url" />
                </div>

                <div className={styles.actions}>
                  <button className={styles.primaryButton} type="submit">
                    Submit Report
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
