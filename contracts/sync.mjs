#!/usr/bin/env node
// Copies the request-schema contracts in ./src into the server and the client.
//   node contracts/sync.mjs          write the copies
//   node contracts/sync.mjs --check  exit 1 if any copy has drifted (run by the server tests)
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const source = join(root, "src");
const targets = [
  join(root, "..", "server", "src", "contracts"),
  join(root, "..", "client", "src", "shared", "contracts"),
];
const check = process.argv.includes("--check");

const header = `// GENERATED from /contracts/src by contracts/sync.mjs. Do not edit here.\n`;
let drift = false;

for (const file of readdirSync(source).filter((f) => f.endsWith(".ts"))) {
  const expected = header + readFileSync(join(source, file), "utf8");
  for (const dir of targets) {
    const dest = join(dir, file);
    const actual = existsSync(dest) ? readFileSync(dest, "utf8") : null;
    if (actual === expected) continue;
    if (check) {
      console.error(`out of sync: ${dest}`);
      drift = true;
    } else {
      mkdirSync(dir, { recursive: true });
      writeFileSync(dest, expected);
      console.log(`wrote ${dest}`);
    }
  }
}

if (drift) {
  console.error("\nRun: node contracts/sync.mjs");
  process.exit(1);
}
