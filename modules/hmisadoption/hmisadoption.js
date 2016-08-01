
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

appManagerMSF.controller('hmisadoptionController', ['$scope', '$parse', 'sqlService', 'meUser', 'Organisationunit', function($scope, $parse, sqlService, meUser, Organisationunit) {

    $scope.periods = [];
    $scope.tableRows = [];
    var tempChildArray = [];

    // We assume root orgunits have the same level
    var rootLevel;

    // By default, show last 12 months
    $scope.lastMonths = 12;

    $scope.loadTable = function(){
        $scope.tableLoaded = false;
        $scope.progressbarDisplayed = true;

        // Reset previous data, if exist
        $scope.tableRows = [];
        $scope.periods = [];
        tempChildArray = [];
        rootLevel = null;

        // First of all, get user orgunits
        meUser.get().$promise.then(function(user) {
            dataViewOrgunits = user.dataViewOrganisationUnits;

            var dataViewOrgunitNum = dataViewOrgunits.length;
            var index = 0;
            angular.forEach(dataViewOrgunits, function(dataViewOrgunit) {
                var dataViewOrgUnitPromise = Organisationunit.get({filter: 'id:eq:' + dataViewOrgunit.id}).$promise;

                dataViewOrgUnitPromise.then(function(orgunitResult) {
                    // Orgunit contains "id" and "level" fields
                    var orgunit = orgunitResult.organisationUnits[0];
                    rootLevel = orgunit.level;

                    var query = getQueryForOrgunit(orgunit);
                    sqlService.executeSqlView(query).then(function(queryResult) {
                        var rowArray = readQueryResult(queryResult);
                        $scope.tableRows.push(rowArray[0]);

                        // Make visible orgunits under dataViewOrgunit
                        $parse(orgunit.id).assign($scope, true);

                        var childQuery = getQueryForChildren(orgunit);
                        sqlService.executeSqlView(childQuery).then(function(childResult){
                            var childArray = readQueryResult(childResult);
                            tempChildArray.push(childArray);

                            // Increment the counter
                            index++;

                            // Check if last orgunit
                            if(index === dataViewOrgunitNum){
                                console.log("get last one");
                                $scope.tableRows = sortByName($scope.tableRows);
                                angular.forEach(tempChildArray, function(child){
                                    includeChildren(child, orgunit.id);
                                    $scope.tableLoaded = true;
                                    $scope.progressbarDisplayed = false;
                                });
                            }

                        });
                    });
                });


            });
        });
    };


    var readQueryResult = function(data){
        var orgunits = {};
        angular.forEach(data.rows, function(row){
            var id = row[0];
            var name = row[1];
            var level = row[2];
            var path = row[3];
            var period = row[4];
            var value = row[5];
            var storedby = row[6];

            // Replace slash in path, and remove current orgunitid
            path = path.substring(0, path.lastIndexOf("/"));
            path = path.replace(/\//g, "");

            if(orgunits[id] === undefined){
                orgunits[id] = {
                    id: id,
                    name: name,
                    level: level,
                    parents: path,
                    relativeLevel: level - rootLevel,
                    data: {}
                };
                angular.forEach($scope.periods, function(pe){
                    // Remove quotes from period
                    pe = pe.replace(/'/g, "");
                    orgunits[id].data[pe] = {others: 0, pentaho: 0};
                });
            }
            orgunits[id].data[period][storedby] = parseInt(value);
        });
        // Compute percentage and convert into an array
        var result = $.map(orgunits, function(value, index){
            angular.forEach(value.data, function(period){
                period.percentage = Math.round( 100 * period.others / (period.others + period.pentaho) );
                period.percentageRound10 = Math.round(period.percentage / 10) * 10;
            });
            return [value];
        });
        return result;
    };

    var sortByName = function(array){
        return array.sort(function(a, b) {
            if(a.name < b.name) return -1;
            else if (a.name > b.name) return 1;
            else return 0;
        });
    };

    var includeChildren = function(children, parentId){
        children = sortByName(children);
        // Look for parent
        var parentIndex;
        angular.forEach($scope.tableRows, function(row, index){
            if(row.id === parentId) {
                parentIndex = index + 1;
            }
        });

        angular.forEach(children, function(child){
            $scope.tableRows.splice(parentIndex, 0, child);
            parentIndex++;
        })
    };

    var getQueryForChildren = function (orgunit){
        var orgunitId = orgunit.id;
        var orgunitLevel = orgunit.level;
        var dataLevel = parseInt(orgunitLevel) + 1;
        return constructQuery(orgunitId, orgunitLevel, dataLevel);
    };

    var getQueryForOrgunit = function (orgunit){
        var orgunitId = orgunit.id;
        var orgunitLevel = orgunit.level;
        var dataLevel = orgunitLevel;
        return constructQuery(orgunitId, orgunitLevel, dataLevel);
    };

    /**
     * @param orgunitId
     * @param orgunitLevel
     * @param dataLevel
     * @returns The response has the following structure:  uid || name || level || path || period || value || storedby
     */
    var constructQuery = function(orgunitId, orgunitLevel, dataLevel) {
        return "SELECT max(ou.uid) AS uid, max(ou.name) AS name, max(ou.hierarchylevel) AS level, max(path) AS path, a.period, sum(a.count), storedby FROM ( " +
            "SELECT _ou.idlevel" + dataLevel + " AS orgunitid, _pe.monthly AS period, count(*), 'pentaho' AS storedby " +
            "FROM datavalue dv " +
            "INNER JOIN _orgunitstructure _ou ON dv.sourceid = _ou.organisationunitid " +
            "INNER JOIN _periodstructure _pe ON dv.periodid = _pe.periodid " +
            "WHERE _ou.uidlevel" + orgunitLevel + " = '" + orgunitId + "' " +
            "AND _pe.monthly IN (" + getPeriodArray() + ") " +
            "AND storedby = 'pentaho' " +
            "GROUP BY _ou.idlevel" + dataLevel + ", _pe.monthly " +
            "UNION " +
            "SELECT _ou.idlevel" + dataLevel + " AS orgunitid, _pe.monthly AS period, count(*), 'others' AS storedby " +
            "FROM datavalue dv " +
            "INNER JOIN _orgunitstructure _ou ON dv.sourceid = _ou.organisationunitid " +
            "INNER JOIN _periodstructure _pe ON dv.periodid = _pe.periodid " +
            "WHERE _ou.uidlevel" + orgunitLevel + " = '" + orgunitId + "' " +
            "AND _pe.monthly IN (" + getPeriodArray() + ") " +
            "AND storedby != 'pentaho' " +
            "GROUP BY _ou.idlevel" + dataLevel + ", _pe.monthly " +
            ") a " +
            "INNER JOIN organisationunit ou ON a.orgunitid = ou.organisationunitid " +
            "GROUP BY a.orgunitid, a.period, a.storedby;";
    };

    var getPeriodArray = function() {
        var today = new Date();
        var indexMonth = today.getMonth ();
        var indexYear = today.getFullYear();

        var periods = [];

        for (var i = 0; i < $scope.lastMonths; i ++) {
            indexMonth--;
            if (indexMonth < 0){
                indexYear--;
                indexMonth = 11;
            }
            // Force month number to have the format '01', '02', ..., '12'
            periods.push("'" + indexYear + ("0" + (indexMonth + 1)).slice(-2) + "'");
        }
        $scope.periods = periods.sort();
        return periods.join(",");
    };

    $scope.clickOrgunit = function(orgunit){
        var showChildren = $parse(orgunit.parents + orgunit.id);

        // Check current state of parameter
        if(showChildren($scope) === true){
            showChildren.assign($scope, false);
        } else {
            showChildren.assign($scope, true);
        }

        if (!orgunit.childrenLoaded == true) {
            $("#loadChildren").modal('show');
            orgunit.childrenLoaded = true;
            var childQuery = getQueryForChildren(orgunit);
            sqlService.executeSqlView(childQuery).then(function (childResult) {
                var childArray = readQueryResult(childResult);
                includeChildren(childArray, orgunit.id);
                $("#loadChildren").modal('hide');
            })
        }
    };

    $scope.isNumber = isFinite;

    $scope.loadTable();

}]);