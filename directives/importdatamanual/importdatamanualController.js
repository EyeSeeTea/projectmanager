
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


var importdatamanualController = ["$scope", '$interval', '$http', '$filter', "commonvariable", "Analytics", "DataMart", "DataStoreService", "ServerPushDatesDataStoreService", "SystemService", "UserService", "DataImportService", "AnalyticsService", function ($scope, $interval, $http, $filter, commonvariable, Analytics, DataMart, DataStoreService, ServerPushDatesDataStoreService, SystemService, UserService, DataImportService, AnalyticsService) {

	$scope.dataImportStatus = {
		visible: false,
		type: "info",
		value: 100,
		active: true
	};
	$scope.analyticsStatus = {
		visible: false,
		type: "info",
		value: 100,
		active: true
	};
		
	$scope.undefinedFile = false;
	var projectVersion = "";
	var lastUpdated_settings ="";
	var projectName_settings="";
	var projectId_settings="";
	var endDate_settings ="";
	var dataStoreKey = 'aggregatedexport';
	var data_import=true;
	var refreshingData=false;
	var importingData=false;
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
		$scope.analyticsStatus.visible = false;
		$scope.importingData=true;
		$scope.importFailed = false;
		$scope.fileIsNotZip=false;

		var compress = getExtension($file.name) == "zip";

		// Only manage compressed files
		if (!compress) 
		{ console.log("File should be a zip file");
		$scope.dataImportStatus.visible = false;
		$scope.importingData=false;
		$scope.fileIsNotZip = true;
		$scope.importFailed = false;
	return;
	}
		

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
									lastUpdated_settings =  JSON.parse(data).lastUpdated;
									endDate_settings =  JSON.parse(data).end;
									projectId_settings =  JSON.parse(data).projectId;
									projectName_settings =  JSON.parse(data).projectName;
									
									
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

				var namespace="ServersImportDates";
				var dataStoreKey="prueba";
				var log;
				
				

				zip.forEach(function (relativePath, zipEntry) {
					if (zipEntry.name.indexOf('.json') > -1) {
						console.log("json");
						zipEntry.async("text").then( data =>{
							
							if (data_import) {upload(data)} else {console.log("No imported data")} 
						
						})
					} else if (zipEntry.name.indexOf('project.txt') > -1) {
						zipEntry.async("string").then(
							data => {

								DataStoreService.getNamespaceKeyValue(namespace, data).then( d => {
					
									console.log("log");
									console.log(d);
									log=d;

									//data_import=false;
								console.log("lastUpdated_settings");
								console.log(lastUpdated_settings);
								console.log("lastUpdated DataSTORE");
								console.log(log.lastUpdated);
									
								

								if (lastUpdated_settings>log.lastUpdated) { data_import=false;
								console.log("lastUpdated_settings>log.lastUpdated");
								}
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
							});
							}
						
						)
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
					$scope.importingData=false;
					console.log($scope.errorInFile);
				}
			)
	};


	function zipDataValuesFile(fileContent) {
		return (new JSZip()).file("dataValues.json", fileContent).generateAsync({type: "uint8array", compression: "DEFLATE"});
	}

	function upload(fileContent) {
		
		return zipDataValuesFile(fileContent).then( zip => {
			$http({
				method: 'POST',
                url: commonvariable.url + "dataValueSets",
                data: new Uint8Array(zip),
                headers: {'Content-Type': 'application/json'},
				transformRequest: {}
			}).then(
				httpResponse => {
					
					$scope.generateSummary(httpResponse.data);
					$scope.summaryDisplayed = true;
					logDataimport($file.name, httpResponse.data);
					$scope.dataImportStatus.type = 'success';
					$scope.dataImportStatus.active = false;
					$scope.analyticsStatus.visible = true;
					$scope.refreshingData=true;
					AnalyticsService.refreshAllAnalytics()
						.then(
							success => {
								$scope.analyticsStatus.type = 'success';
								$scope.analyticsStatus.active = false;
							},
							error => {
								$scope.analyticsStatus.type = 'danger';
								$scope.analyticsStatus.active = false;
								console.log(error);
							},
							notification => $scope.analyticsLog.push(notification)
							//notification => console.log(notification)
						);
					

					console.log("File upload SUCCESS");
				},
			
				error => {
					$scope.dataImportStatus.visible = false;
					$scope.importingData=false;
					$scope.importFailed = true;

					console.log("File upload FAILED");//error
				}
			);
		})
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
		gt218=true; // QUITAR
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
			namespace="ServersImportDates";
			var dataStoreKey=me.organisationUnits[0].id;
			var log={
				projectId: projectId_settings,
				projectName: projectName_settings,
				lastUpdated: lastUpdated_settings,
				filename: filename,
				endDate: endDate_settings

			}

			DataStoreService.setNamespaceKeyValue(namespace, dataStoreKey, log);
				$scope.periods="Imported data from "+projectName_settings + " from "+  lastUpdated_settings + " to "+endDate_settings; 
		
		})
	};

}];

/* module.exports = dataImport; */