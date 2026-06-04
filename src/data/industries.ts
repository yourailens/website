export type IndustryMediaType = "image" | "video";
export type IndustryAspectRatio = "portrait" | "square" | "landscape";

export type Industry = {
  id: string;
  slug: string;
  name: string;
  question: string | null;
  answer: string | null;
  tagline: string | null;
  description: string | null;
  hero_image_url: string | null;
  hero_media_type: IndustryMediaType;
  hero_aspect_ratio: IndustryAspectRatio;
  hero_poster_url: string | null;
  hero_caption: string | null;
  cover_image_url: string | null;
  cover_media_type: IndustryMediaType;
  cover_aspect_ratio: IndustryAspectRatio;
  cover_poster_url: string | null;
  icon_label: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type IndustryPlaybook = {
  id: string;
  industry_id: string;
  slug: string;
  name: string;
  question: string | null;
  answer: string | null;
  tagline: string | null;
  description: string | null;
  icon_label: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type IndustryPlaybookExample = {
  id: string;
  playbook_id: string;
  title: string;
  caption: string | null;
  media_url: string;
  media_type: IndustryMediaType;
  poster_url: string | null;
  aspect_ratio: IndustryAspectRatio;
  service_slug: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

/** Lightweight cover for industry page playbook list (no gallery payload) */
export type PlaybookCoverPreview = {
  media_url: string;
  media_type: IndustryMediaType;
  poster_url: string | null;
  aspect_ratio: IndustryAspectRatio;
  title: string;
  caption: string | null;
};

export type IndustryPlaybookWithExamples = IndustryPlaybook & {
  examples: IndustryPlaybookExample[];
  /** Set on industry listing when examples are trimmed to a single cover */
  example_count?: number;
  /** Industry page only — poster/still for list UI; examples may be empty */
  cover_preview?: PlaybookCoverPreview | null;
};

export type IndustryWithPlaybooks = Industry & {
  playbooks: IndustryPlaybookWithExamples[];
};

/** Industry + one playbook + sibling nav for dedicated playbook pages */
export type PlaybookPageData = {
  industry: IndustryWithPlaybooks;
  playbook: IndustryPlaybookWithExamples;
  siblings: IndustryPlaybookWithExamples[];
  playbookIndex: number;
};
