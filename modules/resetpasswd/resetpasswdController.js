
appManagerMSF.controller('resetpasswdController', ["$scope",'$filter', 'UsersByUserRole', 'getUser',  function($scope, $filter, UsersByUserRole, getUser) {
	var $translate = $filter('translate');
	
	$scope.resetpass = function () {
	
	
		UsersByUserRole.get({idrole:'N4dxeOVu7aN'}).$promise.then(function(data){
			
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
	
		
}]);