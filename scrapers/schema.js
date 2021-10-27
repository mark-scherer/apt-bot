/*
  scraper I/O schema
*/

module.exports = {
  input: {
    zip: {required: true, type: 'string'},
    minBedrooms: {required: true, type: 'number'},
    maxBedrooms: {required: true, type: 'number'},
    minPrice: {required: true, type: 'number'},
    maxPrice: {required: true, type: 'number'}
  },

  // listingInfo is basic listing data accessible from search results, not requiring scraping the listing individually
  listingInfo: {
    source: {required: true, type: 'string'},
    url: {required: true, type: 'string'},
    address: {required: true, type: 'string'},
    zip: {required: true, type: 'string'},
    price: {required: true, type: 'number'},
    bedrooms: {required: true, type: 'number'},
    phone: {required: false, type: 'string'},
  }
}