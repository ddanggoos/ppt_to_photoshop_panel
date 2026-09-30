/**
 * Default output resolution.
 * 144 ppi turns a 16:9 slide (960x540 pt) into 1920x1080 px.
 */
export const DEFAULT_PPI = 144;

export interface RenderOptions {
  /** Base name for the generated documents, usually the .pptx file name. */
  baseName: string;
  /** 1-based slide numbers to render. Defaults to all slides. */
  slideNumbers?: number[];
  ppi?: number;
}
