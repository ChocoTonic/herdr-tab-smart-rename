import { readdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const directory = new URL("../test/", import.meta.url);
const files = (await readdir(directory))
  .filter((name) => name.endsWith(".test.ts"))
  .map((name) => fileURLToPath(new URL(name, directory)));
const result = spawnSync("bun", ["test", ...files], {
  stdio: "inherit",
  windowsHide: true,
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
