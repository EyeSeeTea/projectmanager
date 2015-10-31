
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


appManagerMSF.controller('resetpasswdController', ["$scope",'$filter', 'UsersByUserRole', 'User', 'FilterResource',  function($scope, $filter, UsersByUserRole, User, FilterResource) {
	var $translate = $filter('translate');
	
	
	$scope.progressbarDisplayed = false;
	$scope.countUsers = 0;
	var totalUsers = 0;
	
	
	function resetPassword(uidrole, newpasswd) {
		
		UsersByUserRole.get({idrole:uidrole}).$promise.then(function(data){
			
			totalUsers=totalUsers + data.users.length;
		
			angular.forEach(data.users, function (value, key){
				
				User.get({iduser:value.id}).$promise.then(function(data){
				
					var username = "username";
					var password = "password";
				
					data.userCredentials [username] = data.userCredentials.code;
					data.userCredentials [password] = newpasswd;
								
					User.put({iduser:value.id},data).$promise.then(function(response){
						if (response.status=="SUCCESS") { 
							$scope.countUsers = $scope.countUsers + 1;
						} else totalUsers = totalUsers - 1;
						
						console.log(response);						
					});				
				
				});


			});
			
				
		});
	}
	
	$scope.resetpass = function () {
		
		$scope.countUsers = 0;
		totalUsers = 0;
		
		$scope.progressbarDisplayed = true;	
		$scope.showresult = false;	
		
		if ($scope.role1 != undefined && $scope.role1!='') {
		
			FilterResource.get({resource:'userRoles', filter:'name:eq:MedCo'}).$promise.then(function(data){
				if (data.userRoles.length>0)
					resetPassword(data.userRoles[0].id, $scope.role1);
			});
		}
		
		if ($scope.role2 != undefined && $scope.role2!='') {		
		
			FilterResource.get({resource:'userRoles', filter:'name:eq:Medical Focal Point'}).$promise.then(function(data){
				if (data.userRoles.length>0)
					resetPassword(data.userRoles[0].id, $scope.role2);
			});
		}
		
		if ($scope.role3 != undefined && $scope.role3!='') {
		
			FilterResource.get({resource:'userRoles', filter:'name:eq:Field User'}).$promise.then(function(data){
				if (data.userRoles.length>0)
					resetPassword(data.userRoles[0].id, $scope.role3);
				
			});		
		}
		
	}	
	
	$scope.$watch(
			function($scope) {
				if(totalUsers!=0){
					if (totalUsers == $scope.countUsers) {
						$scope.progressbarDisplayed = false;
						$scope.showresult=true;						
					}
			}
			});
	
	
	

		
}]);