Dhis2Api.directive('d2Optionset', function(){
	return{
		restrict: 'E',
		templateUrl: 'directives/optionset/optionsetView.html'
	}
	}); 
Dhis2Api.controller("d2DropdownOptionSetController", ['$scope','$http', 'GetOptionSet',function ($scope, $http, GetOptionSet) {
		$scope.ListOptionset = GetOptionSet.get();
		$scope.selectoptionset = function(osSelected){
			$scope.optionsetName=osSelected.name;
			$scope.optionsetUid=osSelected.id;
		}
}]);