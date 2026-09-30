import { describe, expect, it } from "vitest";
import { applyTransform, groupTransform, IDENTITY } from "../../../src/pptx/elements/transform";
import { parseXml } from "../../../src/pptx/xml/parser";

function grpSpPr(off: [number, number], ext: [number, number], chOff: [number, number], chExt: [number, number]) {
  return parseXml(
    `<p:grpSpPr><a:xfrm><a:off x="${off[0]}" y="${off[1]}"/><a:ext cx="${ext[0]}" cy="${ext[1]}"/>` +
      `<a:chOff x="${chOff[0]}" y="${chOff[1]}"/><a:chExt cx="${chExt[0]}" cy="${chExt[1]}"/></a:xfrm></p:grpSpPr>`,
  );
}

describe("groupTransform", () => {
  it("moves children when the group is moved", () => {
    const t = groupTransform(IDENTITY, grpSpPr([1000, 2000], [500, 500], [0, 0], [500, 500]));
    expect(applyTransform(t, { x: 100, y: 100, cx: 50, cy: 50 })).toEqual({ x: 1100, y: 2100, cx: 50, cy: 50 });
  });

  it("scales children when the group is resized", () => {
    const t = groupTransform(IDENTITY, grpSpPr([0, 0], [1000, 400], [100, 100], [500, 200]));
    expect(applyTransform(t, { x: 100, y: 100, cx: 500, cy: 200 })).toEqual({ x: 0, y: 0, cx: 1000, cy: 400 });
    expect(applyTransform(t, { x: 350, y: 200, cx: 50, cy: 50 })).toEqual({ x: 500, y: 200, cx: 100, cy: 100 });
  });

  it("composes nested groups", () => {
    const outer = groupTransform(IDENTITY, grpSpPr([1000, 0], [200, 200], [0, 0], [100, 100]));
    const inner = groupTransform(outer, grpSpPr([10, 10], [50, 50], [0, 0], [50, 50]));
    // inner child (0,0) -> outer child (10,10) -> slide (1000 + 10*2, 0 + 10*2)
    expect(applyTransform(inner, { x: 0, y: 0, cx: 5, cy: 5 })).toEqual({ x: 1020, y: 20, cx: 10, cy: 10 });
  });

  it("returns the parent transform when the group has no transform", () => {
    expect(groupTransform(IDENTITY, parseXml(`<p:grpSpPr/>`))).toBe(IDENTITY);
  });
});
