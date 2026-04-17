import { DateTime } from "luxon";
import nodemailer from "nodemailer";

type BookingEmailInput = {
  bookingId: string;
  name: string;
  email: string;
  brand?: string;
  projectSummary: string;
  scheduledAtIsoUtc: string;
  timezone: string;
  meetUrl?: string;
};

type SendBookingEmailResult =
  | { status: "sent" }
  | { status: "skipped"; reason: string }
  | { status: "failed"; reason: string };

const RESEND_URL = "https://api.resend.com/emails";
const HERO_IMAGE_URL =
  "https://yourailens.s3.ap-south-1.amazonaws.com/gallery/images/1776418268173-All_4_of_202604160006.jpeg";

function getResendConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.BOOKING_FROM_EMAIL?.trim();
  const owner = process.env.BOOKING_OWNER_EMAIL?.trim();
  if (!apiKey || !from) return null;
  return { apiKey, from, owner };
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const portRaw = process.env.SMTP_PORT?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const from = process.env.BOOKING_FROM_EMAIL?.trim();
  const owner = process.env.BOOKING_OWNER_EMAIL?.trim();
  if (!host || !portRaw || !user || !pass || !from) return null;
  const port = Number(portRaw);
  if (!Number.isFinite(port)) return null;
  return { host, port, user, pass, from, owner };
}

function toLocalDateTimeLabel(isoUtc: string, timezone: string) {
  const dt = DateTime.fromISO(isoUtc, { zone: "utc" }).setZone(timezone);
  if (!dt.isValid) return isoUtc;
  return dt.toFormat("ccc, dd LLL yyyy · hh:mm a");
}

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function customerTemplate(input: BookingEmailInput): { subject: string; html: string; text: string } {
  const localLabel = toLocalDateTimeLabel(input.scheduledAtIsoUtc, input.timezone);
  const safeName = escapeHtml(input.name);
  const safeBrand = escapeHtml(input.brand || "Not provided");
  const safeSummary = escapeHtml(input.projectSummary);
  const safeTz = escapeHtml(input.timezone);
  const safeMeet = input.meetUrl ? escapeHtml(input.meetUrl) : "";
  const heroImage = HERO_IMAGE_URL;

  const subject = `Booking Confirmed - ${localLabel}`;
  const html = `
  <div style="margin:0;background:#f6f9ff;font-family:Verdana,Geneva,Tahoma,sans-serif;color:#0f172a">
    <img src="${heroImage}" alt="YourAILens Header" style="display:block;width:100%;height:auto" />
    <div style="padding:22px 34px 10px;background:transparent;color:#0f172a">
      <p style="margin:0;font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:#475569">YourAILens Studio</p>
      <h1 style="margin:8px 0 0;font-size:34px;line-height:1.1;letter-spacing:-0.02em;font-weight:700">Booking confirmed</h1>
      <div style="margin-top:12px;height:1px;width:100%;background:linear-gradient(90deg,rgba(37,99,235,0.6),rgba(37,99,235,0.1) 45%,rgba(15,23,42,0.06) 100%)"></div>
    </div>
    <div style="padding:28px 34px 34px">
      <p style="margin:0 0 14px;font-size:16px">Hi ${safeName},</p>
      <p style="margin:0 0 18px;font-size:14px;line-height:1.65;color:#334155">
        Thanks for scheduling with us. Your call is confirmed with the details below.
      </p>
      <div style="margin-top:8px;border-top:1px solid #d6e4ff;border-bottom:1px solid #d6e4ff;padding:14px 0 8px">
        <div style="display:grid;grid-template-columns:170px 1fr;gap:8px;margin-bottom:8px">
          <p style="margin:0;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#64748b">Date & Time</p>
          <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a">${escapeHtml(localLabel)}</p>
        </div>
        <div style="display:grid;grid-template-columns:170px 1fr;gap:8px;margin-bottom:8px">
          <p style="margin:0;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#64748b">Timezone</p>
          <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a">${safeTz}</p>
        </div>
        <div style="display:grid;grid-template-columns:170px 1fr;gap:8px;margin-bottom:8px">
          <p style="margin:0;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#64748b">Brand</p>
          <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a">${safeBrand}</p>
        </div>
        <div style="display:grid;grid-template-columns:170px 1fr;gap:8px;margin-bottom:8px">
          <p style="margin:0;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#64748b">Booking ID</p>
          <p style="margin:0;font-size:13px;font-weight:700;color:#0f172a">${escapeHtml(input.bookingId)}</p>
        </div>
      </div>
      ${
        input.meetUrl
          ? `<div style="margin-top:18px">
        <a href="${safeMeet}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:700;font-size:13px;padding:12px 18px;border-radius:999px">Open Google Meet</a>
        <p style="margin:10px 0 0;font-size:12px;color:#475569;word-break:break-all">${safeMeet}</p>
      </div>`
          : `<p style="margin:18px 0 0;font-size:13px;color:#475569">We will share the meeting link shortly.</p>`
      }
      <div style="margin-top:22px;padding-top:16px;border-top:1px solid #dbe7ff">
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#64748b">Project notes</p>
        <p style="margin:0;font-size:14px;line-height:1.65;color:#334155;white-space:pre-wrap">${safeSummary}</p>
      </div>
      <p style="margin:24px 0 0;font-size:12px;color:#64748b">
        Need to update details? Reply to this email and we will help you.
      </p>
    </div>
  </div>`;

  const text =
    `Your call is confirmed\n\n` +
    `Date & Time: ${localLabel}\n` +
    `Timezone: ${input.timezone}\n` +
    `Brand: ${input.brand || "Not provided"}\n` +
    `Booking ID: ${input.bookingId}\n` +
    `${input.meetUrl ? `Google Meet: ${input.meetUrl}\n` : ""}\n` +
    `Project notes:\n${input.projectSummary}\n`;

  return { subject, html, text };
}

