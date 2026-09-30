import { app, constants } from "photoshop";
import type { Document } from "photoshop/dom/Document";

export interface CreateDocumentOptions {
  name: string;
  widthPx: number;
  heightPx: number;
  ppi: number;
}

/** Creates an empty white RGB document. Must run inside `runModal`. */
export async function createDocument(options: CreateDocumentOptions): Promise<Document> {
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
