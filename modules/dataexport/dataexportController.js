appManagerMSF.controller('dataexportController', ["$scope",'$filter', "commonvariable", "DataSetsUID", function($scope, $filter, commonvariable, DataSetsUID) {
		var $translate = $filter('translate');
		

		$scope.dataexport=function(){
			
			var texto=$filter('date')($scope.start_date,'yyyy-MM-dd');
			
			alert(texto);
			
			var result=DataSetsUID.get();					
		}

}]);