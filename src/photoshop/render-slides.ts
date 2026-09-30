import type { Presentation, Slide } from "@core";
import type { Document } from "photoshop/dom/Document";
import type { Layer } from "photoshop/dom/Layer";
import { getTargetDocument } from "./document/target-document";
import { resolveFontName } from "./fonts/default-font";
import { listFonts } from "./fonts/list-fonts";
import { runModal } from "./host/modal";
import { createPlacement, type Placement } from "./layers/placement";
import { groupSlideLayers } from "./layers/slide-group";
import { createTextLayer, type TextLayerStyle } from "./layers/text-layer";
import { DEFAULT_PPI, type RenderOptions } from "./render-options";

/**
 * Adds the text of the chosen slides to the active document (or a new one),
 * one group per slide, as a single undoable history step.
 */
export async function renderSlides(presentation: Presentation, options: RenderOptions): Promise<void> {
  const slides = presentation.slides.filter((slide) => options.slideNumbers.includes(slide.number));
  const style: TextLayerStyle = {
    fontName: resolveFontName(options.textStyle.fontName, listFonts()),
    sizePt: options.textStyle.sizePt,
  };

  await runModal("PPT 텍스트 생성", async ({ progress, historyStep }) => {
    const doc = await getTargetDocument({
      slideSize: presentation.slideSize,
      name: options.documentName,
      ppi: DEFAULT_PPI,
    });
    const placement = createPlacement(presentation.slideSize, doc);

    await historyStep(doc, "PPT 텍스트 생성", async () => {
      for (const [i, slide] of slides.entries()) {
        progress(i / slides.length, `슬라이드 ${slide.number}`);
        const layers = await renderSlide(doc, slide, style, placement);
        await groupSlideLayers(doc, layers, slide.number);
      }
    });
  });
}

/** Creates the slide's layers back to front; each new layer lands on top. */
async function renderSlide(doc: Document, slide: Slide, style: TextLayerStyle, placement: Placement): Promise<Layer[]> {
  const layers: Layer[] = [];
  for (const element of slide.elements) {
    switch (element.kind) {
      case "text":
        layers.push(await createTextLayer(doc, element, style, placement));
        break;
    }
  }
  return layers;
}
