"use strict";

const reportData = document.querySelector("#report-data");

if (reportData) {
  const report = JSON.parse(reportData.textContent);
  document
    .querySelector("#intro")
    .insertAdjacentHTML("beforeend", printReport(report));
}
