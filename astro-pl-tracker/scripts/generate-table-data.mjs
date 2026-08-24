import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const outRoot = join(projectRoot, "public", "data");
// Keep in sync with src/utils/contryRoutes.ts
const COUNTRIES = ["all", "by", "ua", "de", "vn", "in", "it", "ge", "cn", "uk", "ru"];

const TABLES = [
  { key: "applications", model: "applications", dims: [
    { fk: "institution", dict: "institution", prop: "name", json: "institution" },
    { fk: "caseType", dict: "caseType", prop: "type", json: "caseType" }] },
  { key: "decisions", model: "decisions", dims: [
    { fk: "institution", dict: "institution", prop: "name", json: "institution" },
    { fk: "caseType", dict: "caseType", prop: "type", json: "caseType" },
    { fk: "decisionMarker", dict: "decisionMarker", prop: "description", json: "decision" }] },
  { key: "statuses", model: "statuses", dims: [
    { fk: "institution", dict: "institution", prop: "name", json: "institution" },
    { fk: "status", dict: "statuslist", prop: "status", json: "status" }] },
  { key: "applicationstotal", model: "applications", dims: [
    { fk: "caseType", dict: "caseType", prop: "type", json: "caseType" }] },
  { key: "decisionstotal", model: "decisions", dims: [
    { fk: "caseType", dict: "caseType", prop: "type", json: "caseType" },
    { fk: "decisionMarker", dict: "decisionMarker", prop: "description", json: "decision" }] },
  { key: "statusestotal", model: "statuses", dims: [
    { fk: "status", dict: "statuslist", prop: "status", json: "status" }] },
];

const pad2 = (n) => String(n).padStart(2, "0");
const fmtDate = (d) => `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;

console.log("Loading dictionaries...");
const dl = await Promise.all([
  prisma.institution.findMany(),
  prisma.caseType.findMany(),
  prisma.decisionMarker.findMany(),
  prisma.statuslist.findMany(),
  prisma.updates.findMany({ select: { dateId: true, timestamp: true } }),
]);
const dicts = { institution: dl[0], caseType: dl[1], decisionMarker: dl[2], statuslist: dl[3] };
const dateById = new Map(dl[4].map((u) => [u.dateId, u.timestamp]));

mkdirSync(outRoot, { recursive: true });
const manifest = {};

for (const table of TABLES) {
  manifest[table.key] = {};
  const dimMaps = table.dims.map((d) => new Map(dicts[d.dict].map((r) => [r.id, r[d.prop]])));
  const fks = table.dims.map((d) => d.fk);

  for (const country of COUNTRIES) {
    const where = country === "all" ? {} : { countryObj: { code: country.toUpperCase() } };
    console.time(table.key + "/" + country);
    const raw = await prisma[table.model].groupBy({ by: ["dateId", ...fks], where, _sum: { count: true } });
    console.timeEnd(table.key + "/" + country);

    const byYear = new Map();
    for (const r of raw) {
      const ts = dateById.get(r.dateId);
      if (!ts) continue;
      const year = ts.getUTCFullYear();
      let rows = byYear.get(year);
      if (!rows) byYear.set(year, (rows = []));
      const row = { date: fmtDate(ts), count: r._sum.count ?? 0 };
      let complete = true;
      for (let i = 0; i < table.dims.length; i++) {
        const name = dimMaps[i].get(r[table.dims[i].fk]);
        if (name === undefined) { complete = false; break; }
        row[table.dims[i].json] = name;
      }
      if (complete) rows.push(row);
    }

    const years = [...byYear.keys()].sort((a, b) => a - b);
    for (const year of years) {
      const rows = byYear.get(year);
      rows.sort((a, b) => {
        if (a.date !== b.date) return a.date < b.date ? -1 : 1;
        for (const d of table.dims) {
          const av = String(a[d.json]);
          const bv = String(b[d.json]);
          if (av !== bv) return av < bv ? -1 : 1;
        }
        return 0;
      });
      const outDir = join(outRoot, country, table.key);
      mkdirSync(outDir, { recursive: true });
      writeFileSync(join(outDir, year + ".json"), JSON.stringify({ rows }));
    }
    manifest[table.key][country] = years;
    console.log("  -> " + years.length + " year file(s)");
  }
}

writeFileSync(join(outRoot, "index.json"), JSON.stringify(manifest));
await prisma.$disconnect();
console.log("Data generation complete.");
