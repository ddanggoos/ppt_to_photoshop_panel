import type { Document } from "photoshop/dom/Document";
import type { Layer } from "photoshop/dom/Layer";

export function slideGroupName(slideNumber: number): string {
  return `슬라이드 ${slideNumber}`;
}

/** Puts a slide's layers into one group named after the slide. Must run inside `runModal`. */
export async function groupSlideLayers(doc: Document, layers: Layer[], slideNumber: number): Promise<void> {
  if (layers.length === 0) return;
  const group = await doc.createLayerGroup({ name: slideGroupName(slideNumber), fromLayers: layers });
  if (!group) {
    throw new Error(`Photoshop could not create the group for slide ${slideNumber}.`);
  }
}
