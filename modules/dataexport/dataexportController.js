

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

appManagerMSF.controller('dataexportController', ["$scope",'$filter', "commonvariable", "DataSetsUID", "DataExport",'$timeout', function($scope, $filter, commonvariable, DataSetsUID, DataExport,$timeout) {
		var $translate = $filter('translate');

	// Set "zipped" to true by default
	$scope.zipped = true;

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
	$scope.progressbarDisplayed = false;
		
	function RESTUtil() {}

	RESTUtil.requestGetData = function( url, successFunc, failFunc ) 
		{
				return $.ajax({
					type: "GET",
					dataType: "json",
					url: url,
					async: true,
					success: successFunc,
					error: failFunc
				});
		}
	
	function updateprocess() {
		$scope.progressbarDisplayed = false;
	}
	
	$scope.submit=function(){
		{			
			
		$scope.progressbarDisplayed = true;
		
		var api_url=commonvariable.url+"/dataValueSets.json?";

		var fecha_inicio=$filter('date')($scope.start_date,'yyyy-MM-dd');
		var fecha_fin=$filter('date')($scope.end_date,'yyyy-MM-dd');

		var orgUnits=commonvariable.OrganisationUnitList;
		var result=DataSetsUID.get();
		
		
		
		//include current date in the file name, Helder
		var today = new Date();
		var dd = (today.getDate()<10?'0'+today.getDate():today.getDate());
		var mm = (today.getMonth()<9?'0'+(today.getMonth()+1):today.getMonth());
		var yyyy = today.getFullYear();

		//////
		var fileName =  $scope.file_name+"_"+yyyy+mm+dd;
		
		var orgUnits_filter="";
		
		result.$promise.then(function(data) {
			var datasets=data.dataSets;			
							
			if (datasets.length>0)
			{
				var dataset_filter="";
				
				for (var i=0;i<datasets.length;i++)
					dataset_filter = dataset_filter+"dataSet="+datasets[i].id+"&";					

				$.each(orgUnits, function(index,value){
					orgUnits_filter=orgUnits_filter+"&orgUnit="+value.id;
				});					
				
				api_url=api_url+dataset_filter+"startDate="+fecha_inicio+"&endDate="+fecha_fin + 
					orgUnits_filter+"&children=true";
				
				
				RESTUtil.requestGetData (api_url,
						
				function(data){
					
					if($scope.zipped){
						var zip = new JSZip();
						zip.file(fileName + '.json', JSON.stringify(data));
						var content = zip.generate({type:"blob", compression:"DEFLATE"});
						saveAs(content, fileName + '.json.zip');
					}
					else{
						var file = new Blob([JSON.stringify(data)], { type: 'application/json' });												
						saveAs(file, fileName + '.json');
					}
					$timeout(updateprocess, 5);
				});
									
			}
			
		});
		}
	}
}]);