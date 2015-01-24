Dhis2Api.directive('d2Authorization', function(){
	return{
		restrict: 'E',
		templateUrl: 'directives/authorization/authorizationView.html',
		scope: {
		      menuoption: '@'
		    }
	}
	}); 
Dhis2Api.controller("d2AuthorizationController", ['$scope',"userAuthorization",'$modal',function ($scope,userAuthorization, $modal) {
	var authorization =userAuthorization.get({menuoption:$scope.menuoption});
	authorization.$promise.then(function(data) {
		if(data.status=="false")
			$scope.open();
	});
	
	  $scope.open = function () {

	    var modalInstance = $modal.open({
	      templateUrl: 'myModalContent.html',
	      controller: 'ModalInstanceCtrl',
	      backdrop: false
	    });
  };
}]);

Dhis2Api.controller('ModalInstanceCtrl', function ($scope, $modalInstance) {
	  $scope.cancel = function () {
	    $modalInstance.dismiss('cancel');
	  };
});