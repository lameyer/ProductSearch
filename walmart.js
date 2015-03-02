var request = require('request');
var cheerio = require('cheerio');
var async = require('async');

var getProductsAtStore = function(query, store, callback) {

  var queryURL = 'http://www.walmart.com/search/?query=' + query + '&stores=' + store.id + '&redirect=false'
  var response = request(queryURL, function(error, response, body) {

    $ = cheerio.load(body.toString());

    try {
      var scriptTagTexts = $('script:not([src])').map(function() {
          return $(this).text()
      }).get();

      var analyticsScript = scriptTagTexts.filter(function(t) {
        return t.indexOf("window._WML.SEARCH_ANALYTICS_DATA") != -1 }
      )[0];
      var analyticsScriptJSON = analyticsScript.split("window._WML.SEARCH_ANALYTICS_DATA = ")[1].split(";").join("");

      var productsToUpcMap = JSON.parse(analyticsScriptJSON).products;
    } catch(err) {}

    var products = $('.js-tile').map(function() {

      var product = {
        id: $(this).attr('data-item-id'),
        name: $(this).find('.js-product-title').text(),
        price: $(this).find('.price').text(),
        url: 'http://www.walmart.com' + $(this).find('.js-product-title').attr('href'),
        store: {
          storeType: store.storeType.displayName,
          address: store.address.address1,
          city: store.address.city,
          region: store.address.state,
          zipcode: store.address.postalCode,
          distance: store.distance,
          type: 'Walmart'
        },
        inStore: $(this).find('.fulfillment-container').text().search('store pickup') !== -1,
        openNow: store.openNow
      }

      if (productsToUpcMap) {
        var matchingItem = productsToUpcMap.filter(function(item) {
          return item.id === product.id;
        });
        if (matchingItem.length > 0) {
          product.upc = matchingItem[0].upc;
        }
      }

      return product;

    }).get().filter(function(product) {
      return product.inStore;
    });

    callback(products);
  });

}

var getWalmartProducts = function(query, zipcode, radius, callback) {

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
