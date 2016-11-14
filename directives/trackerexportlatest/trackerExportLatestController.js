
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

appManagerMSF.directive('trackerExportLatest', function(){
    return{
        restrict: 'E',
        controller: 'trackerExportLatestController',
        css: 'directives/trackerexportlatest/trackerExportLatestCss.css',
        templateUrl: 'directives/trackerexportlatest/trackerExportLatestView.html',
        scope: {}
    }
});

appManagerMSF.controller('trackerExportLatestController', ['$scope', '$filter', 'ProgramService', 'UserService', 'EventExportService', 'DataStoreService', function ($scope, $filter, ProgramService, UserService, EventExportService, DataStoreService) {

    var dataStoreKey = 'trackerexport';

    $scope.params = {};
    $scope.allServices = {};
    $scope.exporting = false;

    ProgramService.getProgramsUnderUserHierarchyByService()
        .then(function (data) {
            $scope.services = data;
            $scope.clickAllServices();
        })
        .then(updateLastExportInfo)
        .then(setLatestExportAsDefault);

    function updateLastExportInfo () {
        return DataStoreService.getKeyValue(dataStoreKey).then(function (log) {
            if (log != undefined) {
                $scope.services.map(function (service) {
                    service.lastExported = log[service.code];
                });
            }
        });
    }

    function setLatestExportAsDefault () {
        var latest = $scope.services.reduce(function (previous, current) {
            if (previous.lastExported === undefined || current.lastExported === undefined) {
                return {lastExported: undefined};
            } else if (previous.lastExported.end < current.lastExported.end) {
                return previous;
            } else {
                return current;
            }
        }, {lastExported: {end:null}});
        $scope.allServices.lastExported = latest.lastExported;
        $scope.params.date  = latest.lastExported !== undefined ? new Date(latest.lastExported.end) : '';
    }
    
    $scope.openLastUpdated = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.dateopened = true;
    };
    
    $scope.clickAllServices = function () {
        $scope.allServices.selected = !$scope.allServices.selected;
        $scope.services.map(function (service) {
            service.selected = $scope.allServices.selected;
        });
    };
    
    $scope.submit = function() {
        $scope.exporting = true;
        return UserService.getCurrentUserOrgunits()
            .then(function (orgunits) {
                return EventExportService.exportEventsFromLastWithDependenciesInZip($scope.params.date, orgunits, getSelectedPrograms());
            })
            .then(function (eventsZipFile) {
                saveAs(eventsZipFile, $scope.params.filename + '.zip');
            })
            .then(logExport)
            .then(updateLastExportInfo)
            .then(setLatestExportAsDefault)
            .then(function final() {
                console.log("Everything done");
            })
            .finally(function () {
                $scope.exporting = false;
            });
    };

    function logExport () {
        return DataStoreService.getKeyValue(dataStoreKey).then(function (log) {
            var current = generateLog();
            log = log || {};
            $scope.getSelectedServices().map(function (service) {
                log[service.code] = current;
            });
            return DataStoreService.setKeyValue(dataStoreKey, log);
        });
    }

    function generateLog () {
        return {
            filename: $scope.params.filename,
            start: (new Date($scope.params.date)).toISOString(),
            end: (new Date()).toISOString()
        }
    }

    $scope.getSelectedServices = function () {
        return !$scope.services ? [] :
            $scope.services.filter(function (service) {
                return service.selected;
            });
    };

    function getSelectedPrograms () {
        return $scope.getSelectedServices().reduce(function (array, service) {
            return array.concat(service.programs);
        }, []);
    }

    $scope.$watch(
        function () { return $scope.services;},
        evaluateAllServices,
        true
    );

    function evaluateAllServices (newServices) {
        if(newServices != undefined) {
            $scope.allServices.selected = newServices.reduce(function (state, current) {
                return state && current.selected;
            }, true);
        }
    }

}]);