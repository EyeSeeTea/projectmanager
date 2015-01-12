Dhis2Api.directive('d2Dropdownorganisationunit', function(){
	return{
		restrict: 'E',
		templateUrl: 'directives/organisationunit/organisationUnitView.html'
	}
	}); 
Dhis2Api.controller("d2DropdownOrganisationUnitController", ['$scope','Organisationunit',"commonvariable", function ($scope,Organisationunit,commonvariable) {
	$scope.findOrganisationunitbyName = function(nameOu) {
			return Organisationunit.get({filter:'name:like:'+nameOu})
			.$promise.then(function(response){
				//console.log(response.organisationUnits);
				return response.organisationUnits;
			 })};
	$scope.onSelect = function ($item, $model, $label) {
			commonvariable.OrganisationUnit = $item;
		   };

}]);