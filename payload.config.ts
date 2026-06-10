import path from "path";
import { fileURLToPath } from "url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";
import { AttendanceRecords } from "./payload/collections/AttendanceRecords.ts";
import { Admins } from "./payload/collections/Admins.ts";
import { BirthdayNotificationLogs } from "./payload/collections/BirthdayNotificationLogs.ts";
import { Departments } from "./payload/collections/Departments.ts";
import { Media } from "./payload/collections/Media.ts";
import { Members } from "./payload/collections/Members.ts";
import { ReportInstructions } from "./payload/collections/ReportInstructions.ts";
import { ReportTemplates } from "./payload/collections/ReportTemplates.ts";
import { ServiceReports } from "./payload/collections/ServiceReports.ts";
import { Services } from "./payload/collections/Services.ts";
import { BirthdayNotificationSettings } from "./payload/globals/BirthdayNotificationSettings.ts";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Admins.slug,
    importMap: {
      baseDir: path.resolve(dirname, "./app/(payload)"),
      importMapFile: path.resolve(dirname, "./app/(payload)/admin/importMap.js"),
    },
  },
  collections: [
    Admins,
    Media,
    Departments,
    Members,
    Services,
    AttendanceRecords,
    ServiceReports,
    ReportInstructions,
    ReportTemplates,
    BirthdayNotificationLogs,
  ],
  editor: lexicalEditor(),
  globals: [BirthdayNotificationSettings],
  secret: process.env.PAYLOAD_SECRET || "dev-only-payload-secret-change-me",
  db: postgresAdapter({
    allowIDOnCreate: true,
    pool: {
      connectionString:
        process.env.DATABASE_URL ||
        "postgresql://postgres:replace-with-password@db.your-project-ref.supabase.co:5432/postgres",
      idleTimeoutMillis: 30000,
      max: 2,
    },
  }),
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "./payload-types.ts"),
  },
});
