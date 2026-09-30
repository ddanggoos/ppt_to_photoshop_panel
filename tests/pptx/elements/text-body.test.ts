import { describe, expect, it } from "vitest";
import { isBlank, readInsets, readParagraphs } from "../../../src/pptx/elements/text-body";
import { parseXml } from "../../../src/pptx/xml/parser";
import { findChild } from "../../../src/pptx/xml/xml-element";

function txBody(inner: string) {
  return parseXml(`<p:txBody xmlns:a="a" xmlns:p="p"><a:bodyPr/>${inner}</p:txBody>`);
}

describe("readParagraphs", () => {
  it("splits paragraphs on <a:p> and lines on <a:br>", () => {
    const body = txBody(
      `<a:p><a:r><a:t>신제품 출시 안내</a:t></a:r></a:p>` +
        `<a:p><a:r><a:t>첫 줄</a:t></a:r><a:br/><a:r><a:t>둘째 줄</a:t></a:r></a:p>`,
    );
    expect(readParagraphs(body)).toEqual([{ lines: ["신제품 출시 안내"] }, { lines: ["첫 줄", "둘째 줄"] }]);
  });

  it("joins runs with different formatting into one line", () => {
    const body = txBody(`<a:p><a:r><a:rPr b="1"/><a:t>신제품</a:t></a:r><a:r><a:t> 출시</a:t></a:r></a:p>`);
    expect(readParagraphs(body)).toEqual([{ lines: ["신제품 출시"] }]);
  });

  it("includes field text such as slide numbers", () => {
    const body = txBody(`<a:p><a:r><a:t>Page </a:t></a:r><a:fld type="slidenum"><a:t>3</a:t></a:fld></a:p>`);
    expect(readParagraphs(body)).toEqual([{ lines: ["Page 3"] }]);
  });

  it("keeps empty paragraphs (blank lines)", () => {
    const body = txBody(`<a:p><a:r><a:t>A</a:t></a:r></a:p><a:p><a:endParaRPr/></a:p><a:p><a:r><a:t>B</a:t></a:r></a:p>`);
    expect(readParagraphs(body)).toEqual([{ lines: ["A"] }, { lines: [""] }, { lines: ["B"] }]);
  });
});

describe("isBlank", () => {
  it("is true only when every line is empty or whitespace", () => {
    expect(isBlank([{ lines: [""] }, { lines: ["  "] }])).toBe(true);
    expect(isBlank([{ lines: [""] }, { lines: ["x"] }])).toBe(false);
  });
});

describe("readInsets", () => {
  it("uses OOXML defaults when not specified", () => {
    expect(readInsets(findChild(txBody(""), "a:bodyPr"))).toEqual({ left: 91440, top: 45720, right: 91440, bottom: 45720 });
  });

  it("reads explicit insets", () => {
    const bodyPr = parseXml(`<a:bodyPr lIns="0" tIns="10" rIns="20" bIns="30"/>`);
    expect(readInsets(bodyPr)).toEqual({ left: 0, top: 10, right: 20, bottom: 30 });
  });
});
