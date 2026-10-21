import { execFileSync, spawnSync } from "node:child_process";
import path from "node:path";
import { requirePatchedNode } from "./runtime.ts";

requirePatchedNode();
const env = {
  ...process.env,
  PATH: `${path.dirname(process.execPath)}${path.delimiter}${process.env.PATH ?? ""}`,
};
// `npm root` reads local installation configuration; downloads run below using
// this already validated Node executable, including when server PATH is sparse.
const globalRoot = execFileSync("npm", ["root", "--global"], { env, encoding: "utf8" }).trim();
const npmCli = process.env.npm_execpath || path.join(globalRoot, "npm", "bin", "npm-cli.js");
const result = spawnSync(process.execPath, [npmCli, "ci", "--omit=dev", "--ignore-scripts"], {
  cwd: new URL("..", import.meta.url),
  env,
  stdio: "inherit",
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
