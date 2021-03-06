var express = require('express');
var getProducts = require('./products');
var compression = require('compression');

var app = express();
app.set('port', (process.env.PORT || 5000));
app.use(compression());
app.use(express.static(__dirname + '/public'));

app.get('/api/search.json', function (request, response) {
  var search = request.query.search;
  var zipcode = request.query.zipcode;
  var radius = request.query.radius || 15;
  if (search && zipcode) {
    getProducts(search, zipcode, radius, function(products) {
      response.send(JSON.stringify(products));
    });
  } else {
    response.send(JSON.stringify({error: 'no search or zipcode entered'}));
  };
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
});

