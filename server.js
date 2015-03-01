var request = require('sync-request');
var cheerio = require('cheerio');
var express = require('express');

var app = express();
app.set('port', (process.env.PORT || 5000));

var getWalmartProducts = function(query, zipcode) {

  var stores = JSON.parse(request('GET', 'http://www.walmart.com/search/store-availability?location=' + zipcode).getBody().toString());

  var storeIds = stores.stores.map(function(x) {
    return x.id;
  }).join(',');

  var response = request('GET', 'http://www.walmart.com/search/?query=' + query + '&stores=' + storeIds+ '&redirect=false');

  $ = cheerio.load(response.getBody().toString());

  var products = $('.js-tile').map(function() {
    var product = {
      title: $(this).find('.js-product-title').text(),
      price: $(this).find('.price').text(),
      url: 'http://www.walmart.com' + $(this).find('.js-product-title').attr('href'),
      inStore: $(this).find('.fulfillment-container').text().search('store pickup') !== -1
    }
    return product;
  }).get().filter(function(product) {
    return product.inStore;
  });

  return products;

};


app.get('/', function (request, response) {
  var search = request.query.search;
  var zipcode = request.query.zipcode;
  if (search && zipcode) {
    response.send(JSON.stringify(getWalmartProducts(search, zipcode)));
  } else {
    response.send(JSON.stringify({error: 'no search or zipcode entered'}));
  };
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
});

