export type BirthdayRunResult = {
  date: string;
  dryRun: boolean;
  failed: number;
  reason?: string;
  sent: number;
  skipped: number;
  status: "already-completed" | "already-running" | "completed" | "disabled" | "partial-failure";
  totalBirthdays?: number;
};

export type BirthdayRunOptions = {
  databaseUrl?: string;
  date?: string;
  dryRun?: boolean;
  emailFrom?: string;
  force?: boolean;
  log?: (message: string) => void;
  resendApiKey?: string;
  siteUrl?: string;
};

export function runBirthdayEmails(options?: BirthdayRunOptions): Promise<BirthdayRunResult>;
