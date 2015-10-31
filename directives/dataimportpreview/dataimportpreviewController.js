
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
	
	$scope.progressbarDisplayed = true;
	
	// Read import file
	var compress = false;
	var fileContent;
	var fileReader = new FileReader();
	
	if ($scope.isCompress) {
		fileReader.readAsArrayBuffer($scope.importFile);
	} else {
	    fileReader.readAsText($scope.importFile);
	}
	
    fileReader.onload = function(e) {
    	
    	fileContent = e.target.result;
    	
    	if ($scope.isCompress) {
    		
    		var zip = new JSZip(e.target.result);
			
			$.each(zip.files, function (index, zipEntry) {
				fileContent = zip.file(zipEntry.name).asText();
			});
    	}		        	
    	
    	var dataValues = JSON.parse(fileContent).dataValues;
    	var data = {};
    	
    	angular.forEach(dataValues, function(dataValue){
    		var value = {
    				dataElementId: dataValue.dataElement,
    				categoryOptionId: dataValue.categoryOptionCombo,
    				value: dataValue.value
    		};
    		if(data[dataValue.orgUnit] === undefined ){
    			data[dataValue.orgUnit] = {periods:{}};
    		}
    		if(data[dataValue.orgUnit]['periods'][dataValue.period] === undefined){
    			data[dataValue.orgUnit]['periods'][dataValue.period] = [];
    		}
    		data[dataValue.orgUnit]['periods'][dataValue.period].push(value);
    	});
    	
    	var healthCenters = {};
    	var kvalue = 0;
    	var num = Object.keys(data).length;
    	angular.forEach(data, function(value, serviceId){
    		Organisationunit.get({filter: 'id:eq:' + serviceId, fields: 'id,name,parent,dataSets[id,name]'})
    				.$promise.then(function(service){
    					
    			var parent = service.organisationUnits[0].parent;
    			if (healthCenters[parent.id] === undefined ){
    				healthCenters[parent.id] = {children:{}};
    			}
    			if (healthCenters[parent.id].name === undefined ){
    				healthCenters[parent.id].name = parent.name;
    			}
    			value.dataSets = service.organisationUnits[0].dataSets; 
    			healthCenters[parent.id]['children'][serviceId] = value;
    			healthCenters[parent.id]['children'][serviceId].name = service.organisationUnits[0].name;
    			
    			kvalue++;
    			if ( kvalue==num ){
        			$scope.dataimportdata = healthCenters;
        			console.log(healthCenters);
        			$scope.importLoaded = true;
        			$scope.progressbarDisplayed = false;
    			}
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
	}
	
	$scope.clickPeriod = function(periodId){
		$scope.datasets = $scope.dataimportdata[$scope.siteSelected].children[$scope.serviceSelected].dataSets;
		$scope.datavalues = $scope.dataimportdata[$scope.siteSelected].children[$scope.serviceSelected].periods[periodId];
		$scope.periodSelected = periodId;
	}
	
}]);

Dhis2Api.filter('d2FormatPeriod', function() {
	return function(original){
		var year = original.substring(0,4);
		var period = original.replace(year, '');
		return year + " - " + period;
	};
});