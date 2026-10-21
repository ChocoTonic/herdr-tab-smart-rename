import { test } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { X509Certificate } from "node:crypto";
import { rootCertificates } from "node:tls";
import { isPatchedNode } from "../src/runtime.ts";
import { runProcess } from "../src/process.ts";

const execute = promisify(execFile);

test("production runtime rejects unpatched Node and Bun", () => {
  assert.equal(isPatchedNode({ node: "24.22.0" }), false);
  assert.equal(isPatchedNode({ node: "24.22.1" }), true);
  assert.equal(isPatchedNode({ node: "24.23.0" }), true);
  assert.equal(isPatchedNode({ node: "24.22.1", bun: "1.4.3" }), false);
  assert.equal(isPatchedNode({ node: "25.0.0" }), false);
});

test("the production Node trust store excludes the compromised emSign root", () => {
  assert.ok(isPatchedNode());
  assert.equal(rootCertificates.some((pem) => new X509Certificate(pem).subject.includes("emSign ECC Root CA - G3")), false);
});

test("Node executes the TypeScript CLI without Bun or a build step", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "smart-rename-node-"));
  try {
    const result = await execute(process.execPath, ["src/cli.ts", "status"], {
      cwd: new URL("..", import.meta.url),
      env: { ...process.env, HERDR_PLUGIN_STATE_DIR: directory },
      timeout: 10_000,
    });
    assert.match(result.stdout, /Smart Rename stopped/);
    assert.equal(result.stderr, "");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("process transport preserves output and rejects timeout and buffer overflow", async () => {
  assert.equal(await runProcess(process.execPath, ["-e", "console.log('◆ Ready')"]), "◆ Ready");
  await assert.rejects(
    runProcess(process.execPath, ["-e", "setTimeout(() => {}, 10000)"], { timeout: 30 }),
    /timed out/,
  );
  await assert.rejects(
    runProcess(process.execPath, ["-e", "console.log('x'.repeat(1024))"], { maxBuffer: 16 }),
    /output exceeded buffer/,
  );
});
