
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

appManagerMSF.controller('dataimportController', ["$scope",'$interval', '$upload', '$filter', "commonvariable", "Analytics", "DataMart", "DataStoreService", "meUser", function($scope, $interval, $upload, $filter, commonvariable, Analytics, DataMart, DataStoreService, meUser) {
		var $translate = $filter('translate');
		
		$scope.progressbarDisplayed = false;
		$scope.msjValidation = 1;
		
		var $file;//single file 
		
		var compress = false;
		var fileContent;
		
		$scope.showImportDialog = function(){
			
			$scope.VarValidation();
			
			if ($scope.msjValidation == 1){
				$("#importConfirmation").modal();
			}
		};
		
	    $scope.sendFiles= function(){
	    	
	    	$scope.previewDataImport = false;
	    	$("#importConfirmation").modal("hide");
	    		    	
	    	$scope.progressbarDisplayed = true;
	    	
	    	if ($scope.getExtension($file.name)=="zip") {
	    		compress=true;
	    	} else {
	    		compress=false;
	    	}
	    	
	    	
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
	            	
	            	Analytics.post();
	            	
	            	var inputParameters = {};
	        		var previousMessage = "";		            	
	        		checkStatus = $interval(function() {
	        			var result = DataMart.query(inputParameters);
	        			 result.$promise.then(function(data_datamart) {
	        	    		console.log(data_datamart);
	        	    		var dataElement = data_datamart[0];
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
	            	
	            	//$scope.progressbarDisplayed = false;
	            	$scope.generateSummary(data);
	            	$scope.summaryDisplayed = true;
					logDataimport($file.name, data);
	            		
	            	console.log("File upload SUCCESS");
	            }).error(function(data) {
	            	console.log("File upload FAILED");//error
	            });
	        };

	    };
		
	    $scope.previewFiles= function(){
	    	
	    	$scope.VarValidation();
	    	
	    	if ($scope.msjValidation == 1){
		    	
		    	if ($scope.getExtension($file.name)=="zip") {
		    		$scope.isCompress = true;
		    	} else {
		    		$scope.isCompress = false;
		    	}
		    	
		    	$scope.dataFile = $file;
		    	$scope.previewDataImport = true;
		    	
		    	return;
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
            $scope.previewDataImport = false;
       };
       
       $scope.generateSummary = function(data){
		   var gt218 = commonvariable.version > "2.18";
    	   for (var dataGroup in data){
			   if ((dataGroup == 'dataValueCount' && !gt218) || (dataGroup == 'importCount' && gt218)){
				   for (var dataElement in data[dataGroup]){
					   $('#importCount').append(data[dataGroup][dataElement]+ " " + dataElement + "<br>");
				   }
			   }
			   else if (dataGroup == 'conflicts') {
				   $scope.conflicts = true;
				   for (var dataElementIndex in data[dataGroup]){
					   var dataElement = data[dataGroup][dataElementIndex];
					   $('#typeSummary tbody').append('<tr><td>' + dataElement.object + '</td><td>' + dataElement.value + '</td></tr>');
				   }
			   }
		   }
       };

	var logDataimport = function(filename, data){
		var namespace = "dataimportlog";
		meUser.get({fields: "userCredentials[code],organisationUnits[id]"}).$promise
			.then(function(me){
				var dataimportLog = {
					timestamp: new Date().getTime(),
					username: me.userCredentials.code,
					filename: filename,
					status: data.status,
					importCount: data.importCount,
					conflicts: data.conflicts
				};
				DataStoreService.updateNamespaceKeyArray(namespace, me.organisationUnits[0].id, dataimportLog);
			})
	};
	
}]);