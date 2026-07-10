import { Pool } from "pg";

const defaultMemberSubject = "Happy birthday from The Nest Church";
const defaultMemberBody =
  "Dear {{firstName}},\n\nHappy birthday from The Nest Church. We celebrate God's goodness in your life today and pray that this new year is filled with grace, joy, and strength.\n\nWith love,\nThe Nest Church";
const defaultAdminSummarySubject = "Birthday notification summary for {{date}}";
const defaultAdminSummaryBody =
  "Birthday notifications were processed for {{date}}.\n\nSent: {{sentCount}}\nSkipped: {{skippedCount}}\nFailed: {{failedCount}}\n\nMembers:\n{{memberList}}";
const advisoryLockName = "thenestchurch-birthday-email-run";

const formatLagosDate = (date) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Africa/Lagos",
    year: "numeric",
  }).formatToParts(date);
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    day: Number(lookup.day),
    iso: `${lookup.year}-${lookup.month}-${lookup.day}`,
    month: Number(lookup.month),
  };
};

const getRunDate = (dateOverride) => {
  if (!dateOverride) {
    return formatLagosDate(new Date());
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOverride)) {
    throw new Error("date must use YYYY-MM-DD.");
  }

  const date = new Date(`${dateOverride}T12:00:00+01:00`);

  if (Number.isNaN(date.getTime()) || formatLagosDate(date).iso !== dateOverride) {
    throw new Error("date must be a real date using YYYY-MM-DD.");
  }

  return formatLagosDate(date);
};

const parseEmails = (value) =>
  String(value ?? "")
    .split(/[\n,]/)
    .map((email) => email.trim())
    .filter(Boolean);

const renderTemplate = (template, values) =>
  String(template ?? "").replace(/\{\{(\w+)\}\}/g, (_, key) => String(values[key] ?? ""));

const toPlainTextHtml = (text) =>
  String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
    .replace(/\r?\n/g, "<br />");

