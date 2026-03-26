import chalk from "chalk";
import { load } from "cheerio";
import { createHash } from "crypto";
import { readFileSync } from "fs";
import { sync } from "glob";

export const SUPPORTED_ALGORITHMS = ["sha256", "sha384", "sha512"] as const;
export const DIRECTIVE_OPTIONS = [
  "script-src",
  "style-src",
  "default-src",
] as const;
export const DEFAULT_OPTIONS = {
  algorithm: "sha256",
  debug: false,
  directive: "default-src",
} as const satisfies Options;

interface Options {
  readonly algorithm: (typeof SUPPORTED_ALGORITHMS)[number];
  readonly debug: boolean;
  readonly directive: (typeof DIRECTIVE_OPTIONS)[number];
}

export function formattedHashesFromFiles(globArg: string, options: Options) {
  if (options && options.debug) {
    console.log(chalk.bold("Passed arguments:"));
    console.log(chalk.magenta("globArg:\n"), chalk.yellow(globArg));
    console.log(
      chalk.magenta("options:\n"),
      chalk.yellow(JSON.stringify(options, null, 2)),
    );
  }
  if (!globArg) {
    throw new Error("File name or glob pattern must be defined.");
  }
  const { algorithm, directive, debug } = options;

  if (debug) {
    console.log(chalk.bold("Final options:"));
    console.log(
      chalk.yellow(JSON.stringify({ algorithm, directive, debug }, null, 2)),
    );
  }

  const filePaths = sync(globArg);
  if (debug) {
    console.log(
      chalk.bold("Discovered files (") +
        chalk.yellow("" + filePaths.length + " files") +
        chalk.bold("):"),
    );
    console.log(chalk.yellow(filePaths.join("\n")));
  }
  if (filePaths.length === 0) {
    throw new Error("No files found with glob pattern " + globArg);
  }

  const htmlArray = filePaths.map(function (filePath) {
    return readFileSync(filePath);
  });

  const hashes = rawHashesFromHtml(htmlArray, options);

  return formatHashes(hashes, options);
}

export function rawHashesFromHtml(
  htmlOrHtmlArray: string | readonly string[] | Buffer | readonly Buffer[],
  options: Options,
) {
  let htmlArray;
  if (htmlOrHtmlArray instanceof Array) {
    htmlArray = htmlOrHtmlArray;
  } else {
    if (typeof htmlOrHtmlArray === "string") {
      htmlArray = [htmlOrHtmlArray];
    } else {
      throw new Error("html argument must be string or an array");
    }
  }
  const { algorithm, directive } = options;

  return htmlArray
    .map(function (html) {
      // get all inline snippets
      const $ = load(html);
      const cssSelectors = {
        "style-src": "style",
        "script-src": "script:not([src])",
        "default-src": "style, script:not([src])",
      };
      return $(cssSelectors[directive])
        .map(function () {
          return $(this).html();
        })
        .get();
    })
    .reduce(function (resultArray, array) {
      // flattern arrays
      return resultArray.concat(array);
    }, [])
    .filter(function (item, pos, self) {
      // remove duplicates
      return self.indexOf(item) == pos;
    })
    .map(function (inlineContent) {
      // encode
      const hash = createHash(algorithm);
      hash.update(inlineContent);
      const base64Hash = hash.digest("base64");
      return base64Hash;
    });
}

function formatHashes(hashes: readonly string[], options: Options) {
  const { algorithm, directive } = options;

  const formattedHashes = hashes.map(function (hash) {
    return "'" + algorithm + "-" + hash + "'";
  });

  return directive + ": " + formattedHashes.join(" ") + ";";
}
