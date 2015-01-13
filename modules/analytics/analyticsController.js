appManagerMSF.controller('analyticsController', ["$scope",'$filter', "commonvariable", "Analytics", function($scope, $filter, commonvariable, Analytics) {
		var $translate = $filter('translate');
		
		$scope.test=function(){
			Analytics.post();
		}
	
}]);