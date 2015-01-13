appManagerMSF.controller('metadataexportController', ["$scope",'$filter', "commonvariable", "MetaDataExport", function($scope, $filter, commonvariable, MetaDataExport) {
		var $translate = $filter('translate');
		
		$scope.metadataexport=function(){
			var result=MetaDataExport.get();
			

		}
}]);