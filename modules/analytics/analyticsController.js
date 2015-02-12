appManagerMSF.controller('analyticsController', ["$scope",'$interval', '$filter', "commonvariable", "Analytics", "DataMart", function($scope, $interval, $filter, commonvariable, Analytics, DataMart) {
	var $translate = $filter('translate');
	
	$scope.progressbarDisplayed = false;
	
	$scope.analytics=function(){
		Analytics.post();
		
		$scope.progressbarDisplayed = true;
		$scope.summaryDisplayed = true;
		
		var inputParameters = {};
		var previousMessage = "";
		checkStatus = $interval(function() {
			var result = DataMart.query(inputParameters);
			 result.$promise.then(function(data) {
	    		console.log(data);
	    		var dataElement = data[0];
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
	};
}]);