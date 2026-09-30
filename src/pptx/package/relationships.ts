import { findChildren, getAttr } from "../xml/xml-element";
import { dirname, relsPathFor, resolvePartPath } from "./part-path";
import type { PptxPackage } from "./pptx-package";

const REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";

export const RelType = {
  officeDocument: `${REL_NS}/officeDocument`,
  slide: `${REL_NS}/slide`,
  slideLayout: `${REL_NS}/slideLayout`,
  slideMaster: `${REL_NS}/slideMaster`,
} as const;

export interface Relationship {
  id: string;
  type: string;
  /** Target resolved to a part path inside the package. */
  target: string;
}

/**
 * Reads the relationships of a part. Pass "" for the package root (`_rels/.rels`).
 * A part without a .rels file has no relationships.
 */
export async function readRelationships(pkg: PptxPackage, partPath: string): Promise<Relationship[]> {
  const relsPath = partPath ? relsPathFor(partPath) : "_rels/.rels";
  if (!pkg.hasPart(relsPath)) return [];

  const root = await pkg.readXml(relsPath);
  const baseDir = dirname(partPath);
  return findChildren(root, "Relationship").map((rel) => ({
    id: getAttr(rel, "Id") ?? "",
    type: getAttr(rel, "Type") ?? "",
    target: resolvePartPath(baseDir, getAttr(rel, "Target") ?? ""),
  }));
}

/** Target of the first relationship of the given type, if any. */
export async function findRelatedPart(pkg: PptxPackage, partPath: string, type: string): Promise<string | undefined> {
  const rels = await readRelationships(pkg, partPath);
  return rels.find((rel) => rel.type === type)?.target;
}
