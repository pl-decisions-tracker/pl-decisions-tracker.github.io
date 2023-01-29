import "zx/globals";

const sqlite3 = require("sqlite3").verbose();

const ensureDecisionsTable = (db) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='decisions'",
      (err, row) => {
        if (err) {
          reject(err);
        } else if (row === undefined) {
          db.run(
            `CREATE TABLE decisions (
            dateId INTEGER,
            institution INTEGER,
            country INTEGER,
            caseType INTEGER,
            decisionMarker INTEGER,
            count INTEGER
            );`,
            (err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            }
          );
        } else {
          resolve();
        }
      }
    );
  });
};

const ensureUpdatesTable = (db) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='updates'",
      (err, row) => {
        if (err) {
          reject(err);
        } else if (row === undefined) {
          db.run(
            `CREATE TABLE updates (
            dateId INTEGER PRIMARY KEY,
            year INTEGER,
            month INTEGER,
            day INTEGER,
            hour INTEGER,
            minute INTEGER,
            decisionsTotal INTEGER,
            dataUpdated INTEGER DEFAULT 0
            );`,
            (err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            }
          );
        } else {
          resolve();
        }
      }
    );
  });
};

const ensureUpdateTypesTable = (db) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='updateTypes'",
      (err, row) => {
        if (err) {
          reject(err);
        } else if (row === undefined) {
          db.run(
            `CREATE TABLE updateTypes (
            updateTypeId INTEGER PRIMARY KEY,
            updateTypeName TEXT
            );`,
            (err) => {
              if (err) {
                reject(err);
              } else {
                db.run(`INSERT INTO updateTypes (updateTypeId, updateTypeName) VALUES
                (0, "No data"),
                (1, "Regular update"),
                (2, "Initial upadte"),
                (4, "Year closure")`, (err) => {
                  if(err) {
                    reject(err);
                  }else {
                    resolve();
                  }
                });
              }
            }
          );
        } else {
          resolve();
        }
      }
    );
  });
};

const ensureStatusesTable = (db) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='statuses'",
      (err, row) => {
        if (err) {
          reject(err);
        } else if (row === undefined) {
          db.run(
            `CREATE TABLE statuses (
            dateId INTEGER,
            institution INTEGER,
            status INTEGER,
            country INTEGER,
            count INTEGER
            );`,
            (err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            }
          );
        } else {
          resolve();
        }
      }
    );
  });
};

const ensureApplicationsTable = (db) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='applications'",
      (err, row) => {
        if (err) {
          reject(err);
        } else if (row === undefined) {
          db.run(
            `CREATE TABLE applications (
            dateId INTEGER,
            institution INTEGER,
            country INTEGER,
            caseType INTEGER,
            count INTEGER
            );`,
            (err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            }
          );
        } else {
          resolve();
        }
      }
    );
  });
};

const setupTrackerDatabase = (db) => {
  return Promise.all([
    ensureDecisionsTable(db),
    ensureUpdatesTable(db),
    ensureStatusesTable(db),
    ensureUpdateTypesTable(db),
    ensureApplicationsTable(db),
  ]);
};

