import { readPlaceholderRef, type PlaceholderRef } from "../elements/placeholder-ref";
import { readXfrm, type EmuRect } from "../elements/xfrm";
import { findRelatedPart, RelType } from "../package/relationships";
import type { PptxPackage } from "../package/pptx-package";
import { findChild, findPath } from "../xml/xml-element";

export type PlaceholderResolver = (ref: PlaceholderRef) => EmuRect | undefined;

interface PlaceholderEntry {
  ref: PlaceholderRef;
  frame?: EmuRect;
}

interface LayoutPlaceholders {
  layout: PlaceholderEntry[];
  master: PlaceholderEntry[];
}

/**
 * Finds where a placeholder sits when the slide does not store its position:
 * first on the slide layout, then on the slide master. Results are cached per layout.
 */
export class PlaceholderFrames {
  private readonly cache = new Map<string, Promise<LayoutPlaceholders>>();

  constructor(private readonly pkg: PptxPackage) {}

  async resolverFor(slidePath: string): Promise<PlaceholderResolver> {
    const layoutPath = await findRelatedPart(this.pkg, slidePath, RelType.slideLayout);
    if (!layoutPath) return () => undefined;

    let entry = this.cache.get(layoutPath);
    if (!entry) {
      entry = this.loadLayout(layoutPath);
      this.cache.set(layoutPath, entry);
    }
    const { layout, master } = await entry;
    return (ref) => resolve(ref, layout, master);
  }

  private async loadLayout(layoutPath: string): Promise<LayoutPlaceholders> {
    const masterPath = await findRelatedPart(this.pkg, layoutPath, RelType.slideMaster);
    return {
      layout: await this.readEntries(layoutPath),
      master: masterPath ? await this.readEntries(masterPath) : [],
    };
  }

  private async readEntries(partPath: string): Promise<PlaceholderEntry[]> {
    const root = await this.pkg.readXml(partPath);
    const spTree = findPath(root, "p:cSld", "p:spTree");
    const entries: PlaceholderEntry[] = [];
    for (const sp of spTree?.children ?? []) {
      if (sp.name !== "p:sp") continue;
      const ref = readPlaceholderRef(sp);
      if (ref) entries.push({ ref, frame: readXfrm(findChild(sp, "p:spPr")) });
    }
    return entries;
  }
}

function resolve(ref: PlaceholderRef, layout: PlaceholderEntry[], master: PlaceholderEntry[]): EmuRect | undefined {
  const onLayout =
    (ref.idx !== undefined ? layout.find((e) => e.ref.idx === ref.idx) : undefined) ??
    layout.find((e) => masterType(e.ref.type) === masterType(ref.type));
  if (onLayout?.frame) return onLayout.frame;

  const type = masterType((onLayout?.ref ?? ref).type);
  return master.find((e) => masterType(e.ref.type) === type)?.frame;
}

/** Slide masters only define these placeholder kinds; map the others onto them. */
function masterType(type: string): string {
  if (type === "title" || type === "ctrTitle") return "title";
  if (type === "dt" || type === "ftr" || type === "sldNum" || type === "hdr") return type;
  return "body";
}
