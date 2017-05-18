
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
require('./core/dhis2Api');
require('./directives/directives.module');
require('./directives/header/headerController');
require('./features/features.module');
require('./features/analytics/analyticsController');
require('./features/availabledata/availabledataController');
require('./features/dataexport/dataexportController');
require('./features/dataimport/dataimportController');
require('./features/resetpasswd/resetpasswdController');

require('./app.css');

var appManagerMSF = angular.module("appManagerMSF", ['ngRoute','Dhis2Api','Directives', 'Features', 'pascalprecht.translate','ui.bootstrap','d2Menu', 'angularFileUpload','angularTreeview','angularCSS']);

appManagerMSF.config(function($routeProvider) {
 
	$routeProvider.when('/dataapproval', {
		templateUrl: "features/dataapproval/dataapprovalView.html",
		controller: "dataapprovalController"
	});
	$routeProvider.when('/metadataimport', {
		templateUrl: "features/metadataimport/metadataimportView.html",
		controller: "metadataimportController",
		css: "features/metadataimport/metadataimportCss.css"
	});
	$routeProvider.when('/metadataexport', {
		templateUrl: "features/metadataexport/metadataexportView.html",
		controller: "metadataexportController"
	});
	$routeProvider.when('/analytics', {
		template: require('./features/analytics/analyticsView.html'),
		controller: 'analyticsController'
	});
	$routeProvider.when('/dataimport', {
		template: require('./features/dataimport/dataimportView.html'),
		controller: 'dataimportController'
	});
	$routeProvider.when('/dataexport', {
		template: require('./features/dataexport/dataexportView.html'),
		controller: 'dataexportController',
		css: require('./features/dataexport/dataexportCss.css')
	});
	$routeProvider.when('/trackerdataimport', {
		templateUrl: "features/trackerdataimport/trackerDataImportView.html",
		controller: "trackerDataImportController",
		css: "features/trackerdataimport/trackerDataImportCss.css"
	});
	$routeProvider.when('/trackerdataexport', {
		templateUrl: "features/trackerdataexport/trackerDataExportView.html",
		controller: "trackerDataExportController"
	});
	$routeProvider.when('/resetpasswd', {
		template: require('./features/resetpasswd/resetpasswdView.html'),
		controller: 'resetpasswdController',
		css: require('./features/resetpasswd/resetpasswdCss.css')
	});
	$routeProvider.when('/availabledata', {
		template: require('./features/availabledata/availabledataView.html'),
		controller: 'availabledataController',
		css: require('./features/availabledata/availabledataCss.css')
	});
	$routeProvider.when('/hmisadoption', {
		templateUrl: "features/hmisadoption/hmisadoptionView.html",
		controller: "hmisadoptionController",
		css: "features/hmisadoption/hmisadoptionCss.css"
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

	  jQuery.ajax({ url: urlApi + 'userSettings/keyUiLocale/', contentType: 'text/plain', method: 'GET', dataType: 'text', async: false}).done(function (uiLocale) {
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

appManagerMSF.config(function (uibDatepickerConfig) {
	uibDatepickerConfig.startingDay = 1;
});
