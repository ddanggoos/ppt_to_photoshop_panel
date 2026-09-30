import type { TextElement } from "@core";
import { emuToPt } from "../units";
import { findChild, findPath, getAttr, type XmlElement } from "../xml/xml-element";
import { readPlaceholderRef, type PlaceholderRef } from "./placeholder-ref";
import { isBlank, readInsets, readParagraphs } from "./text-body";
import { applyTransform, type Transform } from "./transform";
import { readXfrm, type EmuRect } from "./xfrm";

export interface ShapeContext {
  /** Maps the shape's coordinates to slide coordinates (non-identity inside groups). */
  transform: Transform;
  /** Frame inherited from the layout/master for placeholders without their own position. */
  resolvePlaceholder: (ref: PlaceholderRef) => EmuRect | undefined;
}

/** Converts a `<p:sp>` with text into a text element. Returns undefined when there is no text. */
export function readTextShape(sp: XmlElement, ctx: ShapeContext): TextElement | undefined {
  const txBody = findChild(sp, "p:txBody");
  if (!txBody) return undefined;

  const paragraphs = readParagraphs(txBody);
  if (isBlank(paragraphs)) return undefined;

  const box = readXfrm(findChild(sp, "p:spPr")) ?? resolveInheritedFrame(sp, ctx);
  if (!box) return undefined;

  const slideBox = applyTransform(ctx.transform, box);
  const insets = readInsets(findChild(txBody, "a:bodyPr"));
  return {
    kind: "text",
    name: getAttr(findPath(sp, "p:nvSpPr", "p:cNvPr"), "name") ?? "Text",
    frame: {
      x: emuToPt(slideBox.x + insets.left),
      y: emuToPt(slideBox.y + insets.top),
      width: emuToPt(Math.max(0, slideBox.cx - insets.left - insets.right)),
      height: emuToPt(Math.max(0, slideBox.cy - insets.top - insets.bottom)),
    },
    paragraphs,
  };
}

function resolveInheritedFrame(sp: XmlElement, ctx: ShapeContext): EmuRect | undefined {
  const ref = readPlaceholderRef(sp);
  return ref ? ctx.resolvePlaceholder(ref) : undefined;
}
