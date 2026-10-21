import { execFile, type ChildProcess } from "node:child_process";
import { promisify } from "node:util";

const execute = promisify(execFile);

export async function runProcess(
  command: string,
  args: string[],
  options: { env?: NodeJS.ProcessEnv; timeout?: number; maxBuffer?: number } = {},
): Promise<string> {
  try {
    const result = await execute(command, args, {
      env: options.env ?? process.env,
      timeout: options.timeout ?? 10_000,
      maxBuffer: options.maxBuffer ?? 2 * 1024 * 1024,
      encoding: "utf8",
      windowsHide: true,
    });
    return result.stdout.trim();
  } catch (error) {
    const failure = error as Error & { stderr?: string; killed?: boolean; code?: string | number };
    if (failure.code === "ERR_CHILD_PROCESS_STDIO_MAXBUFFER") {
      throw new Error(`${command} output exceeded buffer`);
    }
    if (failure.killed) throw new Error(`${command} timed out`);
    throw new Error(failure.stderr?.trim() || failure.message);
  }
}

export function exited(child: ChildProcess): Promise<number> {
  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("close", (code) => resolve(code ?? 1));
  });
}
