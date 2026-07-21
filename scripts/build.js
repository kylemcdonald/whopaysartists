"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const ejs = require("ejs");

const rootDir = path.resolve(__dirname, "..");
const outputDir = path.join(rootDir, "dist");
const publicDir = path.join(rootDir, "public");
const viewsDir = path.join(rootDir, "views");

const fields = [
  "time_of_month",
  "month",
  "year",
  "fee",
  "currency",
  "client",
  "where",
  "job",
  "time_amount",
  "time_unit",
  "medium",
  "experience",
  "gender",
  "working_years",
  "also",
];

const fieldNames = [
  "Time of month",
  "Month",
  "Year",
  "Fee",
  "Currency",
  "Client",
  "Where",
  "Job",
  "Time amount",
  "Time unit",
  "Medium",
  "Experience",
  "Gender",
  "Working years",
  "Also",
];

function serializeForInlineScript(value) {
  return JSON.stringify(value)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
}

function csvValue(value) {
  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return `"${String(value).replaceAll('"', '""')}"`;
}

function createCsv(reports) {
  const rows = [fieldNames.map(csvValue).join(",")];

  for (const report of reports) {
    rows.push(fields.map((field) => csvValue(report[field])).join(","));
  }

  return `${rows.join("\n")}\n`;
}

async function render(templateName, data) {
  return ejs.renderFile(path.join(viewsDir, templateName), data, {
    async: false,
  });
}

async function build() {
  const reports = JSON.parse(
    await fs.readFile(path.join(rootDir, "data.json"), "utf8"),
  );
  const ids = new Set();

  for (const report of reports) {
    if (!/^[a-f0-9]{24}$/.test(report._id)) {
      throw new Error(`Invalid report ID: ${report._id}`);
    }
    if (ids.has(report._id)) {
      throw new Error(`Duplicate report ID: ${report._id}`);
    }
    ids.add(report._id);
  }

  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });
  await fs.cp(publicDir, outputDir, { recursive: true });

  const index = await render("index.ejs", {});
  await fs.writeFile(path.join(outputDir, "index.html"), index);

  for (const report of reports) {
    const item = await render("item.ejs", {
      err: null,
      reportJson: serializeForInlineScript(report),
    });
    await fs.writeFile(path.join(outputDir, `${report._id}.html`), item);
  }

  const notFound = await render("item.ejs", {
    err: "not found",
    reportJson: null,
  });
  await fs.writeFile(path.join(outputDir, "404.html"), notFound);
  await fs.writeFile(
    path.join(outputDir, "data.json"),
    `${JSON.stringify(reports)}\n`,
  );
  await fs.writeFile(path.join(outputDir, "data.csv"), createCsv(reports));

  console.log(`Built ${reports.length} reports in ${outputDir}`);
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
