import { findChild, getNumberAttr, type XmlElement } from "../xml/xml-element";

/** Rectangle in EMU. */
export interface EmuRect {
  x: number;
  y: number;
  cx: number;
  cy: number;
}

/** Reads `<a:xfrm>` (offset and extent) from a shape's `<p:spPr>`. */
export function readXfrm(spPr: XmlElement | undefined): EmuRect | undefined {
  const xfrm = findChild(spPr, "a:xfrm");
  return readRect(findChild(xfrm, "a:off"), findChild(xfrm, "a:ext"));
}

export interface GroupXfrm {
  /** Where the group sits in its parent's coordinate space. */
  frame: EmuRect;
  /** The coordinate space its children are expressed in. */
  childFrame: EmuRect;
}

/** Reads `<a:xfrm>` of a group's `<p:grpSpPr>`, including the child coordinate space. */
export function readGroupXfrm(grpSpPr: XmlElement | undefined): GroupXfrm | undefined {
  const xfrm = findChild(grpSpPr, "a:xfrm");
  const frame = readRect(findChild(xfrm, "a:off"), findChild(xfrm, "a:ext"));
  const childFrame = readRect(findChild(xfrm, "a:chOff"), findChild(xfrm, "a:chExt"));
  return frame && childFrame ? { frame, childFrame } : undefined;
}

function readRect(off: XmlElement | undefined, ext: XmlElement | undefined): EmuRect | undefined {
  const x = getNumberAttr(off, "x");
  const y = getNumberAttr(off, "y");
  const cx = getNumberAttr(ext, "cx");
  const cy = getNumberAttr(ext, "cy");
  if (x === undefined || y === undefined || cx === undefined || cy === undefined) return undefined;
  return { x, y, cx, cy };
}
