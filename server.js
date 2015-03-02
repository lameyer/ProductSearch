var express = require('express');
var getWalmartProducts = require('./walmart');

var app = express();
app.set('port', (process.env.PORT || 5000));

app.get('/', function (request, response) {
  var search = request.query.search;
  var zipcode = request.query.zipcode;
  if (search && zipcode) {
    getWalmartProducts(search, zipcode, function(products) {
      response.send(JSON.stringify(products));
    });
  } else {
    response.send(JSON.stringify({error: 'no search or zipcode entered'}));
  };
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
});

