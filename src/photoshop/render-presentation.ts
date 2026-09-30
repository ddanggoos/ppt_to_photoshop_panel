import { ptToPx, type Presentation } from "@core";
import { createDocument } from "./document/create-document";
import { runModal } from "./host/modal";
import { DEFAULT_PPI, type RenderOptions } from "./render-options";

/** Renders each slide into its own Photoshop document. */
export async function renderPresentation(presentation: Presentation, options: RenderOptions): Promise<void> {
  const ppi = options.ppi ?? DEFAULT_PPI;
  const { slideSize } = presentation;
  const slides = options.slideNumbers
    ? presentation.slides.filter((s) => options.slideNumbers!.includes(s.number))
    : presentation.slides;

  await runModal("Convert PPT slides", async (progress) => {
    for (const [i, slide] of slides.entries()) {
      progress(i / slides.length, `Slide ${slide.number}`);
      await createDocument({
        name: `${options.baseName} - Slide ${slide.number}`,
        widthPx: ptToPx(slideSize.width, ppi),
        heightPx: ptToPx(slideSize.height, ppi),
        ppi,
      });
      // TODO: render slide elements as layers (photoshop/layers/).
    }
  });
}
