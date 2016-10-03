
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

appManagerMSF.controller('metadataimportController', ["$scope", "$q", "MetadataSyncService", "DemographicsService", "AnalyticsService", "MetadataImportService", function($scope, $q, MetadataSyncService, DemographicsService, AnalyticsService, MetadataImportService) {

	$scope.progressStatus = {};
	$scope.syncBarStatus = {};
	$scope.undefinedFile = false;

	var $file;//single file

	MetadataSyncService.getLocalMetadataVersion()
		.then(
			setLocalMetadataVersion,
			printSyncError
		);

	MetadataSyncService.isRemoteServerAvailable()
		.then(function(data){
			$scope.isRemoteAvailable = true;
			$scope.remoteStatus = data;
		},
		function(error){
			$scope.isRemoteAvailable = false;
			$scope.remoteStatus = error;
		});

	function setLocalMetadataVersion (version) {
		$scope.localMetadataVersion = version;
	}

	function printSyncError (message) {
		console.log(message);
	}

	$scope.metadataSync = function () {
		$scope.analyticsLog = [];
		$scope.syncBarStatus = {
			visible: true,
			active: true,
			type: 'info',
			value: 100
		};
		MetadataSyncService.executeMetadataSync()
			.then(
				function () {
					$scope.syncBarStatus.active = false;
					$scope.syncBarStatus.type = 'success';
					console.log("Metadata synchronization done");
					$scope.progressStatus = {
						visible: true,
						active: true,
						type: 'info',
						value: 100
					};
				},
				function error() {
					$scope.syncBarStatus.active = false;
					$scope.syncBarStatus.type = 'danger';
					console.log("Error in automatic metadata sync");
					throw "Metadata sync failed";
				},
				function (data) {
					console.log("Updated to " + data.currentVersion);
					$scope.localMetadataVersion = data.currentVersion;
				}
			)
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
					if (notification != undefined) $scope.analyticsLog.push(notification);
				}
			);
	};
		
	$scope.sendFiles = function(){

		varValidation();

		if (!$scope.undefinedFile){
			$scope.progressStatus = {
				visible: true,
				active: true,
				type: 'info',
				value: 100
			};

			$scope.analyticsLog = [];
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
						$scope.analyticsLog.push(notification);
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