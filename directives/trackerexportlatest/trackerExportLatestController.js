
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

    ProgramService.getProgramsUnderUserHierarchyByService()
        .then(function (data) {
            $scope.services = data;
            $scope.clickAllServices();
        })
        .then(addLastExportInfo);

    function addLastExportInfo () {
        return DataStoreService.getKeyValue(dataStoreKey).then(function (log) {
            if (log != undefined) {
                $scope.allServices.lastExported = log.ALL;
                $scope.services.map(function (service) {
                    service.lastExported = log[service.code];
                });
            }
        });
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
        UserService.getCurrentUserOrgunits()
            .then(function (orgunits) {
                return EventExportService.exportEventsFromLastWithDependenciesInZip($scope.params.date, orgunits, getSelectedPrograms());
            })
            .then(function (eventsZipFile) {
                saveAs(eventsZipFile, $scope.params.filename + '.zip');
            })
            .then(logExport)
            .then(function final() {
                console.log("Everything done");
            });
    };

    function logExport () {
        DataStoreService.getKeyValue(dataStoreKey).then(function (log) {
            var current = generateLog();
            log = log || {};
            if($scope.allServices.selected) {
                log.ALL = current;
            }
            getSelectedServices().map(function (service) {
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

    function getSelectedServices () {
        return $scope.services.filter(function (service) {
            return service.selected;
        });
    }

    function getSelectedPrograms () {
        return getSelectedServices().reduce(function (array, service) {
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