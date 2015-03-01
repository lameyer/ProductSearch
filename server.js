var request = require('sync-request');
var cheerio = require('cheerio');
var express = require('express');

var app = express();

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


app.get('/', function (req, res) {
  res.send(JSON.stringify(getWalmartProducts('dog toys', '95073')))
})

var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})

