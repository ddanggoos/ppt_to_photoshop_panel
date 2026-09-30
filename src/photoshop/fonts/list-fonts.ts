import { app } from "photoshop";

export interface FontInfo {
  /** Name Photoshop uses to identify the font, e.g. "MalgunGothic". */
  postScriptName: string;
  /** Display name, e.g. "Malgun Gothic Regular". */
  name: string;
}

/** Fonts installed on this system, sorted by display name. */
export function listFonts(): FontInfo[] {
  return Array.from(app.fonts, (font) => ({ postScriptName: font.postScriptName, name: font.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
