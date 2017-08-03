

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



export const datasyncDirective = [function () {
	return {
		restrict: 'E',
		controller: datasyncController,
		css: require('./datasyncCss.css'),
		template: require('./datasyncView.html'),
		scope: {}
	}
}];


var datasyncController = ["$scope", "$q", "$filter", "commonvariable", "DataExport", "RemoteApiService", "DataStoreService", 'UserService',
	function ($scope, $q: ng.IQService, $filter, commonvariable, DataExport, RemoteApiService, DataStoreService, UserService) {


		$scope.sync_result = "";
		$scope.sync_result_date="";
		var namespace = "dataPush";
		//var previousLastDatePush = null;
		var lastDatePush = null;
		var serversPushDatesNamespace = "ServersPushDates"

		DataStoreService.getNamespaceKeyValue(namespace, "push").then(
			data => {
				//console.log(data.lastDatePush);
				//previousLastDatePush = new Date(data.previousLastDatePush);
				lastDatePush = new Date(data.lastDatePush);
				$scope.sync_result_date = new Date(data.lastDatePush).toString();
			}
			,
			error => {
				console.log(error);

			}
		);



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


		function writeRegisterInRemoteServer(lastDatePush) {
			var register = {
				//previousLastDatePush: lastDatePush.getTime(),
				lastDatePush: (new Date()).getTime(),
				

			};
			// Try PUT first. If failure, try POST to create a new entry in the namespace.
console.log(new Date(register.lastDatePush));

			UserService.getCurrentUser()
				.then(function (user) {

					var orgunitid = user.organisationUnits[0].id;
					return RemoteApiService.executeRemoteQuery({
						method: 'PUT',
						resource: 'dataStore/' + serversPushDatesNamespace + '/' + orgunitid+"_date",
						data: register
					})
						.then(function success() {
							return register.lastDatePush;
						}, function error() {
							return RemoteApiService.executeRemoteQuery({
								method: 'POST',
								resource: 'dataStore/' + serversPushDatesNamespace + '/' + orgunitid+"_date",
								data: register
							})
								.then(function success() {
									return register.lastDatePush;
								});
						});
				});

			DataStoreService.setNamespaceKeyValue("dataPush", "push", register);
			
			return register.lastDatePush;
		}
		

		$scope.submit_sync = function () {
var result_date=null;
			let api_url = commonvariable.url + "/synchronization/dataPush";


			RemoteApiService.isRemoteServerAvailable().then(
				data => {


					let restUtil = new RESTUtil();
					restUtil.requestPostData(api_url,
						data => {

							if (data == null) {
								$scope.sync_result = "Import process completed successfully (No data updated)"

							}
							else {
								$scope.sync_result = data.description + "( Updated: " + data.importCount.updated + ", Imported: " + data.importCount.imported + ", Ignored: " + data.importCount.ignored + ", Deleted: " + data.importCount.deleted + ")";
							}
							result_date=new Date(writeRegisterInRemoteServer(lastDatePush)).toString();

							$scope.sync_result_date =result_date;


						},

						data_error => {
							console.log(data_error);


						});

				},
				error => $scope.sync_result = error

			)

		}

	}
];

