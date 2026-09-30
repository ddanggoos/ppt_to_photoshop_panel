import { ptToPx, type Size } from "@core";
import { app } from "photoshop";
import type { Document } from "photoshop/dom/Document";
import { createDocument } from "./create-document";

export interface TargetDocumentOptions {
  slideSize: Size;
  /** Used only when a new document has to be created. */
  name: string;
  ppi: number;
}

/** The active document, or a new slide-sized document when none is open. Must run inside `runModal`. */
export async function getTargetDocument(options: TargetDocumentOptions): Promise<Document> {
  const active = app.activeDocument;
  if (active) return active;

  return createDocument({
    name: options.name,
    widthPx: ptToPx(options.slideSize.width, options.ppi),
    heightPx: ptToPx(options.slideSize.height, options.ppi),
    ppi: options.ppi,
  });
}
