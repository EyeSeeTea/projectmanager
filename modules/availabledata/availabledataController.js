appManagerMSF.controller('availabledataController', ["$scope", "$q", "$http", "commonvariable", "DataElementGroupsUID", "meUser", function($scope, $q, $http, commonvariable, DataElementGroupsUID, meUser) {
	
	var deGroups = DataElementGroupsUID.get().$promise;	
	var currentUser = meUser.get().$promise;
	
	var values = {};
	
	$q.all([deGroups, currentUser])
		.then(function(data){
		
			var avData_url = commonvariable.url + "analytics.json?filter=dx:";
			
			//TODO Check that deg exist.
			var degUids = data[0].dataElementGroups;
			
			for(var i = 0; i < degUids.length; i++){
				avData_url = avData_url + "DE_GROUP-" + degUids[i].id + ";"
			}
			
			avData_url = avData_url + "&dimension=pe:LAST_6_MONTHS";
			avData_url = avData_url + "&dimension=ou:LEVEL-5;LEVEL-6;UBesAQhQnHy";
			avData_url = avData_url + "&hierarchyMeta=true&displayProperty=NAME";
			
			$http.get(avData_url).
				success(function(data){
					console.log(data);
					
					// Refactor periods
					var periods = [];
					for(var i = 0; i < data.metaData.pe.length; i++){
						var period = {};
						period.id = data.metaData.pe[i];
						period.name = data.metaData.names[data.metaData.pe[i]];
						periods.push(period);
					}
					
					// Refactor orgunits
					var orgunits = [];
					for(var i = 0; i < data.metaData.ou.length; i++){
						var orgunit = {};
						orgunit.id = data.metaData.ou[i];
						var ouComplete = data.metaData.ouHierarchy[data.metaData.ou[i]];
						var tokens = ouComplete.split("/");
						var name = "";
						for(var j = 1; j < tokens.length; j++){
							name = name + "/" + data.metaData.names[tokens[j]];
						}
						name = name + "/" + data.metaData.names[data.metaData.ou[i]];
						orgunit.name = name;
						orgunits.push(orgunit);
					}
					
					$scope.periods = periods;
					$scope.orgunits = orgunits;
					
					// Print data in table
					values = data.rows;
					$scope.$on('onRepeatLast', function(scope, element, attrs){
						for(var i = 0; i < values.length; i++){
							$("." + values[i][0] + "." + values[i][1]).html("X");
						}
					});
					
				}).
				error(function(data){
					
				});
		});
	
	$scope.renderValues = function(){
		
	};

}]);

Dhis2Api.directive('onLastRepeat', function(){
	return function(scope, element, attrs) {
        if (scope.$last) setTimeout(function(){
            scope.$emit('onRepeatLast', element, attrs);
        }, 1);
    };
});