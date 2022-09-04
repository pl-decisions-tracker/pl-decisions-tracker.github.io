#!/usr/bin/env bash
suffix=$(
  echo $RANDOM | md5sum | head -c 20
)
current_year=$(date +"%Y")
currend_date=$(date +"%Y-%m-%d")

# Decisions by wojewodship
group_by="institution%2CdecisionMarker%2CcaseType"
fields="institution%2CdecisionMarker%2CcaseType%2Ctotal"
order_by="institution%2CdecisionMarker%2CcaseType%2C${suffix}"
url="https://migracje.gov.pl/wp-json/udscmap/v1/decisions/poland?groupBy=${group_by}&fields=${fields}&orderBy=${order_by}&year=${current_year}&country=RU"
echo "${url}"
curl --location --silent -H "Accept: application/json" "${url}" >/tmp/decisions.json
jq -r -c --arg today "$currend_date" --slurpfile current_json /tmp/decisions.json '. + {($today): $current_json[0]}' decisions.json >tmpfile && mv tmpfile decisions.json

# Statuses by wojewodship
group_by="institution%2Cstatus"
fields="institution%2Cstatus%2Ctotal"
order_by="institution%2C${suffix}"
url="https://migracje.gov.pl/wp-json/udscmap/v1/statuses/poland?groupBy=${group_by}&fields=${fields}&orderBy=${order_by}&year=${current_year}&country=RU"
echo "${url}"
curl --location --silent -H "Accept: application/json" "${url}" >/tmp/statuses.json
jq -r -c --arg today "$currend_date" --slurpfile current_json /tmp/statuses.json '. + {($today): $current_json[0]}' statuses.json >tmpfile && mv tmpfile statuses.json

# Applications by wojewodship
group_by="institution%2CcaseType"
fields="institution%2CcaseType%2Ctotal"
order_by="institution%2C${suffix}"
url="https://migracje.gov.pl/wp-json/udscmap/v1/applications/poland?groupBy=${group_by}&fields=${fields}&orderBy=${order_by}&year=${current_year}&country=RU"
echo "${url}"
curl --location --silent -H "Accept: application/json" "${url}" >/tmp/applications.json
jq -r -c --arg today "$currend_date" --slurpfile current_json /tmp/applications.json '. + {($today): $current_json[0]}' applications.json >tmpfile && mv tmpfile applications.json

# Totals
# Decisions
group_by="decisionMarker%2CcaseType"
fields="decisionMarker%2CcaseType%2Ctotal"
order_by="decisionMarker%2CcaseType%2C${suffix}"
url="https://migracje.gov.pl/wp-json/udscmap/v1/decisions/poland?groupBy=${group_by}&fields=${fields}&orderBy=${order_by}&year=${current_year}&country=RU"
echo "${url}"
curl --location --silent -H "Accept: application/json" "${url}" >/tmp/decisionsTotal.json
jq -r -c --arg today "$currend_date" --slurpfile current_json /tmp/decisionsTotal.json '. + {($today): $current_json[0]}' decisionsTotal.json >tmpfile && mv tmpfile decisionsTotal.json

# Statuses
group_by="status"
fields="status%2Ctotal"
order_by="status%2C${suffix}"
url="https://migracje.gov.pl/wp-json/udscmap/v1/statuses/poland?groupBy=${group_by}&fields=${fields}&orderBy=${order_by}&year=${current_year}&country=RU"
echo "${url}"
curl --location --silent -H "Accept: application/json" "${url}" >/tmp/statusesTotal.json
jq -r -c --arg today "$currend_date" --slurpfile current_json /tmp/statusesTotal.json '. + {($today): $current_json[0]}' statusesTotal.json >tmpfile && mv tmpfile statusesTotal.json

# Applications
group_by="caseType"
fields="caseType%2Ctotal"
order_by="caseType%2C${suffix}"
url="https://migracje.gov.pl/wp-json/udscmap/v1/applications/poland?groupBy=${group_by}&fields=${fields}&orderBy=${order_by}&year=${current_year}&country=RU"
echo "${url}"
curl --location --silent -H "Accept: application/json" "${url}" >/tmp/applicationsTotal.json
jq -r -c --arg today "$currend_date" --slurpfile current_json /tmp/applicationsTotal.json '. + {($today): $current_json[0]}' applicationsTotal.json >tmpfile && mv tmpfile applicationsTotal.json

# Health-check
# The total number of all decisions not just for the selected country
group_by=""
fields="total"
order_by="${suffix}"
url="https://migracje.gov.pl/wp-json/udscmap/v1/decisions/poland?groupBy=${group_by}&fields=${fields}&orderBy=${order_by}&year=${current_year}"
echo "${url}"
curl --location --silent -H "Accept: application/json" "${url}" >/tmp/decisionsTotal.json
jq -r -c --arg today "$currend_date" --slurpfile current_json /tmp/healthCheck.json '. + {($today): $current_json[0]}' healthCheck.json >tmpfile && mv tmpfile healthCheck.json
