var async = require('async');
var getWalmartProducts = require('./walmart');
var getBestBuyProducts = require('./bestbuy');

var getProducts = function(query, zipcode, radius, callback) {
  async.parallel([
      function(callback){
          getWalmartProducts(query, zipcode, radius, function(products){
              callback(null, products);
          });
      },
      function(callback){
          getBestBuyProducts(query, zipcode, radius, function(products){
              callback(null, products);
          });
      }
  ],
  function(err, productsBySource){
    var products = [];
    productsBySource.forEach(function(productList) {
      productList.forEach(function(product) {
        products.push(product);
      });
    });
    products.sort(function(a,b) {
      return a.store.distance - b.store.distance;
    });

    callback(products);
  });
}

module.exports = getProducts;
