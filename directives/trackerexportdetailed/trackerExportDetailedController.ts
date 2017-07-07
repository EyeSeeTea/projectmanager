

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

import { CommonVariable, Orgunit } from '../../model/model';
import { EventExportService } from '../../services/services.module';

export const trackerExportDetailedDirective = [function(){
    return{
        restrict: 'E',
        controller: trackerExportDetailedController,
        template: require('./trackerExportDetailedView.html'),
        scope: {}
    }
}];

var trackerExportDetailedController = ["$scope",'$filter', 'commonvariable', 'EventExportService', 
        function($scope: ng.IScope, $filter: ng.IFilterService, commonvariable: CommonVariable, EventExportService: EventExportService) {

    $scope.exporting = false;
    
    //new component for datepiker helder
    $scope.today = () => $scope.dt = new Date();
    $scope.clear = () => $scope.dt = null;

    $scope.today();

    $scope.openstart = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.openedstart = true;
    };

    $scope.openend = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.openedend = true;
    };
    
    $scope.submit = function() {

        $scope.exporting = true;
        
        const start: string = $filter('date')($scope.start_date,'yyyy-MM-dd');
        const end: string = $filter('date')($scope.end_date,'yyyy-MM-dd');
        const orgUnits: Orgunit[] = commonvariable.OrganisationUnitList;

        EventExportService.exportEventsWithDependenciesInZip(start, end, orgUnits)
            .then( (eventsZipFile) => saveAs(eventsZipFile, $scope.file_name + '.zip') )
            .finally( () => $scope.exporting = false );
    }
}];
