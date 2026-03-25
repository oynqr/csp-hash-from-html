#!/usr/bin/env node

import { Option, program } from "commander";
import config from "../package.json" with { type: "json" };
import { formattedHashesFromFiles } from "./lib.js";

program
  .version(config.version)
  .description(config.description)
  .usage("[options] <fileOrGlob ...>")
  .addOption(
    new Option("-a, --algorithm <algorithm>", "hash algorithm")
      .choices(["sha256", "sha384", "sha512"])
      .default("sha256"),
  )
  .addOption(
    new Option("-d, --directive <directive>", "directive").choices([
      "default-src",
      "script-src",
      "style-src",
    ]),
  )
  .option("--debug", "verbose output for debugging")
  .on("--help", function () {
    console.log("");
    console.log("  Examples:");
    console.log("");
    console.log("    $ csp-hash index.html");
    console.log("    $ csp-hash index.html example.html");
    console.log("    $ csp-hash build/**/*.html");
    console.log("    $ csp-hash -a sha512 index.html");
    console.log("    $ csp-hash -d script-src index.html");
    console.log("");
  })
  .argument("<string...>")
  .parse(process.argv);

try {
  let globPattern;
  if (program.args.length > 1) {
    // Let's merge multiple file args into one glob pattern. Some shells also
    // expand globs in command line arguments.
    globPattern = "{" + program.args.join(",") + "}";
  } else {
    globPattern = program.args[0];
  }
  const options = program.opts();
  const formattedHashes = formattedHashesFromFiles(globPattern, {
    algorithm: options.algorithm,
    directive: options.directive,
    debug: !!options.debug,
  });
  console.log(formattedHashes);
} catch (error) {
  console.error(error);
  process.exit(1);
}
