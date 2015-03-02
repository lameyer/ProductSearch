var request = require('request');

var getProducts = function(query, zipcode, radius, callback) {

  var queryURL = 'http://api.remix.bestbuy.com/v1/stores(area(' + zipcode + ','+radius+'))+products(search=' + query.split(' ').join('&search=') + ')?apiKey=' + process.env.BEST_BUY_API_KEY + '&format=json&show=storeId,city,region,name,distance,products.name,products.upc,products.salePrice,products.url'

  console.log(queryURL);

  request(queryURL, function(error,reponse,body) {

    var queryResponse = JSON.parse(body);
    var products = [];

    queryResponse.stores.forEach(function(store) {
      var prettyStore = {
        name: store.name,
        city: store.city,
        region: store.region,
        distance: store.distance,
        type: 'Best Buy'
      }
      store.products.forEach(function(product) {
        var prettyProduct = {
          name: product.name,
          upc: product.upc,
          price: product.salePrice,
          url: product.url,
          store: prettyStore
        }
        products.push(prettyProduct);
      });
    });

      // products.sort(function(a,b) {
      //   return a.distance - b.distance;
      // });

    callback(products);

  });

};

module.exports = getProducts;
