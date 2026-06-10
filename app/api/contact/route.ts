import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Record<string, string>;

  if (!body.name || !body.email || !body.subject || !body.message) {
    return NextResponse.json(
      { message: "All fields are required." },
      { status: 400 }
    );
  }

  return NextResponse.json({
    message:
      "Message received. Replace this placeholder route with your email or CRM integration.",
  });
}
