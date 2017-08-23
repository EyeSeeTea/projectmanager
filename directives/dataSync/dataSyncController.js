

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


var datasyncController = ["$scope", "$q", "$filter", "commonvariable", "Info", "Organisationunit", "DataExport", "messageConversations", "RemoteApiService", "DataStoreService", 'UserService',
	function ($scope, $q, $filter, commonvariable, Info, Organisationunit, DataExport, messageConversations, RemoteApiService, DataStoreService, UserService) {

		var projectId = null;
		var projectName = null;
		var medcoID = null;
		$scope.sync_result = "";
		$scope.sync_result_date = "";
		var namespace = "dataPush";
		var lastDatePush = null;
		var lastPushDateSaved = null;
		var serversPushDatesNamespace = "ServersPushDates";

		var register = {
			lastDatePush: null,
			lastPushDateSaved: null
		};

		UserService.getCurrentUser()
			.then(function (user) {
				$scope.isOnline = commonvariable.isOnline
				projectId = user.organisationUnits[0].id;
				projectName = user.organisationUnits[0].name;
				DataStoreService.getNamespaceKeyValue(serversPushDatesNamespace, projectId + "_date").then(
					data => {
						lastDatePush = data.lastDatePush;
						lastPushDateSaved = data.lastPushDateSaved;
						if (lastPushDateSaved == undefined) { lastPushDateSaved = parseInt(lastDatePush - 60 * 12 * 60 * 60 * 1000) }
						$scope.sync_result_date = data.lastDatePush;
						$scope.validation_date = data.lastDatePush;
					}, error => {
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
			var values = { values: [] }
			Info.get().$promise.then(
				info => {
					lastDatePush= new Date(info.serverDate).getTime();
					register = {
						lastDatePush: lastDatePush,
						lastPushDateSaved: parseInt(lastDatePush - 60 * 24 * 60 * 60 * 1000)
					};

					RemoteApiService.executeRemoteQuery({
						method: 'GET',
						resource: 'dataStore/' + serversPushDatesNamespace + '/' + projectId + "_date",

					}).then(function success(dates) {
						
							if (dates.data.lastPushDateSaved != undefined) {
								register.lastPushDateSaved = dates.data.lastPushDateSaved
							}

						}, function error() {}
						).then(
						() => {
							RemoteApiService.executeRemoteQuery({
								method: 'PUT',
								resource: 'dataStore/' + serversPushDatesNamespace + '/' + projectId + "_date",
								data: register
							})
								.then(function success() {
									$scope.sync_result_date = register.lastDatePush;
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
								});
							$scope.sync_result_date = register.lastDatePush;
						})
				}
			);
		}

		$scope.submitValidationRequest = function () {
			var result_date = null;
			var sync_result = null;
			let api_url = commonvariable.url + "/messageConversations";
			var values = { values: [] }

			Info.get().$promise.then(
				info => {
					register = {
						lastDatePush: new Date(info.serverDate).getTime(),
						lastPushDateSaved: lastPushDateSaved
					};
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

									sendMessageOnline(message);
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
							writeRegisterInRemoteServer(projectId)
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

		function sendMessage(message) {
			RemoteApiService.executeRemoteQuery({
				method: 'POST',
				resource: 'messageConversations',
				data: message
			})
		}

		function sendMessageOnline(message) {
			messageConversations.post(message);

		}

		function getMedco(projectId) {
			var medco = [];
			return getMission(projectId).then(mission => {
				return getUsersMissions(mission).then(
					users => {
						//console.log("users");
						//console.log(users);
						for (var user in users) {
							for (var role in users[user].userCredentials.userRoles) {
								if (users[user].userCredentials.userRoles[role].id == "IQ6i3gWsYYa") {
									medco.push({ id: users[user].id });
								}
							}
						}
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
							return mission.organisationUnits[0].users;
						}
					)
				);
			});
		}
	}
];

