import { describe, expect, it } from "vitest";
import { ptToPx } from "@core";

describe("ptToPx", () => {
  it("converts points to pixels at the given resolution", () => {
    expect(ptToPx(72, 72)).toBe(72);
    expect(ptToPx(960, 144)).toBe(1920);
    expect(ptToPx(540, 144)).toBe(1080);
  });

  it("rounds to whole pixels", () => {
    expect(ptToPx(10, 100)).toBe(14);
  });
});
