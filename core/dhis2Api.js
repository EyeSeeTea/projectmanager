
/* 
   Copyright (c) 2015.
 
   This file is part of Project Manager.
 
   Project Manager is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.
 
   Project Manager is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.
 
   You should have received a copy of the GNU General Public License
   along with Project Manager.  If not, see <http://www.gnu.org/licenses/>. */
	   
var Dhis2Api = angular.module("Dhis2Api", ['ngResource', 'door3.css']);

var urlBase = $.parseJSON( $.ajax({
	type: "GET",
	dataType: "json",
	url: 'manifest.webapp',
	async: false
}).responseText).activities.dhis.href + '/';

var urlApi = urlBase + '/api/';

//Auxiliary variable to parse the url
var urlAuxLink = document.createElement('a');
urlAuxLink.href = urlBase;

//Delete initial and final slash
var auxBaseUrl = urlAuxLink.pathname;
if (auxBaseUrl.startsWith("/")) auxBaseUrl = auxBaseUrl.substring(1);
if (auxBaseUrl.endsWith("/")) auxBaseUrl = auxBaseUrl.substring(0, auxBaseUrl.length - 1);

//Dhis related variables
window.dhis2 = window.dhis2 || {};
dhis2.settings = dhis2.settings || {};
dhis2.settings.baseUrl = auxBaseUrl;

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

Dhis2Api.factory("UsersByUserRole",['$resource','commonvariable', function ($resource,commonvariable) {
return $resource( commonvariable.url+"userRoles/:idrole", 
{
	idrole:'idrole',
	fields: 'id, name, users'
},
{ get: { method: "GET"} });
}]);




Dhis2Api.factory("User",['$resource','commonvariable', function ($resource,commonvariable) {
	return $resource( commonvariable.url+"users/:iduser", 
	{
		idrole:'iduser',
		fields: ':all,userCredentials[name,code,created,userRoles]'
	},
	{ get: { method: "GET"},
	  put: {method: "PUT"}});
}]);

Dhis2Api.factory("FilterResource",  ['$resource', 'commonvariable', function ($resource, commonvariable) {
	
	return $resource(commonvariable.url + ":resource",
			{
			resource:'@resource',
			filter:'@filter'
			},
			{get: {method: "GET"}});
		
}]);
Dhis2Api.factory("DataElementGroupsUID",['$resource','commonvariable', function ($resource,commonvariable) {
	return $resource( commonvariable.url+"dataElementGroups.json?fields=id&paging=false", 
	{},
  { get: { method: "GET"} });
}]);
