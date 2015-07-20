var appManagerMSF = angular.module("appManagerMSF", ['ngRoute','Dhis2Api','pascalprecht.translate','ui.bootstrap','d2Menu', 'angularFileUpload','angularTreeview','door3.css']);

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
	  
	  $routeProvider.when('/resetpasswd', {
		  	templateUrl: "modules/resetpasswd/resetpasswdView.html",
		  		 controller: "resetpasswdController"
		  });
	  
	  $routeProvider.when('/availabledata', {
		  	templateUrl: "modules/availabledata/availabledataView.html",
		  		 controller: "availabledataController",
		  		 css: "modules/availabledata/availabledataCss.css"
		  });
	
	  $routeProvider.otherwise({
	        redirectTo: '/'
	  });   

	});

appManagerMSF.config(function ($translateProvider, urlApi) {
  
	  $translateProvider.useStaticFilesLoader({
          prefix: 'languages/',
          suffix: '.json'
      });
	  
	  $translateProvider.registerAvailableLanguageKeys(
			    ['es', 'fr', 'en'],
			    {
			        'en*': 'en',
			        'es*': 'es',
					'fr*': 'fr',
			        '*': 'en' // must be last!
			    }
			);
	  
	  $translateProvider.fallbackLanguage(['en']);

	  jQuery.ajax({ url: urlApi + 'userSettings/keyUiLocale/', contentType: 'text/plain', method: 'GET', dataType: 'text', async: false}).success(function (uiLocale) {
		  if (uiLocale == ''){
			  $translateProvider.determinePreferredLanguage();
		  }
		  else{
			  $translateProvider.use(uiLocale);
		  }
      }).fail(function () {
    	  $translateProvider.determinePreferredLanguage();
	  });
	  
});