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
 * Adds the chosen text boxes to the active document (or a new one),
 * one group per slide, as a single undoable history step.
 */
export async function renderSlides(presentation: Presentation, options: RenderOptions): Promise<void> {
  const slides = selectedSlides(presentation, options.selection);
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

/** Slides that have chosen text boxes, each narrowed to those boxes (stacking order kept). */
function selectedSlides(presentation: Presentation, selection: RenderOptions["selection"]): Slide[] {
  return presentation.slides.flatMap((slide) => {
    const indices = selection.get(slide.number);
    if (!indices || indices.length === 0) return [];
    return [{ ...slide, elements: slide.elements.filter((_, index) => indices.includes(index)) }];
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
