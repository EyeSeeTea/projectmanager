Dhis2Api.directive('d2Drowdowndataset', function(){
	return{
		restrict: 'E',
		templateUrl: 'directives/dataset/dataSetView.html'
	}
	}); 
Dhis2Api.controller("d2DrowdowndatasetController", ['$scope','$http', 'GetDatasetDAppr',function ($scope, $http,GetDatasetDAppr) {
		$scope.ListDataset = GetDatasetDAppr.get();
		$scope.selectDataset = function(dsSelected){
			$scope.DatasetName=dsSelected.name;
			$scope.DatasetUid=dsSelected.id;
		}
}]);