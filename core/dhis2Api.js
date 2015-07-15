/*
 *	Architeture 
 * 	Helder Yesid Castrillón
 * 	Hisp Colombia 2014
 * 
 * Core Module for using WebApi of dhis2
 * It is the persistence in the FrontEnd
 * 
 * */
var Dhis2Api = angular.module("Dhis2Api", ['ngResource', 'door3.css']);

var urlApi = "/dhis/api/";
var urlBase = "/dhis/";

//Create all common variables of the apps 
Dhis2Api.factory("commonvariable", function () {
	var Vari={
			url: urlApi,
			urlbase: urlBase,
			OrganisationUnit:"",
			OrganisationUnitList:[],
			Period:"",
			DataSet:""
			};

   return Vari; 
});

Dhis2Api.constant("urlApi", urlApi);

Dhis2Api.factory("userAuthorization", ['$resource','commonvariable',function($resource,commonvariable) {
	return $resource(commonvariable.url + "me/authorization/:menuoption",
		{
			menuoption:'@menuoption'
		},
		{ get: { method: "GET", transformResponse: function (response) {return {status: response};}	}});

}]);

Dhis2Api.factory("meUser", ['$resource','commonvariable',function($resource,commonvariable) {
	return $resource(commonvariable.url + "me",
		{},
		{ get: { method: "GET"} });

}]);

Dhis2Api.factory("TreeOrganisationunit",['$resource','commonvariable', function ($resource,commonvariable) {
	return $resource(commonvariable.url+"organisationUnits/:uid", 
   {
	uid:'@uid',
    fields:'name,id,children[name,id]'
   }, 
  { get: { method: "GET"} });
}]);

Dhis2Api.factory("Organisationunit",['$resource','commonvariable', function ($resource,commonvariable) {
	return $resource( commonvariable.url+"organisationUnits", 
   {
		fields:'name,id,level,parent',
		pageSize:'10',
		page:1
   }, 
  { get: { method: "GET"},
	getOU: {method: "GET",
			url: commonvariable.url+"organisationUnits/:uid",
			params: {uid: '@uid'} } });
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

Dhis2Api.factory("DataMart",['$resource','commonvariable', function ($resource,commonvariable) {
	return $resource( commonvariable.url+"system/tasks/DATAMART", 
   {lastId:'@lastId'}, 
  { get: { method: "GET"} });
}]);

Dhis2Api.factory("DatasetDAppr",['$resource','commonvariable', function ($resource,commonvariable) {
	return $resource( commonvariable.url+"dataSets", 
   {filter:'approveData:eq:true', 
   fields:'id,name,dataElements,periodType'},
  { get: { method: "GET"} });
}]);

Dhis2Api.factory("DataApprovalsState",['$resource','commonvariable', function ($resource,commonvariable) {
	return $resource( commonvariable.url+"dataApprovals", 
	{ds:'@ds',
	pe:'@pe',
	ou:'@ou'},
  { get: { method: "GET"},
	post: { method: "POST"},
	remove: {method:'DELETE'}
  });
}]);

Dhis2Api.factory("DataApprovalsAccept",['$resource','commonvariable', function ($resource,commonvariable) {
	return $resource( commonvariable.url+"dataAcceptances", 
	{ds:'@ds',
	pe:'@pe',
	ou:'@ou'},
  { post: { method: "POST"},
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
	return $resource( commonvariable.url+"dataSets.json?fields=id&paging=false", 
	{},
  { get: { method: "GET"} });
}]);

Dhis2Api.factory("DataExport",['$resource','commonvariable', function ($resource,commonvariable) {
	return $resource( commonvariable.url+"dataValueSets.json", 
	{startDate:'@startDate',
     endDate:'@endDate',
     orgUnit:'@orgUnit',
	 children:'@children'},
  { get: { method: "GET"} });
}]);

Dhis2Api.factory("MetaDataExport",['$resource','commonvariable', function ($resource,commonvariable) {
	return $resource( commonvariable.url+"metadata.json", 
	{},
  { get: { method: "GET"} });
}]);

Dhis2Api.factory("MetaDataExportZip",['$resource','commonvariable', function ($resource,commonvariable) {
	return $resource( commonvariable.url+"metadata.json.zip", 
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

Dhis2Api.factory("DataSetEntryForm",['$resource','commonvariable', function ($resource,commonvariable) {
	return $resource( commonvariable.urlbase+"dhis-web-dataentry/loadForm.action", 
		{ dataSetId:'@dataSetId' },
		{ get: { method: "GET", transformResponse: function (response) {
			return {codeHtml: response};}
		}
	});
}]);

Dhis2Api.factory("DataElementGroupsUID",['$resource','commonvariable', function ($resource,commonvariable) {
	return $resource( commonvariable.url+"dataElementGroups.json?fields=id&paging=false", 
	{},
  { get: { method: "GET"} });
}]);
