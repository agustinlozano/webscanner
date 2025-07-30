import { build } from "esbuild";
import { resolve } from "path";

await build({
  entryPoints: ["src/index.ts"],
  outdir: "dist/",
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
});
