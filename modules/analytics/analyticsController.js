
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


appManagerMSF.controller('analyticsController', ["$scope", "AnalyticsService", "DemographicsService", function($scope, AnalyticsService, DemographicsService) {

	$scope.progressbarDisplayed = false;

	$scope.analytics = function () {

		$scope.progressbarDisplayed = true;
		$scope.summaryDisplayed = true;

		DemographicsService.updateDemographicData()
			.then(AnalyticsService.refreshAnalytics)
			.then(
				function (success) {
					$scope.progressbarDisplayed = false;
				},
				function (error) {
					$scope.progressbarDisplayed = false;
					// TODO Alert about the error
				},
				function (dataElement) {
					$('#notificationTable tbody').prepend('<tr><td>' + dataElement.time + '</td><td>' + dataElement.message + '</td></tr>');
				}
			);
	};
	
}]);