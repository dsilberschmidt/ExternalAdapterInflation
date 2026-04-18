# ExternalAdapterInflation

Chainlink external adapter for computing accumulated U.S. dollar inflation from a historical start date.

This repository was built as part of **“Oracle for an historical stable coin”**, a prototype submitted to the **Chainlink Spring 2022 Hackathon**.

## Overview

Most oracle examples return a spot price or a single data point. This adapter follows a different pattern: it receives a historical `start_date`, queries a public inflation source, aggregates the relevant series from that date onward, and returns a single accumulated value that can be consumed by a smart contract.

The broader question behind the project was simple:

> Can a smart contract reason about value across time, not just price at a point in time?

## What this adapter does

The adapter:

1. receives a request containing a historical start date
2. queries a U.S. inflation index source
3. extracts the monthly CPI series returned by that source
4. computes a cumulative factor across time
5. returns the result in `data.result` in a Chainlink-compatible response

## Active data source

The current implementation uses the **U.S. Bureau of Labor Statistics (BLS) Public Data API**.

Series currently used:

- `CUUR0000SA0` — CPI for All Urban Consumers (U.S. city average, all items)

BLS API endpoint:

- `https://api.bls.gov/publicAPI/v2/timeseries/data/`

## Input

The adapter expects a JSON request body like this:

    {
      "id": "1",
      "data": {
        "start_date": "2020-01-01"
      }
    }

Accepted aliases for the main input field:

- `start_date`
- `from`
- `start`

## Output

A successful response follows the usual Chainlink external adapter structure:

    {
      "jobRunID": "1",
      "data": {
        "result": 1.1234
      },
      "result": 1.1234,
      "statusCode": 200
    }

## Important note on the returned value

The current implementation returns an accumulated inflation factor computed from the CPI index:

    latest_cpi / first_cpi_from_start_date

So the returned value is an accumulation factor rather than a human-formatted inflation percentage.

That means:

- `1.00` corresponds roughly to no cumulative change
- `1.10` corresponds roughly to a 10% accumulated increase in the price level
- the code returns the factor itself, not `factor - 1`

## How the calculation works

The adapter:

1. fetches the CPI series from BLS
2. filters monthly observations
3. keeps only entries at or after the requested `start_date`
4. sorts them chronologically
5. divides the latest CPI value by the first CPI value in range

This produces a cleaner accumulated-inflation factor than the earlier prototype logic based on multiplying monthly rate-derived values.

## Repository structure

- `index.js` — core adapter logic, request validation, BLS query, accumulated-inflation calculation, Chainlink response formatting
- `app.js` — Express wrapper exposing the adapter over HTTP
- `Dockerfile` — Docker image definition
- `Procfile` — Heroku process definition
- `notes.md` — development notes and usage examples
- `docs/history/heroku-debugging.md` — preserved debugging notes from the original Heroku deployment phase

## Local development

Install dependencies:

    yarn

Run locally:

    yarn start

By default, the service listens on:

- `PORT`, if provided
- otherwise `8080`

## Example local call

    curl -X POST \
      -H "content-type:application/json" \
      "http://localhost:8080/" \
      --data '{
        "id": "1",
        "data": {
          "start_date": "2020-01-01"
        }
      }'

You can also use the accepted aliases:

    curl -X POST \
      -H "content-type:application/json" \
      "http://localhost:8080/" \
      --data '{
        "id": "1",
        "data": {
          "from": "2020-01-01"
        }
      }'

## Docker

Build the image:

    docker build . -t external-adapter-inflation

Run it:

    docker run -p 8080:8080 \
      external-adapter-inflation

## Relationship to the smart contract repo

This adapter was designed to work with the companion smart-contract repository:

- `hsc`: https://github.com/dsilberschmidt/hsc

In the full prototype flow:

    smart contract → Chainlink node → this external adapter → inflation source → accumulated inflation result → on-chain storage

## Project context

This adapter was part of a broader experiment around a possible historical stable coin: a system where smart contracts could use inflation-aware logic anchored to a selectable historical date.

Public hackathon submission:

- https://devpost.com/software/oracle-for-an-historical-stable-coin

## Historical note about Nasdaq

The original version of the adapter queried **Nasdaq Data Link** dataset `RATEINF/INFLATION_USA`.

That source was part of the original 2022 prototype and remains important historically. However, live requests to Nasdaq Data Link became blocked from the current environment by Nasdaq's security layer, so the active implementation was migrated to BLS.

## Current state

This repository has been cleaned to preserve the actual adapter logic and remove leftover template material.

It currently:

- runs locally
- returns a working accumulated-inflation factor
- uses BLS as the active inflation source
- preserves the historical Heroku deployment/debugging path
- remains tied to the original prototype architecture

It should be understood as a historical prototype, not as a production-ready service.

## Historical note

This repository is best understood as a preserved technical artifact from the 2022 prototype rather than as a maintained service. Its main value today is to document the external-adapter side of the Historical Stable Coin experiment.

## Author

dsilberschmidt
