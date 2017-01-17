
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



Dhis2Api.directive('d2Dataimportpreview', function(){
	return{
		restrict: 'E',
		templateUrl: 'directives/dataimportpreview/dataimportpreviewView.html',
		css: 'directives/dataimportpreview/dataimportpreviewCss.css',
		scope: {
			importFile: '=',
			isCompress: '='
		}
	};
});

Dhis2Api.controller('d2DataimportpreviewController', ['$scope', "Organisationunit", function($scope, Organisationunit){
		
	$scope.importPreviewStatus = {
		visible: true,
		type: "info",
		value: 100,
		active: true
	};
	$scope.msjEmptyFile = false;
	
	// Read import file
	var fileContent;
	var fileReader = new FileReader();
	
	if ($scope.isCompress) {
		fileReader.readAsArrayBuffer($scope.importFile);
	} else {
	    fileReader.readAsText($scope.importFile);
	}
	
    fileReader.onload = function(e) {

    	fileContent = e.target.result;

		new JSZip.external.Promise(
			function (resolve, reject) {
				if ($scope.isCompress) {
					resolve(JSZip.loadAsync(fileContent).then(function(data){
						return data.file(/.json$/)[0].async("string");
					}));
				} else {
					resolve(fileContent);
				}
			})
			.then(function (fileData) {
				var dataValues = JSON.parse(fileData).dataValues;
				var data = {};

				if (dataValues == undefined){
					$scope.msjEmptyFile = true;
					$scope.importPreviewStatus.visible = false;
					return;
				}

				angular.forEach(dataValues, function(dataValue){
					var value = {
						dataElementId: dataValue.dataElement,
						categoryOptionId: dataValue.categoryOptionCombo,
						value: dataValue.value
					};
					if(data[dataValue.orgUnit] === undefined ){
						data[dataValue.orgUnit] = {periods:{}};
						data[dataValue.orgUnit].id = dataValue.orgUnit;
					}
					if(data[dataValue.orgUnit]['periods'][dataValue.period] === undefined){
						data[dataValue.orgUnit]['periods'][dataValue.period] = {
							"id": dataValue.period,
							"values": []
						};
					}
					data[dataValue.orgUnit]['periods'][dataValue.period].values.push(value);
				});

				var healthCenters = {};
				var kvalue = 0;
				var num = Object.keys(data).length;
				angular.forEach(data, function(value, serviceId){
					Organisationunit.get({filter: 'id:eq:' + serviceId, fields: 'id,name,parent[id,name],dataSets[id,name,code,periodType]'}).$promise.then(function(service){
						
						var parent = service.organisationUnits[0].parent;
						if (healthCenters[parent.id] === undefined ){
							healthCenters[parent.id] = {children:{}};
							healthCenters[parent.id].id = parent.id;
							healthCenters[parent.id].name = parent.name;
						}

						value.dataSets = filterDatasets(service.organisationUnits[0].dataSets);
						healthCenters[parent.id]['children'][serviceId] = value;
						healthCenters[parent.id]['children'][serviceId].name = service.organisationUnits[0].name;

						kvalue++;
						if ( kvalue==num ){
							$scope.dataimportdata = healthCenters;
							$scope.importLoaded = true;
							$scope.importPreviewStatus.visible = false;
						}
					});
				});
			});
    };
    
    $scope.clickSite = function(siteId){
		$scope.siteSelected = siteId;
		$scope.services = $scope.dataimportdata[siteId].children;
		$scope.periods = null;
		$scope.periodSelected = null;
	};
	
	$scope.clickService = function(serviceId){
		$scope.serviceSelected = serviceId;
		$scope.periods = $scope.dataimportdata[$scope.siteSelected].children[$scope.serviceSelected].periods;
		$scope.periodSelected = null;
	};
	
	$scope.clickPeriod = function(periodId){
		$scope.datasets = $scope.dataimportdata[$scope.siteSelected].children[$scope.serviceSelected].dataSets;
		$scope.datavalues = $scope.dataimportdata[$scope.siteSelected].children[$scope.serviceSelected].periods[periodId].values;
		$scope.periodSelected = periodId;
	};

	var filterDatasets = function(dataSetsArray){
		dataSetsArray.sort(function(DSa, DSb){
			return DSa.code.localeCompare(DSb.code);
		});

		// We will remove array items, so loop in reverse to not be affected by reindexing
		var previousCode = '';
		for( var i = dataSetsArray.length -1; i >= 0; i--){
			var currentCode = dataSetsArray[i].code;
			if(trimCodeLevel(currentCode) === trimCodeLevel(previousCode)){
				dataSetsArray.splice(i, 1);
			}
			previousCode = currentCode;
		}
		return dataSetsArray;
	};

	// Delete level information, if present
	var trimCodeLevel = function(code){
		if(code === undefined || code.length === 0){
			return '';
		} else {
			var lastChar = code.charAt(code.length - 1);
			if(!isNaN(parseInt(lastChar))){
				return code.substring(0, code.length - 2);
			}
			return code;
		}
	};
	
}]);

Dhis2Api.filter('d2FormatPeriod', function() {
	return function(original){
		var year = original.substring(0,4);
		var period = original.replace(year, '');
		return year + " - " + period;
	};
});