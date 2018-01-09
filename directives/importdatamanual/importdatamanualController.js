
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

export const importdatamanualDirective = [function () {
	return {
		restrict: 'E',
		controller: importdatamanualController,
		template: require('./importdatamanualView.html'),
		scope: {}
	}
}];


var importdatamanualController = ["$scope", '$interval', '$upload', '$filter', "commonvariable", "Analytics", "DataMart", "DataStoreService", "ServerPushDatesDataStoreService", "SystemService", "UserService", "DataImportService", "AnalyticsService", function ($scope, $interval, $upload, $filter, commonvariable, Analytics, DataMart, DataStoreService, ServerPushDatesDataStoreService, SystemService, UserService, DataImportService, AnalyticsService) {

	$scope.dataImportStatus = {
		visible: false,
		type: "info",
		value: 100,
		active: true
	};
		
	$scope.undefinedFile = false;
	var projectVersion = "";
	//var serverVersion ="";
	var $file;//single file 
	$scope.errorVisible = false;

	$scope.showImportDialog = function () {

		varValidation();

		if (!$scope.undefinedFile) {
			$("#importConfirmation").modal();
		}
	};

	$scope.sendFiles = function () {
		$scope.analyticsLog = [];
		$scope.previewDataImport = false;
		$("#importConfirmation").modal("hide");
		$scope.errorVersiones ="";
		$scope.dataImportStatus.visible = true;
		$scope.importFailed = false;

		var compress = getExtension($file.name) == "zip";

		// Only manage compressed files
		if (!compress) return;

		//var zip = new JSZip(e.target.result);
		SystemService.getServerVersion()
			.then(
			serverVersion => {
				return JSZip.loadAsync($file)

					.then(function (zip) {
						var settingsEntry = undefined;
						zip.forEach(function (relativePath, zipEntry) {

							if (zipEntry.name.indexOf('settings.txt') > -1) {
								settingsEntry = zipEntry;
							}
						})

						if (settingsEntry) {
							return settingsEntry.async("text").then(
								data => {
									projectVersion = JSON.parse(data).version;
									if (projectVersion == serverVersion) {
										return Promise.resolve(zip);
									} else {
										return Promise.reject("DIFFERENT_VERSIONS");
									}
								}
							)
						} else {
							return Promise.reject("NO_SETTINGS_FILE");
						}
					})
				}
			)
			.then( zip => {
				zip.forEach(function (relativePath, zipEntry) {
					if (zipEntry.name.indexOf('.json') > -1) {
						zipEntry.async("text").then( data => upload(data) )
					} else if (zipEntry.name.indexOf('project.txt') > -1) {
						zipEntry.async("string").then(
							data => {

								//var projects2 = data.replace(/['"]+/g, '');
								var projects = data.split(";");
								var dateExport = zipEntry.name.split("_");
								dateExport = parseInt(dateExport[1]);

								var register = {
									lastDatePush: dateExport,
									lastPushDateSaved: parseInt(dateExport - 30 * 24 * 60 * 60 * 1000)
								};
								var values = { values: [] };

								for (var i in projects) {
									if (projects[i] != "") {

										var project = projects[i];
										ServerPushDatesDataStoreService.getKeyValue(project + "_date")
											.then( dates => {
												if (dates != undefined) {
													
													if (dates.lastDatePush > register.lastDatePush) { register.lastDatePush = dates.lastDatePush }
													if (dates.lastPushDateSaved != undefined) {
														register.lastPushDateSaved = dates.lastPushDateSaved
													}
												}
												ServerPushDatesDataStoreService.setKeyValue(project + "_date", register);
											})

										ServerPushDatesDataStoreService.getKeyValue(project + "_values")
											.then( currentValue => {
												if (currentValue == undefined) {
													ServerPushDatesDataStoreService.setKeyValue(project + "_values", { values: [] });
												}
											});
									}
								}
							})
					}
				})
			})
			.then(
				success => console.log(success),
				error => {
					$scope.errorVisible = true;
					$scope.errorInFile = error;
					$scope.dataImportStatus.visible = false;
					$scope.importFailed = true;
					console.log($scope.errorInFile);
				}
			)
	};




	function upload(fileContent) {
		$upload.http({
			url: commonvariable.url + "dataValueSets",
			headers: { 'Content-Type': 'application/json' },
			data: fileContent
		}).progress(function (ev) {
			console.log('progress: ' + parseInt(100.0 * ev.loaded / ev.total));
		}).success(function (data) {
			AnalyticsService.refreshAllAnalytics()
				.then(
					function (success) {
						$scope.dataImportStatus.type = 'success';
						$scope.dataImportStatus.active = false;
					},
					function (error) {
						$scope.dataImportStatus.type = 'danger';
						$scope.dataImportStatus.active = false;
						console.log(error);
					},
					function (notification) {
						$scope.analyticsLog.push(notification);
					}
				);
			$scope.generateSummary(data);
			$scope.summaryDisplayed = true;
			logDataimport($file.name, data);

			console.log("File upload SUCCESS");
		}).error(function (data) {
			$scope.dataImportStatus.visible = false;
			$scope.importFailed = true;

			console.log("File upload FAILED");//error
		});

	}






	$scope.previewFiles = function () {

		varValidation();

		if (!$scope.undefinedFile) {
			$scope.isCompress = getExtension($file.name) == "zip";
			$scope.dataFile = $file;
			$scope.previewDataImport = true;
		}
	};

	function varValidation() {
		console.log($file);
		$scope.undefinedFile = ($file == undefined);
	}

	function getExtension(filename) {
		var parts = filename.split('.');
		return parts[parts.length - 1];
	}

	$scope.onFileSelect = function ($files) {
		for (var i = 0; i < $files.length; i++) {
			$file = $files[i];//set a single file
			$scope.undefinedFile = false;
			$scope.importFailed = false;
			$scope.errorVisible = false;
		}
		$scope.previewDataImport = false;
	};

	$scope.generateSummary = function (data) {
		var gt218 = commonvariable.version > "2.18";

		for (var dataGroup in data) {
			if ((dataGroup == 'dataValueCount' && !gt218) || (dataGroup == 'importCount' && gt218)) {
				for (var dataElement in data[dataGroup]) {
					$('#importCount').append(data[dataGroup][dataElement] + " " + dataElement + "<br>");
				}
			}
			else if (dataGroup == 'conflicts') {
				$scope.conflicts = true;
				for (var dataElementIndex in data[dataGroup]) {
					var dataElement = data[dataGroup][dataElementIndex];
					$('#typeSummary tbody').append('<tr><td>' + dataElement.object + '</td><td>' + dataElement.value + '</td></tr>');
				}
			}
		}
	};

	var logDataimport = function (filename, data) {
		var namespace = "dataimportlog";
		UserService.getCurrentUser().then(function (me) {
			var dataimportLog = {
				timestamp: new Date().getTime(),
				username: me.userCredentials.username,
				filename: filename,
				status: data.status,
				importCount: data.importCount,
				conflicts: data.conflicts
				//data: DataImportService.getFormattedSummary(rawData)
			};
			DataStoreService.updateNamespaceKeyArray(namespace, me.organisationUnits[0].id, dataimportLog);
		})
	};

}];

/* module.exports = dataImport; */