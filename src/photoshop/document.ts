import { app, constants } from "photoshop";
import type { Document } from "photoshop/dom/Document";

export interface SlideDocumentOptions {
  name: string;
  widthPx: number;
  heightPx: number;
  ppi: number;
}

/**
 * Creates an empty RGB document sized to a slide.
 * Must be called inside `core.executeAsModal`.
 */
export async function createSlideDocument(options: SlideDocumentOptions): Promise<Document> {
  const doc = await app.documents.add({
    name: options.name,
    width: options.widthPx,
    height: options.heightPx,
    resolution: options.ppi,
    mode: constants.NewDocumentMode.RGB,
    fill: constants.DocumentFill.WHITE,
  });
  if (!doc) {
    throw new Error(`Photoshop could not create document "${options.name}".`);
  }
  return doc;
}
