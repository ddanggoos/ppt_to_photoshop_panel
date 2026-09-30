import type { XmlElement } from "../xml/xml-element";
import { readGroupXfrm, type EmuRect } from "./xfrm";

/** Maps coordinates of a nested shape to slide coordinates (scale, then offset). */
export interface Transform {
  scaleX: number;
  scaleY: number;
  offsetX: number;
  offsetY: number;
}

export const IDENTITY: Transform = { scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0 };

export function applyTransform(t: Transform, rect: EmuRect): EmuRect {
  return {
    x: t.offsetX + rect.x * t.scaleX,
    y: t.offsetY + rect.y * t.scaleY,
    cx: rect.cx * t.scaleX,
    cy: rect.cy * t.scaleY,
  };
}

/**
 * Transform for the children of a group: their child coordinate space (chOff/chExt)
 * is mapped onto the group's frame (off/ext), then through the parent transform.
 * Rotation and flips are not handled yet.
 */
export function groupTransform(parent: Transform, grpSpPr: XmlElement | undefined): Transform {
  const xfrm = readGroupXfrm(grpSpPr);
  if (!xfrm) return parent;

  const { frame, childFrame } = xfrm;
  const scaleX = childFrame.cx ? frame.cx / childFrame.cx : 1;
  const scaleY = childFrame.cy ? frame.cy / childFrame.cy : 1;
  const local: Transform = {
    scaleX,
    scaleY,
    offsetX: frame.x - childFrame.x * scaleX,
    offsetY: frame.y - childFrame.y * scaleY,
  };
  return {
    scaleX: parent.scaleX * local.scaleX,
    scaleY: parent.scaleY * local.scaleY,
    offsetX: parent.offsetX + parent.scaleX * local.offsetX,
    offsetY: parent.offsetY + parent.scaleY * local.offsetY,
  };
}
