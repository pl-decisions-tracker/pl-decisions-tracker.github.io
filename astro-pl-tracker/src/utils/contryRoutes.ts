interface CountryParams {
    params: {
      country: string;
    }
}
export function getCountryRoutes(): CountryParams[] {
  return [
    {
      params: {
        country: "by"
      }
    },
    {
      params: {
        country: "ua"
      }
    },
    {
      params: {
        country: "de"
      }
    },
    {
      params: {
        country: "vn"
      }
    },
    {
      params: {
        country: "in"
      }
    },
    {
      params: {
        country: "it"
      }
    },
    {
      params: {
        country: "ge"
      }
    },
    {
      params: {
        country: "cn"
      }
    },
    {
      params: {
        country: "uk"
      }
    }
  ];
}