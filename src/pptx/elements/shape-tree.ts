import type { SlideElement } from "@core";
import { findChild, type XmlElement } from "../xml/xml-element";
import { readTextShape, type ShapeContext } from "./text-shape";
import { groupTransform } from "./transform";

/**
 * Walks a shape tree (`<p:spTree>` or `<p:grpSp>`) in document order,
 * which is the stacking order from back to front.
 */
export function readShapeTree(container: XmlElement, ctx: ShapeContext): SlideElement[] {
  const elements: SlideElement[] = [];
  for (const child of container.children) {
    if (child.name === "p:sp") {
      const text = readTextShape(child, ctx);
      if (text) elements.push(text);
    } else if (child.name === "p:grpSp") {
      const transform = groupTransform(ctx.transform, findChild(child, "p:grpSpPr"));
      elements.push(...readShapeTree(child, { ...ctx, transform }));
    }
    // TODO: pictures (p:pic), connectors, graphic frames.
  }
  return elements;
}
