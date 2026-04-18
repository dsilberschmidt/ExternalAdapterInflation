const { Requester, Validator } = require('@chainlink/external-adapter')

const customError = (data) => {
  if (data.Response === 'Error') return true
  return false
}

const customParams = {
  start_date: ['start_date', 'from', 'start']
}

const seriesId = 'CUUR0000SA0'
const url = 'https://api.bls.gov/publicAPI/v2/timeseries/data/'

const periodToMonth = (period) => {
  const match = /^M(\d{2})$/.exec(period || '')
  return match ? Number(match[1]) : null
}

const toSortableDate = (entry) => {
  const month = periodToMonth(entry.period)
  return `${entry.year}-${String(month).padStart(2, '0')}`
}

const computeAccumulatedFactor = (data, startDate) => {
  const filtered = data
    .filter(entry => periodToMonth(entry.period) !== null)
    .map(entry => ({
      date: toSortableDate(entry),
      value: Number(entry.value)
    }))
    .filter(entry => !Number.isNaN(entry.value))
    .sort((a, b) => a.date.localeCompare(b.date))

  const startMonth = startDate.slice(0, 7)
  const usable = filtered.filter(entry => entry.date >= startMonth)

  if (usable.length === 0) {
    throw new Error(`No BLS data available for start_date ${startDate}`)
  }

  const first = usable[0].value
  const last = usable[usable.length - 1].value

  if (!first || !last) {
    throw new Error('Invalid CPI values returned by BLS')
  }

  return last / first
}

const createRequest = (input, callback) => {
  const validator = new Validator(callback, input, customParams)
  const jobRunID = validator.validated.id
  const start_date = validator.validated.data.start_date

  const startyear = start_date.slice(0, 4)
  const endyear = String(new Date().getUTCFullYear())

  const config = {
    url,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      seriesid: [seriesId],
      startyear,
      endyear
    }
  }

  Requester.request(config, customError)
    .then(response => {
      const series = response.data.Results.series[0].data
      const reply = computeAccumulatedFactor(series, start_date)
      response.data.result = reply
      callback(response.status, Requester.success(jobRunID, response))
    })
    .catch(error => {
      callback(500, Requester.errored(jobRunID, error))
    })
}

exports.gcpservice = (req, res) => {
  createRequest(req.body, (statusCode, data) => {
    res.status(statusCode).send(data)
  })
}

exports.handler = (event, context, callback) => {
  createRequest(event, (statusCode, data) => {
    callback(null, data)
  })
}

exports.handlerv2 = (event, context, callback) => {
  createRequest(JSON.parse(event.body), (statusCode, data) => {
    callback(null, {
      statusCode: statusCode,
      body: JSON.stringify(data),
      isBase64Encoded: false
    })
  })
}

module.exports.createRequest = createRequest
