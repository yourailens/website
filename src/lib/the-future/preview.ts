import type {
  FutureMediaType,
  FutureModule,
  FutureModulePreview,
  FutureSequenceFrame,
} from "@/data/the-future";
import type { ModuleCoverAspectId } from "@/data/module-covers";

export function resolveModulePreview(
  mod: FutureModule,
  firstFrame?: Pick<
    FutureSequenceFrame,
    "media_type" | "image_url" | "video_url" | "poster_url" | "aspect_ratio"
  > | null
): FutureModulePreview {
  if (mod.cover_media_type === "video" && mod.cover_video_url?.trim()) {
    return {
      preview_url: mod.cover_video_url.trim(),
      preview_media_type: "video",
      preview_aspect: mod.cover_aspect,
      preview_poster_url: null,
    };
  }
  if (mod.cover_image_url?.trim()) {
    return {
      preview_url: mod.cover_image_url.trim(),
      preview_media_type: "image",
      preview_aspect: mod.cover_aspect,
      preview_poster_url: null,
    };
  }
  if (firstFrame) {
    if (firstFrame.media_type === "video" && firstFrame.video_url?.trim()) {
      return {
        preview_url: firstFrame.video_url.trim(),
        preview_media_type: "video",
        preview_aspect: firstFrame.aspect_ratio,
        preview_poster_url: firstFrame.poster_url?.trim() || null,
      };
    }
    if (firstFrame.image_url?.trim()) {
      return {
        preview_url: firstFrame.image_url.trim(),
        preview_media_type: "image",
        preview_aspect: firstFrame.aspect_ratio,
        preview_poster_url: null,
      };
    }
  }
  return {
    preview_url: null,
    preview_media_type: "image",
    preview_aspect: mod.cover_aspect,
    preview_poster_url: null,
  };
}

export function attachPreviewsToModules<T extends FutureModule>(
  modules: T[],
  firstFrameByModuleId: Map<string, FutureSequenceFrame>
): (T & FutureModulePreview)[] {
  return modules.map((m) => ({
    ...m,
    ...resolveModulePreview(m, firstFrameByModuleId.get(m.id) ?? null),
  }));
}
