appManagerMSF.controller('metadataimportController', ["$scope", '$upload', '$filter', "commonvariable", "MetaDataImport", function($scope, $upload, $filter, commonvariable, MetaDataImport) {
		var $translate = $filter('translate');
		
		$scope.progressbarDisplayed = false;
		
		var $file;//single file 
	    $scope.sendFiles= function(){
	    	
	    	$scope.progressbarDisplayed = true;
	    	
	    	var fileReader = new FileReader();
	        fileReader.readAsArrayBuffer($file);
	        fileReader.onload = function(e) {
	            $upload.http({
	                url: commonvariable.url+"metaData",
	                headers: {'Content-Type': 'application/json'},
	                data: e.target.result
	            }).progress(function(ev) {
	            	console.log('progress: ' + parseInt(100.0 * ev.loaded / ev.total));
	            }).success(function(data) {
	            	$scope.progressbarDisplayed = false;
	            	console.log(data);
                    console.log("File upload SUCCESS");
	            }).error(function(data) {
	            	console.log("File upload FAILED");//error
	            });
	        };
	    };
	    	
	    $scope.onFileSelect = function ($files) {
            for (var i = 0; i < $files.length; i++) {
                $file = $files[i];//set a single file
            }
       };

}]);