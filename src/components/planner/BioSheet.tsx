"use client";

import { useState } from "react";
import Link from "next/link";
import { PLANNER_BIO_CATEGORY_COLOR, plannerBioBanner, plannerBioCategory, type PlannerBio } from "@/data/planner";
import { P_BTN_GHOST, P_GLASS, P_PAGE } from "@/components/planner/planner-ui";

function prettyDay(value: string | null) {
  if (!value) return "";
  const d = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function hrefOf(value: string, host?: string) {
  const v = value.trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  if (host && (v.startsWith("@") || !v.includes("."))) return `https://${host}/${v.replace(/^@/, "")}`;
  return `https://${v}`;
}

function Fact({ label, value, href }: { label: string; value: string | null; href?: string }) {
  if (!value?.trim()) return null;
  return (
    <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-3 border-t border-white/10 py-3 first:border-t-0">
      <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-white/40">{label}</p>
      {href ? (
        <a href={href} className="break-words text-[15px] text-white hover:text-[#7eb6ff]" target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
          {value}
        </a>
      ) : (
        <p className="break-words text-[15px] text-white">{value}</p>
      )}
    </div>
  );
}

export default function BioSheet({ bio }: { bio: PlannerBio }) {
  const [copied, setCopied] = useState(false);
  const title = bio.preferred_name?.trim() || bio.full_name;
  const place = [bio.city, bio.country].filter(Boolean).join(", ");
  const role = [bio.role_title, bio.company].filter(Boolean).join(" at ");

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={`${P_PAGE} max-w-[820px]`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/planner/follow-ups/contacts" className="text-[14px] font-medium text-white/70 hover:text-white">
          Contacts
        </Link>
        <div className="flex items-center gap-2">
          <button type="button" className={P_BTN_GHOST} onClick={() => void copy()}>
            {copied ? "Copied" : "Copy link"}
          </button>
          <Link href={`/planner/follow-ups/contacts/${bio.slug}/edit`} className={P_BTN_GHOST}>
            Edit
          </Link>
        </div>
      </div>

      <article className={`${P_GLASS} overflow-hidden`}>
        <div
          className="px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-white"
          style={{ background: PLANNER_BIO_CATEGORY_COLOR[plannerBioCategory(bio.category)] }}
        >
          {plannerBioBanner(bio.category, bio.label)}
        </div>
        <div className="px-6 py-7 sm:px-8">
          <div className="flex items-end gap-5">
            <span className="flex h-20 w-20 items-center justify-center rounded-full border border-white/30 bg-white/10 text-[28px] font-bold">
              {title.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0 pb-1">
              <h2 className="text-[32px] font-bold leading-none tracking-tight">{title}</h2>
              {bio.preferred_name && bio.preferred_name !== bio.full_name ? (
                <p className="mt-2 text-[14px] text-white/45">{bio.full_name}</p>
              ) : null}
              <p className="mt-2 text-[16px] text-white/75">{role || "No role yet"}</p>
            </div>
          </div>

          <div className="mt-8">
            <Fact label="Category" value={bio.category === "lead" ? "Lead" : bio.category === "sponsor" ? "Sponsor" : "Misc"} />
            <Fact label="Label" value={bio.label} />
            <Fact label="Pronouns" value={bio.pronouns} />
            <Fact label="Birthday" value={prettyDay(bio.birthday)} />
            <Fact label="Languages" value={bio.languages} />
            <Fact label="Company" value={bio.company} />
            <Fact label="Role" value={bio.role_title} />
            <Fact label="Department" value={bio.department} />
            <Fact label="Industry" value={bio.industry} />
            <Fact label="Email" value={bio.email} href={bio.email ? `mailto:${bio.email}` : undefined} />
            <Fact label="Phone" value={bio.phone} href={bio.phone ? `tel:${bio.phone}` : undefined} />
            <Fact label="WhatsApp" value={bio.whatsapp} href={bio.whatsapp ? `tel:${bio.whatsapp}` : undefined} />
            <Fact label="Website" value={bio.website} href={bio.website ? hrefOf(bio.website) : undefined} />
            <Fact label="LinkedIn" value={bio.linkedin} href={bio.linkedin ? hrefOf(bio.linkedin, "www.linkedin.com/in") : undefined} />
            <Fact label="Instagram" value={bio.instagram} href={bio.instagram ? hrefOf(bio.instagram, "instagram.com") : undefined} />
            <Fact label="Place" value={place || null} />
            <Fact label="How we met" value={bio.source} />
            <Fact label="Introduced" value={bio.introduced_by} />
            <Fact label="Kept by" value={bio.owner?.display_name ?? null} />
          </div>

          {bio.bio?.trim() ? (
            <div className="mt-8">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#7eb6ff]">About</p>
              <p className="mt-2 whitespace-pre-wrap text-[16px] leading-relaxed text-white/85">{bio.bio}</p>
            </div>
          ) : null}
          {bio.notes?.trim() ? (
            <div className="mt-6">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#7eb6ff]">Notes for the team</p>
              <p className="mt-2 whitespace-pre-wrap text-[16px] leading-relaxed text-white/85">{bio.notes}</p>
            </div>
          ) : null}
        </div>
      </article>
    </div>
  );
}
