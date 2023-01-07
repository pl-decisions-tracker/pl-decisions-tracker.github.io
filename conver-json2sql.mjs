import "zx/globals";

const sqlite3 = require("sqlite3").verbose();
const countryId = 179;
const currentYear = 2022;
const currentHour = 21;
const currentMinute = 5;
const sqlLiteConnection = new sqlite3.Database("data/sqlite/tracker.db");

// decisions
const decisionsJsonData = fs.readJSONSync("decisions.json");
const applicationsJsonData = fs.readJSONSync("applications.json");
const statusesJsonData = fs.readJSONSync("statuses.json");
let previousDateSum;
for (const date of Object.keys(decisionsJsonData).sort()) {
  if (!date.startsWith(`${currentYear}-`)) {
    continue;
  }
  const dateSum = decisionsJsonData[date].reduce(
    (accumulator, currentValue) => {
      return accumulator + currentValue.total;
    },
    0
  );
  if (dateSum === previousDateSum) {
    continue;
  }

  const dateArray = date.split("-");
  const currentMonth = dateArray[1];
  const currentDay = dateArray[2];

  if (previousDateSum == undefined) {
    // repeat the same data twice for unfinished year
    // one-time script, no need for advanced logic
    let query = `INSERT INTO updates (year, month, day, hour, minute, decisionsTotal, dataUpdated) VALUES (${currentYear}, ${currentMonth}, ${currentDay}, ${currentHour}, ${currentMinute}, ${dateSum}, 1)`;
    const dateId = await new Promise((resolve, reject) => {
      sqlLiteConnection.run(query, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });

    query = `INSERT INTO decisions (dateId, institution, country, caseType, decisionMarker, count) VALUES ${decisionsJsonData[
      date
    ]
      .map(
        (el) =>
          `(${dateId}, ${el.institution}, ${countryId}, ${el.caseType}, ${el.decisionMarker}, ${el.total})`
      )
      .join(",")}`;
    sqlLiteConnection.run(query);

    query = `INSERT INTO applications (dateId, institution, country, caseType, count) VALUES ${applicationsJsonData[
      date
    ]
      .map(
        (el) =>
          `(${dateId}, ${el.institution}, ${countryId}, ${el.caseType}, ${el.total})`
      )
      .join(",")}`;
    sqlLiteConnection.run(query);

    query = `INSERT INTO statuses (dateId, institution, status, country, count) VALUES ${statusesJsonData[
      date
    ]
      .map(
        (el) =>
          `(${dateId}, ${el.institution}, ${el.status}, ${countryId}, ${el.total})`
      )
      .join(",")}`;
    sqlLiteConnection.run(query);
  }

  let query = `INSERT INTO updates (year, month, day, hour, minute, decisionsTotal, dataUpdated) VALUES (${currentYear}, ${currentMonth}, ${currentDay}, ${currentHour}, ${currentMinute}, ${dateSum}, 1)`;
  const dateId = await new Promise((resolve, reject) => {
    sqlLiteConnection.run(query, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });

  query = `INSERT INTO decisions (dateId, institution, country, caseType, decisionMarker, count) VALUES ${decisionsJsonData[
    date
  ]
    .map(
      (el) =>
        `(${dateId}, ${el.institution}, ${countryId}, ${el.caseType}, ${el.decisionMarker}, ${el.total})`
    )
    .join(",")}`;
  sqlLiteConnection.run(query);

  query = `INSERT INTO applications (dateId, institution, country, caseType, count) VALUES ${applicationsJsonData[
    date
  ]
    .map(
      (el) =>
        `(${dateId}, ${el.institution}, ${countryId}, ${el.caseType}, ${el.total})`
    )
    .join(",")}`;
  sqlLiteConnection.run(query);

  query = `INSERT INTO statuses (dateId, institution, status, country, count) VALUES ${statusesJsonData[
    date
  ]
    .map(
      (el) =>
        `(${dateId}, ${el.institution}, ${el.status}, ${countryId}, ${el.total})`
    )
    .join(",")}`;
  sqlLiteConnection.run(query);

  previousDateSum = dateSum;
}

await new Promise((resolve, reject) => {
  sqlLiteConnection.close(function (err) {
    if (err) {
      reject(err);
    } else {
      resolve();
    }
  });
});
