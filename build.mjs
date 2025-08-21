import { build } from "esbuild";
import { resolve } from "path";
import { copyFileSync, mkdirSync } from "fs";

(async () => {
  // Ensure dist directory exists
  mkdirSync("dist", { recursive: true });

  // Build the main TypeScript file
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

  // Copy the bootstrap.js file to dist directory
  copyFileSync("src/bootstrap.js", "dist/bootstrap.js");

  console.log("Build completed successfully");
  console.log("- Built: dist/index.js");
  console.log("- Copied: dist/bootstrap.js");
})().catch((error) => {
  console.error("Build failed:", error);
  process.exit(1);
});
