import JSZip from "jszip";

export interface BuildPptxOptions {
  /** Slide size in EMU. Defaults to 16:9 (12192000 x 6858000). null leaves it out. */
  slideSize?: { cx: number; cy: number } | null;
  /** Number of empty slides. Ignored when `slides` is given. */
  slideCount?: number;
  /** Shapes (inner XML of <p:spTree>) for each slide. See ./shapes.ts. */
  slides?: string[];
  /** Shapes on the single slide layout every slide uses. */
  layoutShapes?: string;
  /** Shapes on the slide master. */
  masterShapes?: string;
  /** Slide part numbers in presentation order. Defaults to 1..N. */
  order?: number[];
  /** Write relationship targets as absolute paths ("/ppt/slides/..."). */
  absoluteTargets?: boolean;
  /** Leave out the package root relationships (_rels/.rels). */
  omitRootRels?: boolean;
}

const REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const NS =
  `xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" ` +
  `xmlns:r="${REL_NS}" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"`;
const XML_DECL = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`;

/** Builds a minimal .pptx package in memory, following PowerPoint's part layout. */
export async function buildPptx(options: BuildPptxOptions = {}): Promise<ArrayBuffer> {
  const slides = options.slides ?? Array.from({ length: options.slideCount ?? 1 }, () => "");
  const order = options.order ?? slides.map((_, i) => i + 1);
  const slideSize = options.slideSize === undefined ? { cx: 12192000, cy: 6858000 } : options.slideSize;
  const abs = options.absoluteTargets;

  const zip = new JSZip();
  if (!options.omitRootRels) {
    zip.file("_rels/.rels", rels([["rId1", "officeDocument", `${abs ? "/" : ""}ppt/presentation.xml`]]));
  }

  zip.file(
    "ppt/_rels/presentation.xml.rels",
    rels(slides.map((_, i) => [`rId${i + 2}`, "slide", `${abs ? "/ppt/" : ""}slides/slide${i + 1}.xml`])),
  );
  const sldIds = order.map((n, i) => `<p:sldId id="${256 + i}" r:id="rId${n + 1}"/>`).join("");
  const sldSz = slideSize ? `<p:sldSz cx="${slideSize.cx}" cy="${slideSize.cy}"/>` : "";
  zip.file("ppt/presentation.xml", `${XML_DECL}<p:presentation ${NS}><p:sldIdLst>${sldIds}</p:sldIdLst>${sldSz}</p:presentation>`);

  slides.forEach((shapes, i) => {
    zip.file(`ppt/slides/slide${i + 1}.xml`, part("p:sld", shapes));
    zip.file(`ppt/slides/_rels/slide${i + 1}.xml.rels`, rels([["rId1", "slideLayout", "../slideLayouts/slideLayout1.xml"]]));
  });
  zip.file("ppt/slideLayouts/slideLayout1.xml", part("p:sldLayout", options.layoutShapes ?? ""));
  zip.file("ppt/slideLayouts/_rels/slideLayout1.xml.rels", rels([["rId1", "slideMaster", "../slideMasters/slideMaster1.xml"]]));
  zip.file("ppt/slideMasters/slideMaster1.xml", part("p:sldMaster", options.masterShapes ?? ""));

  return zip.generateAsync({ type: "arraybuffer" });
}

function part(rootName: string, shapes: string): string {
  const spTree = `<p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/>${shapes}</p:spTree>`;
  return `${XML_DECL}<${rootName} ${NS}><p:cSld>${spTree}</p:cSld></${rootName}>`;
}

function rels(entries: [id: string, type: string, target: string][]): string {
  const items = entries
    .map(([id, type, target]) => `<Relationship Id="${id}" Type="${REL_NS}/${type}" Target="${target}"/>`)
    .join("");
  return `${XML_DECL}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${items}</Relationships>`;
}
