/** OOXML lengths are stored in English Metric Units (EMU). */
export const EMU_PER_POINT = 12700;

export function emuToPt(emu: number): number {
  return emu / EMU_PER_POINT;
}
