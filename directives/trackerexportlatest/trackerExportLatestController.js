
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

appManagerMSF.controller('trackerExportLatestController', ['$scope', '$filter', 'ProgramService', 'UserService', 'EventExportService', function ($scope, $filter, ProgramService, UserService, EventExportService) {
    
    $scope.params = {};

    ProgramService.getProgramsUnderUserHierarchyByService()
        .then(function (data) {
            $scope.services = data;
            $scope.clickAllServices();
        });
    
    $scope.openLastUpdated = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.dateopened = true;
    };
    
    $scope.clickAllServices = function () {
        $scope.allServices = !$scope.allServices;
        $scope.services.map(function (service) {
            service.selected = $scope.allServices;
        });
    };
    
    $scope.submit = function() {
        UserService.getCurrentUserOrgunits()
            .then(function (orgunits) {
                var lastUpdated = $filter('date')($scope.params.date,'yyyy-MM-dd');
                return EventExportService.exportEventsFromLastWithDependenciesInZip(lastUpdated, orgunits, getSelectedPrograms());
            })
            .then(function (eventsZipFile) {
                saveAs(eventsZipFile, $scope.params.filename + '.zip');
            });
    };

    function getSelectedPrograms () {
        return $scope.services.filter(function (service) {
            return service.selected;
        }).reduce(function (array, service) {
            return array.concat(service.programs);
        }, []);
    }

}]);