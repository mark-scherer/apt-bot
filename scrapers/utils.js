/*
  scraper utils
*/

const _ = require('lodash')
const got = require('got')

/* IO helpers */

// generic I/O validator
  // returns null if all data passes validation
  // otherwise returns list of errors
const validateIO = (data, schema) => {
  const errors = []
  _.forEach(data, element => {
    let elementErrors = []
    _.forEach(schema, (fieldDetails, fieldName) => {
      const elementHasField = element[fieldName] !== null && element[fieldName] !== undefined
      
      // check for missing required fields
      if (fieldDetails.required && !elementHasField) elementErrors.push(`missing required field: ${JSON.stringify({ fieldName, fieldDetails })}`)

      // check for correct field type
      if (elementHasField) {
        const elementFieldType = typeof element[fieldName]
        if (elementFieldType !== fieldDetails.type) elementErrors.push(`incorrect field type: ${JSON.stringify({ fieldName, elementFieldType, requiredFieldType: fieldDetails.type })}`)
      }
    })

    // check for extra fields
    _.forEach(Object.keys(element), (elementFieldName) => {
      if (!schema[elementFieldName]) elementErrors.push(`extra field: ${JSON.stringify({ elementFieldName, elementFieldValue: element[elementFieldName] })}`)
    })

    if (elementErrors.length) errors.push(JSON.stringify({ elementErrors, element }))
  })

  return errors.length ? errors : null
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
  validateIO,
  validateListings,
  ZIP_MAP,

  request,

  isNull
}