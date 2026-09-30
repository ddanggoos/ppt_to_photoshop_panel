import { ptToPx, type Presentation, type SlideElement } from "@core";
import type { Document } from "photoshop/dom/Document";
import { createDocument } from "./document/create-document";
import { resolveFontName } from "./fonts/default-font";
import { listFonts } from "./fonts/list-fonts";
import { runModal } from "./host/modal";
import { createTextLayer, type TextLayerStyle } from "./layers/text-layer";
import { DEFAULT_PPI, type RenderOptions } from "./render-options";

/** Renders each slide into its own Photoshop document. */
export async function renderPresentation(presentation: Presentation, options: RenderOptions): Promise<void> {
  const ppi = options.ppi ?? DEFAULT_PPI;
  const { slideSize } = presentation;
  const slides = options.slideNumbers
    ? presentation.slides.filter((s) => options.slideNumbers!.includes(s.number))
    : presentation.slides;
  const textStyle: TextLayerStyle = {
    fontName: resolveFontName(options.textStyle.fontName, listFonts()),
    sizePt: options.textStyle.sizePt,
  };

  await runModal("Convert PPT slides", async (progress) => {
    for (const [i, slide] of slides.entries()) {
      progress(i / slides.length, `Slide ${slide.number}`);
      const doc = await createDocument({
        name: `${options.baseName} - Slide ${slide.number}`,
        widthPx: ptToPx(slideSize.width, ppi),
        heightPx: ptToPx(slideSize.height, ppi),
        ppi,
      });
      // Elements are back to front, and each new layer is created on top.
      for (const element of slide.elements) {
        await renderElement(doc, element, textStyle, ppi);
      }
    }
  });
}

async function renderElement(doc: Document, element: SlideElement, textStyle: TextLayerStyle, ppi: number): Promise<void> {
  switch (element.kind) {
    case "text":
      await createTextLayer(doc, element, textStyle, ppi);
      break;
  }
}
