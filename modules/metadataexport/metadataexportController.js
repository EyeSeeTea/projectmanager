appManagerMSF.controller('metadataexportController', ["$scope",'$filter', "MetaDataExport", function($scope, $filter, MetaDataExport) {
	var $translate = $filter('translate');
	
	$scope.submit=function(){
		var result = MetaDataExport.get();
		var fileName = this.file_name;
		result.$promise.then(function(data) {
			var file = new Blob([JSON.stringify(data.toJSON())], { type: 'application/json' });
            saveAs(file, fileName + '.json');
    	});
	};
		
}]);