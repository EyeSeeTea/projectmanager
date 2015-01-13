var appManagerMSF = angular.module("appManagerMSF", ['ngRoute','Dhis2Api','pascalprecht.translate','ui.bootstrap','d2Menu']);

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
		  
	  $routeProvider.when('/analytics', {
		    templateUrl: "modules/analytics/analyticsView.html",
		    controller: "analyticsController"
		  });
	  $routeProvider.when('/dataimport', {
		  	templateUrl: "modules/dataimport/dataimportView.html",
		  	controller: "dataimportController"
		  });
	  $routeProvider.when('/dataexport', {
		  	templateUrl: "modules/dataexport/dataexportView.html",
		  		 controller: "dataexportController"
		  });		  
	
	  $routeProvider.otherwise({
	        redirectTo: '/'
	  });   

	});

appManagerMSF.config(function ($translateProvider) {
  
	  $translateProvider.useStaticFilesLoader({
          prefix: 'languages/',
          suffix: '.json'
      });
	  
	  $translateProvider.registerAvailableLanguageKeys(
			    ['es', 'en'],
			    {
			        'en*': 'en',
			        'es*': 'es',
			        '*': 'en' // must be last!
			    }
			);
	  
	  $translateProvider.fallbackLanguage(['en']);
	  $translateProvider.determinePreferredLanguage();
	  
});