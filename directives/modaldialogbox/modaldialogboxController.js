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