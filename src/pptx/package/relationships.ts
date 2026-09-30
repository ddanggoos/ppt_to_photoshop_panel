import { ATTR } from "../xml/parser";
import { dirname, relsPathFor, resolvePartPath } from "./part-path";
import type { PptxPackage } from "./pptx-package";

const REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";

export const RelType = {
  officeDocument: `${REL_NS}/officeDocument`,
  slide: `${REL_NS}/slide`,
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

  const doc = await pkg.readXml(relsPath);
  const baseDir = dirname(partPath);
  const nodes: Record<string, string>[] = doc?.Relationships?.Relationship ?? [];
  return nodes.map((node) => ({
    id: node[`${ATTR}Id`],
    type: node[`${ATTR}Type`],
    target: resolvePartPath(baseDir, node[`${ATTR}Target`]),
  }));
}
