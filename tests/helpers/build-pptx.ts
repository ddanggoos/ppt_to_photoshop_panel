import JSZip from "jszip";

export interface BuildPptxOptions {
  /** Slide size in EMU. Defaults to 16:9 (12192000 x 6858000). */
  slideSize?: { cx: number; cy: number } | null;
  /** Number of slide parts (slide1.xml ... slideN.xml). */
  slideCount?: number;
  /** Slide part numbers in presentation order. Defaults to 1..slideCount. */
  order?: number[];
  /** Write relationship targets as absolute paths ("/ppt/slides/...") */
  absoluteTargets?: boolean;
  /** Leave out the package root relationships (_rels/.rels). */
  omitRootRels?: boolean;
}

const REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const P_NS = "http://schemas.openxmlformats.org/presentationml/2006/main";

/** Builds a minimal .pptx package in memory, following PowerPoint's part layout. */
export async function buildPptx(options: BuildPptxOptions = {}): Promise<ArrayBuffer> {
  const slideCount = options.slideCount ?? 1;
  const order = options.order ?? Array.from({ length: slideCount }, (_, i) => i + 1);
  const slideSize = options.slideSize === undefined ? { cx: 12192000, cy: 6858000 } : options.slideSize;
  const prefix = options.absoluteTargets ? "/ppt/" : "";

  const zip = new JSZip();
  if (!options.omitRootRels) {
    zip.file("_rels/.rels", rels([["rId1", "officeDocument", `${options.absoluteTargets ? "/" : ""}ppt/presentation.xml`]]));
  }

  const slideRels = Array.from({ length: slideCount }, (_, i): [string, string, string] =>
    [`rId${i + 2}`, "slide", `${prefix}slides/slide${i + 1}.xml`]);
  zip.file("ppt/_rels/presentation.xml.rels", rels(slideRels));

  const sldIds = order.map((n, i) => `<p:sldId id="${256 + i}" r:id="rId${n + 1}"/>`).join("");
  const sldSz = slideSize ? `<p:sldSz cx="${slideSize.cx}" cy="${slideSize.cy}"/>` : "";
  zip.file(
    "ppt/presentation.xml",
    `<?xml version="1.0" encoding="UTF-8"?><p:presentation xmlns:p="${P_NS}" xmlns:r="${REL_NS}">` +
      `<p:sldIdLst>${sldIds}</p:sldIdLst>${sldSz}</p:presentation>`,
  );

  for (let i = 1; i <= slideCount; i++) {
    zip.file(`ppt/slides/slide${i}.xml`, `<?xml version="1.0" encoding="UTF-8"?><p:sld xmlns:p="${P_NS}"/>`);
  }
  return zip.generateAsync({ type: "arraybuffer" });
}

function rels(entries: [id: string, type: string, target: string][]): string {
  const items = entries
    .map(([id, type, target]) => `<Relationship Id="${id}" Type="${REL_NS}/${type}" Target="${target}"/>`)
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${items}</Relationships>`;
}
