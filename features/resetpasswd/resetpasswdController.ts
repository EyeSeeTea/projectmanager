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

import { UserService } from '../../services/services.module';
import { ProgressStatus } from '../../model/model';

export class ResetPassword {

	static $inject = ['$filter', 'UsersByUserRole', 'User', 'FilterResource', 'UserService'];

	progressbarDisplayed = false;
	countUsers = 0;
	totalUsers = 0;

    user = { project: {id: null} };
    projectUsers = [];
    password = { new: "" };

	// Variable to control
	individualProgressStatus = ProgressStatus.hidden;
	resetPasswordResult

	constructor(private $filter, private UsersByUserRole, private User, private FilterResource,
				private UserService: UserService
	) {
		// Password reset is based on projects. If user orgunit is not a project, ask him to select one.
	    // Again, lets suppose users have ONE orgunit assigned
		this.UserService.getCurrentUser().then( currentUser => {
			if (currentUser.organisationUnits[0].level === 4) {
				this.user.project = currentUser.organisationUnits[0];
				this.loadProjectUsers(this.user.project);
			}
		});
	}
	
	loadProjectUsers (project) {
        if (project.id){
            this.UserService.getProjectUsers(project).then( projectUsers => {
                this.projectUsers = projectUsers;
            });
        }
    }

	resetProjectPassword () {
        // Filter projectUser by selected property, and remove property
        var targetUsers = this.projectUsers
			.filter( user => user.selected)
			.map( filteredUser => {
            	var userCopy = $.extend({}, filteredUser);
            	delete userCopy.selected;
            	return userCopy;
        	});

        if (targetUsers.length > 0) {
            this.resetPasswordResult = {
                total: targetUsers.length,
                updated: 0,
                done: false
            };
			this.individualProgressStatus = ProgressStatus.initialWithProgress;
			this.individualProgressStatus.value = this.resetPasswordResult.updated / this.resetPasswordResult.total;

			targetUsers.forEach( user => {
				this.UserService.updateUserPassword(user, this.password.new).then(
					result => {
						if (result.status === "OK") {
							console.info("Password reset for username " + user.userCredentials.username);
							this.resetPasswordResult.updated++;
							this.individualProgressStatus.value =
								100 * (this.resetPasswordResult.updated / this.resetPasswordResult.total);
							if (this.resetPasswordResult.updated === this.resetPasswordResult.total) {
								this.individualProgressStatus = ProgressStatus.doneSuccessful;
								this.resetPasswordResult.done = true;
							}
						}
                	},
					someError => {
						this.individualProgressStatus = ProgressStatus.doneWithFailure;
						console.log("Error while updating user passwords");
					});
			});
        }
    };

	/** 
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
		
	*/
	
}
