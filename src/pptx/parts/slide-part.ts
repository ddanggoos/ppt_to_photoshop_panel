import type { Slide } from "@core";
import { readShapeTree } from "../elements/shape-tree";
import { IDENTITY } from "../elements/transform";
import type { PptxPackage } from "../package/pptx-package";
import { findPath } from "../xml/xml-element";
import type { PlaceholderFrames } from "./placeholder-frames";

/** Reads a slide part (ppt/slides/slideN.xml) into a slide with its elements. */
export async function readSlidePart(
  pkg: PptxPackage,
  path: string,
  number: number,
  placeholders: PlaceholderFrames,
): Promise<Slide> {
  const root = await pkg.readXml(path);
  const spTree = findPath(root, "p:cSld", "p:spTree");
  if (!spTree) return { number, elements: [] };

  const resolvePlaceholder = await placeholders.resolverFor(path);
  return { number, elements: readShapeTree(spTree, { transform: IDENTITY, resolvePlaceholder }) };
}
