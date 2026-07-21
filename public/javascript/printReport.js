"use strict";

var currencySymbols = { USD: "$", EUR: "€", GBP: "£", JPY: "¥" };
var monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function printReport(report) {
  var out = "<p>I was paid";
  if (report.fee == 0) {
    out += " nothing";
  } else if (report.fee) {
    var currencySymbol = currencySymbols[report.currency] || "";
    out += " " + escapeHtml(currencySymbol) + escapeHtml(report.fee);
  }
  if (report.client) out += " by " + escapeHtml(report.client);
  if (report.job) out += " for a " + escapeHtml(report.job);
  if (report.where) out += " in " + escapeHtml(report.where);
  out += ".</p>";

  if (report.time_amount && report.time_unit) {
    var unit =
      report.time_amount > 1
        ? report.time_unit
        : report.time_unit.replace(/s$/, "");
    out +=
      "<p>It took " +
      escapeHtml(report.time_amount) +
      " " +
      escapeHtml(unit) +
      " of work";
    if (report.experience) {
      out += ", and I had a " + escapeHtml(report.experience) + " experience";
    }
    out += ".</p>";
  } else if (report.experience) {
    out +=
      "<p>I had a " + escapeHtml(report.experience) + " experience.</p>";
  }

  var hasGender = report.gender && report.gender != "person";
  var hasMedium = Boolean(report.medium);
  var hasWorkingYears =
    report.working_years || report.working_years == 0;
  if (hasGender || hasMedium || hasWorkingYears) {
    out += "<p>I";
    if (hasGender) {
      out += " am a " + escapeHtml(report.gender);
      if (hasMedium || hasWorkingYears) {
        out += ", and";
      }
    }
    if (hasWorkingYears) {
      out +=
        " have been doing " + (hasMedium ? escapeHtml(report.medium) : "this");
      if (report.working_years == 0) {
        out += " for less than a year";
      } else {
        out +=
          " for " +
          escapeHtml(report.working_years) +
          " " +
          (report.working_years > 1 ? "years" : "year");
      }
    } else if (hasMedium) {
      out += " do " + escapeHtml(report.medium);
    }
    out += ".</p>";
  }

  if (report.also) {
    out += "<p>Also: " + escapeHtml(report.also) + "</p>";
  }

  var submitted = [
    report.time_of_month,
    monthNames[report.month],
    report.year,
  ]
    .filter(Boolean)
    .map(escapeHtml)
    .join(" ");
  out +=
    '<p class="date"><a href="/' +
    encodeURIComponent(report._id) +
    '">Submitted in ' +
    submitted +
    "</a></p>";

  return out;
}
