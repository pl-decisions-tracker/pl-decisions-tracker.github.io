import "zx/globals";

const sqlite3 = require("sqlite3").verbose();
const randomSuffix = Math.random().toString(36).slice(2);

const updateCaseType = async (db) => {
  return fetch(`https://migracje.gov.pl/wp-json/udscmap/v1/caseType?orderBy=${randomSuffix}&limit=-1`)
    .then((resp) => resp.json())
    .then((data) => {
      let query = `DELETE FROM caseType`;
      return new Promise((resolve, reject) => {
        db.run(query, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    })
    .then((data) => {
      let query = `INSERT INTO caseType (id, type) VALUES ${data
        .map(
          (el) =>
            `(${el.id}, '${el.type
              .replaceAll("''", '"')
              .replaceAll("'", '"')}')`
        )
        .join(",")}`;
      return new Promise((resolve, reject) => {
        db.run(query, function (err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
};

const updateCountry = async (db) => {
  return fetch(`https://migracje.gov.pl/wp-json/udscmap/v1/country?orderBy=${randomSuffix}&limit=-1`)
    .then((resp) => resp.json())
    .then((data) => {
      let query = `DELETE FROM country`;
      return new Promise((resolve, reject) => {
        db.run(query, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    })
    .then((data) => {
      let query = `INSERT INTO country (id, name, code) VALUES ${data
        .map(
          (el) =>
            `(${el.id}, '${el.name
              ?.replaceAll("''", '"')
              ?.replaceAll("'", '"')}', '${el.code
              ?.replaceAll("''", '"')
              ?.replaceAll("'", '"')}')`
        )
        .join(",")}`;
      return new Promise((resolve, reject) => {
        db.run(query, function (err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
};

const updateDecisionMarker = async (db) => {
  return fetch(`https://migracje.gov.pl/wp-json/udscmap/v1/decisionMarker?orderBy=${randomSuffix}&limit=-1`)
    .then((resp) => resp.json())
    .then((data) => {
      let query = `DELETE FROM decisionMarker`;
      return new Promise((resolve, reject) => {
        db.run(query, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    })
    .then((data) => {
      let query = `INSERT INTO decisionMarker (id, description) VALUES ${data
        .map(
          (el) =>
            `(${el.id}, '${el.description
              .replaceAll("''", '"')
              .replaceAll("'", '"')}')`
        )
        .join(",")}`;
      return new Promise((resolve, reject) => {
        db.run(query, function (err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
};

const updateInstitution = async (db) => {
  return fetch(`https://migracje.gov.pl/wp-json/udscmap/v1/institution?orderBy=${randomSuffix}&limit=-1`)
    .then((resp) => resp.json())
    .then((data) => {
      let query = `DELETE FROM institution`;
      return new Promise((resolve, reject) => {
        db.run(query, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    })
    .then((data) => {
      let query = `INSERT INTO institution (id, name) VALUES ${data
        .map(
          (el) =>
            `(${el.id}, '${el.name
              .replaceAll("''", '"')
              .replaceAll("'", '"')}')`
        )
        .join(",")}`;
      return new Promise((resolve, reject) => {
        db.run(query, function (err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
};

const updateStatuslist = async (db) => {
  return fetch(`https://migracje.gov.pl/wp-json/udscmap/v1/status?orderBy=${randomSuffix}&limit=-1`)
    .then((resp) => resp.json())
    .then((data) => {
      let query = `DELETE FROM statuslist`;
      return new Promise((resolve, reject) => {
        db.run(query, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    })
    .then((data) => {
      let query = `INSERT INTO statuslist (id, status) VALUES ${data
        .map(
          (el) =>
            `(${el.id}, '${el.status
              .replaceAll("''", '"')
              .replaceAll("'", '"')}')`
        )
        .join(",")}`;
      return new Promise((resolve, reject) => {
        db.run(query, function (err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
};

const ensureCountryTable = (db) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='country'",
      (err, row) => {
        if (err) {
          reject(err);
        } else if (row === undefined) {
          db.run(
            `CREATE TABLE country (
            id INTEGER PRIMARY KEY,
            name TEXT,
            code TEXT
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

const ensureInstitutionTable = (db) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='institution'",
      (err, row) => {
        if (err) {
          reject(err);
        } else if (row === undefined) {
          db.run(
            `CREATE TABLE institution (
            id INTEGER PRIMARY KEY,
            name TEXT
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

const ensureCasetypeTable = (db) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='caseType'",
      (err, row) => {
        if (err) {
          reject(err);
        } else if (row === undefined) {
          db.run(
            `CREATE TABLE caseType (
            id INTEGER PRIMARY KEY,
            type TEXT
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

const ensureDecisionmarkerTable = (db) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='decisionMarker'",
      (err, row) => {
        if (err) {
          reject(err);
        } else if (row === undefined) {
          db.run(
            `CREATE TABLE decisionMarker (
            id INTEGER PRIMARY KEY,
            description TEXT
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

const ensureStatuslistTable = (db) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='statuslist'",
      (err, row) => {
        if (err) {
          reject(err);
        } else if (row === undefined) {
          db.run(
            `CREATE TABLE statuslist (
            id INTEGER PRIMARY KEY,
            status TEXT
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

$.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
const sqlLiteConnection = new sqlite3.Database("astro-pl-tracker/prisma/tracker.db");
await Promise.all([
  ensureCasetypeTable(sqlLiteConnection).then(
    updateCaseType(sqlLiteConnection)
  ),
  ensureCountryTable(sqlLiteConnection).then(
    updateCountry(sqlLiteConnection)),
  ensureDecisionmarkerTable(sqlLiteConnection).then(
    updateDecisionMarker(sqlLiteConnection)
  ),
  ensureInstitutionTable(sqlLiteConnection).then(
    updateInstitution(sqlLiteConnection)
  ),
  ensureStatuslistTable(sqlLiteConnection).then(
    updateStatuslist(sqlLiteConnection)
  ),
]);
