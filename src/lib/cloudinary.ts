import { Cloudinary } from "@cloudinary/url-gen";
import { fill } from "@cloudinary/url-gen/actions/resize";
import { compass } from "@cloudinary/url-gen/qualifiers/gravity";
import { format, quality, dpr } from "@cloudinary/url-gen/actions/delivery";
import { source } from "@cloudinary/url-gen/actions/overlay";
import { text } from "@cloudinary/url-gen/qualifiers/source";
import { TextStyle } from "@cloudinary/url-gen/qualifiers/textStyle";
import { Position } from "@cloudinary/url-gen/qualifiers/position";

import { CLOUDINARY_CLOUD_NAME } from "@/constants";

const cld =
  CLOUDINARY_CLOUD_NAME && CLOUDINARY_CLOUD_NAME.trim()
    ? new Cloudinary({
        cloud: {
          cloudName: CLOUDINARY_CLOUD_NAME,
        },
      })
    : new Cloudinary({
        cloud: {
          cloudName: "demo",
        },
      });

/**
 * Returns a Cloudinary image configured for banner usage.
 *
 * - Works even when Cloudinary isn't configured (falls back to Cloudinary "demo" cloud).
 * - Produces consistent banner sizing/cropping.
 * - Applies web-friendly delivery settings (auto format/quality/dpr).
 * - Optionally overlays a title (e.g. class name) on the image.
 */
export function bannerPhoto(publicId: string, title?: string) {
  const image = cld
    .image(publicId)
    // Keep a predictable banner aspect ratio for the UI
    .resize(fill().width(1200).height(400)) // 3:1
    // Optimize for the current device/browser
    .delivery(format("auto"))
    .delivery(quality("auto"))
    .delivery(dpr("auto"));

  const overlayText = title?.trim();
  if (!overlayText) return image;

  return image.overlay(
    source(
      text(
        overlayText,
        new TextStyle("roboto", 44)
          .fontWeight("bold")
          .lineSpacing(8)
      ).textColor("white")
    ).position(
      new Position()
        .gravity(compass("south_west"))
        .offsetY(0.2)
        .offsetX(0.04)
    )
  );
}

