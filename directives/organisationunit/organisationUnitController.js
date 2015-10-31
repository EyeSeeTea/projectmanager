
/* 
   Copyright (c) 2015.
 
   This file is part of Project Manager.
 
   Project Manager is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.
 
   Project Manager is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.
 
   You should have received a copy of the GNU General Public License
   along with Project Manager.  If not, see <http://www.gnu.org/licenses/>. */


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