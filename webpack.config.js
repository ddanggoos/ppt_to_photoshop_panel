// Based on Adobe's official UXP samples:
//   - swc-uxp-starter / create-swc-uxp-app (SWC aliases, static copy, CSS extraction)
//   - typescript-webpack-sample (ts-loader, host module externals)
// https://github.com/AdobeDocs/uxp-photoshop-plugin-samples

import path from "path";
import { fileURLToPath } from "url";
import CopyWebpackPlugin from "copy-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { aliases as swcAliases } from "@swc-uxp-wrappers/utils";
import { pathAliases } from "./path-aliases.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default (env, argv) => {
  const isDev = argv.mode !== "production";

  return {
    entry: { main: "./src/main.ts" },
    // Same as the official SWC template; avoids webpack's eval-based dev default.
    devtool: isDev ? "cheap-module-source-map" : false,
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].bundle.js",
      publicPath: "",
      clean: true,
      // Keep everything in one bundle: SWC lazy-loads a focus-visible polyfill
      // via dynamic import, which we don't rely on UXP to load as a chunk.
      asyncChunks: false,
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, "css-loader"],
        },
      ],
    },
    resolve: {
      extensions: [".ts", ".js", ".json"],
      alias: {
        // Redirect @spectrum-web-components/* to the UXP-compatible wrappers.
        ...swcAliases,
        // Module aliases (@core, @pptx, ...); see docs/ARCHITECTURE.md.
        ...pathAliases,
      },
    },
    // Modules provided by the host at runtime; never bundle them.
    externals: {
      photoshop: "commonjs2 photoshop",
      uxp: "commonjs2 uxp",
      os: "commonjs2 os",
      fs: "commonjs2 fs",
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          { from: "src/index.html", to: "." },
          { from: "manifest.json", to: "." },
        ],
      }),
      new MiniCssExtractPlugin({ filename: "[name].bundle.css" }),
    ],
    performance: { hints: false },
  };
};
