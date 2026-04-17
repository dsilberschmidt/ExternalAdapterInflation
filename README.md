# ExternalAdapterInflation

Custom Chainlink external adapter for computing accumulated U.S. dollar inflation from a historical start date.

This repository was built as part of **“Oracle for an historical stable coin”**, a prototype submitted to the **Chainlink Spring 2022 Hackathon**.

## Overview

Most oracle examples return a spot price or a single data point. This adapter follows a different pattern: it receives a historical `start_date`, queries a public inflation dataset, aggregates the returned series from that date onward, and returns a single accumulated value that can be consumed by a smart contract.

The broader question behind the project was simple: can a smart contract reason about value across time, not just price at a point in time?

## What this adapter does

The adapter:
1. receives a request containing a historical start date
2. queries the Nasdaq Data Link dataset `RATEINF/INFLATION_USA`
3. extracts the inflation series returned by the dataset
4. computes a cumulative value across the returned observations
5. returns the result in `data.result` in a Chainlink-compatible response

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

Optional field:
- `endpoint` — defaults to `data.json`

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

The current implementation computes the cumulative product:

    Π (1 + monthly_value / 100 / 12)

So the returned value is currently closer to an accumulation factor than to a final human-formatted inflation percentage.

That means:
- `1.00` corresponds roughly to no cumulative change
- `1.10` corresponds roughly to a 10% accumulated factor
- the code, as it stands, does not subtract 1 at the end

This matters because the adapter is returning the internal computed value used by the prototype, not a polished end-user presentation layer.

## Data source

The adapter queries:
- **Nasdaq Data Link**
- dataset: `RATEINF/INFLATION_USA`

The API key is expected in the environment as:
- `API_KEY`

## How the calculation works

In the current version, the adapter takes the second element of each returned data row (`x[1]`) and computes:

    response.data.dataset_data.data
      .map(x => x[1])
      .reduce((p, c) => p * (1 + c / 100 / 12), 1)

This reflects the original prototype logic and is preserved here as a historical artifact of the project.

## Repository structure

- `index.js` — core adapter logic, request validation, Nasdaq query, cumulative calculation, Chainlink response formatting
- `app.js` — Express wrapper exposing the adapter over HTTP
- `test/` — test scaffolding
- `Dockerfile` — Docker image definition
- `Procfile` — Heroku process definition
- `notes.md` — local notes and example requests from development

## Local development

Install dependencies:

    yarn

Run tests:

    yarn test

Run locally:

    yarn start

By default, the service listens on:
- `PORT`, if provided
- otherwise `8080`

## Example local call

    curl -X POST \
      -H "content-type: application/json" \
      "http://localhost:8080/" \
      --data '{
        "id": "1",
        "data": {
          "start_date": "2020-01-01"
        }
      }'

You can also use the accepted aliases:

    curl -X POST \
      -H "content-type: application/json" \
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
      -e API_KEY=your_nasdaq_api_key \
      external-adapter-inflation

## Deployment notes

This repository reflects an earlier prototype stack and includes deployment artifacts from that period:
- `Procfile` for Heroku-style deployment
- `Dockerfile` for containerized execution
- AWS/GCP wrapper exports in `index.js`

Because of that, it should be understood as a historical prototype, not as a production-ready service.

## Relationship to the smart contract repo

This adapter was designed to work with the companion smart-contract repository:
- `hsc`: https://github.com/dsilberschmidt/hsc

In the full prototype flow:

    smart contract → Chainlink node → this external adapter → Nasdaq dataset → accumulated inflation result → on-chain storage

## Project context

This adapter was part of a broader experiment around a possible historical stable coin: a system where smart contracts could use inflation-aware logic anchored to a selectable historical date.

Public hackathon submission:
- https://devpost.com/software/oracle-for-an-historical-stable-coin

## Current status

This repository is preserved as a public prototype.

It still has several traits of a hackathon / research build:
- template metadata remains in `package.json`
- the repository originally inherited the Chainlink adapter template
- the calculation is functional but only lightly documented in code
- the deployment assumptions are tied to an older Chainlink/Heroku era

## Cleanup opportunities

Reasonable future cleanup would include:
- replacing template package metadata
- adding a proper `.env.example`
- documenting the exact semantics of the returned result more formally
- adding stronger tests for the cumulative calculation
- updating the stack for current deployment targets

## Author

dsilberschmidt