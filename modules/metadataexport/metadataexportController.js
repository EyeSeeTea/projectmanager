appManagerMSF.controller('metadataexportController', ["$scope",'$filter', "MetaDataExport", function($scope, $filter, MetaDataExport) {
	var $translate = $filter('translate');
	
	$scope.progressbarDisplayed = false;
	
	$scope.submit=function(){
		//Show progress bar 
		$scope.progressbarDisplayed = true;
		
		var result = MetaDataExport.get();
		var fileName = this.file_name;
		result.$promise.then(function(data) {
			var file = new Blob([JSON.stringify(data.toJSON())], { type: 'application/json' });
			//Hide progress bar
			$scope.progressbarDisplayed = false;
            saveAs(file, fileName + '.json');
    	});
	};
		
}]);