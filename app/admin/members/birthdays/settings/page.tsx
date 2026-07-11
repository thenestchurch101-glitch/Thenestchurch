import Link from "next/link";
import type { BirthdayNotificationSetting } from "@/payload-types";
import { getAdminContext } from "@/payload/utilities/getAdminContext";
import styles from "../../members.module.css";
import { saveBirthdayEmailSettings } from "./actions";

type SearchParams = Promise<{
  saved?: string | string[];
}>;

const takeString = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const formatLastRun = (value: string | null | undefined) => {
  if (!value) return "Never";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(date);
};

export const dynamic = "force-dynamic";

export default async function BirthdayEmailSettingsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const saved = takeString(params.saved);
  const { req } = await getAdminContext("birthday-email-settings-page", {
    allowedRoles: ["admin", "staff"],
  });
  const settings = (await req.payload.findGlobal({
    slug: "birthday-notification-settings",
    req,
  })) as BirthdayNotificationSetting;

  return (
    <main className={styles.page}>
      <div className={styles.stack}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Birthdays</p>
          <h1 className={styles.title}>Birthday Email Settings</h1>
          <p className={styles.lede}>
            Control member birthday messages and the Gmail addresses that receive the daily birthday summary.
          </p>
          <div className={styles.actions}>
            <Link className={styles.secondaryButton} href="/admin/members/birthdays">
              Back To Birthdays
            </Link>
          </div>
        </section>

        {saved === "1" ? (
          <div className={`${styles.banner} ${styles.bannerSuccess}`}>Birthday email settings saved.</div>
        ) : null}
        {saved === "invalid" ? (
          <div className={styles.emptyState}>Enter the send time in HH:mm format, for example 08:00.</div>
        ) : null}

        <form action={saveBirthdayEmailSettings} className={styles.stack}>
          <section className={styles.panel}>
            <div className={styles.panelPad}>
              <h2 className={styles.panelTitle}>Sending</h2>
              <label className={styles.checkboxWrap}>
                <input defaultChecked={Boolean(settings.enabled)} name="enabled" type="checkbox" />
                Enable automatic birthday notifications
              </label>
              <div className={styles.doubleGrid}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="sendTime">Preferred Lagos time</label>
                  <input className={styles.input} defaultValue={settings.sendTime ?? "08:00"} id="sendTime" name="sendTime" type="time" />
                </div>
                <div className={styles.fieldGroup}>
                  <span className={styles.fieldLabel}>Last successful run</span>
                  <p className={styles.panelText}>{formatLastRun(settings.lastRun)}</p>
                </div>
              </div>
              <p className={styles.panelText}>The external cron-job schedule controls the actual execution time.</p>
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelPad}>
              <h2 className={styles.panelTitle}>Gmail Birthday Alerts</h2>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="adminNotificationEmails">Notification email addresses</label>
                <textarea
                  className={styles.textarea}
                  defaultValue={settings.adminNotificationEmails ?? ""}
                  id="adminNotificationEmails"
                  name="adminNotificationEmails"
                  placeholder={"firstperson@gmail.com\nsecondperson@gmail.com"}
                />
                <p className={styles.panelText}>Enter one address per line or separate addresses with commas.</p>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="adminSummarySubject">Summary subject</label>
                <input className={styles.input} defaultValue={settings.adminSummarySubject ?? "Birthday notification summary for {{date}}"} id="adminSummarySubject" name="adminSummarySubject" />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="adminSummaryBody">Summary message</label>
                <textarea className={styles.textarea} defaultValue={settings.adminSummaryBody ?? ""} id="adminSummaryBody" name="adminSummaryBody" />
                <p className={styles.panelText}>Available placeholders: {"{{date}}"}, {"{{memberList}}"}, {"{{sentCount}}"}, {"{{skippedCount}}"}, {"{{failedCount}}"}.</p>
              </div>
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelPad}>
              <h2 className={styles.panelTitle}>Member Birthday Email</h2>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="memberEmailSubject">Member subject</label>
                <input className={styles.input} defaultValue={settings.memberEmailSubject ?? "Happy birthday from The Nest Church"} id="memberEmailSubject" name="memberEmailSubject" />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="memberEmailBody">Member message</label>
                <textarea className={styles.textarea} defaultValue={settings.memberEmailBody ?? ""} id="memberEmailBody" name="memberEmailBody" />
                <p className={styles.panelText}>Available placeholders: {"{{firstName}}"}, {"{{lastName}}"}, {"{{fullName}}"}, {"{{date}}"}.</p>
              </div>
              <div className={styles.actions}>
                <button className={styles.primaryButton} type="submit">Save Birthday Email Settings</button>
              </div>
            </div>
          </section>
        </form>
      </div>
    </main>
  );
}
