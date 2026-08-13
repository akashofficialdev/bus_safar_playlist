import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Dehradun to Mussoorie journey", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Window Seat Radio<\/title>/i);
  assert.match(html, /Dehradun to Mussoorie/);
  assert.match(html, /Window Seat Radio/);
  assert.match(html, /Now playing/);
  assert.match(html, /Subah Ki Bus/);
  assert.match(html, /Journey progress/);
  assert.match(html, /Halfway Chai/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/);
});

test("removes the starter preview implementation", async () => {
  const [page, layout, packageJson, appFiles] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readdir(new URL("../app/", import.meta.url)),
  ]);

  assert.doesNotMatch(page, /SkeletonPreview|_sites-preview|codex-preview/);
  assert.match(layout, /Window Seat Radio/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.ok(!appFiles.includes("_sites-preview"));
});
