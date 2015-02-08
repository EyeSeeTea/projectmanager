appManagerMSF.controller('dataexportController', ["$scope",'$filter', "commonvariable", "DataSetsUID", function($scope, $filter, commonvariable, DataSetsUID) {
		var $translate = $filter('translate');
		

		$scope.dataexport=function(){
			
			var fecha_inicio=$filter('date')($scope.start_date,'yyyy-MM-dd');
			var fecha_fin=$filter('date')($scope.end_date,'yyyy-MM-dd');
			
			var orgUnit=commonvariable.OrganisationUnit;
			
			console.log(fecha_inicio);
			console.log(fecha_fin);
			console.log(orgUnit);
			
			var result=DataSetsUID.get();	
			
			console.log(result);
		}

}]);