const sendEmail = async ({ apiKey, dryRun, from, idempotencyKey, subject, text, to }) => {
  if (dryRun) {
    return;
  }

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is required to send birthday emails.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      from,
      html: toPlainTextHtml(text),
      subject,
      text,
      to: Array.isArray(to) ? to : [to],
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    method: "POST",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend email failed with ${response.status}: ${body}`);
  }
};

const getSettings = async (client) => {
  const result = await client.query(
    `select enabled,
            last_run,
            admin_notification_emails,
            member_email_subject,
            member_email_body,
            admin_summary_subject,
            admin_summary_body
       from birthday_notification_settings
      order by id
      limit 1`,
  );

  return (
    result.rows[0] ?? {
      admin_notification_emails: "",
      admin_summary_body: defaultAdminSummaryBody,
      admin_summary_subject: defaultAdminSummarySubject,
      enabled: false,
      last_run: null,
      member_email_body: defaultMemberBody,
      member_email_subject: defaultMemberSubject,
    }
  );
};

const getBirthdayMembers = async (client, runDate) => {
  const result = await client.query(
    `select id,
            first_name,
            last_name,
            full_name,
            email,
            date_of_birth
       from members
      where date_of_birth is not null
        and extract(month from date_of_birth) = $1
        and extract(day from date_of_birth) = $2
      order by full_name`,
    [runDate.month, runDate.day],
  );

  return result.rows;
};

const getAlreadySentMemberIDs = async (client, runDate) => {
  const result = await client.query(
    `select distinct member_id
       from birthday_notification_logs
      where run_date = $1::date
        and member_id is not null
        and status = 'sent'
        and dry_run = false`,
    [runDate.iso],
  );

  return new Set(result.rows.map((row) => String(row.member_id)));
};

const logAttempt = async ({ client, dryRun, member, message, recipientEmail, runDate, status }) => {
  await client.query(
    `insert into birthday_notification_logs
      (run_date, member_id, recipient_email, status, message, dry_run, updated_at, created_at)
     values ($1::date, $2, $3, $4, $5, $6, now(), now())`,
    [runDate.iso, member?.id ?? null, recipientEmail, status, message, dryRun],
  );
};

export const runBirthdayEmails = async ({
  databaseUrl = process.env.DATABASE_URL,
  date,
  dryRun = false,
  emailFrom = process.env.EMAIL_FROM || process.env.RESEND_FROM_EMAIL || "The Nest Church <no-reply@thenestchurch.org>",
  force = false,
  log = () => {},
  resendApiKey = process.env.RESEND_API_KEY,
} = {}) => {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is missing.");
  }

  const runDate = getRunDate(date);
  const pool = new Pool({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 10000,
    max: 1,
  });
  const client = await pool.connect();
  let lockAcquired = false;

  try {
    const lockResult = await client.query("select pg_try_advisory_lock(hashtext($1)) as acquired", [advisoryLockName]);
    lockAcquired = Boolean(lockResult.rows[0]?.acquired);

    if (!lockAcquired) {
      return { date: runDate.iso, dryRun, failed: 0, reason: "A birthday run is already in progress.", sent: 0, skipped: 0, status: "already-running" };
    }

    log(`Loading birthday settings for ${runDate.iso}.`);
    const settings = await getSettings(client);

    if (!settings.enabled && !force) {
      return { date: runDate.iso, dryRun, failed: 0, reason: "Birthday notifications are disabled in admin settings.", sent: 0, skipped: 0, status: "disabled" };
    }

    const alreadyRan = settings.last_run
      ? formatLagosDate(new Date(settings.last_run)).iso === runDate.iso
      : false;

    if (alreadyRan && !force && !dryRun) {
      return { date: runDate.iso, dryRun, failed: 0, reason: "Birthday notifications have already run today.", sent: 0, skipped: 0, status: "already-completed" };
    }

    log("Loading members with birthdays.");
    const birthdayMembers = await getBirthdayMembers(client, runDate);
    const alreadySentMemberIDs = dryRun ? new Set() : await getAlreadySentMemberIDs(client, runDate);
    log(`Found ${birthdayMembers.length} birthday member(s) for ${runDate.iso}.`);

    const summary = { failed: [], sent: [], skipped: [] };

    for (const member of birthdayMembers) {
      const recipientEmail = member.email;

      if (alreadySentMemberIDs.has(String(member.id))) {
        summary.skipped.push(member);
        continue;
      }

      if (!recipientEmail) {
        summary.skipped.push(member);
        await logAttempt({ client, dryRun, runDate, member, recipientEmail: null, status: "skipped", message: "Member has no email address." });
        continue;
      }

      const templateValues = {
        date: runDate.iso,
        firstName: member.first_name,
        fullName: member.full_name,
        lastName: member.last_name,
      };
      const body = renderTemplate(settings.member_email_body || defaultMemberBody, templateValues);

      try {
        await sendEmail({
          apiKey: resendApiKey,
          dryRun,
          from: emailFrom,
          idempotencyKey: `birthday-member-${runDate.iso}-${member.id}`,
          subject: renderTemplate(settings.member_email_subject || defaultMemberSubject, templateValues),
          text: body,
          to: recipientEmail,
        });
        summary.sent.push(member);
        await logAttempt({ client, dryRun, runDate, member, recipientEmail, status: "sent", message: dryRun ? "Dry run: email not sent." : "Birthday email sent." });
      } catch (error) {
        summary.failed.push(member);
        await logAttempt({ client, dryRun, runDate, member, recipientEmail, status: "failed", message: error instanceof Error ? error.message : "Unknown email error." });
      }
    }

    const adminEmails = parseEmails(settings.admin_notification_emails);
    const memberList =
      birthdayMembers.map((member) => `- ${member.full_name || member.email || `Member ${member.id}`}`).join("\n") ||
      "- No birthdays today";
    const summaryValues = {
      date: runDate.iso,
      failedCount: summary.failed.length,
      memberList,
      sentCount: summary.sent.length,
      skippedCount: summary.skipped.length,
    };
    const summaryBody = renderTemplate(settings.admin_summary_body || defaultAdminSummaryBody, summaryValues);

    for (const email of summary.failed.length === 0 ? adminEmails : []) {
      try {
        await sendEmail({
          apiKey: resendApiKey,
          dryRun,
          from: emailFrom,
          idempotencyKey: `birthday-summary-${runDate.iso}-${email}`,
          subject: renderTemplate(settings.admin_summary_subject || defaultAdminSummarySubject, summaryValues),
          text: summaryBody,
          to: email,
        });
      } catch (error) {
        log(`Admin birthday summary failed for ${email}: ${error instanceof Error ? error.message : error}`);
      }
    }

    if (!dryRun && summary.failed.length === 0) {
      await client.query("update birthday_notification_settings set last_run = now(), updated_at = now()");
    }

    return {
      date: runDate.iso,
      dryRun,
      failed: summary.failed.length,
      sent: summary.sent.length,
      skipped: summary.skipped.length,
      status: summary.failed.length > 0 ? "partial-failure" : "completed",
      totalBirthdays: birthdayMembers.length,
    };
  } finally {
    if (lockAcquired) {
      await client.query("select pg_advisory_unlock(hashtext($1))", [advisoryLockName]).catch(() => undefined);
    }
    client.release();
    await pool.end();
  }
};
