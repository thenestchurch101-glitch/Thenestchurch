import { loadLocalEnv } from "./_shared.mjs";
import { runBirthdayEmails } from "./birthday-email-runner.mjs";

loadLocalEnv();

const args = new Set(process.argv.slice(2));
const getArgValue = (name) => {
  const prefix = `${name}=`;
  const match = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : undefined;
};

const verbose = args.has("--verbose");
const result = await runBirthdayEmails({
  date: getArgValue("--date"),
  dryRun: args.has("--dry-run"),
  force: args.has("--force"),
  log: verbose ? (message) => console.log(`[birthday] ${message}`) : undefined,
});

console.log(
  `Birthday run ${result.date}: status=${result.status}, sent=${result.sent}, skipped=${result.skipped}, failed=${result.failed}, dryRun=${result.dryRun}${result.reason ? `, reason=${result.reason}` : ""}`,
);

if (result.failed > 0) {
  process.exitCode = 1;
}
