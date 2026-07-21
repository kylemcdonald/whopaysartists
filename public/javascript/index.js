"use strict";

function shuffle(items) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[randomIndex]] = [items[randomIndex], items[index]];
  }
  return items;
}

function loadSome(data, count) {
  const reports = document.querySelector("#reports");

  for (let index = 0; index < count && data.length; index += 1) {
    const report = document.createElement("li");
    report.innerHTML = printReport(data.pop());
    reports.append(report);
  }

  if (!data.length) {
    document.querySelector("#showall").hidden = true;
  }
}

async function loadReports() {
  const response = await fetch("/data.json");
  if (!response.ok) {
    throw new Error(`Could not load reports (${response.status})`);
  }

  const data = shuffle(await response.json());
  document.querySelector("#count").textContent = `all ${data.length} stories`;

  const showAll = document.createElement("button");
  showAll.id = "showall";
  showAll.type = "button";
  showAll.textContent = "Show all";
  showAll.addEventListener("click", () => loadSome(data, data.length));
  document.querySelector("#learn").append(showAll);

  loadSome(data, 10);
}

loadReports().catch((error) => {
  console.error(error);
  document.querySelector("#reports").textContent =
    "Sorry, the reports could not be loaded.";
});
