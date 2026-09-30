import { describe, expect, it } from "vitest";
import { parsePptx, PptxError } from "@pptx";
import { buildPptx } from "../helpers/build-pptx";

describe("parsePptx", () => {
  it("builds the presentation model", async () => {
    const presentation = await parsePptx(await buildPptx({ slideCount: 3 }));
    expect(presentation).toEqual({
      slideSize: { width: 960, height: 540 },
      slides: [{ number: 1 }, { number: 2 }, { number: 3 }],
    });
  });

  it("supports 4:3 slides", async () => {
    const presentation = await parsePptx(await buildPptx({ slideSize: { cx: 9144000, cy: 6858000 } }));
    expect(presentation.slideSize).toEqual({ width: 720, height: 540 });
  });

  it("rejects files that are not ZIP packages", async () => {
    const notZip = new TextEncoder().encode("hello").buffer as ArrayBuffer;
    await expect(parsePptx(notZip)).rejects.toBeInstanceOf(PptxError);
  });
});
