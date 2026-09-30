import { describe, expect, it } from "vitest";
import { PptxPackage } from "../../../src/pptx/package/pptx-package";
import { readPresentationPart } from "../../../src/pptx/parts/presentation-part";
import { buildPptx } from "../../helpers/build-pptx";

async function read(options: Parameters<typeof buildPptx>[0]) {
  return readPresentationPart(await PptxPackage.open(await buildPptx(options)));
}

describe("readPresentationPart", () => {
  it("reads the slide size in points", async () => {
    const part = await read({ slideSize: { cx: 12192000, cy: 6858000 } });
    expect(part.slideSize).toEqual({ width: 960, height: 540 });
  });

  it("lists slides in presentation order, not file order", async () => {
    const part = await read({ slideCount: 3, order: [3, 1, 2] });
    expect(part.slidePaths).toEqual([
      "ppt/slides/slide3.xml",
      "ppt/slides/slide1.xml",
      "ppt/slides/slide2.xml",
    ]);
  });

  it("resolves absolute relationship targets", async () => {
    const part = await read({ slideCount: 2, absoluteTargets: true });
    expect(part.slidePaths).toEqual(["ppt/slides/slide1.xml", "ppt/slides/slide2.xml"]);
  });

  it("handles a presentation with no slides", async () => {
    const part = await read({ slideCount: 0 });
    expect(part.slidePaths).toEqual([]);
  });

  it("fails when the slide size is missing", async () => {
    await expect(read({ slideSize: null })).rejects.toThrow("Slide size is missing.");
  });

  it("fails when the main presentation part cannot be found", async () => {
    await expect(read({ omitRootRels: true })).rejects.toThrow("Main presentation part not found.");
  });
});
