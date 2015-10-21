
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
		
			FilterResource.get({resource:'userRoles', filter:'name:eq:MTL'}).$promise.then(function(data){
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