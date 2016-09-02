

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


Dhis2Api.directive('projectSelector', function(){
    return{
        restrict: 'E',
        templateUrl: 'directives/projectSelector/projectSelectorView.html',
        scope: {
            project: '='
        },
        controller: ['$scope', 'Organisationunit', function($scope, Organisationunit){
            
            $scope.selection = {};
            
            // Get all missions and publish them in mission variable
            Organisationunit.get({filter: 'level:eq:3'}).$promise.then(function(result){
                $scope.missions = result.organisationUnits;
            });
            
            $scope.modifyMission = function() {
                var filters = { filter: [
                    'level:eq:4',
                    'path:like:' + $scope.selection.mission.id
                ]};
                Organisationunit.get(filters).$promise.then(function(result){
                    $scope.projects = result.organisationUnits;
                });
            };

            $scope.modifyProject = function() {
                $scope.project = $scope.selection.project;
            };
        }]
    }
});