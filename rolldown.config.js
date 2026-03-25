import { defineConfig } from "rolldown";
import { dts } from "rolldown-plugin-dts";

export default defineConfig({
  external: (id) => id.includes("node_modules"),
  input: ["src/cli.ts", "src/lib.ts"],
  output: {
    dir: "dist",
    format: "esm",
    minify: true,
    sourcemap: true,
  },
  platform: "node",
  plugins: [dts()],
});
