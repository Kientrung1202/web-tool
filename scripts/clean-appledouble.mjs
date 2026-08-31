import { readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const SKIP_DIRS = new Set([".git", "node_modules"]);

function cleanAppleDoubleFiles(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);

    if (entry.name.startsWith("._")) {
      rmSync(path, { recursive: true, force: true });
      continue;
    }

    if (entry.isDirectory() && !SKIP_DIRS.has(entry.name)) {
      cleanAppleDoubleFiles(path);
    }
  }
}

cleanAppleDoubleFiles(process.cwd());
