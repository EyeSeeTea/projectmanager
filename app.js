
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
require('./node_modules/angular/angular.min');
require('./node_modules/angular-route/angular-route.min');
require('./node_modules/angular-resource/angular-resource.min');
require('./node_modules/angular-translate/dist/angular-translate.min');
require('./node_modules/angular-translate-loader-static-files/angular-translate-loader-static-files.min');
require('./node_modules/angular-sanitize/angular-sanitize.min');
require('./node_modules/ng-file-upload/dist/angular-file-upload.min');
require('./node_modules/ng-file-upload/dist/angular-file-upload-shim.min');
require('./node_modules/angular-css/angular-css.min');

require('./node_modules/bootstrap/dist/js/bootstrap.min');
require('./node_modules/bootstrap/dist/css/bootstrap.min.css');
require('./node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls');

require('./include/angular.treeview/angular.treeview');
require('./include/angular.treeview/css/angular.treeview.css');

require('./core/dhis2Api');
require('./directives/directives.module');
require('./features/features.module');
require('./app.css');

var appManagerMSF = angular.module("appManagerMSF", ['ngRoute','Dhis2Api','Directives', 'Features', 'pascalprecht.translate','ui.bootstrap','d2Menu', 'angularFileUpload','angularTreeview','angularCSS']);

appManagerMSF.config(['$routeProvider', function($routeProvider) {
 
	$routeProvider.when('/dataapproval', {
		templateUrl: "features/dataapproval/dataapprovalView.html",
		controller: "dataapprovalController"
	});
	$routeProvider.when('/metadataimport', {
		template: require('./features/metadataimport/metadataimportView.html'),
		controller: 'metadataimportController',
		css: require('./features/metadataimport/metadataimportCss.css')
	});
	$routeProvider.when('/metadataexport', {
		template: require('./features/metadataexport/metadataexportView.html'),
		controller: 'metadataexportController'
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
		template: require('./features/trackerdataimport/trackerDataImportView.html'),
		controller: 'trackerDataImportController',
		controllerAs: 'ctrl',
		css: require('./features/trackerdataimport/trackerDataImportCss.css')
	});
	$routeProvider.when('/trackerdataexport', {
		template: require('./features/trackerdataexport/trackerDataExportView.html'),
		controller: 'trackerDataExportController as ctrl'
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

}]);

appManagerMSF.config(['$translateProvider', 'urlApi', function ($translateProvider, urlApi) {
  
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
}]);

appManagerMSF.config(['uibDatepickerConfig', function (uibDatepickerConfig) {
	uibDatepickerConfig.startingDay = 1;
}]);
