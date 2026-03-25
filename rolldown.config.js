import { defineConfig } from "rolldown";

export default defineConfig({
  external: (id, _, isResolved) => id !== "./lib.js" && !isResolved,
  input: "src/cli.js",
  output: {
    file: "dist/cli.js",
    format: "esm",
    minify: true,
  },
  platform: "node",
});
