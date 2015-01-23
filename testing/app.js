var Dhis2Api = angular.module("Dhis2Api", ['ngResource', 'ui.bootstrap']);

//Create all common variables of the apps 
Dhis2Api.factory("commonvariable", function () {
   
	var Api={
			url:"http://localhost:8080/dhis/api/"
			
	};
    
     return Api; 
});
Dhis2Api.factory("GetOrganisationunit",['$resource','commonvariable', function ($resource,commonvariable) {
	return $resource(commonvariable.url+"organisationUnits", 
   {}, 
  { get: { method: "GET"} });
}]);

Dhis2Api.factory("findOrganisationunitbyName",['$resource','commonvariable', function ($resource,commonvariable) {
	return $resource(commonvariable.url+"organisationUnits", 
   {}, 
  { get: { method: "GET"} });
}]);

Dhis2Api.controller("d2DrowdownOrganisationUnitController",function ($scope,GetOrganisationunit) {
$scope.ListOrganisationunit = GetOrganisationunit.get();
$scope.titulo="test";
$scope.selectOu = function(ouselected){
	$scope.ouname=ouselected.name;
	$scope.ouid=ouselected.id;
	
}
});

Dhis2Api.controller('TypeaheadCtrl', ['$scope','$http','commonvariable','findOrganisationunitbyName',function($scope,$http,commonvariable, findOrganisationunitbyName) {

		$scope.today = function() {
		    $scope.dt = new Date();
		  };
		  $scope.today();
	
	/*$scope.findOrganisationunit1 = function(val) {
			  return findOrganisationunitbyName.get().then(function(response){
	      return response.organisationUnits;
	    });
	  };
	  */
	  // 
	  $scope.findOrganisationunit = function(val) {
			  return $http.get(commonvariable.url+'organisationUnits', {
	      params: {
	        filter:"name:like:"+val,
	        fields:"name,id,level,parent"
	      }
	    }).then(function(response){
	      return response.data.organisationUnits;
	    });
	  };

}]);

Dhis2Api.controller('ModalDemoCtrl', function ($scope, $modal, $log) {

	  $scope.items = ['item1', 'item2', 'item3'];

	  $scope.open = function (size) {

	    var modalInstance = $modal.open({
	      templateUrl: 'myModalContent.html',
	      controller: 'ModalInstanceCtrl',
	      size: size,
	      resolve: {
	        items: function () {
	          return $scope.items;
	        }
	      }
	    });

	    modalInstance.result.then(function (selectedItem) {
	      $scope.selected = selectedItem;
	    }, function () {
	      $log.info('Modal dismissed at: ' + new Date());
	    });
	  };
	});

	// Please note that $modalInstance represents a modal window (instance) dependency.
	// It is not the same as the $modal service used above.

Dhis2Api.controller('ModalInstanceCtrl', function ($scope, $modalInstance, items) {

	  $scope.items = items;
	  $scope.selected = {
	    item: $scope.items[0]
	  };

	  $scope.ok = function () {
	    $modalInstance.close($scope.selected.item);
	  };

	  $scope.cancel = function () {
	    $modalInstance.dismiss('cancel');
	  };
	});