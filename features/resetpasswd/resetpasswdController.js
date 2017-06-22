
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

var resetPassword = ["$scope",'$filter', 'UsersByUserRole', 'User', 'FilterResource', 'UserService',  function($scope, $filter, UsersByUserRole, User, FilterResource, UserService) {
	
	$scope.progressbarDisplayed = false;
	$scope.countUsers = 0;
	var totalUsers = 0;

    $scope.user = {project: {}};
    $scope.projectUsers = [];
    $scope.password = {};

	// Variable to control
	$scope.individualProgressStatus = {
		visible: false,
		type: "info",
		value: 0,
		active: false
	};

    // Password reset is based on projects. If user orgunit is not a project, ask him to select one.
    // Again, lets suppose users have ONE orgunit assigned
    UserService.getCurrentUser().then(function(currentUser) {
        if (currentUser.organisationUnits[0].level === 4) {
            $scope.user.project = currentUser.organisationUnits[0];
            loadProjectUsers();
        }
    });

    function loadProjectUsers () {
        if ($scope.user.project.id){
            UserService.getProjectUsers($scope.user.project).then(function(projectUsers) {
                $scope.projectUsers = projectUsers;
            });
        }
    }

    $scope.resetProjectPassword = function (){
        // Filter projectUser by selected property, and remove property
        var targetUsers = $scope.projectUsers.filter(function(user){
            return user.selected;
        }).map(function(filteredUser){
            var userCopy = $.extend({}, filteredUser);
            delete userCopy.selected;
            return userCopy;
        });

        if (targetUsers.length > 0) {
            $scope.resetPasswordResult = {
                total: targetUsers.length,
                updated: 0,
                done: false
            };
			$scope.individualProgressStatus = {
				visible: true,
				type: "info",
				active: true,
				value: ($scope.resetPasswordResult.updated / $scope.resetPasswordResult.total)
			};
            angular.forEach(targetUsers, function (user) {
                UserService.updateUserPassword(user, $scope.password.new).then(function (result) {
                    if (result.status === "OK") {
						console.info("Password reset for username " + user.userCredentials.username);
                        $scope.resetPasswordResult.updated++;
						$scope.individualProgressStatus.value =
							100 * ($scope.resetPasswordResult.updated / $scope.resetPasswordResult.total);
                        if ($scope.resetPasswordResult.updated === $scope.resetPasswordResult.total) {
                            $scope.individualProgressStatus.type = "success";
							$scope.individualProgressStatus.active = false;
                            $scope.resetPasswordResult.done = true;
                        }
                    }
                },
				function(someError) {
					$scope.individualProgressStatus.type = "danger";
					$scope.individualProgressStatus.active = false;
					console.log("Error while updating user passwords");
				});
            });
        }
    };

    // Watch for changes in user.project variable. If changes, reload project users
    $scope.$watch(
        function(){
            return $scope.user.project;
        },
        function(){
            loadProjectUsers();
        }
    );


	
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
		
	};
	
	$scope.$watch(
			function($scope) {
				if(totalUsers!=0){
					if (totalUsers == $scope.countUsers) {
						$scope.progressbarDisplayed = false;
						$scope.showresult=true;						
					}
			}
			});
	
	
	

		
}];

module.exports = resetPassword;