var appManagerMSF = angular.module("appManagerMSF", ['ngRoute','Dhis2Api']);

appManagerMSF.config(function($routeProvider) {
 
	  $routeProvider.when('/dataapproval', {
		    templateUrl: "modules/dataapproval/dataapprovalView.html",
		    controller: "dataapprovalController"
		  });
	  $routeProvider.when('/metadataimport', {
		  	templateUrl: "modules/metadataimport/metadataimportView.html",
		  	controller: "metadataimportController"
		  });
	  $routeProvider.when('/metadataexport', {
		  	templateUrl: "modules/metadataexport/metadataexportView.html",
		  		 controller: "metadataexportController"
		  });
	
	  $routeProvider.otherwise({
	        redirectTo: '/'
	  });   

	});