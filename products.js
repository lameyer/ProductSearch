var async = require('async');
var _ = require('underscore');
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

    products = _.values(_.groupBy(products, function(product) {
      return product.upc;
    }));

    products.forEach(function(productList){
      productList.sort(function(a,b){
        return a.store.distance - b.store.distance;
      });
    });

    products.sort(function(a,b) {
      return a[0].store.distance - b[0].store.distance;
    });

    callback(products);
  });
}

module.exports = getProducts;
