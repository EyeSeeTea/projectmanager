
appManagerMSF.controller('resetpasswdController', ["$scope",'$filter', 'UsersByUserRole', 'User',  function($scope, $filter, UsersByUserRole, User) {
	var $translate = $filter('translate');
	
	$scope.progressbarDisplayed = false;
	
	function resetPassword(uidrole) {
		UsersByUserRole.get({idrole:uidrole}).$promise.then(function(data){
		
			angular.forEach(data.users, function (value, key){
			
				User.get({iduser:value.id}).$promise.then(function(data){
				
					var username = "username";
					var password = "password";
				
					data.userCredentials [username] = data.userCredentials.code;
					data.userCredentials [password] = $scope.role1;
				
				
					User.put({iduser:value.id},data).$promise.then(function(response){
						console.log(response);						
					});
				
				
				});
			
			});
			
			$scope.progressbarDisplayed = false;
	
		});

	}
	
	$scope.resetpass = function () {
		
		$scope.progressbarDisplayed = true;
		
		resetPassword('N4dxeOVu7aN');
		
		
		
	}	
	
	
	
		/*UsersByUserRole.get({idrole:'N4dxeOVu7aN'}).$promise.then(function(data){
			
			angular.forEach(data.users, function (value, key){
				
				getUser.get({iduser:value.id}).$promise.then(function(data){
					
					var username = "username";
					var password = "password";
					
					data.userCredentials [username] = data.userCredentials.code;
					data.userCredentials [password] = $scope.role1;
					
					
					getUser.put({iduser:value.id},data).$promise.then(function(response){
						console.log(response);						
					})
					
					
				});
				
			});
		
		});
	
	};
	
	*/
	
		
}]);