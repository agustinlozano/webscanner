import { build } from "esbuild";
import { resolve } from "path";

await build({
  entryPoints: ["src/index.ts"],
  outfile: "dist/index.js",
  bundle: true,
  platform: "node",
  target: "node18",
  format: "cjs",
  sourcemap: true,
  tsconfig: "tsconfig.json",
  alias: {
    "@": resolve("src"),
  },
  external: ["playwright"],
  banner: {
    js: `
// Lambda Runtime bootstrap
if (typeof exports !== 'undefined') {
  // In Lambda environment, set up the handler
  const originalHandler = exports.handler;
  if (originalHandler) {
    exports.handler = originalHandler;
  }
}
`,
  },
});
