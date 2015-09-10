appManagerMSF.controller('availabledataController', ["$scope", "$q", "$http", "$parse", "$animate", "commonvariable", 
                                                     "DataElementGroupsUID", "Organisationunit", "OrganisationunitLevel", "meUser", 
                                                     function($scope, $q, $http, $parse, $animate, commonvariable, DataElementGroupsUID, 
                                                    		 Organisationunit, OrganisationunitLevel, meUser) {
	
	// Some important variables
	var values = {};
	var dataViewOrgUnit;
	var maxLevel;
	
	// Initialize visibility of table and progressBar
	$scope.tableDisplayed = false;
	$scope.progressbarDisplayed = true;
	
	// WARNING: Currently we are assuming that users are assigned to only one dataViewOrgUnit (not several)
	meUser.get().$promise.then(function(userInfo){
		
		// Assuming users are assigned to only one orgunit for dataView
		var dataViewOrgUnitId = userInfo.dataViewOrganisationUnits[0].id;
		
		// Define promises
		var dataViewOrgUnitPromise = Organisationunit.get({filter: 'id:eq:' + dataViewOrgUnitId}).$promise;
		var deGroupsPromise = DataElementGroupsUID.get().$promise;
		var ouLevelsPromise = OrganisationunitLevel.get().$promise;
		
		$q.all([deGroupsPromise, dataViewOrgUnitPromise, ouLevelsPromise])
		.then(function(data){
		
			var avData_url = commonvariable.url + "analytics.json";

			// If no dx dimension is provided, it takes all dataelements in the system
			/**
			// Get all dataElementGroups
			//TODO Check that deg exist.
			avData_url = avData_url + "?filter=dx:";
			
			angular.forEach(data[0].dataElementGroups, function(group){
				avData_url = avData_url + "DE_GROUP-" + group.id + ";";
			});
			*/

			// Get current user dataViewOrganisationUnits
			dataViewOrgUnit = data[1].organisationUnits[0];
			avData_url = avData_url + "?dimension=ou:" + dataViewOrgUnit.id;
			
			// Get maximum level in the system
			maxLevel = getMaxLevel(data[2].organisationUnitLevels);
			for(var i = dataViewOrgUnit.level + 1; i <= maxLevel; i++){
				avData_url = avData_url + ";LEVEL-" + i;
			}
					
			// Add the period parameter: last 6 months
			avData_url = avData_url + "&dimension=pe:LAST_6_MONTHS";
			// Add the aggregation type: count
			avData_url = avData_url + "&aggregationType=COUNT";
			// Show complete hierarchy
			avData_url = avData_url + "&hierarchyMeta=true&displayProperty=NAME";
			
			// Get data
			$http.get(avData_url).
				success(function(data){
					
					// Create array of periods
					var periods = [];
					angular.forEach(data.metaData.pe, function(pe){
						periods.push({
							id: pe,
							name: data.metaData.names[pe]
						})
					});
					
					// Create array of orgunits
					var orgunits = [];
					angular.forEach(data.metaData.ou, function(ou){
						
						//Create full name with real names
						var parents = data.metaData.ouHierarchy[ou].split("/");
						parents.shift();
						var fullName = "";
						angular.forEach(parents, function(parent){
							fullName = fullName + "/" + data.metaData.names[parent].replace(" ","_");
						});
						fullName = fullName + "/" + data.metaData.names[ou].replace(" ","_");
						
						var level = dataViewOrgUnit.level + parents.length;

						// Push the new orgunit
						orgunits.push({
							id: ou,
							name: data.metaData.names[ou],
							fullName: fullName,
							parents: parents.join(" && "),
							relativeLevel: parents.length,
							level: level,
							isLastLevel: (level === maxLevel)
						});					
						
					});
					
					// Assign periods and orgunits to view
					$scope.periods = periods;
					$scope.orgunits = orgunits;
					
					// Print data in table when table is ready
					// Data.rows contains an array of values. Each value is an array with this structure:
					// 0. Organization unit id
					// 1. Period (for example 201501)
					// 2. Value
					values = data.rows;
					$scope.$on('onRepeatLast', function(scope, element, attrs){
						for(var i = 0; i < values.length; i++){
							$("." + values[i][0] + "." + values[i][1])
								.html("X <small>(" + Math.round(values[i][2]) + ")</small>");
						}
						
						// Make visible orgunits under dataViewOrgunit
						$parse(dataViewOrgUnitId).assign($scope, true);
						
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
		
		// Toggle between plus and minus icons
		$("#ou_" + orgunitUID).find("span").toggleClass("glyphicon-plus glyphicon-minus ");
	}
	
	var getMaxLevel = function(levels){
		var max = 1;
		angular.forEach(levels, function(level){
			if(level.level > max) {max = level.level};
		});
		return max;
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