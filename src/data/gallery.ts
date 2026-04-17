/** Shared across Films + Images galleries */
export type FilmCategory = "photorealistic" | "product" | "animations";
export type CharacterTag = "Kaira" | "Akriti" | "Niharika" | "Ankanksha";

export const CHARACTER_TAGS: CharacterTag[] = ["Kaira", "Akriti", "Niharika", "Ankanksha"];

export const GALLERY_CATEGORY_TABS: { id: FilmCategory | null; label: string }[] = [
  { id: null, label: "All work" },
  { id: "photorealistic", label: "Photorealistic" },
  { id: "product", label: "Product" },
  { id: "animations", label: "Animations" },
];

export function categoryLabel(c: FilmCategory): string {
  const labels: Record<FilmCategory, string> = {
    photorealistic: "Photorealistic",
    product: "Product",
    animations: "Animations",
  };
  return labels[c];
}

export type GalleryImage = {
  /** Set when loaded from Supabase (admin uploads) */
  id?: string;
  src: string;
  title: string;
  category: FilmCategory;
  aspect?: "square" | "portrait" | "landscape";
  peopleTags?: CharacterTag[];
};

export const GALLERY_IMAGES: GalleryImage[] = [
  { src: "/images/hr1.png", title: "Editorial collective", aspect: "landscape", category: "photorealistic" },
  { src: "/images/img1.jpeg", title: "Campaign still", aspect: "portrait", category: "photorealistic" },
  { src: "/images/img2.jpeg", title: "Portrait study", aspect: "portrait", category: "photorealistic" },
  { src: "/images/img3.jpeg", title: "Brand moment", aspect: "square", category: "animations" },
  { src: "/images/img4.jpeg", title: "Studio frame", aspect: "landscape", category: "photorealistic" },
  { src: "/images/img5.jpeg", title: "Lookbook", aspect: "portrait", category: "photorealistic" },
  { src: "/images/img6.png", title: "Product hero", aspect: "square", category: "product" },
  { src: "/images/img7.png", title: "Social suite", aspect: "square", category: "product" },
  { src: "/images/ai_avatar1.jpeg", title: "AI character", aspect: "portrait", category: "animations" },
  { src: "/images/ws1.png", title: "Lifestyle", aspect: "landscape", category: "photorealistic" },
  { src: "/images/ws3.png", title: "Fashion", aspect: "portrait", category: "photorealistic" },
  { src: "/images/otshirt1.png", title: "Apparel one", aspect: "square", category: "product" },
  { src: "/images/otshirt2.png", title: "Apparel two", aspect: "square", category: "product" },
  { src: "/images/cologne.png", title: "Luxury pack", aspect: "portrait", category: "product" },
  { src: "/images/shoe.png", title: "Footwear", aspect: "landscape", category: "product" },
  { src: "/images/w2.png", title: "Campaign flat", aspect: "landscape", category: "photorealistic" },
];

export type GalleryFilm = {
  id?: string;
  src: string;
  /** First-frame JPEG on S3, generated on admin upload — used for OG / WhatsApp previews. */
  posterUrl?: string;
  title: string;
  category: FilmCategory;
  /** Portrait / vertical masters — layout uses a taller tile. Omit for 16×9 landscape. */
  orientation?: "landscape" | "portrait";
  peopleTags?: CharacterTag[];
};

export const GALLERY_FILMS: GalleryFilm[] = [
  { src: "/videos/sync1.mov", title: "Sync", category: "photorealistic", orientation: "landscape" },
  { src: "/videos/v3.mp4", title: "Vertical spot", category: "animations", orientation: "portrait" },
  { src: "/videos/sd1.mp4", title: "Studio reel", category: "product", orientation: "landscape" },
  { src: "/videos/v4.mp4", title: "Portrait reel", category: "animations", orientation: "portrait" },
  { src: "/videos/v04.mp4", title: "Campaign cut", category: "photorealistic", orientation: "landscape" },
  { src: "/videos/cs2.mp4", title: "Product story", category: "product", orientation: "landscape" },
  { src: "/videos/ws3.mp4", title: "Walkthrough", category: "photorealistic", orientation: "landscape" },
  { src: "/videos/cs3.mov", title: "Launch film", category: "animations", orientation: "landscape" },
  { src: "/videos/w2.mp4", title: "Winter edit", category: "photorealistic", orientation: "landscape" },
];
