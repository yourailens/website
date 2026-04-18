import nodemailer from "nodemailer";
import {
  WORKSHOP_TITLE,
  formatInr,
  workshopDateRangeLabel,
  workshopMeetExpectationCopy,
  workshopSessionTimeLabel,
  WORKSHOP_LIST_PRICE_INR,
  WORKSHOP_PRICE_INR,
  isWorkshopEarlyBirdActive,
  WORKSHOP_PAYMENT_SUPPORT_PHONE,
} from "@/lib/events/workshop-config";

type WorkshopEmailInput = {
  registrationId: string;
  name: string;
  email: string;
  /** UPI payment phone when paid via workshop flow */
  phone?: string;
  company?: string;
  notes?: string;
  paymentScreenshotUrl?: string;
};

type PaymentVerificationEmailInput = {
  registrationId: string;
  name: string;
  email: string;
  phone: string;
  paymentScreenshotUrl: string;
};

export type SendWorkshopEmailResult =
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

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function customerTemplate(input: WorkshopEmailInput): { subject: string; html: string; text: string } {
  const dates = workshopDateRangeLabel();
  const times = workshopSessionTimeLabel();
  const safeName = escapeHtml(input.name);
  const safeMeetLine = escapeHtml(workshopMeetExpectationCopy());
  const heroImage = HERO_IMAGE_URL;
  const early = isWorkshopEarlyBirdActive();
  const priceHtml = early
    ? `Early bird fee: <strong>${escapeHtml(formatInr(WORKSHOP_PRICE_INR))}</strong> (list ${escapeHtml(formatInr(WORKSHOP_LIST_PRICE_INR))}).`
    : `Workshop fee: <strong>${escapeHtml(formatInr(WORKSHOP_LIST_PRICE_INR))}</strong>.`;
  const subject = `You're registered: ${WORKSHOP_TITLE}`;
  const html = `
  <div style="margin:0;background:#f6f9ff;font-family:Verdana,Geneva,Tahoma,sans-serif;color:#0f172a">
    <img src="${heroImage}" alt="YourAILens Header" style="display:block;width:100%;height:auto" />
    <div style="padding:22px 34px 10px;background:transparent;color:#0f172a">
      <p style="margin:0;font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:#475569">YourAILens Studios</p>
      <h1 style="margin:8px 0 0;font-size:32px;line-height:1.1;letter-spacing:-0.02em;font-weight:700">Registration received</h1>
      <div style="margin-top:12px;height:1px;width:100%;background:linear-gradient(90deg,rgba(37,99,235,0.6),rgba(37,99,235,0.1) 45%,rgba(15,23,42,0.06) 100%)"></div>
    </div>
    <div style="padding:28px 34px 34px">
      <p style="margin:0 0 14px;font-size:16px">Hi ${safeName},</p>
      <p style="margin:0 0 18px;font-size:14px;line-height:1.65;color:#334155">
        Thank you for registering for <strong>${escapeHtml(WORKSHOP_TITLE)}</strong>.
      </p>
      <div style="margin-top:8px;border-top:1px solid #d6e4ff;border-bottom:1px solid #d6e4ff;padding:14px 0 8px">
        <div style="display:grid;grid-template-columns:170px 1fr;gap:8px;margin-bottom:8px">
          <p style="margin:0;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#64748b">Dates</p>
          <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a">${escapeHtml(dates)}</p>
        </div>
        <div style="display:grid;grid-template-columns:170px 1fr;gap:8px;margin-bottom:8px">
          <p style="margin:0;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#64748b">Time</p>
          <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a">${escapeHtml(times)}</p>
        </div>
        <div style="display:grid;grid-template-columns:170px 1fr;gap:8px;margin-bottom:8px">
          <p style="margin:0;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#64748b">Registration ID</p>
          <p style="margin:0;font-size:13px;font-weight:700;color:#0f172a">${escapeHtml(input.registrationId)}</p>
        </div>
        ${
          input.phone
            ? `<div style="display:grid;grid-template-columns:170px 1fr;gap:8px;margin-bottom:8px">
          <p style="margin:0;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#64748b">UPI phone</p>
          <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a">${escapeHtml(input.phone)}</p>
        </div>`
            : ""
        }
      </div>
      <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#334155">
        ${priceHtml}
      </p>
      <p style="margin:20px 0 0;font-size:14px;line-height:1.65;color:#334155">
        ${safeMeetLine}
      </p>
      <p style="margin:16px 0 0;font-size:14px;line-height:1.65;color:#334155">
        If you need anything before the workshop (accessibility, schedule questions, or materials), reply to this email or reach out via our <a href="https://instagram.com/yourailens" style="color:#2563eb;font-weight:600">Instagram</a> and we’ll help.
      </p>
      <p style="margin:24px 0 0;font-size:12px;color:#64748b">
        Team YourAILens Studios
      </p>
    </div>
  </div>`;

  const text =
    `Hi ${input.name},\n\n` +
    `Thank you for registering for ${WORKSHOP_TITLE}.\n\n` +
    `Dates: ${dates}\n` +
    `Time: ${times}\n` +
    `Registration ID: ${input.registrationId}\n` +
    (input.phone ? `UPI phone: ${input.phone}\n` : "") +
    (early
      ? `Fee: ${formatInr(WORKSHOP_PRICE_INR)} (early bird; list ${formatInr(WORKSHOP_LIST_PRICE_INR)})\n`
      : `Fee: ${formatInr(WORKSHOP_LIST_PRICE_INR)}\n`) +
    `\n${workshopMeetExpectationCopy()}\n\n` +
    `If you need anything before the workshop, reply to this email.\n\n` +
    `Team YourAILens Studios\n`;

  return { subject, html, text };
}

