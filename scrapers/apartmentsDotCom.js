/*
  apartments.com scraper
    
  - site breakdown:
    - search filters encoded in url query
      - ex request: https://www.apartments.com/san-francisco-ca-94123/2-bedrooms-under-3200/
    - server-side renders html with search results data
      - images are excluded, not sure what initiates image get requests
    - node and curl based requests denied until 'user-agent' request header set to match chrome
      - requests use lots of cookies but 
*/

const fs = require('fs')
const _ = require('lodash')
const cheerio = require('cheerio')
const utils = require('./utils')
const Scraper = require('./scraper')

const BASE_URL = 'https://www.apartments.com'
const REQUEST_HEADERS = {
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36'
}

const sanitizeLocation = (locationInput) => locationInput.toLowerCase().trim().replace(/ /g, '-')

class apartmentsDotCom extends Scraper {
  constructor(opts) {
    super(opts)

    if (this.opts.minBedrooms <= 0 || this.opts.maxBedrooms > 4) throw Error(`unsupported bedroom range: ${JSON.stringify({ ..._.pick(opts, ['minBedrooms', 'maxBedrooms']) })}`)
    if (this.opts.minBedrooms === this.opts.maxBedrooms) throw Error(`unsupported bedroom range: ${JSON.stringify({ ..._.pick(opts, ['minBedrooms', 'maxBedrooms']) })}`)
    if (this.opts.minPrice <= 0 || this.opts.maxPrice > 5000) throw Error(`unsupported price range: ${JSON.stringify({ ..._.pick(opts, ['minPrice', 'maxPrice']) })}`)
    if (this.opts.minPrice === this.opts.maxPrice) throw Error(`unsupported price range: ${JSON.stringify({ ..._.pick(opts, ['minPrice', 'maxPrice']) })}`)
    if (!utils.ZIP_MAP[this.opts.zip]) throw Error(`unsupported zip: ${JSON.stringify({ ..._.pick(opts, ['zip']) })}`)
  }

  async scrape() {
    const locationClause = `${sanitizeLocation(utils.ZIP_MAP[this.opts.zip].city)}-${sanitizeLocation(utils.ZIP_MAP[this.opts.zip].state)}-${this.opts.zip}`
    const bedroomsPriceClause = `${this.opts.minBedrooms}-to-${this.opts.maxBedrooms}-bedrooms-${this.opts.minPrice}-to-${this.opts.maxPrice}`
    const url = `${BASE_URL}/${locationClause}/${bedroomsPriceClause}`
    
    const rawHtml = await utils.request(url, {
      headers: REQUEST_HEADERS
    })

    let listings = []
    const source = this.constructor.name
    const $ = cheerio.load(rawHtml)
    $('li.mortar-wrapper').each(function(i, elem) {
      listings.push({
        source,
        url: $(this).find('.property-link').attr('href'),
        address: $(this).find('.property-address').attr('title').split(',')[0].trim().toLowerCase(),
        zip: $(this).find('.property-address').attr('title').split(' ').slice(-1)[0].trim().toLowerCase(),
        price: parseInt($(this).find('.property-pricing,.property-rents,.price-range').text().trim().replace(/\$|,/g, '')),
        bedrooms: parseInt($(this).find('.property-beds,.bed-range').text().trim().toLowerCase().replace(/ Bed(s)?/g, '')),
        phone: $(this).find('.phone-link').text().replace(/\n/g, '').trim().substring(0,14) || null
      })
    })

    try {
      utils.validateListings(listings, 'info')
    } catch (listingError) {
      throw Error(`${this.constructor.name}.scrape: scraped invalid listings: ${listingError}`)
    }

    return listings
  }
}

module.exports = apartmentsDotCom
