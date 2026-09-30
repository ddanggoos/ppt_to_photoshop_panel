import type JSZip from "jszip";

export interface SlideRef {
  /** 1-based position in the presentation. */
  number: number;
  /** Part path inside the package, e.g. "ppt/slides/slide1.xml". */
  path: string;
}

export interface PresentationInfo {
  slideWidthEmu: number;
  slideHeightEmu: number;
  slides: SlideRef[];
}

export interface PptxPackage {
  zip: JSZip;
  info: PresentationInfo;
}
