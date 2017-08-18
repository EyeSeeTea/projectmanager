

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


var datasyncController = ["$scope", "$q", "$filter", "commonvariable", "Organisationunit", "DataExport", "messageConversations", "RemoteApiService", "DataStoreService", 'UserService',
	function ($scope, $q: ng.IQService, $filter, commonvariable, Organisationunit, DataExport, messageConversations, RemoteApiService, DataStoreService, UserService) {

		var projectId = null;
		var projectName = null;
		var medcoID = null;
		$scope.sync_result = "";
		$scope.sync_result_date = "";
		var namespace = "dataPush";
		var lastDatePush = null;
		var serversPushDatesNamespace = "ServersPushDates";
		$scope.online = false;

		UserService.getCurrentUser()
			.then(function (user) {
				if (commonvariable.urlbase.indexOf("8989") == -1) { $scope.online = true }
				projectId = user.organisationUnits[0].id;
				projectName = user.organisationUnits[0].name;
				DataStoreService.getNamespaceKeyValue(serversPushDatesNamespace, projectId + "_date").then(
					data => {
						lastDatePush = data.lastDatePush;
						$scope.sync_result_date = data.lastDatePush;
						$scope.validation_date = data.lastDatePush;
					}
					,
					error => {
						console.log(error);
					}
				);
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


		function writeRegisterInRemoteServer(projectId) {
			var register = {
				lastDatePush: (new Date()).getTime()
			};

			var values = { values: [] }
			// Try PUT first. If failure, try POST to create a new entry in the namespace.

			RemoteApiService.executeRemoteQuery({
				method: 'PUT',
				resource: 'dataStore/' + serversPushDatesNamespace + '/' + projectId + "_date",
				data: register
			})
				.then(function success() {
					return register.lastDatePush;
				}, function error() {
				
					return RemoteApiService.executeRemoteQuery({
						method: 'POST',
						resource: 'dataStore/' + serversPushDatesNamespace + '/' + projectId + "_date",
						data: register
					})
						.then(function success() {
							return RemoteApiService.executeRemoteQuery({
								method: 'POST',
								resource: 'dataStore/' + serversPushDatesNamespace + '/' + projectId + "_values",
								data: values
							})
						});
				}).then(
				() => {
					DataStoreService.setNamespaceKeyValue(serversPushDatesNamespace, projectId + "_date", register).then(() => {
					});
				}

				);
			return register.lastDatePush;


		}
		$scope.submitValidationRequest = function () {
			var result_date = null;
			var sync_result = null;
			var register = {
				lastDatePush: (new Date()).getTime()
			};
			var values = { values: [] }
			UserService.getCurrentUser()
				.then(function (user) {

					projectId = user.organisationUnits[0].id;
					projectName = user.organisationUnits[0].name;
					getMedco(projectId).then(
						medcos => {
							
							var message = {
								"subject": "Data Validation Request - " + projectName,
								"text": "Data Validation Request: Date - " + register.lastDatePush,
								"users": medcos
							}
							
							sendMessage(message);
							$scope.validation_date = register.lastDatePush;
						});

					DataStoreService.setNamespaceKeyValue(serversPushDatesNamespace, projectId + "_date", register);
					DataStoreService.getNamespaceKeyValue(serversPushDatesNamespace, projectId + "_values")
						.then(
						currentValue => {
							if (currentValue == undefined) {
								DataStoreService.setNamespaceKeyValue(serversPushDatesNamespace, projectId + "_values", values);
							}
						});
				});
		}


		$scope.submit_sync = function () {
			var result_date = null;
			var sync_result = null;
			let api_url = commonvariable.url + "/synchronization/dataPush";

			UserService.getCurrentUser()
				.then(function (user) {
					projectId = user.organisationUnits[0].id;
					projectName = user.organisationUnits[0].name;

				});

			RemoteApiService.isRemoteServerAvailable().then(
				data => {
					let restUtil = new RESTUtil();
					restUtil.requestPostData(api_url,
						data => {

							if (data == null) {
								sync_result = "Import process completed successfully (No data updated)"
								$scope.sync_result = sync_result;
							}
							else {
								sync_result = data.description + "( Updated: " + data.importCount.updated + ", Imported: " + data.importCount.imported + ", Ignored: " + data.importCount.ignored + ", Deleted: " + data.importCount.deleted + ")";
								$scope.sync_result = sync_result;
							}

							result_date = writeRegisterInRemoteServer(projectId);

							$scope.sync_result_date = result_date;
							// Enviar mensaje a medco messageConversations
							getMedco(projectId).then(
								medcos => {
								var message = {
										"subject": "Data Sync - " + projectName,
										"text": "Data Sync: Date - " + result_date + ". Result: " + sync_result,
										"users": medcos
									}
									sendMessage(message);
								});
						},

						data_error => {
							console.log(data_error);
						});

				},
				error => $scope.sync_result = error

			);

		}
		//}




		function sendMessage(message) {
			RemoteApiService.executeRemoteQuery({
				method: 'POST',
				resource: 'messageConversations',
				data: message
			})
		}




		function getMedco(projectId) {
			var medco = [];

			return getMission(projectId).then(mission => {

				return getUsersMissions(mission).then(
					users => {
						console.log("users");
						console.log(users);
						for (var user in users) {
							if (users[user].userCredentials.userRoles[0].id == "IQ6i3gWsYYa") {
								medco.push({ id: users[user].id });

							}
						};



						return medco;
					}


				);
			});

		}



		function getMission(projectId) {
			return $q(function (resolve) {
				resolve(
					Organisationunit.get({ filter: 'id:eq:' + projectId, fields: 'id,parent, organisationUnits[id, parent]' }).$promise.then(

						project => {
							console.log("orgunit");
							console.log(project.organisationUnits[0].parent.id)
							return project.organisationUnits[0].parent.id;
						}
					)
				);

			});
		}

		function getUsersMissions(mission) {
			return $q(function (resolve) {
				resolve(
					Organisationunit.get({ filter: 'id:eq:' + mission, fields: 'id,name,users[id,userCredentials[userRoles[id]]]' }).$promise.then(

						mission => {
							console.log("users");
							console.log(mission.organisationUnits[0].users)
							return mission.organisationUnits[0].users;
						}
					)
				);

			});
		}


	}

];

