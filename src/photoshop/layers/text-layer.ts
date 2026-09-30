import { POINTS_PER_INCH, ptToPx, textLines, type TextElement } from "@core";
import type { Document } from "photoshop/dom/Document";

export interface TextLayerStyle {
  fontName: string;
  sizePt: number;
}

/**
 * Creates a point text layer (black) whose top-left corner sits at the element's frame.
 * Line breaks from the slide (Enter, Shift+Enter) are kept; automatic wrapping is not.
 * Must run inside `runModal`.
 */
export async function createTextLayer(
  doc: Document,
  element: TextElement,
  style: TextLayerStyle,
  ppi: number,
): Promise<void> {
  const left = ptToPx(element.frame.x, ppi);
  const top = ptToPx(element.frame.y, ppi);
  // Photoshop takes the font size in pixels here; the document resolution equals `ppi`.
  const fontSizePx = (style.sizePt / POINTS_PER_INCH) * ppi;

  const layer = await doc.createTextLayer({
    name: element.name,
    contents: textLines(element).join("\r"),
    fontName: style.fontName,
    fontSize: fontSizePx,
    // Point text is anchored at the first line's baseline; corrected below.
    position: { x: left, y: top + fontSizePx },
  });
  if (!layer) {
    throw new Error(`Photoshop could not create text layer "${element.name}".`);
  }

  const bounds = layer.bounds;
  await layer.translate(left - bounds.left, top - bounds.top);
}
