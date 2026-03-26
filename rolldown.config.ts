import { chmodSync } from "node:fs";
import { defineConfig } from "rolldown";
import { dts } from "rolldown-plugin-dts";
import { dependencies } from "./package.json" with { type: "json" };

export default defineConfig({
  external: (id) => Object.hasOwn(dependencies, id),
  input: ["src/cli.ts", "src/lib.ts"],
  output: {
    dir: "dist",
    format: "esm",
    minify: true,
    sourcemap: true,
  },
  platform: "node",
  plugins: [
    dts(),
    {
      name: "make cli executable",
      writeBundle: () => {
        chmodSync("dist/cli.js", 0o755);
      },
    },
  ],
});
