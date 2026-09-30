import JSZip from "jszip";
import { PptxError } from "../errors";
import { parseXml } from "../xml/parser";
import type { XmlElement } from "../xml/xml-element";

/** Read access to the parts (files) inside a .pptx ZIP container. */
export class PptxPackage {
  private constructor(private readonly zip: JSZip) {}

  static async open(data: ArrayBuffer): Promise<PptxPackage> {
    try {
      return new PptxPackage(await JSZip.loadAsync(data));
    } catch {
      throw new PptxError("Not a valid .pptx file (ZIP could not be read).");
    }
  }

  hasPart(path: string): boolean {
    return this.zip.file(path) !== null;
  }

  /** Reads a part and returns its root XML element. */
  async readXml(path: string): Promise<XmlElement> {
    const file = this.zip.file(path);
    if (!file) {
      throw new PptxError(`Missing part: ${path}`);
    }
    return parseXml(await file.async("string"));
  }
}
