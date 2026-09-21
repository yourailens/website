export type MobileClip = {
  id: string;
  title: string;
  tag?: string;
  section: string;
  href: string;
  poster?: string | null;
  video?: string | null;
  youtubeId?: string | null;
  portrait?: boolean;
};

export type MobileHomeData = {
  /** Same opening film as laptop hero — poster until tap */
  hero: MobileClip;
  /** SC. 2 · Just landed */
  landed: MobileClip[];
  /** SC. 2 · Any format */
  formats: MobileClip[];
  /** SC. 3 · 45 min / homepage feature trailer */
  feature: MobileClip | null;
  /** SC. 3 · On the lot */
  lot: MobileClip[];
  /** SC. 4 · Community */
  community: MobileClip[];
  /** SC. 5 · Call sheet */
  pricing: { title: string; tag: string; href: string }[];
};