function paymentVerificationCustomerTemplate(
  input: PaymentVerificationEmailInput
): { subject: string; html: string; text: string } {
  const safeName = escapeHtml(input.name);
  const phone = escapeHtml(WORKSHOP_PAYMENT_SUPPORT_PHONE);
  const subject = `We’re verifying your payment — ${WORKSHOP_TITLE}`;
  const html = `
  <div style="margin:0;background:#f6f9ff;font-family:Verdana,Geneva,Tahoma,sans-serif;color:#0f172a">
    <div style="padding:28px 34px 34px">
      <p style="margin:0;font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:#475569">YourAILens Studios</p>
      <h1 style="margin:8px 0 0;font-size:26px;line-height:1.15;letter-spacing:-0.02em;font-weight:700">Payment received — verification in progress</h1>
      <p style="margin:18px 0 0;font-size:16px">Hi ${safeName},</p>
      <p style="margin:14px 0 0;font-size:14px;line-height:1.65;color:#334155">
        Thank you for submitting your payment proof for <strong>${escapeHtml(WORKSHOP_TITLE)}</strong>.
        We’re verifying your payment now. Once it’s verified, we’ll send you a separate <strong>confirmation email</strong> with full workshop details.
      </p>
      <p style="margin:16px 0 0;font-size:14px;line-height:1.65;color:#334155">
        This message confirms we’ve received your proof and <strong>holds your spot</strong> while we complete verification.
      </p>
      <p style="margin:16px 0 0;font-size:14px;line-height:1.65;color:#334155">
        If you don’t receive the confirmation email within <strong>10 hours</strong>, please contact us at <strong>${phone}</strong> (call or WhatsApp).
      </p>
      <p style="margin:22px 0 0;font-size:12px;color:#64748b">
        Registration ID: ${escapeHtml(input.registrationId)}<br />
        Team YourAILens Studios
      </p>
    </div>
  </div>`;

  const text =
    `Hi ${input.name},\n\n` +
    `Thanks for submitting your payment proof for ${WORKSHOP_TITLE}.\n\n` +
    `We're verifying your payment. Once it's verified, we'll send you a separate confirmation email with full details.\n\n` +
    `This message holds your spot while we verify.\n\n` +
    `If you don't receive the confirmation email within 10 hours, contact us at ${WORKSHOP_PAYMENT_SUPPORT_PHONE} (call or WhatsApp).\n\n` +
    `Registration ID: ${input.registrationId}\n\n` +
    `Team YourAILens Studios\n`;

  return { subject, html, text };
}

function paymentProofOwnerTemplate(input: PaymentVerificationEmailInput): { subject: string; html: string; text: string } {
  const subject = `Payment proof submitted — verify: ${input.name}`;
  const html = `
  <div style="margin:0;background:#f6f9ff;font-family:Verdana,Geneva,Tahoma,sans-serif;color:#0f172a">
    <div style="padding:24px 28px 30px">
      <h2 style="margin:0 0 12px;font-size:22px;font-weight:700">Workshop payment to verify</h2>
      <p style="margin:0 0 8px;font-size:14px"><strong>Name:</strong> ${escapeHtml(input.name)}</p>
      <p style="margin:0 0 8px;font-size:14px"><strong>Email:</strong> ${escapeHtml(input.email)}</p>
      <p style="margin:0 0 8px;font-size:14px"><strong>UPI phone:</strong> ${escapeHtml(input.phone)}</p>
      <p style="margin:0 0 8px;font-size:14px"><strong>Registration ID:</strong> ${escapeHtml(input.registrationId)}</p>
      <p style="margin:0 0 8px;font-size:14px"><strong>Screenshot:</strong> <a href="${escapeHtml(input.paymentScreenshotUrl)}" style="color:#2563eb;font-weight:600">Open link</a></p>
      <p style="margin:16px 0 0;font-size:13px;color:#475569">Approve in the admin dashboard to send the confirmation email.</p>
    </div>
  </div>`;
  const text =
    `Payment proof submitted — verify in admin\n\n` +
    `Name: ${input.name}\nEmail: ${input.email}\nUPI phone: ${input.phone}\nID: ${input.registrationId}\n` +
    `Screenshot: ${input.paymentScreenshotUrl}\n`;
  return { subject, html, text };
}

