appManagerMSF.controller('dataapprovalController', ["$scope",'$filter', function($scope, $filter) {
	var $translate = $filter('translate');
    $scope.title = $translate('DATA_APPROVAL'); 
}]);