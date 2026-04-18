# Notes

## Active data source

The adapter now uses the U.S. Bureau of Labor Statistics (BLS) Public Data API.

Series currently used:
- `CUUR0000SA0` — CPI for All Urban Consumers (U.S. city average, all items)

BLS API endpoint:
- `https://api.bls.gov/publicAPI/v2/timeseries/data/`

## Current calculation logic

The adapter computes accumulated inflation as an index ratio:

    latest_cpi / first_cpi_from_start_date

This is cleaner than the earlier prototype logic based on multiplying monthly inflation-rate values.

For example, if the CPI at the selected historical start date is 257.971 and the latest CPI is 330.213, the adapter returns:

    330.213 / 257.971 = 1.280039229215687

## Local test

    curl -X POST -H "content-type:application/json" "http://localhost:8080/" --data '{"id": 0, "data": { "start_date": "2020-01-01"}}'

## Historical note about Nasdaq

The original version of the project queried Nasdaq Data Link dataset `RATEINF/INFLATION_USA`.

That historical query path is preserved in the project history because it was the source used during the original 2022 prototype. However, live requests to Nasdaq Data Link became blocked from the current environment by Nasdaq's security layer, so the active implementation was migrated to BLS.

## Historical Heroku deployment

Historical deployed endpoint used during the original prototype:

    curl --silent -X POST -H "content-type:application/json" "https://evening-forest-80004.herokuapp.com" --data '{"id": 0, "data": { "start_date": "2005-01-01"}}' | jq -r .result

Expected example result from that period:

    1.480891171443743
