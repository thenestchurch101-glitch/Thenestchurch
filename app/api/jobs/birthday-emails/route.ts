import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { runBirthdayEmails } from "@/scripts/birthday-email-runner.mjs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const isAuthorized = (request: NextRequest) => {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return false;
  }

  const authorization = request.headers.get("authorization");
  const providedSecret = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : request.headers.get("x-cron-secret")?.trim();

  if (!providedSecret) {
    return false;
  }

  const expected = Buffer.from(cronSecret);
  const provided = Buffer.from(providedSecret);
  return expected.length === provided.length && timingSafeEqual(expected, provided);
};

const handleBirthdayRun = async (request: NextRequest) => {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const result = await runBirthdayEmails({
      weeklySummaryOnly: request.nextUrl.searchParams.get("preview") === "weekly",
    });
    const status = result.failed > 0 ? 502 : 200;
    return NextResponse.json(result, { status });
  } catch (error) {
    console.error("Birthday email cron failed.", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Birthday email cron failed." },
      { status: 500 },
    );
  }
};

export const GET = handleBirthdayRun;
export const POST = handleBirthdayRun;
