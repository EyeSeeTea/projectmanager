var Dhis2Api = angular.module("Dhis2Api", ['ngResource']);

//Create all common variables of the apps 
Dhis2Api.factory("commonvariable", function () {
   
	var Api={
			url:"http://localhost:8080/dhis/api/"
			
	};
    
     return Api; 
});
Dhis2Api.factory("GetOrganisationunit",['$resource','commonvariable', function ($resource,commonvariable) {
	console.log("Aqui >>>"+commonvariable.url);
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



