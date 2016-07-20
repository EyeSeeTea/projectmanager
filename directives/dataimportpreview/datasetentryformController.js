
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



Dhis2Api.directive('d2DatasetEntryForm', function(){
	return{
		restrict: 'E',
		templateUrl: 'directives/dataimportpreview/datasetentryformView.html',
		scope: {
			periodId: '=',
			datavalues: '=',
			datasets: '=',
			orgunit: '='
		}
	};
});

Dhis2Api.controller('d2DatasetEntryFormController',['$scope', 'DataSetEntryForm', 'commonvariable', 'DataImportService', 
	function($scope, DataSetEntryForm, commonvariable, DataImportService){
	
	function init(){
		$scope.clickDataset(null);

		$scope.datasets = filterDatasetByPeriod( $scope.datasets, $scope.periodId );
		
		var dsNum = $scope.datasets.length;
		var dsCount = 0;
		if ( dsNum > 0){
			$scope.datasetsReady = false;
			$scope.progressbarDisplayed = true;
			
			angular.forEach($scope.datasets, function(dataset, index){
				$scope.progressbarDisplayed = true;
				DataSetEntryForm.get({dataSetId: dataset.id}).$promise.then(function(dataSetHtml){
					var codeHtml = dataSetHtml.codeHtml;
					
					// Replace unique id='tabs'
					codeHtml = codeHtml.replace(/id="tabs"/g, 'id="tabs-' + dataset.id + '"' );
					
					$("#" + dataset.id).append(codeHtml);
								
					dsCount++;
					if(dsCount == dsNum){
						$scope.formatDatasets();
						$scope.fillDatavalues();
						
						//Initialize dataset to first one
						$scope.clickDataset($scope.datasets[0].id);
						$scope.datasetsReady = true;
						$scope.progressbarDisplayed = false;
					}
				});
			});
		}
	}

	function filterDatasetByPeriod( datasets, periodId ){
		var periodType = DataImportService.getPeriodType( periodId );
		return datasets.filter( function( dataset ){
			return dataset.periodType === periodType;
		});
	}

	$scope.formatDatasets = function(){
		// Remove section filters
		$(".sectionFilter").remove();
		
		// Set entryfields as readonly
		$(".entryfield").prop("readonly", true);
		
		// Set some layout to tables
		$(".sectionTable").addClass("table table-condensed table-bordered table-striped");
		
		// Modify titles of sections to place them as section header
		var sectionLinks = $("div[id^='tabs-'] > ul > li > a");
		sectionLinks.each( function(){
			var sectionId = $(this).attr("href");
			if (sectionId.startsWith("#")) {sectionId = sectionId.substring(1);}
			
			$("#" + sectionId).prepend("<h3>" + $(this).html() + "</h3>");
			$(this).parent().remove();
		});
		
		// Add click event listeners to entryfields
		$(".entryfield").click(function(){
			var idtokens = $( this ).attr("id").split("-");
			var de = idtokens[0];
			var co = idtokens[1];
			$scope.datahistory = commonvariable.url + "charts/history/data.png?de=" + de + "&co=" + co + "&ou=" 
				+ $scope.orgunit + "&pe=" + $scope.periodId;
			$scope.$apply();
			$("#dataValueHistory").modal();
		});
	};
	
	$scope.hideHistory = function(){
		$scope.datahistory = null;
		$("#dataValueHistory").modal("hide");
	}
	
	$scope.fillDatavalues = function(){
		angular.forEach($scope.datavalues, function(datavalue){
			var valueCell = $("#" + datavalue.dataElementId + "-" + datavalue.categoryOptionId + "-val");
			
			// Check if the dataelement cell exists
			if( valueCell.length == 1 ){
				if (valueCell.val().length > 0){
					valueCell.val( parseFloat( valueCell.val() ) + parseFloat( datavalue.value ) );
				} else {
					valueCell.val( datavalue.value );
				}
			} else {
				// TODO Manage not present dataelements
			}
		});
	};
	
	$scope.clickDataset = function(datasetId){
		$scope.selectedDataset = datasetId;
	}
	
	init();
}]);