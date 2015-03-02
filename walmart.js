var request = require('request');
var cheerio = require('cheerio');
var async = require('async');

var getProductsAtStore = function(query, store, callback) {

  console.log('start: ' + store.id);

  var queryURL = 'http://www.walmart.com/search/?query=' + query + '&stores=' + store.id + '&redirect=false'
  var response = request(queryURL, function(error, response, body) {

    $ = cheerio.load(body.toString());

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
    console.log('finish: ' + store.id);
    callback(products);
  });

}

var getWalmartProducts = function(query, zipcode, callback) {

  var storeURL = 'http://www.walmart.com/search/store-availability?location=' + zipcode

  request(storeURL, function(error,reponse,body) {

    var storeResponse = JSON.parse(body);
    var products = [];

    var queryStore = function(store, callback) {
      getProductsAtStore(query, store, function(products) {
        callback(null, products);
      });
    }

    async.map(storeResponse.stores, queryStore, function(err, productsByStore){
      productsByStore.forEach(function(productList) {
        productList.forEach(function(product) {
          products[products.length] = product;
        });
      });
      products.sort(function(a,b) {
        return a.distance - b.distance;
      });

      callback(products);
    });

  });

};

module.exports = getWalmartProducts;
