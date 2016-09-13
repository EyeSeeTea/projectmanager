
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

appManagerMSF.factory("DemographicsService", ['$q', 'UserService', 'DataSetsUID', 'DataExport', 'Organisationunit', function($q, UserService, DataSetsUID, DataExport, Organisationunit) {

    var projectDatasetCode = 'DS_DEM';
    var siteDatasetCode = 'DEM2';

    var projectDatasetUID;
    var siteDatasetUID;

    var userOrgunits;
    var userSites;
    var userServices;

    function updateDemographicData () {

        // Check if current user is MFP
        return UserService.currentUserHasRole('Medical Focal Point').then(function (hasRole) {
            if (hasRole) {
                return saveUserOrgunits()
                    .then(saveUserSitesAndServices)
                    .then(updateCbrAndPercentages)
                    .then(updatePopulation);

            } else {
                return $q.when("Update demographics done");
            }
        });
    }

    function saveUserOrgunits () {
        return UserService.getCurrentUser().then(function (meUser) {
            userOrgunits = meUser.organisationUnits.map(function (ou) {return ou.id;});
        });
    }

    function saveUserSitesAndServices () {
        userSites = [];
        userServices = [];
        var queries = [];
        for (var i = 0; i < userOrgunits.length; i++) {
            var promise = Organisationunit.get({fields: 'id,path,level', filter: 'path:like:' + userOrgunits[i]}).$promise;
            queries.push(promise);
        }
        return $q.all(queries).then( function (responses) {
            angular.forEach(responses, function (response) {
                angular.forEach(response.organisationUnits, function (orgunit) {
                    if (orgunit.level === 5) userSites.push(orgunit.id);
                    if (orgunit.level === 6) userServices.push(orgunit.id);
                })
            });
        })
    }

    function updateCbrAndPercentages () {
        console.log("updating CBR");
        return getDatasetUidByCode(projectDatasetCode)
            .then(function (datasetId) {
                return readDatasetValues(datasetId, userOrgunits, 2015);
            })
            .then(function (values) {
                return writeValues(values, userServices);
            });
    }

    function updatePopulation () {
        console.log("updating population");
        return $q.when("Update population done");
    }

    function getDatasetUidByCode (datasetCode) {
        return DataSetsUID.get({filter: 'code:eq:' + datasetCode}).$promise.then(function (datasetInfo) {
            if (datasetInfo.dataSets.length != 0) {
                return datasetInfo.dataSets[0].id;
            } else {
                return undefined;
            }
        });
    }

    function readDatasetValues (datasetUid, orgunits, periods) {
        return DataExport.get({
            dataSet: datasetUid,
            orgUnit: orgunits.toString(),
            period: periods.toString()
        }).$promise
            .then( function (result) {
                return result.dataValues;
            });
    }

    function writeValues (values, orgunits) {
        if (values != undefined) {
            var payload = {dataValues: []};
            for (var i = 0; i < values.length; i++) {
                for (var j = 0; j < orgunits.length; j++) {
                    payload.dataValues.push({
                        dataElement: values[i].dataElement,
                        period: values[i].period,
                        orgUnit: orgunits[j],
                        value: values[i].value
                    })
                }
            }
            return DataExport.save(payload).$promise;
        } else {
            return $q.when("No values to update");
        }
    }

    return {
        updateDemographicData: updateDemographicData
    }

}]);