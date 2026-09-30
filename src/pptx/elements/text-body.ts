import type { TextParagraph } from "@core";
import { findChild, findChildren, getNumberAttr, type XmlElement } from "../xml/xml-element";

/** Inner margins of a text box, in EMU. */
export interface Insets {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

// OOXML defaults: 0.1in left/right, 0.05in top/bottom.
const DEFAULT_INSETS: Insets = { left: 91440, top: 45720, right: 91440, bottom: 45720 };

export function readInsets(bodyPr: XmlElement | undefined): Insets {
  return {
    left: getNumberAttr(bodyPr, "lIns") ?? DEFAULT_INSETS.left,
    top: getNumberAttr(bodyPr, "tIns") ?? DEFAULT_INSETS.top,
    right: getNumberAttr(bodyPr, "rIns") ?? DEFAULT_INSETS.right,
    bottom: getNumberAttr(bodyPr, "bIns") ?? DEFAULT_INSETS.bottom,
  };
}

/**
 * Reads the paragraphs of a `<p:txBody>`. Each `<a:p>` is a paragraph (Enter);
 * `<a:br>` starts a new line inside it (Shift+Enter). Automatic wrapping is not stored.
 */
export function readParagraphs(txBody: XmlElement): TextParagraph[] {
  return findChildren(txBody, "a:p").map(readParagraph);
}

function readParagraph(p: XmlElement): TextParagraph {
  const lines = [""];
  for (const child of p.children) {
    if (child.name === "a:r" || child.name === "a:fld") {
      lines[lines.length - 1] += findChild(child, "a:t")?.text ?? "";
    } else if (child.name === "a:br") {
      lines.push("");
    }
  }
  return { lines };
}

export function isBlank(paragraphs: TextParagraph[]): boolean {
  return paragraphs.every((paragraph) => paragraph.lines.every((line) => line.trim() === ""));
}
