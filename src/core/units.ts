export const POINTS_PER_INCH = 72;

/** Converts points to pixels at the given resolution (pixels per inch). */
export function ptToPx(pt: number, ppi: number): number {
  return Math.round((pt / POINTS_PER_INCH) * ppi);
}
