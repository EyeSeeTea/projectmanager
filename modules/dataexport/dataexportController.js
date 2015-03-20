appManagerMSF.controller('dataexportController', ["$scope",'$filter', "commonvariable", "DataSetsUID", "DataExport",'$timeout', function($scope, $filter, commonvariable, DataSetsUID, DataExport,$timeout) {
		var $translate = $filter('translate');
		
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