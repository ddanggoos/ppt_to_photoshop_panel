import { describe, expect, it } from "vitest";
import { parsePptx } from "@pptx";
import { buildPptx } from "../../helpers/build-pptx";
import { group, placeholderFrame, plainShape, textBox } from "../../helpers/shapes";

const NO_INSETS = { l: 0, t: 0, r: 0, b: 0 };
const EMU_PER_PT = 12700;
const pt = (n: number) => n * EMU_PER_PT;

async function slideElements(options: Parameters<typeof buildPptx>[0]) {
  const presentation = await parsePptx(await buildPptx(options));
  return presentation.slides[0].elements;
}

describe("slide text extraction", () => {
  it("creates one text element per text box, in stacking order", async () => {
    const elements = await slideElements({
      slides: [
        textBox({ name: "제목", box: { x: 0, y: 0, cx: pt(100), cy: pt(20) }, paragraphs: ["신제품 출시"] }) +
          textBox({ name: "본문", box: { x: 0, y: pt(50), cx: pt(100), cy: pt(20) }, paragraphs: ["설명"] }),
      ],
    });
    expect(elements.map((e) => e.name)).toEqual(["제목", "본문"]);
  });

  it("keeps paragraphs and line breaks", async () => {
    const [element] = await slideElements({
      slides: [textBox({ box: { x: 0, y: 0, cx: pt(100), cy: pt(50) }, paragraphs: ["안내", ["첫 줄", "둘째 줄"]] })],
    });
    expect(element.paragraphs).toEqual([{ lines: ["안내"] }, { lines: ["첫 줄", "둘째 줄"] }]);
  });

  it("uses the text area inside the box's inner margins, in points", async () => {
    const [withDefaults] = await slideElements({
      slides: [textBox({ box: { x: pt(100), y: pt(50), cx: pt(200), cy: pt(40) }, paragraphs: ["A"] })],
    });
    // Default insets: 7.2pt left/right, 3.6pt top/bottom.
    expect(withDefaults.frame).toEqual({ x: 107.2, y: 53.6, width: 185.6, height: 32.8 });

    const [noInsets] = await slideElements({
      slides: [textBox({ box: { x: pt(100), y: pt(50), cx: pt(200), cy: pt(40) }, insets: NO_INSETS, paragraphs: ["A"] })],
    });
    expect(noInsets.frame).toEqual({ x: 100, y: 50, width: 200, height: 40 });
  });

  it("skips shapes without text and empty text boxes", async () => {
    const elements = await slideElements({
      slides: [
        plainShape({ x: 0, y: 0, cx: 10, cy: 10 }) +
          textBox({ name: "빈 상자", box: { x: 0, y: 0, cx: 10, cy: 10 }, paragraphs: ["", "  "] }) +
          textBox({ name: "내용", box: { x: 0, y: 0, cx: 10, cy: 10 }, paragraphs: ["x"] }),
      ],
    });
    expect(elements.map((e) => e.name)).toEqual(["내용"]);
  });

  it("places text inside groups in slide coordinates", async () => {
    const [element] = await slideElements({
      slides: [
        group(
          { x: pt(100), y: pt(100), cx: pt(200), cy: pt(200) },
          { x: 0, y: 0, cx: pt(100), cy: pt(100) },
          textBox({ box: { x: pt(10), y: pt(20), cx: pt(50), cy: pt(10) }, insets: NO_INSETS, paragraphs: ["그룹 안"] }),
        ),
      ],
    });
    expect(element.frame).toEqual({ x: 120, y: 140, width: 100, height: 20 });
  });
});

describe("placeholder position inheritance", () => {
  const titleText = textBox({ name: "제목 1", placeholder: { type: "title" }, insets: NO_INSETS, paragraphs: ["제목"] });

  it("takes the position from the slide layout", async () => {
    const [element] = await slideElements({
      slides: [titleText],
      layoutShapes: placeholderFrame({ type: "title" }, { x: pt(10), y: pt(20), cx: pt(300), cy: pt(40) }),
    });
    expect(element.frame).toEqual({ x: 10, y: 20, width: 300, height: 40 });
  });

  it("falls back to the slide master when the layout has no position", async () => {
    const [element] = await slideElements({
      slides: [titleText],
      layoutShapes: placeholderFrame({ type: "title" }),
      masterShapes: placeholderFrame({ type: "title" }, { x: pt(30), y: pt(40), cx: pt(200), cy: pt(20) }),
    });
    expect(element.frame).toEqual({ x: 30, y: 40, width: 200, height: 20 });
  });

  it("matches body placeholders by index", async () => {
    const [element] = await slideElements({
      slides: [textBox({ placeholder: { idx: 2 }, insets: NO_INSETS, paragraphs: ["두 번째 본문"] })],
      layoutShapes:
        placeholderFrame({ type: "body", idx: 1 }, { x: pt(10), y: 0, cx: pt(10), cy: pt(10) }) +
        placeholderFrame({ type: "body", idx: 2 }, { x: pt(500), y: 0, cx: pt(10), cy: pt(10) }),
    });
    expect(element.frame.x).toBe(500);
  });

  it("maps a centered title on the layout to the master's title", async () => {
    const [element] = await slideElements({
      slides: [textBox({ placeholder: { type: "ctrTitle" }, insets: NO_INSETS, paragraphs: ["표지 제목"] })],
      masterShapes: placeholderFrame({ type: "title" }, { x: pt(1), y: pt(2), cx: pt(3), cy: pt(4) }),
    });
    expect(element.frame).toEqual({ x: 1, y: 2, width: 3, height: 4 });
  });

  it("skips a placeholder whose position cannot be found", async () => {
    expect(await slideElements({ slides: [titleText] })).toEqual([]);
  });
});
