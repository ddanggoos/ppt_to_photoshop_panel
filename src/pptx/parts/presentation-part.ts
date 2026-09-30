import type { Size } from "@core";
import { PptxError } from "../errors";
import { readRelationships, RelType } from "../package/relationships";
import type { PptxPackage } from "../package/pptx-package";
import { emuToPt } from "../units";
import { ATTR } from "../xml/parser";

export interface PresentationPart {
  slideSize: Size;
  /** Slide part paths in presentation order. */
  slidePaths: string[];
}

/** Reads ppt/presentation.xml: slide size and slide order. */
export async function readPresentationPart(pkg: PptxPackage): Promise<PresentationPart> {
  const path = await findPresentationPath(pkg);
  const root = (await pkg.readXml(path))["p:presentation"];

  const sldSz = root?.["p:sldSz"];
  const widthEmu = Number(sldSz?.[`${ATTR}cx`]);
  const heightEmu = Number(sldSz?.[`${ATTR}cy`]);
  if (!widthEmu || !heightEmu) {
    throw new PptxError("Slide size is missing.");
  }

  const rels = await readRelationships(pkg, path);
  const slideRels = new Map(rels.filter((r) => r.type === RelType.slide).map((r) => [r.id, r]));
  const slideIds: Record<string, string>[] = root["p:sldIdLst"]?.["p:sldId"] ?? [];
  const slidePaths = slideIds
    .map((sldId) => slideRels.get(sldId[`${ATTR}r:id`])?.target)
    .filter((target): target is string => target !== undefined);

  return {
    slideSize: { width: emuToPt(widthEmu), height: emuToPt(heightEmu) },
    slidePaths,
  };
}

async function findPresentationPath(pkg: PptxPackage): Promise<string> {
  const rootRels = await readRelationships(pkg, "");
  const officeDocument = rootRels.find((r) => r.type === RelType.officeDocument);
  if (!officeDocument) {
    throw new PptxError("Main presentation part not found.");
  }
  return officeDocument.target;
}
