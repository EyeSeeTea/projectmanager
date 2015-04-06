appManagerMSF.controller('dataimportController', ["$scope", '$upload', '$filter', "commonvariable", function($scope, $upload, $filter, commonvariable) {
		var $translate = $filter('translate');
		
		$scope.progressbarDisplayed = false;
		$scope.msjValidation = 1;
		
		var $file;//single file 
		
		var compress = false;
		var fileContent;		
		
	    $scope.sendFiles= function(){
	    	
	    	$scope.VarValidation();
	    	
	    	if ($scope.msjValidation == 1){
		    	$scope.progressbarDisplayed = true;
		    	
		    	if ($scope.getExtension($file.name)=="zip") compress=true;
		    	
		    	
		    	var fileReader = new FileReader();
		        fileReader.readAsArrayBuffer($file);
		        fileReader.onload = function(e) {
		        	
		        	fileContent = e.target.result;
		        	
		        	if (compress) {
		        		
		        		var zip = new JSZip(e.target.result);
						
						$.each(zip.files, function (index, zipEntry) {
						
							fileContent = zip.file(zipEntry.name).asArrayBuffer();
						});
		        	}		        	
		        	
		            $upload.http({
		                url: commonvariable.url+"dataValueSets",
		                headers: {'Content-Type': 'application/json'},
		                data: fileContent
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
	    	};    
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
	    
		$scope.getExtension = function(filename) {
				var parts = filename.split('.');
				return parts[parts.length - 1];
		};
	    	
	    $scope.onFileSelect = function ($files) {
            for (var i = 0; i < $files.length; i++) {
                $file = $files[i];//set a single file
                $scope.msjValidation = 1;
            }
       };
       
       $scope.generateSummary = function(data){
    	   for (var dataGroup in data){
       		if (dataGroup == 'dataValueCount'){
           		for (var dataElement in data[dataGroup]){
           			$('#importCount').append(data[dataGroup][dataElement]+ " " + dataElement + "<br>");
           		}
       		}
/*       		else if (dataGroup == 'conflicts') {
       			for (var dataElementIndex in data[dataGroup]){
       				var dataElement = data[dataGroup][dataElementIndex];
       				$('#typeSummary tbody').append('<tr><td>' + dataElement.object + '</td><td>' + dataElement.value + '</td></tr>');
       			}
				}*/
       		
       	}
       };
	
}]);