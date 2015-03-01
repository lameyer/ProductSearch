var request = require('sync-request');
var cheerio = require('cheerio');

var getProductsAtStore = function(query, store) {

  var response = request('GET', 'http://www.walmart.com/search/?query=' + query + '&stores=' + store.id + '&redirect=false');

  $ = cheerio.load(response.getBody().toString());

  var products = $('.js-tile').map(function() {
    var product = {
      title: $(this).find('.js-product-title').text(),
      price: $(this).find('.price').text(),
      url: 'http://www.walmart.com' + $(this).find('.js-product-title').attr('href'),
      inStore: $(this).find('.fulfillment-container').text().search('store pickup') !== -1,
      storeId: store.id,
      distance: store.distance,
      address: store.address,
      geoPoint: store.geoPoint,
      openNow: store.openNow
    }
    return product;
  }).get().filter(function(product) {
    return product.inStore;
  });

  return products;
}

var getWalmartProducts = function(query, zipcode) {

  var storeResponse = JSON.parse(request('GET', 'http://www.walmart.com/search/store-availability?location=' + zipcode).getBody().toString());

  var products = [];

  storeResponse.stores.forEach(function(store) {
    var productList = getProductsAtStore(query, store);
    productList.forEach(function(product) {
      products[products.length] = product;
    });
  });

  products.sort(function(a,b) {
    return a.distance - b.distance;
  });

  return products;
};

module.exports = getWalmartProducts;
