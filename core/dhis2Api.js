/*
 *	Architeture 
 * 	Helder Yesid Castrillón
 * 	Hisp Colombia 2014
 * 
 * Core Module for using WebApi of dhis2
 * It is the persistence in the FrontEnd
 * 
 * */
var Dhis2Api = angular.module("Dhis2Api", ['ngResource']);

//Create all common variables of the apps 
Dhis2Api.factory("commonvariable", function () {
     
	var Api={
			url:"http://localhost:8080/dhis/api/"
			};
			
   return Api; 
});


Dhis2Api.factory("GetOrganisationunit",['$resource','commonvariable', function ($resource,commonvariable) {
	return $resource( commonvariable.url+"organisationUnits", 
   {
		fields:'name,id,level,parent'
   }, 
  { ByName: { method: "GET"} });
}]);

Dhis2Api.factory("GetOptionSet",['$resource','commonvariable', function ($resource,commonvariable) {
	return $resource( commonvariable.url+"optionSets", 
   {}, 
  { get: { method: "GET"} });
}]);

Dhis2Api.factory("GetDatasetDAppr",['$resource','commonvariable', function ($resource,commonvariable) {
	return $resource( commonvariable.url+"dataSets", 
   {filter:'approveData:eq:true'}, 
  { get: { method: "GET"} });
}]);

