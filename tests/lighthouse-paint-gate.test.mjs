import test from "node:test";
import assert from "node:assert/strict";
import { decidePaintGate } from "../scripts/lighthouse-paint-gate.mjs";

test("a blog or token push warns", () => {
  assert.equal(
    decidePaintGate("push", [
      "src/content/blog/example.md",
      "public/images/blog/example.webp",
      "public/.well-known/openai-apps-challenge",
    ]),
    "warn",
  );
});

test("a layout or tracking change stays a hard fail", () => {
  assert.equal(decidePaintGate("pull_request", ["src/layouts/BaseLayout.astro"]), "error");
  assert.equal(decidePaintGate("push", ["src/components/PostHog.astro"]), "error");
  assert.equal(decidePaintGate("push", ["src/styles/global.css"]), "error");
});

test("the Monday run and a manual run stay hard fails", () => {
  assert.equal(decidePaintGate("schedule", []), "error");
  assert.equal(decidePaintGate("workflow_dispatch", ["src/content/blog/example.md"]), "error");
});
