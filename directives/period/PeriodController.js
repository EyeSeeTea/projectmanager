Dhis2Api.directive('d2DrowdownPeriod', function(){
	return{
		restrict: 'E',
		templateUrl: 'directives/period/PeriodView.html'
	}
	}); 
Dhis2Api.controller("2DrowdownPeriodController", ['$scope','$http', 'GetPeriod',function ($scope, $http,GetPeriod) {
		$scope.ListPeriod = GetPeriod.get();
		$scope.selectPeriod = function(PeriodSelected){
			$scope.periodName=PeriodSelected.name;
			$scope.periodUid=PeriodSelected.id;
		}
}]);