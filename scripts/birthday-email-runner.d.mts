export type BirthdayRunResult = {
  date: string;
  dryRun: boolean;
  failed: number;
  reason?: string;
  sent: number;
  skipped: number;
  status: "already-completed" | "already-running" | "completed" | "disabled" | "partial-failure";
  totalBirthdays?: number;
  weeklyBirthdays?: number;
  weeklyStartDate?: string;
  weeklySummaryRecipients?: number;
  weeklySummaryFailed?: number;
};

export type BirthdayRunOptions = {
  databaseUrl?: string;
  date?: string;
  dryRun?: boolean;
  emailFrom?: string;
  force?: boolean;
  idempotencySuffix?: string;
  log?: (message: string) => void;
  resendApiKey?: string;
  siteUrl?: string;
  weeklySummaryOnly?: boolean;
};

export function runBirthdayEmails(options?: BirthdayRunOptions): Promise<BirthdayRunResult>;
