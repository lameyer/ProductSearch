var app = angular.module('ProductSearch',[]);
app.controller('SearchController', function($http) {
  var controller = this;
  controller.zipcode = '95073';
  controller.submit = function() {
    $http.get('/api/search.json', {
      params: {
        search: controller.query,
        zipcode: controller.zipcode
      }
    }).success(function(data){
      controller.searchResults = data;
    }).error(function(data){
      alert("Something went wrong!");
    });
  }
});
