/*
  dev scratch for scrapers
*/

const fs = require('fs')
const Scraper = require('./apartmentsDotCom')

const DEFAULT_OPTS = {
  zip: '94123',
  minBedrooms: 1,
  maxBedrooms: 2,
  minPrice: 1500,
  maxPrice: 3000
}
const OUTPUT_RESPONSE_FILE = '/Users/mark/Downloads/apartmentsDotCom.json'

const main = async function() {
  const scraper = new Scraper(DEFAULT_OPTS)
  const listings = await scraper.scrape()
  fs.writeFileSync(OUTPUT_RESPONSE_FILE, JSON.stringify(listings))  
  console.log(`wrote ${listings.length} listings to ${OUTPUT_RESPONSE_FILE}`)
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })