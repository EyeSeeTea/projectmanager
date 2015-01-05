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