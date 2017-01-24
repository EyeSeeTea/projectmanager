
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

appManagerMSF.factory("DemographicsService", ['$q', 'UserService', 'DataSetsUID', 'DataExport', 'Organisationunit', 'DataElement', function($q, UserService, DataSetsUID, DataExport, Organisationunit, DataElement) {

    var demInfoDatasetCode = 'DS_DEM';
    var demInfoDatasetId;
    var populationDatasetCode = 'DS_POP_Q';
    var populationDatasetId;
    var ageDistributionCode = 'DEM3';
    var ageDistributionId;
    var populationCode = 'DEM1';
    var populationId;
    var populationByAgeCode = 'DEM4';
    var populationByAgeId;

    var currentYear = new Date().getFullYear();
    var startDate = (currentYear - 1) + "-01-01";
    var endDate = (currentYear + 1) + "-12-31";

    var userOrgunits;
    var userSites;
    var userServices;

    function updateDemographicData () {

        // Check if current user is MFP
        return UserService.currentUserHasRole('Medical Focal Point').then(function (hasRole) {
            if (hasRole) {
                return saveUserOrgunits()
                    .then(saveUserSitesAndServices)
                    .then(saveDemographicMetadata)
                    .then(updateCbrAndPercentages)
                    .then(calculatePopulationByAge)
                    .then(updatePopulation);

            } else {
                return $q.when("Update demographics done");
            }
        });
    }

    function saveUserOrgunits () {
        return UserService.getCurrentUser().then(function (meUser) {
            userOrgunits = meUser.organisationUnits;
        });
    }

    function saveUserSitesAndServices () {
        userSites = [];
        userServices = [];
        var queries = [];
        for (var i = 0; i < userOrgunits.length; i++) {
            var promise = Organisationunit.get({fields: 'id,path,level', filter: 'path:like:' + userOrgunits[i].id}).$promise;
            queries.push(promise);
        }
        return $q.all(queries).then( function (responses) {
            angular.forEach(responses, function (response) {
                angular.forEach(response.organisationUnits, function (orgunit) {
                    if (orgunit.level === 5) userSites.push(orgunit);
                    if (orgunit.level === 6) userServices.push(orgunit);
                })
            });
        })
    }

    function saveDemographicMetadata () {
        return getDatasetUidByCode(populationDatasetCode)
            .then(function (datasetId) {
                populationDatasetId = datasetId;
                return getDatasetUidByCode(demInfoDatasetCode);
            })
            .then(function (datasetId) {
                demInfoDatasetId = datasetId;
                return getDataElementByCode(ageDistributionCode);
            })
            .then(function (dataElementId) {
                ageDistributionId = dataElementId;
                return getDataElementByCode(populationCode);
            })
            .then(function (dataElementId) {
                populationId = dataElementId;
                return getDataElementByCode(populationByAgeCode);
            })
            .then(function (dataElementId) {
                populationByAgeId = dataElementId;
            })
    }

    function updateCbrAndPercentages () {
        var cbrAndPercentagesValues;
        return readDatasetValues(demInfoDatasetId, userOrgunits, startDate, endDate)
            .then(function (values) {
                cbrAndPercentagesValues = values;
                // Copy cbr and age distributions from project to site
                return writeValues(values, userSites);
            })
            .then(function () {
                if (cbrAndPercentagesValues) {
                    var cbrValues = cbrAndPercentagesValues.filter(function (value) {return value.dataElement != ageDistributionId;});
                    // Not copy age distributions to services
                    return writeValues(cbrValues, userServices);
                } else {
                    return $q.when("No values to update");
                }
            });
    }

    /**
     * Calculates Population by age at project level and site level.
     */
    function calculatePopulationByAge () {
        var ageDistribution;
        return readDatasetValues(demInfoDatasetId, userOrgunits.concat(userSites), startDate, endDate)
            .then(function (values) {
                if (values != undefined) {
                    ageDistribution = values.filter(function (value) { return value.dataElement == ageDistributionId});
                    return readDatasetValues(populationDatasetId, userOrgunits.concat(userSites), startDate, endDate);
                } else {
                    return $q.reject("No age distribution information");
                }
            })
            .then(function (populationValues) {
                if (populationValues != undefined) {
                    populationValues = populationValues.filter(function (value) { return value.dataElement == populationId});
                    return writePopulationByAge(populationValues, ageDistribution);
                } else {
                    return $q.reject("No population data");
                }
            })
            .catch(function(error) {
                console.log("No population information: " + error);
            });
    }

    function updatePopulation () {
        return readDatasetValues(populationDatasetId, userSites, startDate, endDate)
            .then(function (values) {
                return writeValues(values, userServices);
            });
    }
    
    function getDataElementByCode (dataElementCode) {
        return DataElement.get({filter: 'code:eq:' + dataElementCode}).$promise.then(function (dataElementInfo) {
            if (dataElementInfo.dataElements.length != 0) {
                return dataElementInfo.dataElements[0].id;
            } else {
                return undefined;
            }
        })
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

    function readDatasetValues (datasetUid, orgunits, startDate, endDate) {
        return DataExport.get({
            dataSet: datasetUid,
            orgUnit: orgunits.map(function (ou) {return ou.id;}).toString(),
            startDate: startDate,
            endDate: endDate
        }).$promise
            .then( function (result) {
                return result.dataValues;
            });
    }

    function writeValues (values, orgunits) {
        if (values != undefined) {
            var payload = {dataValues: []};
            for (var i = 0; i < values.length; i++) {
                var children = orgunits.filter(function (ou) {
                    return ou.path.indexOf(values[i].orgUnit) >= 0;
                });
                for (var j = 0; j < children.length; j++) {
                    payload.dataValues.push({
                        dataElement: values[i].dataElement,
                        period: values[i].period,
                        orgUnit: children[j].id,
                        value: values[i].value,
                        categoryOptionCombo: values[i].categoryOptionCombo
                    })
                }
            }
            return DataExport.save(payload).$promise;
        } else {
            return $q.when("No values to update");
        }
    }

    function writePopulationByAge (populationValues, ageDistribution) {
        if (populationValues != undefined && ageDistribution != undefined) {
            var payload = {dataValues: []};
            populationValues.map(function (popValue) {
                ageDistribution.filter(function (value) {
                    return value.period == popValue.period.substr(0,4) && value.orgUnit == popValue.orgUnit;
                }).map(function (ageDistributionValue) {
                    payload.dataValues.push({
                        dataElement: populationByAgeId,
                        period: popValue.period,
                        orgUnit: popValue.orgUnit,
                        value: Math.round((parseFloat(popValue.value) * parseFloat(ageDistributionValue.value) / 100)),
                        categoryOptionCombo: ageDistributionValue.categoryOptionCombo
                    })
                })
            });
            return DataExport.save(payload).$promise;
        } else {
            return $q.when("No values to update");
        }
    }

    return {
        updateDemographicData: updateDemographicData
    }

}]);
