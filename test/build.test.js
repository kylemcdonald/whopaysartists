"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const rootDir = path.resolve(__dirname, "..");
const outputDir = path.join(rootDir, "dist");
const reports = JSON.parse(
  fs.readFileSync(path.join(rootDir, "data.json"), "utf8"),
);

test("build emits the complete dataset and one page per report", () => {
  const builtReports = JSON.parse(
    fs.readFileSync(path.join(outputDir, "data.json"), "utf8"),
  );
  assert.deepEqual(builtReports, reports);

  for (const report of reports) {
    assert.ok(
      fs.existsSync(path.join(outputDir, `${report._id}.html`)),
      `missing page for ${report._id}`,
    );
  }
});

test("build emits the home page, downloads, headers, and 404 page", () => {
  for (const filename of [
    "index.html",
    "data.json",
    "data.csv",
    "_headers",
    "404.html",
  ]) {
    assert.ok(fs.existsSync(path.join(outputDir, filename)), filename);
  }

  const csv = fs.readFileSync(path.join(outputDir, "data.csv"), "utf8");
  assert.match(csv, /^"Time of month","Month","Year","Fee"/);

  const notFound = fs.readFileSync(path.join(outputDir, "404.html"), "utf8");
  assert.match(notFound, /Sorry, that item doesn't exist\./);
});

test("inline report JSON cannot terminate its script element", () => {
  const report = reports.find((item) => item.client?.includes("<script>"));
  assert.ok(report, "expected the retained XSS test record");

  const html = fs.readFileSync(
    path.join(outputDir, `${report._id}.html`),
    "utf8",
  );
  assert.doesNotMatch(html, /<script>console\.log/);
  assert.match(html, /\\u003cscript\\u003e/);
});

test("report renderer escapes untrusted fields", () => {
  const source = fs.readFileSync(
    path.join(rootDir, "public/javascript/printReport.js"),
    "utf8",
  );
  const context = vm.createContext({});
  vm.runInContext(source, context);

  const html = context.printReport({
    _id: "193cf93190108a1a92bf0cd8",
    client: '<script>alert("xss")</script>',
    month: 0,
    year: 2020,
  });

  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
});
