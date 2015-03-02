var request = require('request');

var getBestBuyProducts = function(query, zipcode, radius, callback) {

  var queryURL = 'http://api.remix.bestbuy.com/v1/stores(area(' + zipcode + ','+radius+'))+products(search=' + query.split(' ').join('&search=') + ')?apiKey=' + process.env.BEST_BUY_API_KEY + '&format=json&show=storeId,storeType,address,city,region,postalCode, name,distance,products.name,products.upc,products.salePrice,products.url'

  request(queryURL, function(error,reponse,body) {

    var queryResponse = JSON.parse(body);
    var products = [];

    queryResponse.stores.forEach(function(store) {
      var prettyStore = {
        storeType: store.storeType,
        address: store.address,
        city: store.city,
        region: store.region,
        zipcode: store.postalCode,
        distance: store.distance,
        type: 'Best Buy'
      }
      store.products.forEach(function(product) {
        var prettyProduct = {
          name: product.name,
          upc: product.upc.slice(0,-1), //removed check digit
          price: product.salePrice,
          url: product.url,
          store: prettyStore
        }
        products.push(prettyProduct);
      });
    });

    callback(products);

  });

};

module.exports = getBestBuyProducts;
