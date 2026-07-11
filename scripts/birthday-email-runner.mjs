import { Pool } from "pg";

const defaultMemberSubject = "Happy birthday from The Nest Church";
const defaultMemberBody =
  "Dear {{firstName}},\n\nHappy birthday from The Nest Church. We celebrate God's goodness in your life today and pray that this new year is filled with grace, joy, and strength.\n\nWith love,\nThe Nest Church";
const legacyAdminSummarySubject = "Birthday notification summary for {{date}}";
const legacyAdminSummaryBody =
  "Birthday notifications were processed for {{date}}.\n\nSent: {{sentCount}}\nSkipped: {{skippedCount}}\nFailed: {{failedCount}}\n\nMembers:\n{{memberList}}";
const defaultAdminSummarySubject = "Birthday list for the week of {{date}}";
const defaultAdminSummaryBody =
  "Here are the members celebrating birthdays from Sunday through Saturday, beginning {{date}}.\n\n{{memberList}}";
const advisoryLockName = "thenestchurch-birthday-email-run";

const formatLagosDate = (date) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Africa/Lagos",
    weekday: "short",
    year: "numeric",
  }).formatToParts(date);
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    day: Number(lookup.day),
    iso: `${lookup.year}-${lookup.month}-${lookup.day}`,
    month: Number(lookup.month),
    weekday: lookup.weekday,
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

