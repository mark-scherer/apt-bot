/*
  scapers tester file
*/

const Bluebird = require('bluebird')
const _ = require('lodash')
const utils = require('./utils')
const scraperSchema = require('./schema')

const SCRAPERS = {
  apartmentsDotCom: require('./apartmentsDotCom')
}
const SCRAPER_COUNT = Object.keys(SCRAPERS).length

/***** TESTS *****/
const TEST_INPUT = {
  zip: '94123',
  minBedrooms: 1,
  maxBedrooms: 2,
  minPrice: 1500,
  maxPrice: 3000
}

const TESTS = {
  catchesMissingInput: async function(scraper) {
    const ommittedInputs = _.shuffle(Object.keys(TEST_INPUT)).slice(0, 1)
    const opts = _.omit(TEST_INPUT, ommittedInputs)
    
    let caughtError = ''
    try {
      new scraper(opts)
    } catch (error) {
      caughtError = String(error)
    }
  
    if (!caughtError.includes('missing required field:')) throw Error(`failed to catch missing input: ${JSON.stringify({ ommittedInputs, caughtError })}`)
  },

  catchesExtraInput: async function(scraper) {
    const extraInputs = { extraInput: 'extraValue' }
    const opts = _.merge({}, TEST_INPUT, extraInputs)
    
    let caughtError = ''
    try {
      new scraper(opts)
    } catch (error) {
      caughtError = String(error)
    }
  
    if (!caughtError.includes('extra field:')) throw Error(`failed to catch extra input: ${JSON.stringify({ extraInputs, caughtError })}`)
  },

  catchesBadInputType: async function(scraper) {
    const inputsToChange = _.filter(Object.keys(scraperSchema.input), fieldName => scraperSchema.input[fieldName].type !== 'string')
    if (!inputsToChange.length) throw Error(`catchesBadInputType: did not find any inputs in schema to change... need to update test`)

    const inputs = _.cloneDeep(TEST_INPUT)
    _.forEach(inputsToChange, fieldName => inputs[fieldName] = String(inputs[fieldName]))

    let caughtError = ''
    try {
      new scraper(inputs)
    } catch (error) {
      caughtError = String(error)
    }
  
    if (!caughtError.includes('incorrect field type:')) throw Error(`failed to catch incorrect input type: ${JSON.stringify({ inputsToChange, inputs, caughtError })}`)
  },

  producesProperListingInfo: async function(scraper) {
    const _scraper = new scraper(TEST_INPUT)
    const listings = await _scraper.scrape()
    if (!listings) throw Error(`did not return listings array`)
    if (!listings.length) throw Error(`returned zero listings`)
    const invalidListings = utils.validateIO(listings, scraperSchema.listingInfo)
    if (invalidListings) throw Error(`returned invalid listings: ${invalidListings.join('\n')}`)
  }
}

/***** END TESTS *****/


const runTest = async function(testName, testFunc) {
  console.log(`\nrunning test: ${testName}...`)
  const testResults = await Bluebird.map(Object.keys(SCRAPERS), async scraperName => {
    let result
    try {
      const returnVal = await testFunc(SCRAPERS[scraperName])
      result = {pass: true}
    } catch (error) {
      result = {pass: false, error: String(error)}
    }
    return [scraperName, result]
  })
  const namedResults = _.fromPairs(testResults)
  const passedScrapers = _.filter(Object.keys(namedResults), scraperName => namedResults[scraperName].pass)
  const failedScrapers = _.filter(Object.keys(namedResults), scraperName => !namedResults[scraperName].pass)
  if (passedScrapers.length === SCRAPER_COUNT) console.log(`\t-> ${passedScrapers.length}/${SCRAPER_COUNT} scrapers passed`)
  else {
    console.error(`\t-> FAILED: only ${passedScrapers.length}/${SCRAPER_COUNT} scraped passed ${testName}, ${failedScrapers.length} failed: ${failedScrapers}`)
    _.forEach(failedScrapers, scraperName => console.error(`\t\t${scraperName}: ${namedResults[scraperName].error}`))
  }

  return passedScrapers.length === SCRAPER_COUNT
}

const main = async function() {
  let PASSED_TESTS = [], FAILED_TESTS = []
  
  const _runTest = async function(testName, testFunc) {
    const pass = await runTest(testName, testFunc)
    if (pass) PASSED_TESTS.push(testName)
    else FAILED_TESTS.push(testName)
  }

  await Bluebird.each(Object.keys(TESTS), async testName => {
    await _runTest(testName, TESTS[testName])
  })
  

  const totalTests = PASSED_TESTS.length + FAILED_TESTS.length
  console.log(`\nfinished testing ${SCRAPER_COUNT} scrapers, passed ${PASSED_TESTS.length}/${totalTests} tests (failed ${FAILED_TESTS.length})`)
  console.log(`\tpassed (${PASSED_TESTS.length}): ${PASSED_TESTS.join(', ')}`)
  console.error(`\tfailed (${FAILED_TESTS.length}): ${FAILED_TESTS.join(', ')}`)
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
