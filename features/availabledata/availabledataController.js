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

var availableData = ["$scope", "$q", "$http", "$parse",
	"Organisationunit", "OrganisationUnitGroupSet", "OrgunitGroupSetService", "UserService", "userDataStoreService", "AnalyticsService",
	function($scope, $q, $http, $parse, Organisationunit,
			 OrganisationUnitGroupSet, OrgunitGroupSetService, UserService, userDataStoreService, AnalyticsService) {

		$scope.availableDataStatus = {
			visible: false,
			type: "info",
			value: 100,
			active: true
		};
		$scope.availablePeriods = [
			{id: "LAST_3_MONTHS", name: 3},
			{id: "LAST_6_MONTHS", name: 6},
			{id: "LAST_12_MONTHS", name: 12}
		];
		$scope.selectedPeriod = {
			id: "LAST_6_MONTHS"
		};

		$scope.availableFilters = [
			{id:"BtFXTpKRl6n", name: "1. Health Service"}
		];

		var selectedFilters = {};

		var orgunitsInfo = {};

		var loadUserSettings = function() {
			return userDataStoreService.getCurrentUserSettings().then(function(userSettings) {
					if(userSettings.availableData.period != null)
						$scope.selectedPeriod = userSettings.availableData.period;
					if(userSettings.availableData.filters != null)
						selectedFilters = userSettings.availableData.filters;
				},
				function(error){
					console.log("There are not settings for current user");
				});
		};

		var loadFilters = function(){
			return OrgunitGroupSetService.getOrgunitGroupSets($scope.availableFilters)
				.then(function(filters){
					$scope.availableFilters = filters;
					// Preselect filters
					angular.forEach($scope.availableFilters, function(filter){
						filter.selected = selectedFilters[filter.id];
					});
				});
		};

		var loadTable = function(){

			// Initialize common variables
			$scope.tableRows = [];
			orgunitsInfo = {};

			// Initialize visibility of table and progressBar
			$scope.tableDisplayed = false;
			$scope.availableDataStatus.visible = true;
			
			UserService.getCurrentUser().then(function(me){
				var dataViewOrgUnits = me.dataViewOrganisationUnits;

				var k = dataViewOrgUnits.length;
				var currentOu = 0;
				angular.forEach(dataViewOrgUnits, function(dataViewOrgUnit){
					var parentPromise = AnalyticsService.queryAvailableData(dataViewOrgUnit, $scope.selectedPeriod, selectedFilters);
					var childrenPromise = AnalyticsService.queryAvailableData(dataViewOrgUnit.children, $scope.selectedPeriod, selectedFilters);

					// Add orgunits to orgunitsInfo. That info will be required later.
					orgunitsInfo[dataViewOrgUnit.id] = dataViewOrgUnit;
					$.map(dataViewOrgUnit.children, function(child){orgunitsInfo[child.id] = child;});

					$q.all([parentPromise, childrenPromise])
						.then(function(analyticsData){
							var parentResult = analyticsData[0];
							var childrenResult = analyticsData[1];

							// Generate public period array. It is required for other functions
							regenerateScopePeriodArray(parentResult);

							var parentRows = AnalyticsService.formatAnalyticsResult(parentResult, orgunitsInfo, []);
							var childrenRows = AnalyticsService.formatAnalyticsResult(childrenResult, orgunitsInfo, [dataViewOrgUnit.id]);
							$scope.tableRows = $scope.tableRows.concat(parentRows).concat(childrenRows);
							
							// Make visible orgunits under dataViewOrgunit
							orgunitsInfo[dataViewOrgUnit.id].clicked = true;

							// Check if last dataViewOrgunit
							if(k === ++currentOu){  
								$scope.tableDisplayed = true;
								$scope.availableDataStatus.visible = false;
							}
						});
				});
			});
		};

		var regenerateScopePeriodArray = function (analyticsResponse) {
			$scope.periods = [];
			angular.forEach(analyticsResponse.metaData.dimensions.pe, function(pe){
			
				$scope.periods.push({
					id: pe,
					//name: "period"
					name: analyticsResponse.metaData.items[pe].name
				})
			});
			
		};

		$scope.isClicked = function(orgunitIds){
			var clicked = true;
			$.each(orgunitIds, function(index, orgunitId){
				if(!orgunitsInfo[orgunitId].clicked === true){
					clicked = false;
				}
			});
			return clicked;
		};

		$scope.clickOrgunit = function(orgunit){
			if(orgunitsInfo[orgunit.id].clicked){
				orgunitsInfo[orgunit.id].clicked = false;
			} else {
				orgunitsInfo[orgunit.id].clicked = true;
				if(!childrenLoaded(orgunit.id)){
					loadChildren(orgunit);
				}
			}
		};

		var loadChildren = function(orgunit) {
			// Add a loading icon and save the reference
			var loadingIcon = addLoadingIcon(orgunit.id);

			var childrenInfo = Organisationunit.get({
				paging: false,
				fields: "id,name,level,children",
				filter: "id:in:[" + orgunitsInfo[orgunit.id].children.map(function(child){return child.id;}).join(",") + "]"
			}).$promise;

			var childrenQuery = AnalyticsService.queryAvailableData(orgunitsInfo[orgunit.id].children, $scope.selectedPeriod,
				selectedFilters);

			$q.all([childrenInfo, childrenQuery])
				.then(function(data){
					var childrenInfo = data[0].organisationUnits;
					// Add children information to orgunitsInfo
					$.map(childrenInfo, function(child){
						orgunitsInfo[child.id] = child;
					});

					// Add analytics information to table
					var childrenResult = data[1];
					var childrenHierarchy = orgunit.parents.slice(0);
					childrenHierarchy.push(orgunit.id);
					var childrenRows = AnalyticsService.formatAnalyticsResult(childrenResult, orgunitsInfo, childrenHierarchy);
					$scope.tableRows = $scope.tableRows.concat(childrenRows);

				})
				.finally(function(){
					// Once finished, remove loadingIcon
					loadingIcon.remove();
				});
		};

		var childrenLoaded = function(orgunitId){
			var children = orgunitsInfo[orgunitId].children;
			for(var i = 0; i < children.length; i++){
				if(orgunitsInfo[children[i].id] != undefined) {
					return true;
				}
			}
			return false;
		};

		var addLoadingIcon = function(orgunitId){
			var orgunitRow = $("#ou_" + orgunitId);
			orgunitRow.append("<span class='children-loading-icon glyphicon glyphicon-repeat'></span>");
			return (orgunitRow.find(".children-loading-icon"));
		};

		$scope.modifyFilter = function(filter){
			if(filter.selected === undefined || filter.selected === null){
				delete selectedFilters[filter.id];
			} else {
				// Update filter information
				selectedFilters[filter.id] = filter.selected;
			}

			/*
			var filterSetting = {};
			filterSetting = {
				"key": "filters",
				"value": selectedFilters
			};

			DataStoreService.updateCurrentUserSettings("availableData", filterSetting)
				.then(function () {
					console.log("settings updated");
				});
			**/

			loadTable();
		};

		$scope.modifyPeriod = function(period){
			$scope.selectedPeriod = {
				id: period.id,
				name: period.name
			};

			var periodSetting = {
				"key": "period",
				"value": $scope.selectedPeriod
			};

			userDataStoreService.updateCurrentUserSettings("availableData", periodSetting)
				.then(function() {});

			loadTable();
		};

		// Initialize table
		loadUserSettings().then(loadFilters).then(loadTable);
	}
];

module.exports = availableData;