const randomSuffix = Math.random().toString(36).slice(2);
const currentDate = new Date();
const currentYear = parseInt($.env.YEAR) || currentDate.getUTCFullYear();
const currentMonth = $.env.YEAR ? 12 : currentDate.getUTCMonth() + 1;
const currentDay = $.env.YEAR ? 31 : currentDate.getUTCDate();
const currentHour = $.env.YEAR ? 23 : currentDate.getUTCHours();
const currentMinute = $.env.YEAR ? 59 : currentDate.getUTCMinutes();
const sqlLiteConnection = new sqlite3.Database("data/sqlite/tracker.db");
await setupTrackerDatabase(sqlLiteConnection);
$.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
const updatesUrl = `https://migracje.gov.pl/wp-json/udscmap/v1/decisions/poland?groupBy=&fields=total&orderBy=${randomSuffix}&year=${currentYear}`;
const updatesData = await fetch(updatesUrl).then((res) => res.json());
let dateId;
if (Array.isArray(updatesData[0]) && updatesData[0].length == 0) {
  // dataUpdated is 0 by default
  let query = `INSERT INTO updates (year, month, day, hour, minute, decisionsTotal) VALUES (${currentYear}, ${currentMonth}, ${currentDay}, ${currentHour}, ${currentMinute}, 0)`;
  dateId = await new Promise((resolve, reject) => {
    sqlLiteConnection.run(query, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
  echo("No records for this year exist, exiting");
  process.exit(0);
}

let query = `INSERT INTO updates (year, month, day, hour, minute, decisionsTotal) VALUES (${currentYear}, ${currentMonth}, ${currentDay}, ${currentHour}, ${currentMinute}, ${updatesData[0].total})`;
dateId = await new Promise((resolve, reject) => {
  sqlLiteConnection.run(query, function (err) {
    if (err) {
      reject(err);
    } else {
      resolve(this.lastID);
    }
  });
});

query = `SELECT * FROM updates WHERE dateId <= ${dateId} AND year = ${currentYear} ORDER BY dateId DESC, year DESC, month DESC, day DESC LIMIT 2`;
const lastCoupleUpdates = await new Promise((resolve, reject) => {
  sqlLiteConnection.all(query, (err, rows) => {
    if (err) {
      reject(err);
    } else {
      resolve(rows);
    }
  });
});

if (
  lastCoupleUpdates.length == 2 &&
  lastCoupleUpdates[0].decisionsTotal === lastCoupleUpdates[1].decisionsTotal
) {
  echo(
    `Nothing has changed since last successfull update on ${lastCoupleUpdates[1].year}-${lastCoupleUpdates[1].month}-${lastCoupleUpdates[1].day}. Exiting`
  );
  process.exit(0);
}

// Assumption - no one would update migracje data on 01.01, so we'll get first 0 status
// then if it was started manually - it is to close year (4)
// if there were only zeroes before - we have first data of the year (2)
// otherwise it's just regular update (1)
let updateType;
if ($.env.YEAR) {
  updateType = 4;
} else {
  query = `SELECT SUM(DISTINCT dataUpdated) as updateMask FROM updates WHERE year = ${currentYear};`;
  const yearUpdateMask = await new Promise((resolve, reject) => {
    sqlLiteConnection.all(query, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  }).then((rows) => rows[0].updateMask);
  if (yearUpdateMask === 0) {
    updateType = 2;
  } else {
    updateType = 1;
  }
}

query = `UPDATE updates SET dataUpdated = ${updateType} WHERE dateId = ${dateId}`;
await new Promise((resolve, reject) => {
  sqlLiteConnection.all(query, (err, rows) => {
    if (err) {
      reject(err);
    } else {
      resolve(rows);
    }
  });
});

// WITH CTE_Source AS
//     (
//     SELECT dateId, decisionsTotal, lag(decisionsTotal) OVER (ORDER BY (SELECT NULL)) AS PriorValue
//     FROM updates AS T
//     ORDER BY T.dateId, T.decisionsTotal
//     )
// SELECT dateId, decisionsTotal
// FROM CTE_Source
// WHERE PriorValue IS NULL OR PriorValue <> decisionsTotal

const decisionsDataUrl = `https://migracje.gov.pl/wp-json/udscmap/v1/decisions/poland?groupBy=institution%2Ccountry%2CcaseType%2CdecisionMarker&fields=institution%2Ccountry%2CcaseType%2CdecisionMarker%2Ctotal&orderBy=total%2C${randomSuffix}&year=${currentYear}`;
const statusesDataUrl = `https://migracje.gov.pl/wp-json/udscmap/v1/statuses/poland?groupBy=institution%2Cstatus%2Ccountry&fields=institution%2Cstatus%2Ccountry%2Ctotal&orderBy=status%2C${randomSuffix}&year=${currentYear}`;
const applicationsDataUrl = `https://migracje.gov.pl/wp-json/udscmap/v1/applications/poland?groupBy=institution%2Ccountry%2CcaseType&fields=institution%2Ccountry%2CcaseType%2Ctotal&orderBy=caseType%2C${randomSuffix}&year=${currentYear}`;

const [decisionsData, statusesData, applicationsData] = await Promise.all([
  fetch(decisionsDataUrl).then((res) => res.json()),
  fetch(statusesDataUrl).then((res) => res.json()),
  fetch(applicationsDataUrl).then((res) => res.json()),
]);

query = `INSERT INTO decisions (dateId, institution, country, caseType, decisionMarker, count) VALUES ${decisionsData
  .map(
    (el) =>
      `(${dateId}, ${el.institution}, ${el.country}, ${el.caseType}, ${el.decisionMarker}, ${el.total})`
  )
  .join(",")}`;
sqlLiteConnection.run(query);

query = `INSERT INTO applications (dateId, institution, country, caseType, count) VALUES ${applicationsData
  .map(
    (el) =>
      `(${dateId}, ${el.institution}, ${el.country}, ${el.caseType}, ${el.total})`
  )
  .join(",")}`;
sqlLiteConnection.run(query);

query = `INSERT INTO statuses (dateId, institution, status, country, count) VALUES ${statusesData
  .map(
    (el) =>
      `(${dateId}, ${el.institution}, ${el.status}, ${el.country}, ${el.total})`
  )
  .join(",")}`;
sqlLiteConnection.run(query);

await new Promise((resolve, reject) => {
  sqlLiteConnection.close(function (err) {
    if (err) {
      reject(err);
    } else {
      resolve();
    }
  });
});
