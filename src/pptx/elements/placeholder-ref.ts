import { findPath, getAttr, getNumberAttr, type XmlElement } from "../xml/xml-element";

/** Identifies a placeholder (`<p:ph>`) so it can be matched to its layout and master. */
export interface PlaceholderRef {
  type: string;
  idx?: number;
}

/** Reads `<p:nvSpPr><p:nvPr><p:ph>` of a shape, or undefined if it is not a placeholder. */
export function readPlaceholderRef(sp: XmlElement): PlaceholderRef | undefined {
  const ph = findPath(sp, "p:nvSpPr", "p:nvPr", "p:ph");
  if (!ph) return undefined;
  // "obj" is the spec default when the type attribute is omitted.
  return { type: getAttr(ph, "type") ?? "obj", idx: getNumberAttr(ph, "idx") };
}
