var app = angular.module('ProductSearch',[]);
app.controller('SearchController', function($http) {
  var controller = this;
  controller.query = 'Call of Duty';
  controller.zipcode = '95073';
  controller.isRunning = false;

  controller.submit = function() {
    controller.isRunning= true;

    $http.get('/api/search.json', {
      params: {
        search: controller.query,
        zipcode: controller.zipcode
      }

    }).success(function(data){
      controller.searchResults = data;
      controller.isRunning = false;

    }).error(function(data){
      alert("Something went wrong!");
      controller.isRunning = false;
    });
  }
});
