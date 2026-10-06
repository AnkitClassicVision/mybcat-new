#!/usr/bin/env node
/**
 * Decide whether First Contentful Paint is a hard fail or a warning.
 *
 * error: schedule, manual run, or a change that can move first paint.
 * warn: blog posts, token files, and other ordinary commits.
 *
 * The 2500 ms cap stays in lighthouserc.cjs. This file must not raise it.
 */

const PAINT_PREFIXES = [
  "src/layouts/",
  "src/components/",
  "src/styles/",
  "src/pages/",
  "public/fonts/",
  "public/js/",
];

export function decidePaintGate(eventName, files) {
  if (eventName === "schedule" || eventName === "workflow_dispatch") {
    return "error";
  }
  const list = Array.isArray(files) ? files : String(files || "").split(/\s+/);
  for (const file of list) {
    if (!file) continue;
    if (file.startsWith("src/content/") || file.startsWith("public/images/blog/")) {
      continue;
    }
    if (PAINT_PREFIXES.some((prefix) => file.startsWith(prefix)) || file.endsWith(".css")) {
      return "error";
    }
  }
  return "warn";
}

function filesFromArgs(argv) {
  const files = [];
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--files") {
      files.push(...String(argv[i + 1] || "").split(/\s+/));
      i += 1;
    }
  }
  return files.filter(Boolean);
}

function eventFromArgs(argv) {
  const index = argv.indexOf("--event");
  return index === -1 ? "" : argv[index + 1] || "";
}

const invokedDirectly = process.argv[1] && process.argv[1].endsWith("lighthouse-paint-gate.mjs");
if (invokedDirectly) {
  const level = decidePaintGate(eventFromArgs(process.argv.slice(2)), filesFromArgs(process.argv.slice(2)));
  if (level !== "error" && level !== "warn") {
    process.stderr.write("paint gate returned an unknown level\n");
    process.exit(2);
  }
  process.stdout.write(`${level}\n`);
}
