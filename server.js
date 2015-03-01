var request = require('sync-request');
var cheerio = require('cheerio');
var spawn = require('child_process').spawn;

var stores = JSON.parse(request('GET', 'http://www.walmart.com/search/store-availability?location=95073').getBody().toString());

var storeIds = stores.stores.map(function(x) {
  return x.id;
}).join(',');

var search = process.argv.slice(2).join('+');
var response = request('GET', 'http://www.walmart.com/search/?query=' + search + '&stores=' + storeIds+ '&redirect=false');

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

console.log(products);

// spawn('open', ['http://www.walmart.com/search/?query=' + search + '&stores=' + storeIds+ '&redirect=false']);
spawn('open', [products[0].url]);



