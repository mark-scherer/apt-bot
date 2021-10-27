/*
  scraper base class
  - only intended to be inherited
*/

const utils = require('./utils')

class Scraper {
  constructor(opts) {
    this.opts = utils.validateInputs(opts)
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