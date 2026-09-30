// Module path aliases shared by webpack.config.js and vitest.config.js.
// Keep in sync with "paths" in tsconfig.json.
import path from "path";
import { fileURLToPath } from "url";

const src = path.join(path.dirname(fileURLToPath(import.meta.url)), "src");

export const pathAliases = {
  "@core": path.join(src, "core"),
  "@pptx": path.join(src, "pptx"),
  "@photoshop": path.join(src, "photoshop"),
  "@platform": path.join(src, "platform"),
  "@ui": path.join(src, "ui"),
  "@shared": path.join(src, "shared"),
};