function ownerTemplate(input: WorkshopEmailInput): { subject: string; html: string; text: string } {
  const heroImage = HERO_IMAGE_URL;
  const subject = `New workshop signup: ${input.name}`;
  const html = `
  <div style="margin:0;background:#f6f9ff;font-family:Verdana,Geneva,Tahoma,sans-serif;color:#0f172a">
    <img src="${heroImage}" alt="YourAILens Header" style="display:block;width:100%;height:auto" />
    <div style="padding:22px 28px 10px">
      <p style="margin:0;font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:#475569">YourAILens Studios</p>
      <h2 style="margin:8px 0 0;font-size:28px;font-weight:700">New workshop registration</h2>
    </div>
    <div style="padding:24px 28px 30px">
      <p style="margin:0 0 8px;font-size:14px"><strong>Name:</strong> ${escapeHtml(input.name)}</p>
      <p style="margin:0 0 8px;font-size:14px"><strong>Email:</strong> ${escapeHtml(input.email)}</p>
      <p style="margin:0 0 8px;font-size:14px"><strong>UPI phone:</strong> ${escapeHtml(input.phone || "n/a")}</p>
      <p style="margin:0 0 8px;font-size:14px"><strong>Company:</strong> ${escapeHtml(input.company || "n/a")}</p>
      <p style="margin:0 0 8px;font-size:14px"><strong>Registration ID:</strong> ${escapeHtml(input.registrationId)}</p>
      ${
        input.paymentScreenshotUrl
          ? `<p style="margin:0 0 8px;font-size:14px"><strong>Payment screenshot:</strong> <a href="${escapeHtml(input.paymentScreenshotUrl)}" style="color:#2563eb;font-weight:600">Open link</a></p>`
          : ""
      }
      <p style="margin:16px 0 0;font-size:13px;color:#475569"><strong>Notes</strong></p>
      <p style="margin:6px 0 0;font-size:14px;white-space:pre-wrap">${escapeHtml(input.notes || "n/a")}</p>
    </div>
  </div>`;
  const text =
    `New workshop registration\n\n` +
    `Name: ${input.name}\nEmail: ${input.email}\nUPI phone: ${input.phone || "n/a"}\nCompany: ${input.company || "n/a"}\nID: ${input.registrationId}\n` +
    (input.paymentScreenshotUrl ? `Payment screenshot: ${input.paymentScreenshotUrl}\n` : "") +
    `\nNotes:\n${input.notes || "n/a"}\n`;
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
    auth: { user: cfg.user, pass: cfg.pass },
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
    m.includes("domain is not verified")
  );
}

export async function sendWorkshopPaymentVerificationEmails(
  input: PaymentVerificationEmailInput
): Promise<SendWorkshopEmailResult> {
  const smtp = getSmtpConfig();
  if (smtp) {
    try {
      if (smtp.owner) {
        await sendSmtpEmail(smtp, smtp.owner, paymentProofOwnerTemplate(input));
      }
      await sendSmtpEmail(smtp, input.email, paymentVerificationCustomerTemplate(input));
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
        "Email not configured. Set SMTP_* + BOOKING_FROM_EMAIL or RESEND_API_KEY + BOOKING_FROM_EMAIL.",
    };
  }
  try {
    if (resend.owner) {
      await sendResendEmail(resend, resend.owner, paymentProofOwnerTemplate(input));
    }
    try {
      await sendResendEmail(resend, input.email, paymentVerificationCustomerTemplate(input));
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

export async function sendWorkshopRegistrationEmails(
  input: WorkshopEmailInput,
  options?: { skipOwnerNotification?: boolean }
): Promise<SendWorkshopEmailResult> {
  const skipOwner = options?.skipOwnerNotification === true;
  const smtp = getSmtpConfig();
  if (smtp) {
    try {
      if (!skipOwner && smtp.owner) {
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
        "Email not configured. Set SMTP_* + BOOKING_FROM_EMAIL or RESEND_API_KEY + BOOKING_FROM_EMAIL.",
    };
  }
  try {
    if (!skipOwner && resend.owner) {
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
