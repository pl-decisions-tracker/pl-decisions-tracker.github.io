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
            id INTEGER PRIMARY KEY,
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
            id INTEGER PRIMARY KEY,
            dateId INTEGER PRIMARY KEY,
            decisionsTotal INTEGER,
            dataUpdated INTEGER DEFAULT 0,
            timestamp INTEGER
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
                db.run(
                  `INSERT INTO updateTypes (updateTypeId, updateTypeName) VALUES
                (-1, "MGP unavailable"),
                (0, "No data"),
                (1, "Regular update"),
                (2, "Initial upadte"),
                (4, "Year closure")`,
                  (err) => {
                    if (err) {
                      reject(err);
                    } else {
                      resolve();
                    }
                  }
                );
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
            id INTEGER PRIMARY KEY,
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
            id INTEGER PRIMARY KEY,
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
    currentYear;
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
const currentTimestamp = $.env.YEAR
  ? Date.UTC(parseInt($.env.YEAR), 11, 31, 23, 59, 0)
  : currentDate.valueOf();
const sqlLiteConnection = new sqlite3.Database(
  "astro-pl-tracker/prisma/tracker.db"
);
await setupTrackerDatabase(sqlLiteConnection);
$.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
const updatesUrl = `https://migracje.gov.pl/wp-json/udscmap/v1/decisions/poland?groupBy=&fields=total&orderBy=${randomSuffix}&year=${currentYear}`;
let updatesData;
try {
  updatesData = await fetch(updatesUrl).then((res) => res.json());
} catch (error) {
  console.log(`Failed to get data from MGP site: ${error}`);
  console.log(
    `Result code is: ${updatesData?.code}, data: ${updatesData?.data}, message: ${updatesData?.message}`
  );
  echo("There were error checking MGP site, exiting.");
  process.exit(1);
}

if (updatesData?.code >= 500) {
  console.log(
    `Result code is: ${updatesData?.code}, data: ${updatesData?.data}, message: ${updatesData?.message}`
  );
  let query = `INSERT INTO updates (decisionsTotal, timestamp, dataUpdated) VALUES (0, ${currentTimestamp}, -1)`;
  await new Promise((resolve, reject) => {
    sqlLiteConnection.run(query, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
  echo("There were error checking MGP site, exiting.");
  const output = process.env["GITHUB_OUTPUT"];
  fs.appendFileSync(output, `update_failed=1${os.EOL}`);
  fs.appendFileSync(output, `failure_code=${updatesData.code}}${os.EOL}`);
  fs.appendFileSync(output, `failure_message=${updatesData.message.replaceAll("\n", "")}}${os.EOL}`);
  fs.appendFileSync(output, `failure_data=${updatesData.data.replaceAll("\n", "")}}${os.EOL}`);
  process.exit(0);
}

let dateId;
if (Array.isArray(updatesData[0]) && updatesData[0].length == 0) {
  // dataUpdated is 0 by default
  let query = `INSERT INTO updates (decisionsTotal, timestamp, dataUpdated) VALUES (0, ${currentTimestamp}, 0)`;
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

let query = `SELECT * FROM updates WHERE timestamp/1000 < ${currentTimestamp} AND strftime('%Y', timestamp/1000, 'unixepoch') = '${currentYear}' ORDER BY dateId DESC, timestamp DESC LIMIT 1`;
const previousUpdate = await new Promise((resolve, reject) => {
  sqlLiteConnection.all(query, (err, rows) => {
    if (err) {
      reject(err);
    } else {
      resolve(rows);
    }
  });
});

if (
  previousUpdate.length == 1 &&
  previousUpdate[0].decisionsTotal === updatesData[0].total
) {
  query = `INSERT INTO updates (decisionsTotal, timestamp, dataUpdated) VALUES (${updatesData[0].total}, ${currentTimestamp}, 0)`;
  dateId = await new Promise((resolve, reject) => {
    sqlLiteConnection.run(query, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
  echo(
    `Nothing has changed since last successfull update on ${previousUpdate[0].year}-${previousUpdate[0].month}-${previousUpdate[0].day}. Exiting`
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
  query = `SELECT SUM(DISTINCT dataUpdated) as updateMask FROM updates WHERE strftime('%Y', timestamp/1000, 'unixepoch') = '${currentYear}';`;
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

query = `INSERT INTO updates (decisionsTotal, timestamp, dataUpdated) VALUES (${updatesData[0].total}, ${currentTimestamp}, ${updateType})`;
dateId = await new Promise((resolve, reject) => {
  sqlLiteConnection.run(query, function (err) {
    if (err) {
      reject(err);
    } else {
      resolve(this.lastID);
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
