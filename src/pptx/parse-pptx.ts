import type { Presentation } from "@core";
import { PptxPackage } from "./package/pptx-package";
import { readPresentationPart } from "./parts/presentation-part";

/** Parses a .pptx file into the intermediate presentation model. */
export async function parsePptx(data: ArrayBuffer): Promise<Presentation> {
  const pkg = await PptxPackage.open(data);
  const presentation = await readPresentationPart(pkg);

  return {
    slideSize: presentation.slideSize,
    // TODO: parse each slide part (presentation.slidePaths) into slide elements.
    slides: presentation.slidePaths.map((_, i) => ({ number: i + 1 })),
  };
}
