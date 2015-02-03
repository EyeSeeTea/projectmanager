Dhis2Api.directive('d2Dropdownorganisationunit', function(){
	return{
		restrict: 'E',
		templateUrl: 'directives/organisationunit/organisationUnitView.html'
	}
	}); 
Dhis2Api.controller("d2DropdownOrganisationUnitController", ['$scope','Organisationunit','OrganisationunitLevel',"commonvariable", function ($scope,Organisationunit,OrganisationunitLevel,commonvariable) {
	
	OrganisationunitLevel.get().$promise.then(function(response){
		$scope.OrganisationunitLevels=response.organisationUnitLevels;
		console.log()
	});
	$scope.findOrganisationunitbyName = function(nameOu) {
			return Organisationunit.get({filter:'name:startsWith:'+nameOu})
			.$promise.then(function(response){
				for( var i = 0; i <  response.organisationUnits.length; i++ ) { 
					 response.organisationUnits[i].level=$scope.OrganisationunitLevels[response.organisationUnits[i].level].name
				}
				return  response.organisationUnits;
			 })};
	$scope.onSelect = function ($item, $model, $label) {
			commonvariable.OrganisationUnit = $item;
		   };

}]);