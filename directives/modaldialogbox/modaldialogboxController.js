Dhis2Api.directive('d2Modaldialogbox', function(){
	return{
		restrict: 'E',
		templateUrl: 'directives/modaldialogbox/modaldialogboxView.html',
		scope: {
		      menuoption: '@'
		    }
	}
	}); 
Dhis2Api.controller("d2modaldialogboxController", ['$scope','$modal',function ($scope, $modal) {
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

Dhis2Api.controller('ModalConfirmCtrl', function ($scope, $modalInstance,information) {
	$scope.information=information;
	  $scope.ok = function () {
	    $modalInstance.close($scope.information.op);
	  };

	  $scope.cancel = function () {
	    $modalInstance.dismiss('cancel');
	  };
	});