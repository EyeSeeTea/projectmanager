appManagerMSF.controller('analyticsController', ["$scope",'$filter', "commonvariable", "Analytics", function($scope, $filter, commonvariable, Analytics) {
		var $translate = $filter('translate');
		
		$scope.analisis=function(){
			Analytics.post();
		}
	
}]);