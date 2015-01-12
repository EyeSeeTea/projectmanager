Dhis2Api.directive('d2Dropdowndataset', function(){
	return{
		restrict: 'E',
		templateUrl: 'directives/dataset/dataSetView.html'
	}
	}); 
Dhis2Api.controller("d2DropdowndatasetController", ['$scope','$http', 'DatasetDAppr',"commonvariable",function ($scope, $http,DatasetDAppr,commonvariable) {
		$scope.ListDataset = DatasetDAppr.get();
		$scope.selectDataset = function(dsSelected){
			commonvariable.DataSet=dsSelected;
			$scope.DatasetName=dsSelected.name;
		}
}]);