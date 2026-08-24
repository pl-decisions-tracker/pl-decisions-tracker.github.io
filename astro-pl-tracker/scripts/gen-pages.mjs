// Regenerates table route pages + redirect stubs (self-contained getStaticPaths).
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const pages = join(process.cwd(), "src", "pages");
const NL = String.fromCharCode(10);
const J = (lines) => lines.join(NL);

const TABLES = [
  "applications",
  "decisions",
  "statuses",
  "applicationstotal",
  "decisionstotal",
  "statusestotal",
];

const STUB_TAIL = J([
  "",
  "<!DOCTYPE html>",
  "<html lang=\"ru\">",
  "  <head>",
  "    <meta charset=\"UTF-8\" />",
  "    <meta http-equiv=\"refresh\" content={refresh} />",
  "    <title>Redirect...</title>",
  "  </head>",
  "  <body>",
  "    <p>Таблицы теперь разбиты по годам.",
  "      <a href={target}>Открыть таблицу за {latest} год</a>.",
  "    </p>",
  "  </body>",
  "</html>",
]);

const COUNTRY_YEAR = (d1, d2) => J([
  "---",
  "import MainLayout from '" + d1 + "layouts/MainLayout.astro';",
  "import TableViewPage from '" + d1 + "components/TableViewPage.astro';",
  "import { getCountryRoutes } from '" + d1 + "utils/contryRoutes';",
  "import { readFileSync } from 'node:fs';",
  "",
  "export async function getStaticPaths() {",
  "  const manifest = JSON.parse(",
  "    readFileSync(new URL('" + d2 + "public/data/index.json', import.meta.url), 'utf-8')",
  "  );",
  "  return getCountryRoutes().flatMap((c) => {",
  "    const years: number[] = manifest['<T>']?.[c.params.country] ?? [];",
  "    return years.map((y) => ({",
  "      params: { country: c.params.country, year: y.toString() },",
  "    }));",
  "  });",
  "}",
  "",
  "const { country, year } = Astro.params;",
  "---",
  "",
  "<MainLayout>",
  "  <TableViewPage countryParam={country!} year={parseInt(year!)} tableKey=\"<T>\" />",
  "</MainLayout>",
]);

const ROOT_YEAR = (d1, d2) => J([
  "---",
  "import MainLayout from '" + d1 + "layouts/MainLayout.astro';",
  "import TableViewPage from '" + d1 + "components/TableViewPage.astro';",
  "import { readFileSync } from 'node:fs';",
  "",
  "export async function getStaticPaths() {",
  "  const manifest = JSON.parse(",
  "    readFileSync(new URL('" + d2 + "public/data/index.json', import.meta.url), 'utf-8')",
  "  );",
  "  const years: number[] = manifest['<T>']?.ru ?? [];",
  "  return years.map((y) => ({ params: { year: y.toString() } }));",
  "}",
  "",
  "const { year } = Astro.params;",
  "---",
  "",
  "<MainLayout>",
  "  <TableViewPage countryParam=\"ru\" year={parseInt(year!)} tableKey=\"<T>\" />",
  "</MainLayout>",
]);

const COUNTRY_STUB = (d1, d2) => J([
  "---",
  "import { getCountryRoutes } from '" + d1 + "utils/contryRoutes';",
  "import { readFileSync } from 'node:fs';",
  "",
  "export async function getStaticPaths() {",
  "  const manifest = JSON.parse(",
  "    readFileSync(new URL('" + d2 + "public/data/index.json', import.meta.url), 'utf-8')",
  "  );",
  "  return getCountryRoutes()",
  "    .map((c) => {",
  "      const years: number[] = manifest['<T>']?.[c.params.country] ?? [];",
  "      const latest = years.length ? years[years.length - 1] : null;",
  "      return { params: c.params, props: { latest } };",
  "    })",
  "    .filter((r) => r.props.latest !== null);",
  "}",
  "",
  "const { latest } = Astro.props;",
  "const target = '../' + latest + '/<T>.html';",
  "const refresh = '0; url=' + target;",
  "---",
  STUB_TAIL,
]);

const ROOT_STUB = (d2) => J([
  "---",
  "import { readFileSync } from 'node:fs';",
  "",
  "export async function getStaticPaths() {",
  "  const manifest = JSON.parse(",
  "    readFileSync(new URL('" + d2 + "public/data/index.json', import.meta.url), 'utf-8')",
  "  );",
  "  const years: number[] = manifest['<T>']?.ru ?? [];",
  "  const latest = years.length ? years[years.length - 1] : null;",
  "  return latest === null ? [] : [{ params: {}, props: { latest } }];",
  "}",
  "",
  "const { latest } = Astro.props;",
  "const target = latest + '/<T>.html';",
  "const refresh = '0; url=' + target;",
  "---",
  STUB_TAIL,
]);

mkdirSync(join(pages, "[country]", "[year]"), { recursive: true });
mkdirSync(join(pages, "[year]"), { recursive: true });


for (const t of TABLES) {
  writeFileSync(join(pages, "[country]", "[year]", t + ".astro"),
    COUNTRY_YEAR("../../../", "../../../").replaceAll("<T>", t));
  writeFileSync(join(pages, "[year]", t + ".astro"),
    ROOT_YEAR("../../", "../../").replaceAll("<T>", t));
  writeFileSync(join(pages, "[country]", t + ".astro"),
    COUNTRY_STUB("../../", "../../").replaceAll("<T>", t));
  writeFileSync(join(pages, t + ".astro"),
    ROOT_STUB("../").replaceAll("<T>", t));
}
console.log("pages generated:", TABLES.length * 4);
