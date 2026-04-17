import { getGalleryFilms } from "@/lib/gallery/load";
import FilmGalleryExperience from "./FilmGalleryExperience";

export const dynamic = "force-dynamic";

export default async function FilmsPage() {
  const films = await getGalleryFilms();
  return <FilmGalleryExperience films={films} />;
}
