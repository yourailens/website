import { DateTime } from "luxon";

type MeetEventInput = {
  name: string;
  email: string;
  brand?: string;
  notes: string;
  scheduledAtIsoUtc: string;
  timezone: string;
};

type MeetEventResult = {
  eventId: string;
  meetLink?: string;
};

function getGoogleConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN?.trim();
  const calendarId = process.env.GOOGLE_CALENDAR_ID?.trim();
  if (!clientId || !clientSecret || !refreshToken || !calendarId) return null;
  return { clientId, clientSecret, refreshToken, calendarId };
}

export function googleMeetConfigured(): boolean {
  return Boolean(getGoogleConfig());
}

async function getGoogleAccessToken(cfg: NonNullable<ReturnType<typeof getGoogleConfig>>): Promise<string> {
  const body = new URLSearchParams({
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    refresh_token: cfg.refreshToken,
    grant_type: "refresh_token",
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    cache: "no-store",
  });

  const json = (await res.json().catch(() => ({}))) as { access_token?: string; error?: string };
  if (!res.ok || !json.access_token) {
    throw new Error(json.error ? `Token refresh failed: ${json.error}` : "Token refresh failed");
  }
  return json.access_token;
}

export async function createGoogleMeetEvent(input: MeetEventInput): Promise<MeetEventResult> {
  const cfg = getGoogleConfig();
  if (!cfg) {
    throw new Error("Google Meet is not configured");
  }
  const token = await getGoogleAccessToken(cfg);
  const startUtc = DateTime.fromISO(input.scheduledAtIsoUtc, { zone: "utc" });
  if (!startUtc.isValid) throw new Error("Invalid scheduled time");
  const endUtc = startUtc.plus({ minutes: 30 });

  const payload = {
    summary: `Discovery Call - ${input.name}`,
    description: [
      `Name: ${input.name}`,
      `Email: ${input.email}`,
      input.brand ? `Brand: ${input.brand}` : null,
      "",
      "Project notes:",
      input.notes,
    ]
      .filter(Boolean)
      .join("\n"),
    start: {
      dateTime: startUtc.toISO(),
      timeZone: input.timezone,
    },
    end: {
      dateTime: endUtc.toISO(),
      timeZone: input.timezone,
    },
    attendees: [{ email: input.email }],
    conferenceData: {
      createRequest: {
        requestId: `meet-${crypto.randomUUID()}`,
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };

  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(cfg.calendarId)}/events?conferenceDataVersion=1&sendUpdates=all`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const json = (await res.json().catch(() => ({}))) as {
    id?: string;
    hangoutLink?: string;
    conferenceData?: { entryPoints?: Array<{ entryPointType?: string; uri?: string }> };
    error?: { message?: string };
  };

  if (!res.ok || !json.id) {
    throw new Error(json.error?.message || "Google Calendar event creation failed");
  }

  const meetLink =
    json.hangoutLink ||
    json.conferenceData?.entryPoints?.find((e) => e.entryPointType === "video")?.uri;

  return {
    eventId: json.id,
    ...(meetLink ? { meetLink } : {}),
  };
}

