// XML snippets for shapes inside <p:spTree>, used with buildPptx({ slides }).

export interface EmuBox {
  x: number;
  y: number;
  cx: number;
  cy: number;
}

export interface TextBoxOptions {
  name?: string;
  /** Omit to inherit the position (placeholders). */
  box?: EmuBox;
  /** Each item is a paragraph; an array paragraph is split by line breaks (<a:br/>). */
  paragraphs: (string | string[])[];
  /** Explicit inner margins; OOXML defaults apply when omitted. */
  insets?: { l: number; t: number; r: number; b: number };
  placeholder?: { type?: string; idx?: number };
}

export function textBox(options: TextBoxOptions): string {
  const ph = options.placeholder;
  const phXml = ph
    ? `<p:ph${ph.type ? ` type="${ph.type}"` : ""}${ph.idx !== undefined ? ` idx="${ph.idx}"` : ""}/>`
    : "";
  const insets = options.insets;
  const bodyPr = insets
    ? `<a:bodyPr lIns="${insets.l}" tIns="${insets.t}" rIns="${insets.r}" bIns="${insets.b}"/>`
    : "<a:bodyPr/>";
  const paragraphs = options.paragraphs.map((p) => paragraph(Array.isArray(p) ? p : [p])).join("");

  return (
    `<p:sp><p:nvSpPr><p:cNvPr id="2" name="${options.name ?? "TextBox"}"/><p:cNvSpPr/><p:nvPr>${phXml}</p:nvPr></p:nvSpPr>` +
    `<p:spPr>${options.box ? xfrm(options.box) : ""}</p:spPr>` +
    `<p:txBody>${bodyPr}<a:lstStyle/>${paragraphs}</p:txBody></p:sp>`
  );
}

/** A placeholder on a layout or master: position only, no text. Omit `box` for no position. */
export function placeholderFrame(ph: { type?: string; idx?: number }, box?: EmuBox): string {
  const attrs = `${ph.type ? ` type="${ph.type}"` : ""}${ph.idx !== undefined ? ` idx="${ph.idx}"` : ""}`;
  return (
    `<p:sp><p:nvSpPr><p:cNvPr id="3" name="Placeholder"/><p:cNvSpPr/><p:nvPr><p:ph${attrs}/></p:nvPr></p:nvSpPr>` +
    `<p:spPr>${box ? xfrm(box) : ""}</p:spPr></p:sp>`
  );
}

export function group(frame: EmuBox, childFrame: EmuBox, children: string): string {
  return (
    `<p:grpSp><p:nvGrpSpPr><p:cNvPr id="4" name="Group"/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>` +
    `<p:grpSpPr><a:xfrm><a:off x="${frame.x}" y="${frame.y}"/><a:ext cx="${frame.cx}" cy="${frame.cy}"/>` +
    `<a:chOff x="${childFrame.x}" y="${childFrame.y}"/><a:chExt cx="${childFrame.cx}" cy="${childFrame.cy}"/></a:xfrm></p:grpSpPr>` +
    `${children}</p:grpSp>`
  );
}

/** A shape without text (e.g. a rectangle). */
export function plainShape(box: EmuBox): string {
  return `<p:sp><p:nvSpPr><p:cNvPr id="5" name="Rectangle"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr>${xfrm(box)}</p:spPr></p:sp>`;
}

function xfrm(box: EmuBox): string {
  return `<a:xfrm><a:off x="${box.x}" y="${box.y}"/><a:ext cx="${box.cx}" cy="${box.cy}"/></a:xfrm>`;
}

function paragraph(lines: string[]): string {
  const runs = lines.map((line) => (line ? `<a:r><a:rPr lang="ko-KR"/><a:t>${escapeXml(line)}</a:t></a:r>` : ""));
  return `<a:p>${runs.join("<a:br/>")}</a:p>`;
}

function escapeXml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
