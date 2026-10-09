export type YailVaultAvatar = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  bio: string | null;
  portrait_url: string;
  /** Pre-baked 1200×630 JPEG on S3 for WhatsApp / OG. */
  og_image_url: string | null;
  accent: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};
