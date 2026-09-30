/** OOXML stores lengths in English Metric Units (EMU). */
export const EMU_PER_INCH = 914400;
export const EMU_PER_POINT = 12700;

/**
 * Resolution used when converting slides to pixels.
 * 144 ppi turns a 16:9 slide (13.333in x 7.5in) into 1920x1080 px.
 */
export const DEFAULT_PPI = 144;

export function emuToPx(emu: number, ppi: number = DEFAULT_PPI): number {
  return Math.round((emu / EMU_PER_INCH) * ppi);
}

export function emuToPt(emu: number): number {
  return emu / EMU_PER_POINT;
}
