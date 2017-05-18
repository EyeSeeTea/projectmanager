
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

var analytics = ["$scope", "AnalyticsService", "DemographicsService", function($scope, AnalyticsService, DemographicsService) {

	$scope.progressStatus = {};

	$scope.analytics = function () {

		$scope.progressStatus = {
			visible: true,
			active: true,
			type: 'info',
			value: 100
		};
		$scope.summaryDisplayed = true;
		$scope.notifications = [];

		DemographicsService.updateDemographicData()
			.then(AnalyticsService.refreshAllAnalytics)
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
					$scope.notifications.push(notification);
				}
			);
	};
	
}];

module.exports = analytics;