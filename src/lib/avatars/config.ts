export const AVATAR_SLUGS = ["kaira", "akriti", "niharika", "akanksha"] as const;
export type AvatarSlug = (typeof AVATAR_SLUGS)[number];

export function isAvatarSlug(value: string): value is AvatarSlug {
  return (AVATAR_SLUGS as readonly string[]).includes(value);
}
