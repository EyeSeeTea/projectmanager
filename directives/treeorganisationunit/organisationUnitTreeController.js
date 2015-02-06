Dhis2Api.directive('d2Treeorganisationunit', function(){
	return{
		restrict: 'E',
		templateUrl: 'directives/treeorganisationunit/organisationUnitTreeView.html'
	}
	}); 
Dhis2Api.controller("d2TreeorganisationUnitController", ['$scope','TreeOrganisationunit',"commonvariable", function ($scope,TreeOrganisationunit,commonvariable) {
	$scope.treeOrganisationUnit=[];
	TreeOrganisationunit.get({filter:'level:eq:1'}).$promise.then(function(response){
		$scope.treeOrganisationUnit=response.organisationUnits;
	});
}]);

