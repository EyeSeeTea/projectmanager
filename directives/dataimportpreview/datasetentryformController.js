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

Dhis2Api.controller('d2DatasetEntryFormController',['$scope', 'DataSetEntryForm', 'commonvariable', function($scope, DataSetEntryForm, commonvariable){
	
	var init = function(){
		$scope.clickDataset(null);
		
		
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
			$("#" + datavalue.dataElementId + "-" + datavalue.categoryOptionId + "-val").val(datavalue.value);			
		});
	};
	
	$scope.clickDataset = function(datasetId){
		$scope.selectedDataset = datasetId;
	}
	
	init();
}]);