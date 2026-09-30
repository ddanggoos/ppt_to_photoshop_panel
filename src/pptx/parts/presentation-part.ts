import type { Size } from "@core";
import { PptxError } from "../errors";
import { findRelatedPart, readRelationships, RelType } from "../package/relationships";
import type { PptxPackage } from "../package/pptx-package";
import { emuToPt } from "../units";
import { findChild, findChildren, getAttr, getNumberAttr } from "../xml/xml-element";

export interface PresentationPart {
  slideSize: Size;
  /** Slide part paths in presentation order. */
  slidePaths: string[];
}

/** Reads ppt/presentation.xml: slide size and slide order. */
export async function readPresentationPart(pkg: PptxPackage): Promise<PresentationPart> {
  const path = await findRelatedPart(pkg, "", RelType.officeDocument);
  if (!path) {
    throw new PptxError("Main presentation part not found.");
  }
  const root = await pkg.readXml(path);

  const sldSz = findChild(root, "p:sldSz");
  const widthEmu = getNumberAttr(sldSz, "cx");
  const heightEmu = getNumberAttr(sldSz, "cy");
  if (!widthEmu || !heightEmu) {
    throw new PptxError("Slide size is missing.");
  }

  const rels = await readRelationships(pkg, path);
  const slideTargets = new Map(rels.filter((r) => r.type === RelType.slide).map((r) => [r.id, r.target]));
  const slidePaths = findChildren(findChild(root, "p:sldIdLst"), "p:sldId")
    .map((sldId) => slideTargets.get(getAttr(sldId, "r:id") ?? ""))
    .filter((target): target is string => target !== undefined);

  return {
    slideSize: { width: emuToPt(widthEmu), height: emuToPt(heightEmu) },
    slidePaths,
  };
}
