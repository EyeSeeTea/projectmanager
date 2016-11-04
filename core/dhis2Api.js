
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
	   
var Dhis2Api = angular.module("Dhis2Api", ['ngResource']);

// Specify the target api version of DHIS2
var apiVersion = 24;

var urlBase = window.location.href.split('api/apps/')[0];
var urlApi = urlBase + 'api/' + apiVersion + "/";

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

var isOnline = urlBase.indexOf("//hmisocba.msf.es") >= 0;

// Get and save DHIS version
var version = "";
$.ajax({ url: urlApi + "system/info", dataType: "json", async: "false", method: "GET" }).done( function (info) {
	version = info.version;
});

//Create all common variables of the apps 
Dhis2Api.factory("commonvariable", function () {
	var Vari={
			url: urlApi,
			urlbase: urlBase,
			isOnline: isOnline,
			version: version,
			apiVersion: apiVersion,
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
            fields: 'name,id,level,parent,children',
            paging: false
        },
        { get: { method: "GET"} }
    );
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
	var datamartUrl = commonvariable.url;
	if (commonvariable.version > "2.18"){
		datamartUrl = datamartUrl + "system/tasks/ANALYTICSTABLE_UPDATE";
	} else {
		datamartUrl = datamartUrl + "system/tasks/DATAMART";
	}
	return $resource( datamartUrl,
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

Dhis2Api.factory("AnalyticsEngine",['$resource','commonvariable', function ($resource,commonvariable) {
	return $resource( commonvariable.url+"analytics.json",
		{});
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
	{},
        {
            get: {
                method: "GET",
                params: {
                    fields: ':all,userCredentials[id,name,username,created,userRoles]',
                    paging: false
                }
            },
	        put: {
                method: "PUT",
                iduser: '@id'
            }
        }
    );
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

Dhis2Api.factory("DataStore",['$resource','commonvariable', function ($resource,commonvariable) {
	return $resource( commonvariable.url+"dataStore/:namespace/:key",
		{
			namespace:'namespace',
			key:'key'
		},
		{ put: { method: "PUT"} });
}]);

Dhis2Api.factory("SqlView",['$resource', 'commonvariable', function($resource, commonvariable) {
	return $resource( commonvariable.url + "sqlViews/:viewId",
		{viewId:'@id'}, {post: {method: "POST"}});
}]);

Dhis2Api.factory("SqlViewData",['$resource', 'commonvariable', function($resource, commonvariable) {
	return $resource( commonvariable.url + "sqlViews/:viewId/data.json",
		{viewId:'viewId'});
}]);

Dhis2Api.factory("OrganisationUnitGroupSet",['$resource','commonvariable', function ($resource,commonvariable) {
	return $resource( commonvariable.url+"organisationUnitGroupSets/:groupsetid",
		{groupsetid: '@groupsetid'});
}]);

Dhis2Api.factory("OrganisationUnitGroup",['$resource','commonvariable', function ($resource,commonvariable) {
	return $resource( commonvariable.url+"organisationUnitGroups",
		{paging: false}
	);
}]);

Dhis2Api.factory("MetadataVersion", ['$resource', 'commonvariable', function ($resource, commonvariable) {
	return $resource( commonvariable.urlbase + "api/metadata/version");
}]);

Dhis2Api.factory("MetadataSync", ['$resource', 'commonvariable', function ($resource, commonvariable) {
	return $resource( commonvariable.urlbase + "api/metadata/sync");
}]);

Dhis2Api.factory("RemoteAvailability", ['$resource', 'commonvariable', function ($resource, commonvariable) {
	return $resource( commonvariable.url + "synchronization/availability");
}]);

Dhis2Api.factory("RemoteInstanceUrl", ['$resource', 'commonvariable', function ($resource, commonvariable) {
	return $resource( commonvariable.url + "systemSettings/keyRemoteInstanceUrl", {}, {
		get: {
			method: 'GET',
			transformResponse: function (response) {
				return {html: response};
			}
		}
	});
}]);

Dhis2Api.factory("Events",['$resource', 'commonvariable', function ($resource, commonvariable) {
	return $resource( commonvariable.url + "events", {}, {
		get: {
			method: 'GET',
			params: {skipPaging: true}
		}
	});
}]);

Dhis2Api.factory("TrackedEntityInstances",['$resource', 'commonvariable', function ($resource, commonvariable) {
	return $resource( commonvariable.url + "trackedEntityInstances/:uid" );
}]);

Dhis2Api.factory("Enrollments",['$resource', 'commonvariable', function ($resource, commonvariable) {
	return $resource( commonvariable.url + "enrollments/:uid" );
}]);
