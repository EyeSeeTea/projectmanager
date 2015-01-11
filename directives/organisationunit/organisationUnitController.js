Dhis2Api.directive('d2Dropdownorganisationunit', function(){
	return{
		restrict: 'E',
		templateUrl: 'directives/organisationunit/organisationUnitView.html'
	}
	}); 
Dhis2Api.controller("d2DropdownOrganisationUnitController", ['$scope','GetOrganisationunit', function ($scope,GetOrganisationunit) {
	$scope.findOrganisationunitbyName = function(nameOu) {
			return GetOrganisationunit.ByName({filter:'name:like:'+nameOu})
			.$promise.then(function(response){
				//console.log(response.organisationUnits);
				return response.organisationUnits;
			 })};
	$scope.onchangeou = function(organisationUnitSelected){
			 $scope.OUSelect=organisationUnitSelected;
			 console.log($scope.OUSelect);
			};

}]);