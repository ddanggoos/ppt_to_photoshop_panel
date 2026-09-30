import { POINTS_PER_INCH, type Size } from "@core";
import type { Document } from "photoshop/dom/Document";

/** Maps slide coordinates (pt) onto a Photoshop document. */
export interface Placement {
  toX(pt: number): number;
  toY(pt: number): number;
  /** Font size in document pixels, so Photoshop shows the chosen size in pt. */
  fontSizePx(pt: number): number;
}

/**
 * Positions are scaled so the slide fills the document (a slide-sized document maps 1:1).
 * Font sizes follow the document resolution, independent of that scaling.
 */
export function createPlacement(slideSize: Size, doc: Document): Placement {
  const scaleX = doc.width / slideSize.width;
  const scaleY = doc.height / slideSize.height;
  const pxPerPt = doc.resolution / POINTS_PER_INCH;
  return {
    toX: (pt) => Math.round(pt * scaleX),
    toY: (pt) => Math.round(pt * scaleY),
    fontSizePx: (pt) => pt * pxPerPt,
  };
}
