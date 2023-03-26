export const countries = [
  {
    code: "by",
    path: "/by",
  },
  {
    code: "ua",
    path: "/ua",
  },
  {
    code: "de",
    path: "/de",
  },
  {
    code: "vn",
    path: "/vn",
  },
  {
    code: "in",
    path: "/in",
  },
  {
    code: "it",
    path: "/it",
  },
  {
    code: "ge",
    path: "/ge",
  },
  {
    code: "cn",
    path: "/cn",
  },
  {
    code: "uk",
    path: "/uk",
  },
  {
    code: "ru",
    path: "",
  },
];
interface CountryParams {
  params: {
    country: string;
  };
}
export function getCountryRoutes(): CountryParams[] {
  return countries.map((c) => ({ params: { country: c.code } }));
}
