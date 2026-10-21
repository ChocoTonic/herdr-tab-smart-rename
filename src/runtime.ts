export function isPatchedNode(versions: { node: string; bun?: string } = process.versions): boolean {
  const [major = 0, minor = 0, patch = 0] = versions.node.split(".").map(Number);
  return !versions.bun && major === 24 && (minor > 22 || (minor === 22 && patch >= 1));
}

export function requirePatchedNode(): void {
  if (!isPatchedNode()) {
    throw new Error("Smart Rename requires Node.js 24.22.1 or later in the 24 LTS line, with the patched eMudhra CA bundle. Bun is supported only for offline tests.");
  }
}
