
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

import * as angular from 'angular';
import { AvailableDataItem } from '../../model/model';

export class AnalyticsService {

    static $inject = ['$q', '$interval', 'AnalyticsEngine', 'Analytics', 'DataMart', 'ValidationService'];

    constructor(
        private $q: ng.IQService,
        private $interval: ng.IIntervalService,
        private AnalyticsEngine,
        private Analytics,
        private DataMart,
        private ValidationService
    ) { }

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
    queryAvailableData(orgunit, period, filters) {
        const analyticsParameters: AnalyticsParameters = this.buildAnalyticsParameters(orgunit, period, filters);

        return this.AnalyticsEngine.get(analyticsParameters).$promise;
    };

    private buildAnalyticsParameters(orgunit, period, filters): AnalyticsParameters {

        var orgunits = "";
        if (orgunit instanceof Array) {
            orgunits = orgunit.map((value, index, array) => value.id).join(";")
        } else {
            orgunits = orgunit.id;
        }

        // Build dimension parameter
        var parameters: AnalyticsParameters = {
            dimension: [
                "ou:" + orgunits,
                "pe:" + period.id,
                "fGoEwhKl0WS:T0qg4AAHiby"
            ],
            
            aggregationType: "COUNT",
            hierarchyMeta: "TRUE",
            displayProperty: "NAME"
        };

        if (filters !== null) {
            var filterArray = [];
            angular.forEach(filters, (option, filterid) => {
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
    formatAnalyticsResult(analytics, orgunitsInfo, hierarchy, valuesDatastore): AvailableDataItem[] {
        let orgunits: { [key: string]: AvailableDataItem } = {};

        var noValidatedPeriod = false;

        angular.forEach(analytics.metaData.dimensions.ou, (orgunit) => {
            var fullName = hierarchy.map((parent) => analytics.metaData.items[parent].name).join("/");

            if (fullName == "") fullName = fullName.concat(analytics.metaData.items[orgunit].name);
            else fullName = fullName.concat("/" + analytics.metaData.items[orgunit].name);

            fullName = fullName.replace(/\ /g, "_");

            orgunits[orgunit] = {
                id: orgunit,
                name: analytics.metaData.items[orgunit].name,
                fullName: fullName,
                parents: hierarchy,
                level: orgunitsInfo[orgunit].level,
                relativeLevel: hierarchy.length,
                isLastLevel: orgunitsInfo[orgunit].children.length === 0,

                data: {}
            }
        });

        // Include data. Data is in "rows" attribute as an array with the syntax [orgunitid, period, value]
        angular.forEach(analytics.rows, (row) => {

            noValidatedPeriod = false;
            if (valuesDatastore[row[0]] != undefined) { noValidatedPeriod = valuesDatastore[row[0]]["'" + row[1] + "'"]}

            orgunits[row[0]].data[row[1]] = { value: row[3], noValidatedPeriod: noValidatedPeriod };

        });

        return $.map(orgunits, (orgunit, id) => orgunit)
    };

    /**
     * It starts the Refresh analytics process and returns a promise that:
     * - resolves when the analytics process is finished
     * - rejects when there is a problem during the execution
     * - notifies each message retrieved about the analytics execution
     * @returns {Promise}
     */
    refreshAnalytics(params) {
        var deferred = this.$q.defer();
        var analytics_id;
        //Analytics.post(params,'');
        var resp = this.Analytics.post();
        resp.$promise.then(
            data =>{
            analytics_id=data.response.id;
          //  console.log(analytics_id);
            }
        );
        
       
        var inputParameters = {};
        var previousMessage = "";
        var checkStatus = this.$interval(() => {
            var result = this.DataMart.query(inputParameters);
            result.$promise.then(
                data => {
                   // var dataElement = data[0];
                   // var dataElement = data[Object.keys(data)[0]][0];
                   // var dataElement= data[analytics_id][0];
                    var dataElement= data[0];
                    if (dataElement != undefined) {
                        inputParameters = { lastId: dataElement.uid };
                        if (dataElement.completed == true) {
                            this.$interval.cancel(checkStatus);
                            deferred.notify(dataElement);
                            deferred.resolve("Done update analytics");
                        }
                        if (previousMessage != dataElement.message) {
                            deferred.notify(dataElement);
                            previousMessage = dataElement.message;
                        }
                    }
                },
                error => {
                    this.$interval.cancel(checkStatus);
                    deferred.reject("Error while refreshing analytics");
                }
            );
        }, 200);

        return deferred.promise;
    }

    refreshAllAnalytics() {
        return this.refreshAnalytics({});
    }

    refreshEventAnalytics() {
        return this.refreshAnalytics({ skipAggregate: true });
    }

    refreshAggregateAnalytics() {
        return this.refreshAnalytics({ skipEvents: true });
    }

}

class AnalyticsParameters {
    constructor(
        public dimension: any,
        public aggregationType: string,
        public hierarchyMeta: string,
        public displayProperty: string,
        public filter?: any
    ) { }
}
