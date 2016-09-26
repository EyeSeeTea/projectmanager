
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

appManagerMSF.controller('metadataimportController', ["$scope", "MetadataSyncService", "DemographicsService", "AnalyticsService", "MetadataImportService", function($scope, MetadataSyncService, DemographicsService, AnalyticsService, MetadataImportService) {

	$scope.progressStatus = {};
	$scope.undefinedFile = false;

	var $file;//single file

	MetadataSyncService.getLocalMetadataVersion()
		.then(
			setLocalMetadataVersion,
			printSyncError
		)
		.then(MetadataSyncService.getRemoteMetadataVersion)
		.then(
			setRemoteMetadataVersion,
			printSyncError
		);

	function setLocalMetadataVersion (version) {
		$scope.localMetadataVersion = version;
	}

	function setRemoteMetadataVersion (version) {
		$scope.remoteMetadataVersion = version;
	}
	
	function printSyncError (message) {
		console.log(message);
	}
		
	$scope.sendFiles = function(){

		varValidation();

		if (!$scope.undefinedFile){
			$scope.progressStatus = {
				visible: true,
				active: true,
				type: 'info',
				value: 100
			};

			$scope.notifications = [];
			MetadataImportService.importMetadataFile($file)
				.then(printImportSummary)
				.then(DemographicsService.updateDemographicData)
				.then(AnalyticsService.refreshAnalytics)
				.then(
					function (success) {
						$scope.progressStatus.type = 'success';
						$scope.progressStatus.active = false;
					},
					function (error) {
						$scope.progressStatus.type = 'danger';
						$scope.progressStatus.active = false;
						console.log(error);
					},
					function (notification) {
						$scope.notifications.push(notification);
					}
				);
		}
	};

	function varValidation () {
		$scope.undefinedFile = ($file == undefined);
	}

	function printImportSummary (data) {
		angular.forEach(data.stats, function (value, property) {
			$('#importCount').append(value + " " + property + "<br>");
		});
		$scope.summaryDisplayed = true;
	}

	$scope.onFileSelect = function ($files) {
		for (var i = 0; i < $files.length; i++) {
			$file = $files[i];//set a single file
			$scope.undefinedFile = false;
		}
	};


}]);