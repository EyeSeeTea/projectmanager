appManagerMSF.controller('metadataimportController', ["$scope", '$upload', '$filter', "commonvariable", function($scope, $upload, $filter, commonvariable) {
		var $translate = $filter('translate');
		
		$scope.progressbarDisplayed = false;
		$scope.msjValidation = 1;
		
		var $file;//single file 
	    $scope.sendFiles= function(){
	    	
	    	$scope.VarValidation();
	    	
	    	if ($scope.msjValidation == 1){
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
		            	console.log(data);
		            	
		            	$scope.progressbarDisplayed = false;
		            	$scope.generateSummary(data);
		            	$scope.summaryDisplayed = true;
		            	
	                    console.log("File upload SUCCESS");
		            }).error(function(data) {
		            	console.log("File upload FAILED");//error
		            });
		        };
	    	}
	    };
	    
	    $scope.VarValidation= function() {
	    	console.log($file);
	    	if ($file == undefined){
	    		$scope.msjValidation = 0;
	    	}
	    	else{
	    		$scope.msjValidation = 1;
	    	}
	    };
	    	
	    $scope.onFileSelect = function ($files) {
            for (var i = 0; i < $files.length; i++) {
                $file = $files[i];//set a single file
                $scope.msjValidation = 1;
            }
       };
       
       $scope.generateSummary = function(data){
    	   for (var dataGroup in data){
       		if (dataGroup == 'importCount'){
           		for (var dataElement in data[dataGroup]){
           			$('#importCount').append(data[dataGroup][dataElement]+ " " + dataElement + "<br>");
           		}
       		}
       		else if (dataGroup == 'importTypeSummaries') {
       			for (var dataElementIndex in data[dataGroup]){
       				var dataElement = data[dataGroup][dataElementIndex];
       				var importCountElement = dataElement.importCount;
       				$('#typeSummary tbody').append('<tr><td>' + dataElement.type + '</td><td>' + importCountElement.imported + '</td><td>' + importCountElement.updated + '</td><td>' + importCountElement.ignored + '</td></tr>');
       			}
			}
       	}
       };

}]);