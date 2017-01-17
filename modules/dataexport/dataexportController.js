

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

appManagerMSF.controller('dataexportController', ["$scope", "$q", "$filter", "commonvariable", "DataSetsUID", "DataExport", 'DemographicsService', '$timeout', function($scope, $q, $filter, commonvariable, DataSetsUID, DataExport, DemographicsService, $timeout) {

	// Set "zipped" to true by default
	$scope.zipped = true;

	$scope.demographicsSelected = false;
	var currentYear = (new Date()).getFullYear();
	$scope.availableYears = [currentYear - 3, currentYear - 2, currentYear - 1, currentYear, currentYear + 1];
	$scope.demographicsYear = currentYear;
	var demographicsDatasets = ["DS_DEM", "DS_POP_Q"];

	//new component for datepiker helder
	 $scope.today = function() {
		 $scope.dt = new Date();
	 };

	$scope.today();

	$scope.clear = function () {
		$scope.dt = null;
	};

	$scope.openstart = function($event) {				
		$event.preventDefault();
		$event.stopPropagation();

		$scope.openedstart = true;
	};
		
	$scope.openend = function($event) {
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
		
	function RESTUtil() {}

	RESTUtil.requestGetData = function( url, successFunc, failFunc ) {
		return $.ajax({
			type: "GET",
			dataType: "json",
			url: url,
			async: true,
			success: successFunc,
			error: failFunc
		});
	};
	
	function updateprocess() {
		$scope.dataExportStatus.visible = false;
	}
	
	$scope.submit = function() {
		
		$scope.dataExportStatus.visible = true;
		
		var api_url=commonvariable.url+"/dataValueSets.json?";

		var boundDates = getBoundDates();
		var fileName = getFilename();
		var orgUnits = commonvariable.OrganisationUnitList;

		updateDemographicIfNeeded()
			.then(getDatasets)
			.then(function(dataSets) {

			var dataset_filter = dataSets.reduce(function(list, dataset) {
				return list + "dataSet=" + dataset.id + "&";
			},"");

			var orgUnits_filter = orgUnits.reduce(function(list, orgunit) {
				return list + "&orgUnit=" + orgunit.id;
			}, "");

			api_url = api_url + dataset_filter +
				"startDate=" + boundDates.start + "&endDate=" + boundDates.end +
				orgUnits_filter + "&children=true";

			RESTUtil.requestGetData (api_url,

			function(data){

				if($scope.zipped){
					var zip = new JSZip();
					zip.file(fileName + '.json', JSON.stringify(data));
					zip.generateAsync({type:"blob", compression:"DEFLATE"})
						.then(function(content) {
							saveAs(content, fileName + '.json.zip');
						});
				}
				else{
					var file = new Blob([JSON.stringify(data)], { type: 'application/json' });
					saveAs(file, fileName + '.json');
				}
				$timeout(updateprocess, 5);
			});
		});
	};

	var updateDemographicIfNeeded = function() {
		if ($scope.demographicsSelected) {
			return DemographicsService.updateDemographicData();
		} else {
			return $q.when("No demographics needed");
		}
	};

	var getDatasets = function() {
		var filter = $scope.demographicsSelected ? {filter: "code:in:[" + demographicsDatasets.join(",") + "]"} : {};
		return DataSetsUID.get(filter).$promise.then(function(data){
			if(data.dataSets.length > 0) {
				return data.dataSets;
			} else {
				$q.reject("No data set");
			}
		});
	};

	var getFilename = function() {
		var today = new Date();
		var dd = (today.getDate()<10 ? '0' + today.getDate() : today.getDate());
		var mm = (today.getMonth()<9 ? '0' + (today.getMonth()+1) : today.getMonth());
		var yyyy = today.getFullYear();

		return $scope.file_name + "_" + yyyy + mm + dd;
	};

	var getBoundDates = function() {
		if ($scope.demographicsSelected) {
			return {
				start: $scope.demographicsYear + "-01-01",
				end: $scope.demographicsYear + "-12-31"
			}
		} else {
			return {
				start: $filter('date')($scope.start_date,'yyyy-MM-dd'),
				end: $filter('date')($scope.end_date,'yyyy-MM-dd')
			}
		}
	};
}]);