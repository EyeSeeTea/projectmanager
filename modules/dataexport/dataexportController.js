appManagerMSF.controller('dataexportController', ["$scope",'$filter', "commonvariable", "DataSetsUID", "DataExport", function($scope, $filter, commonvariable, DataSetsUID, DataExport) {
		var $translate = $filter('translate');
		

		$scope.dataexport=function(){
			
			var fecha_inicio=$filter('date')($scope.start_date,'yyyy-MM-dd');
			var fecha_fin=$filter('date')($scope.end_date,'yyyy-MM-dd');
			
			var orgUnit=commonvariable.OrganisationUnit;
			
			var result=DataSetsUID.get();	
						
			result.$promise.then(function(data) {
				
				var datasets=data.dataSets;			
								
				if (datasets.length>0)
				{
					var dataset_filter="";
					
					dataset_filter=datasets[0].id;
					
					for (var i=1;i<datasets.length;i++)
						dataset_filter = dataset_filter+"&dataSet="+datasets[i].id;
					
					var children_orgunits="true";
					
					//Aqui empieza el problema
					
					var dataValues=DataExport.get({dataSet:encodeURIComponent(dataset_filter),startDate:fecha_inicio,
						endDate:fecha_fin,orgUnit:orgUnit.id,children:children_orgunits});
					
					console.log(dataset_filter);
					console.log(dataValues);
				}
				
			});
		}

}]);