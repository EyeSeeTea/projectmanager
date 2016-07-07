

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


Dhis2Api.directive('d2Secondarymenu', function(){
	return{
		restrict: 'E',
		templateUrl: 'directives/menu/menuView.html',
		controller: ['$scope', 'commonvariable', 'meUser', function($scope, commonvariable, meUser){

			$scope.isOnline = commonvariable.isOnline;

			// Check if current user is in Administrator group
			$scope.isAdministrator = false;
			meUser.get().$promise.then(function(me) {
				angular.forEach(me.userGroups, function(userGroup){
					if(userGroup.name === 'Administrators'){
						$scope.isAdministrator = true;
					}
				})
			});
		}]
	}
});
