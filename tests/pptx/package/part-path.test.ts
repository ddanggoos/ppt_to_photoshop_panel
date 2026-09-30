import { describe, expect, it } from "vitest";
import { dirname, relsPathFor, resolvePartPath } from "../../../src/pptx/package/part-path";

describe("dirname", () => {
  it("returns the folder of a part", () => {
    expect(dirname("ppt/slides/slide1.xml")).toBe("ppt/slides");
    expect(dirname("[Content_Types].xml")).toBe("");
  });
});

describe("relsPathFor", () => {
  it("points to the _rels folder next to the part", () => {
    expect(relsPathFor("ppt/presentation.xml")).toBe("ppt/_rels/presentation.xml.rels");
    expect(relsPathFor("ppt/slides/slide1.xml")).toBe("ppt/slides/_rels/slide1.xml.rels");
  });
});

describe("resolvePartPath", () => {
  it("resolves relative targets against the base folder", () => {
    expect(resolvePartPath("ppt", "slides/slide1.xml")).toBe("ppt/slides/slide1.xml");
    expect(resolvePartPath("ppt/slides", "../media/image1.png")).toBe("ppt/media/image1.png");
    expect(resolvePartPath("ppt", "./theme/theme1.xml")).toBe("ppt/theme/theme1.xml");
  });

  it("treats a leading slash as the package root", () => {
    expect(resolvePartPath("ppt/slides", "/ppt/media/image1.png")).toBe("ppt/media/image1.png");
  });

  it("resolves root-level targets", () => {
    expect(resolvePartPath("", "ppt/presentation.xml")).toBe("ppt/presentation.xml");
  });
});
