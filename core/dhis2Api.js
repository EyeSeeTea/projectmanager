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
     
	var Vari={
			url:"http://localhost:8080/dhis/api/",
			OrganisationUnit:"",
			Period:"2014",
			DataSet:""
			};
			
   return Vari; 
});


Dhis2Api.factory("Organisationunit",['$resource','commonvariable', function ($resource,commonvariable) {
	return $resource( commonvariable.url+"organisationUnits", 
   {
		fields:'name,id,level,parent',
		pageSize:'10',
		page:1
   }, 
  { get: { method: "GET"} });
}]);

Dhis2Api.factory("OptionSet",['$resource','commonvariable', function ($resource,commonvariable) {
	return $resource( commonvariable.url+"optionSets", 
   {}, 
  { get: { method: "GET"} });
}]);

Dhis2Api.factory("Analytics",['$resource','commonvariable', function ($resource,commonvariable) {
	return $resource( commonvariable.url+"resourceTables/analytics", 
   {}, 
  { post: { method: "POST"} });
}]);

Dhis2Api.factory("DatasetDAppr",['$resource','commonvariable', function ($resource,commonvariable) {
	return $resource( commonvariable.url+"dataSets", 
   {filter:'approveData:eq:true', 
   fields:'id,name,dataElements'},
  { get: { method: "GET"} });
}]);

Dhis2Api.factory("DataApprovalsState",['$resource','commonvariable', function ($resource,commonvariable) {
	return $resource( commonvariable.url+"dataApprovals", 
	{ds:'@id',
	pe:'@pe',
	ou:'@ou'},
  { get: { method: "GET"} });
}]);

Dhis2Api.factory("AnaliticsDAppr",['$resource','commonvariable', function ($resource,commonvariable) {
	return $resource( commonvariable.url+"analytics.html", 
	{dimension:'@dx',
	dimension:'@pe',
	dimension:'@ou',
	tableLayout:'true',
	rows:'dx',
	columns:'pe;ou'},
  { get: { method: "GET"} });
}]);

