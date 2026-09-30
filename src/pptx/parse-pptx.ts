import type { Presentation, Slide } from "@core";
import { PptxPackage } from "./package/pptx-package";
import { PlaceholderFrames } from "./parts/placeholder-frames";
import { readPresentationPart } from "./parts/presentation-part";
import { readSlidePart } from "./parts/slide-part";

/** Parses a .pptx file into the intermediate presentation model. */
export async function parsePptx(data: ArrayBuffer): Promise<Presentation> {
  const pkg = await PptxPackage.open(data);
  const presentation = await readPresentationPart(pkg);
  const placeholders = new PlaceholderFrames(pkg);

  const slides: Slide[] = [];
  for (const [i, path] of presentation.slidePaths.entries()) {
    slides.push(await readSlidePart(pkg, path, i + 1, placeholders));
  }
  return { slideSize: presentation.slideSize, slides };
}
