
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

appManagerMSF.factory("AnalyticsService", ['$q', '$interval', 'AnalyticsEngine', 'Analytics', 'DataMart', function($q, $interval, AnalyticsEngine, Analytics, DataMart) {

    /**
     * Performs a query to analytics endpoint with the parameters provided.
     * Orgunit and period are passed as "dimensions". Filters are passed as "filters".
     * Other options: aggregationType=COUNT, hierarchyMeta=TRUE, displayProperty=NAME
     *
     * @param orgunit - Orgunit object or array of orgunits. Orgunit = { "id": "jalskdfjfas", ...}
     * @param period - Period = { "id": "LAST_6_MONTHS", ... }
     * @param filters - Filters = { "filterid": {"id": "optionid",...}, ... {"adsfjdsfjk": {"id": "sdflkasdfj",...}}
     * @returns {*|n} - Result of analytics endpoint
     */
    var queryAvailableData = function(orgunit, period, filters){
        var analyticsParameters = buildAnalyticsParameters(orgunit, period, filters);

        return AnalyticsEngine.get(analyticsParameters).$promise;
    };

    var buildAnalyticsParameters = function(orgunit, period, filters){
        var parameters = {};

        var orgunits = "";
        if(orgunit instanceof Array){
            orgunits = orgunit.map(function(value, index, array){return value.id;}).join(";")
        } else {
            orgunits = orgunit.id;
        }

        // Build dimension parameter
        parameters.dimension = [
            "ou:" + orgunits,
            "pe:" + period.id
        ];

        parameters.aggregationType = "COUNT";
        parameters.hierarchyMeta = "TRUE";
        parameters.displayProperty = "NAME";

        if(filters !== null){
            var filterArray = [];
            angular.forEach(filters, function(option, filterid){
                filterArray.push(filterid + ":" + option.id);
            });
            parameters.filter = filterArray;
        }

        return parameters;
    };

    /**
     * This method formats the analytics response in the following format:
     * result = [
     *  id: orgunit_id (jakdsf3jk43j),
     *  name: orgunit_name (SHABUNDA),
     *  fullName: hierarchy (OCBA/DRC/SHABUNDA, depends on the dataViewOrgunit of the user),
     *  parents: parents_id (["bioweri34oi", "lsjjdslfkj23"]),
     *  level: orgunit_level (4),
     *  relativeLevel: relative_to_root (2, OCBA->0, DRC->1),
     *  isLastLevel: if_has_children (false),
     *  data: {
     *      "201501": "1098",
     *      "201502": "890",
     *      ...
     *      "201512": "897"
     *  }
     *
     * @param analytics - Result of analytics
     * @param orgunitsInfo - Array of information related to orgunits
     * @param hierarchy - hierarchy arrya, like ["fiasdfl3fj","aldfkjlskf"] (parents). Only applicable if isRoot == false
     * @returns {*} - Result data structure
     */
    var formatAnalyticsResult = function(analytics, orgunitsInfo, hierarchy){
        var orgunits = {};
        angular.forEach(analytics.metaData.ou, function(orgunit) {

            var fullName = hierarchy.map(function (parent) {
                return analytics.metaData.names[parent];
            }).join("/");

            if(fullName == "") fullName = fullName.concat(analytics.metaData.names[orgunit]);
            else fullName = fullName.concat("/" + analytics.metaData.names[orgunit]);

            fullName = fullName.replace(/\ /g, "_");

            orgunits[orgunit] = {
                id: orgunit,
                name: analytics.metaData.names[orgunit],
                fullName: fullName,
                parents: hierarchy,
                level: orgunitsInfo[orgunit].level,
                relativeLevel: hierarchy.length,
                isLastLevel: orgunitsInfo[orgunit].children.length === 0,
                data: {}
            }
        });

        // Include data. Data is in "rows" attribute as an array with the syntax [orgunitid, period, value]
        angular.forEach(analytics.rows, function(row){
            orgunits[row[0]].data[row[1]] = row[2];
        });

        return $.map(orgunits, function(orgunit, id){ return [orgunit]; })
    };

    /**
     * It starts the Refresh analytics process and returns a promise that:
     * - resolves when the analytics process is finished
     * - rejects when there is a problem during the execution
     * - notifies each message retrieved about the analytics execution
     * @returns {Promise}
     */
    function refreshAnalytics () {
        var deferred = $q.defer();

        Analytics.post();

        var inputParameters = {};
        var previousMessage = "";
        var checkStatus = $interval( function () {
            var result = DataMart.query(inputParameters);
            result.$promise.then( function (data) {
                var dataElement = data[0];
                if (dataElement != undefined){
                    inputParameters = {lastId: dataElement.uid};
                    if (dataElement.completed == true){
                        $interval.cancel(checkStatus);
                        deferred.resolve("Done update analytics");
                    }
                    if (previousMessage != dataElement.message){
                        deferred.notify(dataElement);
                        previousMessage = dataElement.message;
                    }
                }
            },
            function (error) {
                $interval.cancel(checkStatus);
                deferred.reject("Error while refreshing analytics");
            });
        }, 200);
        
        return deferred.promise;
    }

    return {
        queryAvailableData: queryAvailableData,
        formatAnalyticsResult: formatAnalyticsResult,
        refreshAnalytics: refreshAnalytics
    }

}]);
