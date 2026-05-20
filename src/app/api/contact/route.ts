import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import { contactSchema } from "@/lib/contact-schema";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: NextRequest) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    // Honeypot or validation — don't leak which.
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }

  const { ok } = await checkRateLimit(`ip:${clientIp(req)}`);
  if (!ok) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL ?? "onboarding@resend.dev";
  if (!apiKey || !to) {
    console.error("[contact] Missing RESEND_API_KEY or CONTACT_TO_EMAIL");
    return NextResponse.json({ error: "Server misconfigured." }, { status: 500 });
  }

  const { name, email, message } = parsed.data;
  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: `Portfolio Contact <${from}>`,
      to: [to],
      replyTo: email,
      subject: `New message from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });
  } catch (err) {
    console.error("[contact] Resend failed", err);
    return NextResponse.json({ error: "Could not send message." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
