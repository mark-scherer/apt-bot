/*
  scraper utils
*/

const _ = require('lodash')
const got = require('got')

/* IO helpers */

// comprehensive list of known inputs and their default values if applicable
const KNOWN_OPTS = [
  'zip',
  'minBedrooms',
  'maxBedrooms',
  'minPrice',
  'maxPrice'
]
const validateInputs = function(opts) {
  _.forEach(KNOWN_OPTS, opt => {
    if (isNull(opts[opt])) throw Error(`validateInputs: missing required input: ${JSON.stringify({ opt })}`)
  })

  _.forEach(opts, (val, key) => {
    if (!KNOWN_OPTS.includes(key)) throw Error(`validateInputs: unrecognized input: ${JSON.stringify({ key, val })}`)
  })

  return opts
}

const REQUIRED_FIELDS_LISTING_INFO = {
  source: 'string',
  url: 'string',
  address: 'string',
  zip: 'string',
  price: 'number',
  bedrooms: 'number',
}

// note: does not throw error on extra fields in listings
const validateListings = (listings, type) => {
  let errors = []
  if (type === 'info') {
    _.forEach(listings, (listing, index) => {
      if (!_.isMatchWith(listing, REQUIRED_FIELDS_LISTING_INFO, (objValue, srcValue) => {
        return objValue && typeof objValue === srcValue 
      })) errors.push({ listing, index })
    })
  } else if (type === 'details') {
    throw Error(`validateListings: type === details not yet implemented`)
  } else throw Error(`validateListings: unrecognized listing type: ${type}`)

  if (errors.length > 0) throw Error(`found ${errors.length} invalid listings: ${JSON.stringify({ errors, REQUIRED_FIELDS_LISTING_INFO })}`)
}

// TMP, should actually lookup cities and states somehow
const ZIP_MAP = {
  '94123': {city: 'san francisco', state: 'ca'}
}

/* web helpers */
const request = async function(url, opts={}) {
  const defaultOpts = {
    timeout: 10000
  }
  _.forEach(defaultOpts, (defaultValue, key) => {
    if (isNull(opts[key])) opts[key] = defaultValue
  })

  let response
  try {
    // console.log(`request: sending request: ${JSON.stringify({ url, opts })}`)
    response = await got(url, opts)
  } catch (error) {
    throw Error(`request: ${JSON.stringify({ error: String(error) })}`)
  }
  return response.body
}

/* misc helpers */
const isNull = (val) => val === null || val == undefined

module.exports = {
  validateInputs,
  validateListings,
  ZIP_MAP,

  request,

  isNull
}