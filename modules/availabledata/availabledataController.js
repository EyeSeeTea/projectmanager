appManagerMSF.controller('availabledataController', ["$scope", "$q", "$http", "$parse", "$animate", "commonvariable", 
                                                     "DataElementGroupsUID", "Organisationunit", "OrganisationunitLevel", "meUser", 
                                                     function($scope, $q, $http, $parse, $animate, commonvariable, DataElementGroupsUID, 
                                                    		 Organisationunit, OrganisationunitLevel, meUser) {
	
	// WARNING: Currently we are assuming that users are assigned to only one dataViewOrgUnit (not several)
	var currentUser = meUser.get().$promise;
	
	// Some important variables
	var values = {};
	var dataViewOrgUnitId;
	
	// Initialize visibility of table and progressBar
	$scope.tableDisplayed = false;
	$scope.progressbarDisplayed = true;
	
	currentUser.then(function(userInfo){
		
		// Assuming users are assigned to only one orgunit for dataView
		dataViewOrgUnitId = userInfo.dataViewOrganisationUnits[0].id;
		
		// Define promises
		var dataViewOrgUnit = Organisationunit.getOU({uid:dataViewOrgUnitId}).$promise;
		var deGroups = DataElementGroupsUID.get().$promise;
		var ouLevels = OrganisationunitLevel.get().$promise;
		
		$q.all([deGroups, dataViewOrgUnit, ouLevels])
		.then(function(data){
		
			var avData_url = commonvariable.url + "analytics.json";

			// Get all dataElementGroups
			//TODO Check that deg exist.
			var degUids = data[0].dataElementGroups;
			avData_url = avData_url + "?filter=dx:";
			
			for(var i = 0; i < degUids.length; i++){
				avData_url = avData_url + "DE_GROUP-" + degUids[i].id + ";";
			}
			

			// Get current user dataViewOrganisationUnits
			var dataViewOrgUnits = data[1].dataViewOrganisationUnits;
			avData_url = avData_url + "&dimension=ou:" + data[1].id;
			
			// Get maximum level in the system
			var maxLevel = getMaxLevel(data[2].organisationUnitLevels);
			for(var i = data[1].level + 1; i <= maxLevel; i++){
				avData_url = avData_url + ";LEVEL-" + i;
			}
					
			avData_url = avData_url + "&dimension=pe:LAST_6_MONTHS";
			avData_url = avData_url + "&hierarchyMeta=true&displayProperty=NAME";
			
			// Get data
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
						orgunit.name = data.metaData.names[orgunit.id];
						
						var ouComplete = data.metaData.ouHierarchy[orgunit.id];
						var tokens = ouComplete.split("/");
						tokens.shift();
						var fullName = "";
						for(var j = 0; j < tokens.length; j++){
							fullName = fullName + "/" + data.metaData.names[tokens[j]];
						}
						fullName = fullName + "/" + data.metaData.names[data.metaData.ou[i]];
						orgunit.fullName = fullName;
						orgunit.parents = tokens.join(" && ");
						// It is a relative level, not absolute
						orgunit.level = tokens.length;
						orgunits.push(orgunit);
					}
					
					// Assign periods and orgunits to view
					$scope.periods = periods;
					$scope.orgunits = orgunits;
					
					// Print data in table when table is ready
					values = data.rows;
					$scope.$on('onRepeatLast', function(scope, element, attrs){
						for(var i = 0; i < values.length; i++){
							$("." + values[i][0] + "." + values[i][1]).html("X");
						}
						
						// Make visible orgunits under dataViewOrgunit
						var showChildren = $parse(dataViewOrgUnitId);
						showChildren.assign($scope, true);
						
						// Hide progressBar and show table
						$scope.tableDisplayed = true;
						$scope.progressbarDisplayed = false;
						
						// Refresh scope
						$scope.$apply();
					});
					
				}).
				error(function(data){
					// TODO Handle error
					$scope.progressbarDisplayed = false;
				});
		});
		
	});
		
	$scope.clickOrgunit = function(orgunitUID){
		var showChildren = $parse(orgunitUID);
		
		// Check current state of parameter
		if(showChildren($scope) === true){
			showChildren.assign($scope, false);			
		} else {
			showChildren.assign($scope, true);			
		}
	}
	
	var getMaxLevel = function(levels){
		var level = 1;
		for(var i = 0; i < levels.length; i++){
			if(levels[i].level > level) {level = levels[i].level};
		}
		return level;
	}
	
}]);

// Directive to emit an event when a repeat process is in the last item
Dhis2Api.directive('onLastRepeat', function(){
	return function(scope, element, attrs) {
        if (scope.$last) setTimeout(function(){
            scope.$emit('onRepeatLast', element, attrs);
        }, 1);
    };
});