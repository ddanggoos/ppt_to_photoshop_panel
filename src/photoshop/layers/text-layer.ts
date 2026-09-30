import { textLines, type TextElement } from "@core";
import type { Document } from "photoshop/dom/Document";
import type { Layer } from "photoshop/dom/Layer";
import type { Placement } from "./placement";

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
  placement: Placement,
): Promise<Layer> {
  const left = placement.toX(element.frame.x);
  const top = placement.toY(element.frame.y);
  const fontSizePx = placement.fontSizePx(style.sizePt);

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
  return layer;
}
