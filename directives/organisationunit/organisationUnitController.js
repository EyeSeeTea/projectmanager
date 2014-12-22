Dhis2Api.directive('d2Drowdownorganisationunit', function(){
	return{
		restrict: 'E',
		templateUrl: 'directives/organisationunit/organisationUnitView.html'
	}
	}); 
Dhis2Api.controller("d2DrowdownOrganisationUnitController", ['$scope','$http', 'GetOrganisationunit',function ($scope, $http,GetOrganisationunit) {
		$scope.ListOrganisationunit = GetOrganisationunit.get();
		$scope.selectOrganisationUnit = function(ouSelected){
			$scope.organisationUnitName=ouSelected.name;
			$scope.organisationUnitUid=ouSelected.id;
		}
}]);