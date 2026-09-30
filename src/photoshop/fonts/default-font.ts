import type { FontInfo } from "./list-fonts";

/** Tried in order; the first installed one becomes the default. Korean-capable fonts first. */
const PREFERRED_FONTS = [
  "MalgunGothic", // Windows
  "AppleSDGothicNeo-Regular", // macOS
  "MyriadPro-Regular", // Bundled with Photoshop
];

/** Picks the default font from the installed fonts. */
export function defaultFontName(fonts: FontInfo[]): string {
  const installed = new Set(fonts.map((font) => font.postScriptName));
  return PREFERRED_FONTS.find((name) => installed.has(name)) ?? fonts[0]?.postScriptName ?? PREFERRED_FONTS[0];
}

/** Returns `requested` when installed, otherwise the default font. */
export function resolveFontName(requested: string | undefined, fonts: FontInfo[]): string {
  const installed = fonts.some((font) => font.postScriptName === requested);
  return installed && requested ? requested : defaultFontName(fonts);
}
