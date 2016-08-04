
/* 
   Copyright (c) 2015.
 
   This file is part of Project Manager.
 
   Project Manager is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.
 
   Project Manager is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.
 
   You should have received a copy of the GNU General Public License
   along with Project Manager.  If not, see <http://www.gnu.org/licenses/>. */

appManagerMSF.controller('metadataimportController', ["$scope", '$interval', '$upload', '$filter', "commonvariable", "Analytics", "DataMart", function($scope, $interval, $upload, $filter, commonvariable, Analytics, DataMart) {
		
		$scope.progressbarDisplayed = false;
		$scope.undefinedFile = false;
		
		var $file;//single file
		
		var compress = false;
		var fileContent;
		
	    $scope.sendFiles= function(){
	    	
	    	$scope.VarValidation();
	    	
	    	if (!$scope.undefinedFile){
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
		                url: commonvariable.url+"metaData",
		                headers: {'Content-Type': 'application/json'},
		                data: fileContent
		            }).progress(function(ev) {
		            	console.log('progress: ' + parseInt(100.0 * ev.loaded / ev.total));
		            }).success(function(data) {
		            	console.log(data);
		            	
		            	//$scope.progressbarDisplayed = false;
		            	
		            	Analytics.post();
		            	
		            	var inputParameters = {};
		        		var previousMessage = "";	
		            	
		        		checkStatus = $interval(function() {
		        			var result = DataMart.query(inputParameters);
		        			 result.$promise.then(function(data_dataMart) {
		        	    		console.log(data_dataMart);
		        	    		var dataElement = data_dataMart[0];
		        	    		if (dataElement != undefined){
		        		    		inputParameters = {lastId: dataElement.uid};
		        		    		if (dataElement.completed == true){
		        	    				$interval.cancel(checkStatus);
		        	    				$scope.progressbarDisplayed = false;
		        	    			}
		        		    		if (previousMessage != dataElement.message){
		        		    			$('#notificationTable tbody').prepend('<tr><td>' + dataElement.time + '</td><td>' + dataElement.message + '</td></tr>');
		        		    			previousMessage = dataElement.message;
		        			 		}
		        	    		}
		        	    	});
		                  }, 200);		            	
		            	
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
			$scope.undefinedFile = ($file == undefined);
		};
	    	
	    $scope.onFileSelect = function ($files) {
            for (var i = 0; i < $files.length; i++) {
                $file = $files[i];//set a single file
                $scope.undefinedFile = false;
            }
       };
       
	   $scope.getExtension = function(filename) {
			var parts = filename.split('.');
			return parts[parts.length - 1];
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