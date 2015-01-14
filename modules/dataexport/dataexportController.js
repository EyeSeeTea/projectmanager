appManagerMSF.controller('dataexportController', ["$scope",'$filter', "commonvariable", "DataSetsUID", function($scope, $filter, commonvariable, DataSetsUID) {
		var $translate = $filter('translate');
		

		$scope.dataexport=function(){
			var result=DataSetsUID.get();
			
		
		}
}]);