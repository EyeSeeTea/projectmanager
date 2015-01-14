appManagerMSF.controller('metadataexportController', ["$scope",'$filter', "MetaDataExport", function($scope, $filter, MetaDataExport) {
		var $translate = $filter('translate');
		
//		$scope.metadataexport=function(){
		$scope.submit=function(){
			console.log($scope);
			var result=MetaDataExport.get();
			result.$promise.then(function(data) {
				var file = new Blob([JSON.stringify(data.toJSON())], { type: 'application/json' });
	            saveAs(file, 'filename.json');
	    	});
		}
		
		
}]);