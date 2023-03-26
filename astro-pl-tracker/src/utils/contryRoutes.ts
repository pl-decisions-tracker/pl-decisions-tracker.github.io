export const countries = [
  {
    code: "by",
    path: "/by",
    countryPath: true,
  },
  {
    code: "ua",
    path: "/ua",
    countryPath: true,
  },
  {
    code: "de",
    path: "/de",
    countryPath: true,
  },
  {
    code: "vn",
    path: "/vn",
    countryPath: true,
  },
  {
    code: "in",
    path: "/in",
    countryPath: true,
  },
  {
    code: "it",
    path: "/it",
    countryPath: true,
  },
  {
    code: "ge",
    path: "/ge",
    countryPath: true,
  },
  {
    code: "cn",
    path: "/cn",
    countryPath: true,
  },
  {
    code: "uk",
    path: "/uk",
    countryPath: true,
  },
  {
    code: "ru",
    path: "",
    countryPath: false,
  },
];
interface CountryParams {
  params: {
    country: string;
  };
}
export function getCountryRoutes(): CountryParams[] {
  return countries.filter(c => c.countryPath).map((c) => ({ params: { country: c.code } }));
}
