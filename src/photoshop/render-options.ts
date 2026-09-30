/**
 * Resolution for a new document when none is open.
 * 144 ppi turns a 16:9 slide (960x540 pt) into 1920x1080 px.
 */
export const DEFAULT_PPI = 144;

export const DEFAULT_TEXT_SIZE_PT = 24;

/** Applied to every text layer; PPT fonts and sizes are not carried over. */
export interface TextStyle {
  /** PostScript name. Falls back to the default font when not installed. */
  fontName?: string;
  sizePt: number;
}

export interface RenderOptions {
  /** 1-based slide numbers whose text is added. */
  slideNumbers: number[];
  textStyle: TextStyle;
  /** Name for the new document when no document is open, usually the .pptx file name. */
  documentName: string;
}
