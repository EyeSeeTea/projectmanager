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
			urlbase:"http://localhost:8080/dhis/",
			OrganisationUnit:"",
			Period:"",
			DataSet:""
			};

   return Vari; 
});

Dhis2Api.factory("userAuthorization", ['$resource','commonvariable',function($resource,commonvariable) {
	return $resource(commonvariable.url + "me/authorization/:menuoption",
		{
			menuoption:'@menuoption'
		},
		{ get: { method: "GET", transformResponse: function (response) {
			return {status: response};
		}
		}
		});

}]);

Dhis2Api.factory("Organisationunit",['$resource','commonvariable', function ($resource,commonvariable) {
	return $resource( commonvariable.url+"organisationUnits", 
   {
		fields:'name,id,level,parent',
		pageSize:'10',
		page:1
   }, 
  { get: { method: "GET"} });
}]);

Dhis2Api.factory("OrganisationunitLevel",['$resource','commonvariable', function ($resource,commonvariable) {
	return $resource( commonvariable.url+"organisationUnitLevels", 
   {
		fields:'name,id,level',
		pageSize:10
   }, 
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
   fields:'id,name,dataElements,periodType'},
  { get: { method: "GET"} });
}]);

Dhis2Api.factory("DataApprovalsState",['$resource','commonvariable', function ($resource,commonvariable) {
	return $resource( commonvariable.url+"dataApprovals", 
	{ds:'@id',
	pe:'@pe',
	ou:'@ou'},
  { get: { method: "GET"},
	post: { method: "POST"},
	remove: {method:'DELETE'}
  });
}]);

Dhis2Api.factory("AnaliticsDAppr",['$resource','commonvariable', function ($resource,commonvariable) {
	return $resource( commonvariable.url+"analytics.json?:dimension1&:dimension2&:dimension3", 
	{dimension1:'@dx',
	dimension2:'@pe',
	dimension3:'@ou',
	tableLayout:'true',
	rows:'dx',
	columns:'pe;ou'},
  { get: { method: "GET"} });
}]);

Dhis2Api.factory("DataSetsUID",['$resource','commonvariable', function ($resource,commonvariable) {
	return $resource( commonvariable.url+"dataSets.json?fields=id", 
	{},
  { get: { method: "GET"} });
}]);

Dhis2Api.factory("MetaDataExport",['$resource','commonvariable', function ($resource,commonvariable) {
	return $resource( commonvariable.url+"metadata.json", 
	{},
  { get: { method: "GET"} });
}]);

Dhis2Api.factory("DataSetForm",['$resource','commonvariable', function ($resource,commonvariable) {
	return $resource( commonvariable.urlbase+"dhis-web-reporting/generateDataSetReport.action", 
	{ds:'@id',
	 pe:'@pe',
	 ou:'@ou'},
  { get: { method: "GET", transformResponse: function (response) {
      return {codeHtml: response};
  		}
      }
	});
}]);

