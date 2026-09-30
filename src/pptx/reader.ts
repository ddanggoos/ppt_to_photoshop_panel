import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";
import type { PptxPackage, PresentationInfo, SlideRef } from "./types";

const OFFICE_DOCUMENT_REL =
  "http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument";
const SLIDE_REL =
  "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide";

const ALWAYS_ARRAY = new Set(["Relationship", "p:sldId"]);

const xml = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  isArray: (name) => ALWAYS_ARRAY.has(name),
});

export class PptxError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PptxError";
  }
}

interface Relationship {
  "@_Id": string;
  "@_Type": string;
  "@_Target": string;
}

/** Opens a .pptx file and reads the presentation-level information. */
export async function openPptx(data: ArrayBuffer): Promise<PptxPackage> {
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(data);
  } catch {
    throw new PptxError("Not a valid .pptx file (ZIP could not be read).");
  }
  const info = await readPresentationInfo(zip);
  return { zip, info };
}

async function readPresentationInfo(zip: JSZip): Promise<PresentationInfo> {
  const rootRels = await readRelationships(zip, "_rels/.rels");
  const officeDoc = rootRels.find((r) => r["@_Type"] === OFFICE_DOCUMENT_REL);
  if (!officeDoc) {
    throw new PptxError("Main presentation part not found.");
  }
  const presentationPath = resolvePartPath("", officeDoc["@_Target"]);
  const presentation = (await readXml(zip, presentationPath))["p:presentation"];

  const sldSz = presentation?.["p:sldSz"];
  const slideWidthEmu = Number(sldSz?.["@_cx"]);
  const slideHeightEmu = Number(sldSz?.["@_cy"]);
  if (!slideWidthEmu || !slideHeightEmu) {
    throw new PptxError("Slide size is missing.");
  }

  const presentationRels = await readRelationships(zip, relsPathFor(presentationPath));
  const relsById = new Map(presentationRels.map((r) => [r["@_Id"], r]));
  const baseDir = dirname(presentationPath);

  const slideIds: Record<string, string>[] = presentation["p:sldIdLst"]?.["p:sldId"] ?? [];
  const slides: SlideRef[] = [];
  for (const sldId of slideIds) {
    const rel = relsById.get(sldId["@_r:id"]);
    if (rel?.["@_Type"] !== SLIDE_REL) continue;
    slides.push({ number: slides.length + 1, path: resolvePartPath(baseDir, rel["@_Target"]) });
  }

  return { slideWidthEmu, slideHeightEmu, slides };
}

async function readXml(zip: JSZip, path: string): Promise<any> {
  const file = zip.file(path);
  if (!file) {
    throw new PptxError(`Missing part: ${path}`);
  }
  return xml.parse(await file.async("string"));
}

async function readRelationships(zip: JSZip, path: string): Promise<Relationship[]> {
  if (!zip.file(path)) return [];
  const doc = await readXml(zip, path);
  return doc?.Relationships?.Relationship ?? [];
}

/** "ppt/presentation.xml" -> "ppt/_rels/presentation.xml.rels" */
function relsPathFor(partPath: string): string {
  const dir = dirname(partPath);
  const name = partPath.slice(dir ? dir.length + 1 : 0);
  return `${dir ? dir + "/" : ""}_rels/${name}.rels`;
}

function dirname(path: string): string {
  const i = path.lastIndexOf("/");
  return i === -1 ? "" : path.slice(0, i);
}

/** Resolves a relationship target (relative or absolute) to a package part path. */
export function resolvePartPath(baseDir: string, target: string): string {
  const segments = target.startsWith("/") ? [] : baseDir.split("/").filter(Boolean);
  for (const seg of target.split("/")) {
    if (seg === "" || seg === ".") continue;
    if (seg === "..") segments.pop();
    else segments.push(seg);
  }
  return segments.join("/");
}
