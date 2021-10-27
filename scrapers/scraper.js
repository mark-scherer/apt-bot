/*
  scraper base class
  - only intended to be inherited
*/

const utils = require('./utils')
const scraperSchema = require('./schema')

class Scraper {
  constructor(opts) {
    const validationErrors = utils.validateIO([opts], scraperSchema.input)
    if (validationErrors) throw Error(`${this.constructor.name} constructor: failed to validated input: ${validationErrors}`)
    
    this.opts = opts
  }

  // scrape new listing from main page
  async scrape() {
    throw Error(`Scraper.scrape: should be overwritten by child class`)
  }

  // scrape single listing for further details
  async scrapeListing() {
    throw Error(`Scraper.scrape: should be overwritten by child class`)
  }
}

module.exports = Scraper