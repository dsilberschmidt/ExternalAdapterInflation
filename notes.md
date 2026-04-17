# Notes

## Nasdaq dataset used

https://data.nasdaq.com/api/v3/datasets/RATEINF/INFLATION_USA/data.json?start_date=2020-01-01&api_key=YOUR_API_KEY

Main parameters used:
- `endpoint='data.json'`
- `start_date='2020-01-01'`

## Local test

    curl -X POST -H "content-type:application/json" "http://localhost:8080/" --data '{"id": 0, "data": { "start_date": "2020-01-01"}}'

## Historical Heroku deployment

Historical deployed endpoint used during the prototype:

    curl --silent -X POST -H "content-type:application/json" "https://evening-forest-80004.herokuapp.com" --data '{"id": 0, "data": { "start_date": "2005-01-01"}}' | jq -r .result

Expected example result from that period:

    1.480891171443743

## Current status of the data source

The adapter starts and handles requests locally, but live requests to Nasdaq Data Link are currently blocked from this environment by Nasdaq's security layer (Incapsula / Access Denied / Error 15).

This means the adapter logic itself can still be inspected and run locally, but live retrieval from the historical source may fail independently of the adapter code.

For repository purposes, this project should be treated as a historical prototype with a currently blocked external data source.
