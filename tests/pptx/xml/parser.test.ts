import { describe, expect, it } from "vitest";
import { parseXml } from "../../../src/pptx/xml/parser";
import { findChild, findPath, getNumberAttr } from "../../../src/pptx/xml/xml-element";

describe("parseXml", () => {
  it("returns the root element, skipping the XML declaration", () => {
    const root = parseXml(`<?xml version="1.0"?><root a="1"><child/></root>`);
    expect(root.name).toBe("root");
    expect(root.attributes).toEqual({ a: "1" });
  });

  it("keeps sibling order across different element names", () => {
    const root = parseXml(`<a:p><a:r/><a:br/><a:r/><a:fld/></a:p>`);
    expect(root.children.map((c) => c.name)).toEqual(["a:r", "a:br", "a:r", "a:fld"]);
  });

  it("preserves whitespace and decodes entities in text", () => {
    const root = parseXml(`<a:t>  A &amp; B &lt;C&gt;  </a:t>`);
    expect(root.text).toBe("  A & B <C>  ");
  });

  it("keeps attribute values as strings, including prefixed names", () => {
    const root = parseXml(`<p:sldId id="0256" r:id="rId2"/>`);
    expect(root.attributes).toEqual({ id: "0256", "r:id": "rId2" });
  });
});

describe("xml-element helpers", () => {
  const root = parseXml(`<a><b><c x="10" y="abc"/></b></a>`);

  it("follows child paths", () => {
    expect(findPath(root, "b", "c")?.name).toBe("c");
    expect(findPath(root, "b", "missing")).toBeUndefined();
    expect(findChild(undefined, "b")).toBeUndefined();
  });

  it("reads numeric attributes", () => {
    const c = findPath(root, "b", "c");
    expect(getNumberAttr(c, "x")).toBe(10);
    expect(getNumberAttr(c, "y")).toBeUndefined();
    expect(getNumberAttr(c, "z")).toBeUndefined();
  });
});
