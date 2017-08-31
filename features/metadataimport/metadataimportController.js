
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

var metadataImport = ["$scope", "$q", "commonvariable", "MetadataSyncService", "DemographicsService", "AnalyticsService", "MetadataImportService", function($scope, $q, commonvariable, MetadataSyncService, DemographicsService, AnalyticsService, MetadataImportService) {

	$scope.info = {
		url: commonvariable.urlbase
	};

	$scope.progressStatus = {};
	$scope.syncStatus = {};
	$scope.undefinedFile = false;

	var $file;//single file

	// Initialize metadata sync information
	function initMetadataSyncInfo() {
		return MetadataSyncService.getLocalMetadataVersion()
			.then(localVersion => setLocalMetadataVersion(localVersion))
			.then(() => MetadataSyncService.isRemoteServerAvailable())
			.then(() => MetadataSyncService.getRemoteMetadataVersion())
			.then(remoteVersion => setRemoteMetadataVersion(remoteVersion))
			.then(() => MetadataSyncService.getVersionDifference())
			.then(versionDiff => setVersionDiff(versionDiff))
			.catch((message) => {
				$scope.metadataSyncError = message;
				$q.reject(message);
			});
	}

	function setLocalMetadataVersion (version) {
		$scope.localMetadataVersion = version;
	}

	function setRemoteMetadataVersion (version) {
		$scope.remoteMetadataVersion = version;
	}

	function setVersionDiff (versionDiff) {
		$scope.versionDiffNumber = versionDiff.length;
	}

	$scope.metadataSync = function () {
		$scope.syncStatus = {
			visible: true,
			active: true,
			type: 'info',
			value: 0
		};
		MetadataSyncService.executeMetadataSyncDiff()
			.then(
				function (success){
					$scope.syncStatus.active = false;
					$scope.syncStatus.type = 'success';
					console.log("Metadata synchronization done");
					return initMetadataSyncInfo();
				},
				function (error){
					$scope.syncStatus.active = false;
					$scope.syncStatus.type = 'danger';
					console.log("Error in automatic metadata sync");
					throw "Metadata sync failed";
				},
				function (status) {
					setLocalMetadataVersion(status.currentVersion);
					$scope.syncStatus.value = (status.progress.updated / status.progress.total) * 100;
				}
			);
	};
	
	$scope.metadataSyncIncremental = function () {
		$scope.analyticsLog = [];
		$scope.syncStatus = {
			visible: true,
			active: true,
			type: 'info',
			value: 100
		};
		MetadataSyncService.executeMetadataSync()
			.then(
				function () {
					$scope.syncStatus.active = false;
					$scope.syncStatus.type = 'success';
					console.log("Metadata synchronization done");
					$scope.progressStatus = {
						visible: true,
						active: true,
						type: 'info',
						value: 100
					};
				},
				function error() {
					$scope.syncStatus.active = false;
					$scope.syncStatus.type = 'danger';
					console.log("Error in automatic metadata sync");
					throw "Metadata sync failed";
				},
				function (data) {
					console.log("Updated to " + data.currentVersion);
					$scope.localMetadataVersion = data.currentVersion;
				}
			)
			.then(() => DemographicsService.updateDemographicData())
			.then(() => AnalyticsService.refreshAnalytics())
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
				.then(data => printImportSummary(data))
				.then(() => DemographicsService.updateDemographicData())
				.then(() => AnalyticsService.refreshAllAnalytics())
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

	initMetadataSyncInfo();

}];

module.exports = metadataImport;