function ownerTemplate(input: BookingEmailInput): { subject: string; html: string; text: string } {
  const localLabel = toLocalDateTimeLabel(input.scheduledAtIsoUtc, input.timezone);
  const safeMeet = input.meetUrl ? escapeHtml(input.meetUrl) : "";
  const heroImage = HERO_IMAGE_URL;
  const subject = `New Call Booking - ${input.name} - ${localLabel}`;
  const html = `
  <div style="margin:0;background:#f6f9ff;font-family:Verdana,Geneva,Tahoma,sans-serif;color:#0f172a">
    <img src="${heroImage}" alt="YourAILens Header" style="display:block;width:100%;height:auto" />
    <div style="padding:22px 28px 10px;background:transparent;color:#0f172a">
      <p style="margin:0;font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:#475569">YourAILens Studio</p>
      <h2 style="margin:8px 0 0;font-size:32px;line-height:1.1;letter-spacing:-0.02em;font-weight:700">New booking received</h2>
      <div style="margin-top:12px;height:1px;width:100%;background:linear-gradient(90deg,rgba(37,99,235,0.6),rgba(37,99,235,0.1) 45%,rgba(15,23,42,0.06) 100%)"></div>
    </div>
    <div style="padding:24px 28px 30px">
      <div style="margin-top:6px;border-top:1px solid #d6e4ff;border-bottom:1px solid #d6e4ff;padding:14px 0 8px">
        <div style="display:grid;grid-template-columns:170px 1fr;gap:8px;margin-bottom:8px">
          <p style="margin:0;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#64748b">Name</p>
          <p style="margin:0;font-size:14px;font-weight:700">${escapeHtml(input.name)}</p>
        </div>
        <div style="display:grid;grid-template-columns:170px 1fr;gap:8px;margin-bottom:8px">
          <p style="margin:0;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#64748b">Email</p>
          <p style="margin:0;font-size:14px;font-weight:700">${escapeHtml(input.email)}</p>
        </div>
        <div style="display:grid;grid-template-columns:170px 1fr;gap:8px;margin-bottom:8px">
          <p style="margin:0;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#64748b">Brand</p>
          <p style="margin:0;font-size:14px;font-weight:700">${escapeHtml(input.brand || "Not provided")}</p>
        </div>
        <div style="display:grid;grid-template-columns:170px 1fr;gap:8px;margin-bottom:8px">
          <p style="margin:0;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#64748b">Date & Time</p>
          <p style="margin:0;font-size:14px;font-weight:700">${escapeHtml(localLabel)} (${escapeHtml(input.timezone)})</p>
        </div>
        <div style="display:grid;grid-template-columns:170px 1fr;gap:8px;margin-bottom:8px">
          <p style="margin:0;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#64748b">Booking ID</p>
          <p style="margin:0;font-size:13px;font-weight:700">${escapeHtml(input.bookingId)}</p>
        </div>
        <div style="display:grid;grid-template-columns:170px 1fr;gap:8px;margin-bottom:8px">
          <p style="margin:0;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#64748b">Meet</p>
          <p style="margin:0;font-size:13px;font-weight:700;word-break:break-all">
            ${input.meetUrl ? `<a href="${safeMeet}">${safeMeet}</a>` : "Pending"}
          </p>
        </div>
      </div>
      <div style="margin-top:18px;padding-top:14px;border-top:1px solid #dbe7ff">
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#64748b">Project notes</p>
        <p style="margin:0;font-size:14px;line-height:1.65;white-space:pre-wrap">${escapeHtml(input.projectSummary)}</p>
      </div>
    </div>
  </div>`;

  const text =
    `New booking received\n\n` +
    `Name: ${input.name}\n` +
    `Email: ${input.email}\n` +
    `Brand: ${input.brand || "Not provided"}\n` +
    `Date & Time: ${localLabel} (${input.timezone})\n` +
    `Booking ID: ${input.bookingId}\n` +
    `${input.meetUrl ? `Meet: ${input.meetUrl}\n` : ""}\n` +
    `Project notes:\n${input.projectSummary}\n`;

  return { subject, html, text };
}

