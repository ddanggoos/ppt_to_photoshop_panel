import { defineConfig } from "vitest/config";
import { pathAliases } from "./path-aliases.js";

export default defineConfig({
  resolve: { alias: pathAliases },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
});
