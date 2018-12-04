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
   import { AggregatedDataExportLog, Orgunit } from '../../model/model';
export const dataexportmanualDirective = [function () {
	return {
		restrict: 'E',
		controller: dataexportmanualController,
		css: require('./dataexportmanualCss.css'),
		template: require('./dataexportmanualView.html'),
		scope: {}
	}
}];

var dataexportmanualController = ["$scope", "$q", "$filter", "commonvariable", "SystemService","Info", "DataSetsUID", "DataExport", "DemographicsService", "ServerPushDatesDataStoreService","RemoteApiService", "DataStoreService", "DataStoreNames",'UserService', '$timeout',
	function ($scope, $q: ng.IQService, $filter, commonvariable, SystemService, Info, DataSetsUID, DataExport, DemographicsService,ServerPushDatesDataStoreService, RemoteApiService, DataStoreService, DataStoreNames, UserService, $timeout) {

		let version:string ="";
		 var start_date;
		 var lastUpdated;
		 var dataStoreKey:string = 'aggregatedexport';
		 var projectName;
		 var serverName// for project with 2 servers ; 
		 var projectId;
		var end_date;	
		var lastSyncDate;		
		$scope.demographicsSelected = false;
		let currentYear: number = (new Date()).getFullYear();
		$scope.availableYears = [currentYear - 3, currentYear - 2, currentYear - 1, currentYear, currentYear + 1];
		$scope.demographicsYear = currentYear;
		let demographicsDatasets: string[] = ["DS_DEM", "DS_POP_Q"];

		//new component for datepiker helder
		$scope.today = function () {
			$scope.dt = new Date();
		};

		$scope.today();

		$scope.clear = function () {
			$scope.dt = null;
		};

		$scope.openstart = function ($event) {
			$event.preventDefault();
			$event.stopPropagation();

			$scope.openedstart = true;
		};

		$scope.openend = function ($event) {
			$event.preventDefault();
			$event.stopPropagation();

			$scope.openedend = true;
		};
		///////////////////////////////////7		  
		$scope.dataExportStatus = {
			visible: false,
			type: "info",
			value: 100,
			active: true
		};
		
		UserService.getCurrentUser()
			.then(user => {
				//console.log(user.userCredentials.username.split("-")[1]);
				serverName=user.userCredentials.username.split("-")[1];
				projectId = user.organisationUnits[0].id;
				projectName = user.organisationUnits[0].name;
			
			})
			.then (()=>{
			ServerPushDatesDataStoreService.getKeyValue(projectId + "_date").then(
				lastSyncDateResponse =>
				{ lastSyncDate=new Date(lastSyncDateResponse.lastDatePush).toISOString();
				//console.log("lastSyncDate");
				//console.log(lastSyncDate)
			}
			)
			.then(()=>{	DataStoreService.getKeyValue(dataStoreKey).then( log => {
					if (log==undefined) {DataStoreService.setKeyValue(dataStoreKey)}
					if (log[projectId][serverName] ==undefined) {
						log[projectId][serverName]={};
						log[projectId][serverName].lastUpdated="2018-01-01 00:00";
						log[projectId][serverName].endDate="2018-01-01 00:00";
						}
				
				//$scope.lastUpdated=	log[projectId].lastUpdated;
				$scope.time_zone=new Date().toString().match(/([-\+][0-9]+)\s/)[1];
				$scope.tz=Intl.DateTimeFormat().resolvedOptions().timeZone;
				$scope.projectName=projectName;
				//console.log("serverName");
				//console.log(log[projectId][serverName]);

				if(log[projectId][serverName]!=undefined) {
				
				
					if (log[projectId][serverName].endDate>lastSyncDate) {
						$scope.end_date=log[projectId][serverName].endDate
					} else {
						$scope.end_date=lastSyncDate

					}
				
					//$scope.end_date=log[projectId][serverName].endDate;
					


				$scope.lastUpdated2=log[projectId][serverName].lastUpdated;
				var new_lastupdated=new Date($scope.end_date).toLocaleString('es-ES', { hour12: false });
				var from = new_lastupdated.split("/");
				var dia=parseInt(from[0]);
				var month=parseInt(from[1]);
				var year = parseInt(from[2].split(" ")[0]);
				var hora = parseInt(from[2].split(" ")[1].split(":")[0]);
				var minutos = parseInt(from[2].split(" ")[1].split(":")[1]);
				


				$scope.lastUpdated = new Date(year, month - 1, dia, hora, minutos);
				//$scope.lastUpdated=new Date(log[projectId].endDate).toISOString;
				
				$scope.fecha_maxima=new Date(year, month - 1, dia);
				}
				/*
				$scope.$watch("lastUpdated", function(newValue, oldValue) {
					console.log("I've changed : ", newValue);
					$scope.dt = null;
					$scope.dt = newValue;
				
				});
				*/
       				  $scope.dateOptions = {
           
         			   maxDate: $scope.fecha_maxima,
			
         				 };
				});
			});
		});

		class RESTUtil {

			requestGetData(url, successFunc, failFunc) {
				return $.ajax({
					type: "GET",
					dataType: "json",
					url: url,
					async: true,
					success: successFunc,
					error: failFunc
				});
			};

			requestPostData(url, successFunc, failFunc) {
				return $.ajax({
					type: "POST",
					dataType: "json",
					url: url,
					async: true,
					success: successFunc,
					error: failFunc
				});
			};
		};
		function updateprocess() {
			$scope.dataExportStatus.visible = false;
		};


		$scope.submit = function () {

			$scope.dataExportStatus.visible = true;
			
			let api_url = commonvariable.url + "dataValueSets.json?";
		
			const boundDates: BoundDates = getBoundDates();
			const fileName: string = getFilename();
			let orgUnits = commonvariable.OrganisationUnitList;

			updateDemographicIfNeeded()
				.then(getVersion)
				.then(getDatasets)
				.then(dataSets => {
				
					const dataset_filter = dataSets.reduce(function (list, dataset) {
						return list + "dataSet=" + dataset.id + "&";
					}, "");
/*
					const orgUnits_filter = orgUnits.reduce(function (list, orgunit) {
						return list + "&orgUnit=" + orgunit.id;
					}, "");
					*/
					const orgUnits_filter = "&orgUnit=" + projectId;
/*
					const projects = orgUnits.reduce(function (list, orgunit) {
						if (orgunit.level == 4 && list.indexOf(orgunit.id) == -1) { return list + orgunit.id + ";" }
						if (orgunit.level == 5 && list.indexOf(orgunit.parent.id) == -1) { return list + orgunit.parent.id + ";" }
						if (orgunit.level == 6 && list.indexOf(orgunit.parent.parent.id) == -1) { return list + orgunit.parent.parent.id + ";" }
						else { return list; }
					}, "");

*/
					
				
					//api_url = api_url + dataset_filter +
					//	"startDate=" + boundDates.start + "&endDate=" + boundDates.end +
					//	orgUnits_filter + "&children=true";

					api_url = api_url + dataset_filter +
						"lastUpdated=" + boundDates.lastUpdated  +
						orgUnits_filter + "&children=true";


					let restUtil = new RESTUtil();
					SystemService.getServerDateWithTimezone()
						.then(serverTime => {
							end_date=serverTime;
							let settings: Settings=getSettings();
							var serverDate = new Date(serverTime).getTime()
							restUtil.requestGetData(api_url,
								data => {
									let zip = new JSZip();
									zip.file('System_settings.txt', JSON.stringify(settings));
									zip.file(fileName + '.json', JSON.stringify(data));
									zip.file("OrgUnits_" + serverDate + '_project.txt', projectId);
									
									zip.generateAsync({ type: "blob", compression: "DEFLATE" })
										.then(function (content) {
											saveAs(content, fileName + '.json.zip');
										});
									$timeout(updateprocess, 5);
										$scope.lastUpdated=lastUpdated;
										$scope.end_date=end_date;
										logExport(fileName,lastUpdated, end_date, projectId, projectName, serverName)
								},
								() => { });

						});
				});
		};

		var logExport  = function (fileName, lastUpdated: Date, end_date: Date, projectId, projectName, serverName) {
		
				DataStoreService.getKeyValue(dataStoreKey).then( log => {
					
					//this.getSelectedServices().map( service => {
				//		log[service.code] = current;
				//	});

				var projects_array = projectId.split(";");

				
				projects_array.forEach(project => {
					var current={};
					 current[serverName] = {"filename": fileName, "lastUpdated": lastUpdated, "endDate": end_date, "ProjectName": projectName};
					//var log = {};
					 log[project] = current;
					
				console.log(log);
					DataStoreService.setKeyValue(dataStoreKey, log);	
					
				});
			//	log["project"] = current;
			//		return DataStoreService.setKeyValue(dataStoreKey, log);
				//});
			})}


		var updateDemographicIfNeeded = function () {
			if ($scope.demographicsSelected) {
				return DemographicsService.updateDemographicData();
			} else {
				return $q.when("No demographics needed");
			}
		};

		var getDatasets = function () {
			var filter = $scope.demographicsSelected ? { filter: "code:in:[" + demographicsDatasets.join(",") + "]" } : {};
			return DataSetsUID.get(filter).$promise.then(function (data) {
				if (data.dataSets.length > 0) {
					return data.dataSets;
				} else {
					$q.reject("No data set");
				}
			});
		};

		var getFilename = function (): string {
			var today = new Date();
			var dd = (today.getDate() < 10 ? '0' + today.getDate() : today.getDate());
			var mm = (today.getMonth() < 9 ? '0' + (today.getMonth() + 1) : today.getMonth());
			var yyyy = today.getFullYear();

			return $scope.file_name + "_" + yyyy + mm + dd;
		};

		var getBoundDates = function (): BoundDates {
			if ($scope.demographicsSelected) {
				new BoundDates("");
				return new BoundDates(
					$scope.demographicsYear + "-01-01");
				//	$scope.demographicsYear + "-12-31");
			} else {
				// start_date = $scope.start_date.setDate($scope.start_date.getDate() -7); 
				// end_date = $scope.end_date.setDate($scope.end_date.getDate() +7); 
				 
			//var today = new Date();
			//var dd = (today.getDate() < 10 ? '0' + today.getDate() : today.getDate());
			//var mm = (today.getMonth() < 9 ? '0' + (today.getMonth() + 1) : today.getMonth());
			//var yyyy = today.getFullYear();

			//end_date = yyyy+ "-" + mm+ "-"+ dd ; 
				lastUpdated = $scope.lastUpdated;
				//console.log("lastUpdated");
				//console.log(lastUpdated);
				return new BoundDates(
					
					new Date(lastUpdated).toISOString());
					//$filter('date')(end_date, 'yyyy-MM-dd'));
			}
		};
		var getSettings = function (): Settings {
								
				return new Settings(
			
				version,
				serverName,
				projectName,
				projectId,
				lastUpdated,
				end_date
			)
		}
	var getVersion = function() {

		SystemService.getServerVersion().then (data => { version=data})
	}
		
	}
	
	
];

class BoundDates {
	constructor(
		public lastUpdated: string
	//	public end: string
	) { }
};
class Settings {
	constructor(
		public version: string,
		public serverName: string,
		public projectName: string,
		public projectId: string,
		public lastUpdated: string,
		public end: string
		
	) { }
};