const renderBrandedEmail = ({ content, eyebrow, logoUrl, title }) => `<!doctype html>
<html>
  <body style="margin:0;background:#f6f1e8;color:#211b17;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f1e8;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 10px 35px rgba(38,25,20,.08);">
            <tr>
              <td style="background:#171313;padding:24px 30px;text-align:center;">
                <img src="${logoUrl}" width="150" alt="The Nest Church" style="display:inline-block;max-width:150px;height:auto;border:0;" />
              </td>
            </tr>
            <tr>
              <td style="background:linear-gradient(135deg,#9f1223,#4b1719);padding:30px;color:#fffaf2;">
                <div style="color:#f3c44d;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">${toPlainTextHtml(eyebrow)}</div>
                <h1 style="margin:10px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.2;color:#ffffff;">${toPlainTextHtml(title)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;font-size:16px;line-height:1.7;color:#3d342e;">${content}</td>
            </tr>
            <tr>
              <td style="padding:20px 30px;background:#fbf8f2;border-top:1px solid #eee4d7;text-align:center;color:#766c64;font-size:12px;line-height:1.5;">
                Sent with love by The Nest Church<br />This is an automated birthday notification.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

const sendEmail = async ({ apiKey, dryRun, from, html, idempotencyKey, subject, text, to }) => {
  if (dryRun) {
    return;
  }

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is required to send birthday emails.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      from,
      html: html || toPlainTextHtml(text),
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
            phone_number,
            whatsapp_number,
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

const getWeeklyBirthdayMembers = async (client, runDate) => {
  const result = await client.query(
    `select id,
            first_name,
            last_name,
            full_name,
            email,
            phone_number,
            whatsapp_number,
            date_of_birth
       from members
      where date_of_birth is not null
      order by full_name`,
  );
  const weekDates = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(`${runDate.iso}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() + offset);
    return {
      day: date.getUTCDate(),
      iso: date.toISOString().slice(0, 10),
      month: date.getUTCMonth() + 1,
    };
  });
  const dateByMonthDay = new Map(weekDates.map((date) => [`${date.month}-${date.day}`, date.iso]));

  return result.rows
    .map((member) => {
      const birthDate = new Date(member.date_of_birth);
      const birthdayThisWeek = dateByMonthDay.get(`${birthDate.getUTCMonth() + 1}-${birthDate.getUTCDate()}`);
      return birthdayThisWeek ? { ...member, birthday_this_week: birthdayThisWeek } : null;
    })
    .filter(Boolean)
    .sort((left, right) =>
      left.birthday_this_week.localeCompare(right.birthday_this_week) ||
      String(left.full_name || "").localeCompare(String(right.full_name || "")),
    );
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
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.thenestexpression.com",
} = {}) => {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is missing.");
  }

  const runDate = getRunDate(date);
  const logoUrl = `${siteUrl.replace(/\/$/, "")}/images/logo1.png`;
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
          html: renderBrandedEmail({
            content: toPlainTextHtml(body),
            eyebrow: "Celebrating You",
            logoUrl,
            title: `Happy Birthday, ${member.first_name || member.full_name || "Dear Member"}!`,
          }),
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

    const isWeeklySummaryDay = runDate.weekday === "Sun";
    const adminEmails = isWeeklySummaryDay ? parseEmails(settings.admin_notification_emails) : [];
    const weeklyBirthdayMembers = isWeeklySummaryDay
      ? await getWeeklyBirthdayMembers(client, runDate)
      : [];
    if (isWeeklySummaryDay) {
      log(`Found ${weeklyBirthdayMembers.length} birthday member(s) for the Sunday-to-Saturday digest.`);
    }
    const getMemberPhone = (member) => member.phone_number || member.whatsapp_number || "No phone number";
    const memberList =
      weeklyBirthdayMembers
        .map((member) => `- ${member.birthday_this_week}: ${member.full_name || `Member ${member.id}`} | Phone: ${getMemberPhone(member)} | Email: ${member.email || "No email"}`)
        .join("\n") ||
      "- No birthdays this week";
    const summaryValues = {
      date: runDate.iso,
      failedCount: summary.failed.length,
      memberList,
      sentCount: summary.sent.length,
      skippedCount: summary.skipped.length,
    };
    const summaryBodyTemplate = !settings.admin_summary_body || settings.admin_summary_body === legacyAdminSummaryBody
      ? defaultAdminSummaryBody
      : settings.admin_summary_body;
    const summarySubjectTemplate = !settings.admin_summary_subject || settings.admin_summary_subject === legacyAdminSummarySubject
      ? defaultAdminSummarySubject
      : settings.admin_summary_subject;
    const summaryBody = renderTemplate(summaryBodyTemplate, summaryValues);
    const memberCards = weeklyBirthdayMembers.length
      ? weeklyBirthdayMembers
          .map(
            (member) => `
              <div style="margin:0 0 14px;padding:18px;border:1px solid #eaded2;border-left:4px solid #a91427;border-radius:12px;background:#fffdf9;">
                <div style="font-size:18px;font-weight:700;color:#73101d;">${toPlainTextHtml(member.full_name || `Member ${member.id}`)}</div>
                <div style="margin-top:7px;color:#4e453f;"><strong>Birthday:</strong> ${toPlainTextHtml(member.birthday_this_week)}</div>
                <div style="margin-top:7px;color:#4e453f;"><strong>Phone:</strong> ${toPlainTextHtml(getMemberPhone(member))}</div>
                <div style="margin-top:3px;color:#4e453f;"><strong>Email:</strong> ${toPlainTextHtml(member.email || "No email")}</div>
              </div>`,
          )
          .join("")
      : '<div style="padding:18px;border-radius:12px;background:#fbf8f2;color:#766c64;">No birthdays this week.</div>';
    const summaryHtml = renderBrandedEmail({
      content: `
        <p style="margin:0 0 20px;">Here ${weeklyBirthdayMembers.length === 1 ? "is the member" : "are the members"} celebrating from Sunday through Saturday:</p>
        ${memberCards}
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:22px;background:#f8f3eb;border-radius:12px;">
          <tr>
            <td style="padding:15px;text-align:center;"><strong style="display:block;font-size:22px;color:#1e7f4d;">${summary.sent.length}</strong><span style="font-size:12px;color:#766c64;">Sent</span></td>
            <td style="padding:15px;text-align:center;"><strong style="display:block;font-size:22px;color:#9a6a00;">${summary.skipped.length}</strong><span style="font-size:12px;color:#766c64;">Skipped</span></td>
            <td style="padding:15px;text-align:center;"><strong style="display:block;font-size:22px;color:#a91427;">${summary.failed.length}</strong><span style="font-size:12px;color:#766c64;">Failed</span></td>
          </tr>
        </table>`,
      eyebrow: "Birthday Reminder",
      logoUrl,
      title: weeklyBirthdayMembers.length === 1 ? "This Week's Birthday" : "This Week's Birthday Celebrations",
    });

    for (const email of summary.failed.length === 0 ? adminEmails : []) {
      try {
        await sendEmail({
          apiKey: resendApiKey,
          dryRun,
          from: emailFrom,
          html: summaryHtml,
          idempotencyKey: `birthday-weekly-summary-${runDate.iso}-${email}`,
          subject: renderTemplate(summarySubjectTemplate, summaryValues),
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
      weeklyBirthdays: weeklyBirthdayMembers.length,
      weeklySummaryRecipients: adminEmails.length,
    };
  } finally {
    if (lockAcquired) {
      await client.query("select pg_advisory_unlock(hashtext($1))", [advisoryLockName]).catch(() => undefined);
    }
    client.release();
    await pool.end();
  }
};