async function sendResendEmail(
  cfg: { apiKey: string; from: string },
  to: string,
  tpl: { subject: string; html: string; text: string }
) {
  const res = await fetch(RESEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: cfg.from,
      to: [to],
      subject: tpl.subject,
      html: tpl.html,
      text: tpl.text,
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(j.message || "Resend API error");
  }
}

async function sendSmtpEmail(
  cfg: { host: string; port: number; user: string; pass: string; from: string },
  to: string,
  tpl: { subject: string; html: string; text: string }
) {
  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 465,
    auth: {
      user: cfg.user,
      pass: cfg.pass,
    },
  });
  await transporter.sendMail({
    from: cfg.from,
    to,
    subject: tpl.subject,
    html: tpl.html,
    text: tpl.text,
  });
}

function isResendTestRecipientRestriction(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("you can only send testing emails to your own email address") ||
    m.includes("domain is not verified") ||
    m.includes("verify your domain on resend.com/domains")
  );
}

export async function sendBookingEmails(input: BookingEmailInput): Promise<SendBookingEmailResult> {
  const smtp = getSmtpConfig();
  if (smtp) {
    try {
      if (smtp.owner) {
        await sendSmtpEmail(smtp, smtp.owner, ownerTemplate(input));
      }
      await sendSmtpEmail(smtp, input.email, customerTemplate(input));
      return { status: "sent" };
    } catch (e) {
      return { status: "failed", reason: e instanceof Error ? e.message : "SMTP email error" };
    }
  }

  const resend = getResendConfig();
  if (!resend) {
    return {
      status: "skipped",
      reason:
        "Email not configured. Set SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS + BOOKING_FROM_EMAIL (preferred) or RESEND_API_KEY + BOOKING_FROM_EMAIL.",
    };
  }
  try {
    if (resend.owner) {
      await sendResendEmail(resend, resend.owner, ownerTemplate(input));
    }
    try {
      await sendResendEmail(resend, input.email, customerTemplate(input));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown email error";
      if (isResendTestRecipientRestriction(msg)) {
        return { status: "skipped", reason: "Customer email skipped in Resend test mode until domain is verified." };
      }
      return { status: "failed", reason: msg };
    }
    return { status: "sent" };
  } catch (e) {
    return { status: "failed", reason: e instanceof Error ? e.message : "Unknown email error" };
  }
}

