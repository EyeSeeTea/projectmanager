Dhis2Api.directive('d2Optionset', function(){
	return{
		restrict: 'E',
		templateUrl: 'directives/optionset/optionsetView.html'
	}
	}); 
Dhis2Api.controller("d2DropdownOptionSetController", ['$scope','$http', 'OptionSet',function ($scope, $http, OptionSet) {
		$scope.ListOptionset = OptionSet.get();
		$scope.selectoptionset = function(osSelected){
			$scope.optionsetName=osSelected.name;
			$scope.optionsetUid=osSelected.id;
		}
}]);