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

export const importdatamanualDirective = [
  function() {
    return {
      restrict: "E",
      controller: importdatamanualController,
      template: require("./importdatamanualView.html"),
      scope: {}
    };
  }
];

var importdatamanualController = ["$scope","$interval","$http","$filter","commonvariable","Analytics","DataMart","DataStoreService","ServerPushDatesDataStoreService","SystemService","UserService","DataImportService","AnalyticsService"
,function($scope,$interval,$http, $filter,commonvariable,Analytics,DataMart, DataStoreService,ServerPushDatesDataStoreService,SystemService,UserService,DataImportService,AnalyticsService ) {

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
    var isOnline = commonvariable.isOnline;
    $scope.undefinedFile = false;
    var projectVersion = "";
    var lastUpdated_settings = "";
    var projectName_settings = "";
    var projectId_settings = "";
    var endDate_settings = "";
    var serverName_settings ="";
    var namespace = "ServersImportDates";
    var dataStoreKey = "aggregatedexport";
    $scope.gapDates = false;
    $scope.outdatedDates = false;
    $scope.errorVisible = false;
    $scope.differentVersions=false;
    $scope.fileIsNotZip=false
    $scope.projectName="";
    $scope.lastUpdated="";
    $scope.endDate="";
    var $file; //single file
	
    $scope.analyticsDisplayed=false;
    $scope.summaryDisplayed = false;
    $scope.importingData = false;
    $scope.refreshingData=false;

    $scope.showImportDialog = function() {
      varValidation();

      if (!$scope.undefinedFile) {
        $("#importConfirmation").modal();
      }
    };

    $scope.sendFiles = async function() {
      $scope.analyticsLog = [];
      $scope.previewDataImport = false;
      $("#importConfirmation").modal("hide");
      $scope.errorVersiones = "";
      $scope.dataImportStatus.visible = false;
      $scope.analyticsStatus.visible = false;
      $scope.importingData = false;
      $scope.gapDates = false;
      $scope.outdatedDates = false;
      $scope.importFailed = false;
      $scope.fileIsNotZip = false;
      var data2;
     
	  var data_import = true;
	  $scope.lastSyncOrExport=null;
	  var log=[];
	  var log2=[];

      var compress = getExtension($file.name) == "zip";

      // Only manage compressed files
      if (!compress) {
        console.log("File should be a zip file");
		$scope.dataImportStatus.visible = false;
		$scope.analyticsDisplayed=false;
		$scope.summaryDisplayed = false;
		$scope.importingData = false;
		$scope.refreshingData=false;
        $scope.fileIsNotZip = true;
        $scope.importFailed = false;
        return;
	  }
	  
	  var isMFP= await UserService.currentUserHasRole("Medical Focal Point");
	  var user= await UserService.getCurrentUser();

	  var serverName=user.userCredentials.username.split("-")[1];
	  //console.log("MFP");
	  //console.log(isMFP);
	  var  serverVersion=await SystemService.getServerVersion();
	  var zip2= await JSZip.loadAsync($file);
	  var settingsEntry = undefined;
	  var projectEntry = undefined;
	  var dataEntry = undefined;
   	  await zip2.forEach(function(relativePath, zipEntry) {
		 
		 if (zipEntry.name.indexOf(".json") > -1)
		 {
			
			dataEntry = zipEntry;
			
		 }
		});

		if (dataEntry) {
			data2=await dataEntry.async("text");
		} else {
			data_import = false;
			$scope.importFailed=true;
			$scope.$apply();
			console.log("No data file in the zip");
		}


		await zip2.forEach(function(relativePath, zipEntry) {
		if (zipEntry.name.indexOf("settings.txt") > -1) {
		  
			settingsEntry = zipEntry;
		}
	});
	if (settingsEntry) {
		var  settings=await settingsEntry.async("text");
		  serverName_settings=JSON.parse(settings).serverName;
		  projectVersion = JSON.parse(settings).version;
		  lastUpdated_settings = JSON.parse(settings).lastUpdated;
		  endDate_settings = JSON.parse(settings).end;
		  projectId_settings = JSON.parse(settings).projectId;
		  projectName_settings = JSON.parse(settings).projectName;
      $scope.lastUpdated_settings =lastUpdated_settings;
      $scope.endDate_settings=endDate_settings;

		  if (projectVersion == serverVersion) {
			console.log("Same HMIS Version")
		  } else {
			data_import = false;
			$scope.differentVersions=true;
			//$scope.mensaje ="Different HMIS versions. Please ask the project to update."
			// console.log("DIFFERENT_VERSIONS");
		  }
		} else {
			data_import = false;
			$scope.importFailed=true;
			$scope.$apply();
			console.log("No settings file in the zip");
		}

	await zip2.forEach(function(relativePath, zipEntry) {
		if (zipEntry.name.indexOf("project.txt") > -1) {
		
			projectEntry = zipEntry;
		}
	  });


		if (projectEntry) {
			var projId=await projectEntry.async("string");
			
			 log2=await DataStoreService.getNamespaceKeyValue(namespace,projId);
       if (log2==undefined) { log["lastUpdated"]=null;
       log["endDate"]=null;
      } else {
         if (log2[serverName_settings]!=undefined) {
           
          log=log2[serverName_settings] } else {log["lastUpdated"]=null;
          log["endDate"]=null;
        }
       }
				  var projects = projId.split(";");
                  var dateExport = projectEntry.name.split("_");
                  dateExport = parseInt(dateExport[1]);
                 
                 // console.log("endDate_settings");
                 // console.log(endDate_settings);
                  var register = {
                    lastDatePush: dateExport,
                    lastPushDateSaved: parseInt(
                      dateExport - 30 * 24 * 60 * 60 * 1000
                    )
                  };
				  var values = { values: [] };
				  for (var i in projects) {
                    if (projects[i] != "") {
                      var project = projects[i];
                     // var fecha=await SystemService.getServerLastSyncDate();
                     // console.log("fecha");
                     // console.log(fecha);

                     //CAMBIAR ESTO PARA TENER EN CUENTA UN PROYECTO EN DOS SERVIDORES
                      var dates=await ServerPushDatesDataStoreService.getKeyValue(project);
                      var dates2=await ServerPushDatesDataStoreService.getKeyValue(project+"_date");
           // console.log("dates");
           // console.log(dates);
                      if (dates != undefined) {
                       if (dates[serverName_settings] !=undefined) { 
                         dates =dates[serverName_settings];} else {
                          if (dates2 != undefined) {
                            dates =dates2;
                          }

                          
                         }
              
             // console.log("dates2");
             // console.log(dates);
              if (dates.lastPushDateSaved != undefined) {
                register.lastPushDateSaved = 	dates.lastPushDateSaved;
              }

            //Si la importación se está haciendo en un servidor Local no tiene en cuenta el LastDatePush
						if (new Date(dates.lastDatePush).toISOString()>=log.endDate && isOnline) { 
						 $scope.lastSyncOrExport=new Date(dates.lastDatePush).toISOString() ;
            } 
          
            else {  $scope.lastSyncOrExport=log.endDate
						
						}
            
          } else {  $scope.lastSyncOrExport=log.endDate
						
          }
						//if (isOnline) { // Las restricciones no afectan al MFP para permitir consolidar servidores
				       // NO SE PUEDE IMPORTAR UN ARCHIVO CON UN GAP RESPECTO
                       // A LA ULTIMA IMPORTACION o ultimo sync
						if (lastUpdated_settings > $scope.lastSyncOrExport) {
							data_import = false;
							$scope.gapDates = true;
						//	console.log("lastUpdated_settings>$scope.lastSyncOrExport");
						//	console.log("log.lastUpdated");
						//	console.log(log.lastUpdated);
							
						//	console.log("lastUpdated_settings");
						//	console.log(lastUpdated_settings);
							}
						// comparar fechas date.lastDatePush con endDate_settings y LastUpdated settings
						// NO SE DEBE IMPORTAR UN ARCHIVO EXPORTADO CON ANTERIORIDAD AL ULTIMO SYNC o ultimo export
						if ($scope.lastSyncOrExport > endDate_settings) {
						  data_import = false;
						  $scope.outdatedDates = true;
						  //$scope.mensaje ="This file contains data from " + lastUpdated_settings +" to "+ endDate_settings +". The last imported data (manually or automatically) was until " + $scope.lastSyncOrExport + ". The data in this file could be outdated. The file cannot be imported.";
							
						 //$scope.mensaje ="La fecha lastDatePush del DataStore es mayor que la fecha de exportacion (o endDate) del archivo. No se pueden importar datos desactualizados.";
						//  console.log("register.lastDatePush");
						//  console.log("dates.lastDatePush > register.lastDatePush");
						//  console.log(register.lastDatePush);
						  
						  // REVISAR ESTO BIEN
						  //register.lastDatePush = dates.lastDatePush
						}

					//}
					
					 // }
					  		if (data_import) {
								//hacer solo el set  si las fechas son correctas
								await ServerPushDatesDataStoreService.setKeyValue(project + "_date",register);
								
								var currentValue=await ServerPushDatesDataStoreService.getKeyValue(project + "_values");
								
									if (currentValue == undefined) {
										await ServerPushDatesDataStoreService.setKeyValue(project + "_values",{ values: [] });
									}
								
								$scope.dataImportStatus.visible = true;
								$scope.importingData = true;
								await upload(data2);
						 	 }
							if (data_import == false) {
								//$scope.gapDates = true;
								console.log("No imported data");
							}
					}
					}
					$scope.$apply();

		} else {
			data_import = false;
			$scope.importFailed=true;
			$scope.$apply();
			console.log("No project file in the zip");
		}
	
	}

    function zipDataValuesFile(fileContent) {
      return new JSZip()
        .file("dataValues.json", fileContent)
        .generateAsync({ type: "uint8array", compression: "DEFLATE" });
    }
	
    function upload(fileContent) {
      return zipDataValuesFile(fileContent).then(zip => {
        $http({
          method: "POST",
          url: commonvariable.url + "dataValueSets",
          data: new Uint8Array(zip),
          headers: { "Content-Type": "application/json" },
          transformRequest: {}
        }).then(
          httpResponse => {
			 // console.log(httpResponse.data.status);
			  if (httpResponse.data.status!="ERROR" ) {
			  $scope.generateSummary(httpResponse.data);
            $scope.summaryDisplayed = true;
            logDataimport($file.name, httpResponse.data);
            $scope.dataImportStatus.type = "success";
            $scope.dataImportStatus.active = false;
			$scope.analyticsStatus.visible = true;
			$scope.analyticsDisplayed=true;
            $scope.refreshingData = true;
            AnalyticsService.refreshAllAnalytics().then(
              success => {
                $scope.analyticsStatus.type = "success";
                $scope.analyticsStatus.active = false;
              },
              error => {
                $scope.analyticsStatus.type = "danger";
                $scope.analyticsStatus.active = false;
                console.log(error);
              },
              notification => $scope.analyticsLog.push(notification)
              //notification => console.log(notification)
            );

			console.log("File upload SUCCESS");
		} else {
			$scope.importFailed = true;
			$scope.importingData = false;
			$scope.dataImportStatus.type = "danger";
			$scope.dataImportStatus.active = false;
            console.log("File upload FAILED");
		}
          },

          error => {
            $scope.dataImportStatus.visible = false;
            $scope.importingData = false;
            $scope.importFailed = true;

            console.log("File upload FAILED"); //error
          }
        );
      });
    }

    $scope.previewFiles = function() {
      varValidation();

      if (!$scope.undefinedFile && !$scope.fileIsNotZip) {
        $scope.fileIsNotZip = getExtension($file.name) != "zip";
        $scope.isCompress = getExtension($file.name) == "zip";
        $scope.gapDates = false;
        $scope.outdatedDates = false;
        $scope.errorVisible = false;
        $scope.differentVersions=false;
        
        $scope.importingData = false;
        $scope.refreshingData=false;
        $scope.summaryDisplayed=false;
        $scope.analyticsDisplayed=false;
        $scope.dataImportStatus.visible = false;
        $scope.analyticsStatus.visible = false;

        $scope.dataFile = $file;
        

		if ($scope.isCompress) {
	  	$scope.previewDataImport = true;
		} 
      }
    };

    function varValidation() {
		$scope.undefinedFile = $file == undefined;
		if (!$scope.undefinedFile) {
	  
	  $scope.isCompress = getExtension($file.name) == "zip";
	  
	$scope.fileIsNotZip = getExtension($file.name) != "zip";
		} 
    }

    function getExtension(filename) {
      var parts = filename.split(".");
      return parts[parts.length - 1];
	}
	

    $scope.onFileSelect = function($files) {
      for (var i = 0; i < $files.length; i++) {
        $file = $files[i]; //set a single file
        $scope.undefinedFile = false;
        $scope.importFailed = false;
        $scope.errorVisible = false;
      }
      $scope.previewDataImport = false;
    };

    $scope.generateSummary = function(data) {
      var gt218 = commonvariable.version > "2.18";
      gt218 = true; // QUITAR
      for (var dataGroup in data) {
        if (
          (dataGroup == "dataValueCount" && !gt218) ||
          (dataGroup == "importCount" && gt218)
        ) {
          for (var dataElement in data[dataGroup]) {
            $("#importCount").append(
              data[dataGroup][dataElement] + " " + dataElement + "<br>"
            );
          }
        } else if (dataGroup == "conflicts") {
          $scope.conflicts = true;
          for (var dataElementIndex in data[dataGroup]) {
            var dataElement = data[dataGroup][dataElementIndex];
            $("#typeSummary tbody").append(
              "<tr><td>" +
                dataElement.object +
                "</td><td>" +
                dataElement.value +
                "</td></tr>"
            );
          }
        }
      }
    };

    var logDataimport =  async function(filename, data) {
      var namespace = "dataimportlog";
     var me = await UserService.getCurrentUser();
        var dataimportLog = {
          timestamp: new Date().getTime(),
		  username: me.userCredentials.username,
		  serverName: serverName_settings,
          filename: filename,
          status: data.status,
          importCount: data.importCount,
          conflicts: data.conflicts
          //data: DataImportService.getFormattedSummary(rawData)
        };
        await DataStoreService.updateNamespaceKeyArray(namespace,projectId_settings,dataimportLog);
        namespace = "ServersImportDates";
        var dataStoreKey = projectId_settings;

        var log=await DataStoreService.getNamespaceKeyValue(namespace,dataStoreKey);

		if (log==undefined) { log={};}
		log[serverName_settings] = {
          projectId: projectId_settings,
          projectName: projectName_settings,
          lastUpdated: lastUpdated_settings,
          filename: filename,
          endDate: endDate_settings
        };

       await DataStoreService.setNamespaceKeyValue(namespace, dataStoreKey, log);
        //$scope.periods ="Imported data from " + projectName_settings + " from " + lastUpdated_settings + " to " + endDate_settings;
        $scope.projectName=projectName_settings;
        $scope.lastUpdated=lastUpdated_settings;
        $scope.endDate=endDate_settings;

    };
  }
];

/* module.exports = dataImport; */
