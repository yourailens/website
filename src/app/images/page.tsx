import { getGalleryImages } from "@/lib/gallery/load";
import ImageGalleryExperience from "./ImageGalleryExperience";

export const dynamic = "force-dynamic";

export default async function ImagesPage() {
  const images = await getGalleryImages();
  return <ImageGalleryExperience images={images} />;
}
