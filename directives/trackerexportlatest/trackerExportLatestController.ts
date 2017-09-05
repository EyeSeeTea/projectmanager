
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

import { TrackerDataExportLog } from '../../model/model';
import { EventExportService, SystemService } from '../../services/services.module';

export const trackerExportLatestDirective = [function(){
    return{
        restrict: 'E',
        controller: trackerExportLatestController,
        css: require('./trackerExportLatestCss.css'),
        template: require('./trackerExportLatestView.html'),
        scope: {}
    }
}];

var trackerExportLatestController = ['$scope', '$filter', 'ProgramService', 'UserService', 'EventExportService', 'DataStoreService', 'SystemService', 
    function ($scope: ng.IScope, $filter, ProgramService, UserService, EventExportService: EventExportService, DataStoreService, SystemService: SystemService) {

    const dataStoreKey: string = 'trackerexport';

    $scope.params = {};
    $scope.allServices = {};
    $scope.exporting = false;

    ProgramService.getProgramsUnderUserHierarchyByService()
        .then( data => {
            $scope.services = data;
            $scope.clickAllServices();
        })
        .then( () => updateLastExportInfo() )
        .then( () => setLatestExportAsDefault() );

    function updateLastExportInfo () {
        return DataStoreService.getKeyValue(dataStoreKey).then( log => {
            if (log != undefined) {
                $scope.services.map( service => {
                    service.lastExported = log[service.code];
                });
            }
        });
    }

    function setLatestExportAsDefault () {
        const latest = $scope.services.reduce( (previous, current) => {
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
        $scope.services.map( service => {
            service.selected = $scope.allServices.selected;
        });
    };
    
    $scope.submit = function() {
        $scope.exporting = true;
        const startDate: Date = $scope.params.date;
        var serverDate: Date;
        return SystemService.getServerDateWithTimezone()
            .then( date => serverDate = date )
            .then( () => UserService.getCurrentUserOrgunits() )
            .then( orgunits => EventExportService.exportEventsFromLastWithDependenciesInZip(startDate.toISOString(), orgunits, getSelectedPrograms()) )
            .then( eventsZipFile => saveAs(eventsZipFile, $scope.params.filename + '.zip') )
            .then( () => logExport(startDate, serverDate) )
            .then( () => updateLastExportInfo() )
            .then( () => setLatestExportAsDefault() )
            .then( () => console.log("Everything done") )
            .finally( () => $scope.exporting = false );
    };

    function logExport (start: Date, end: Date) {
        return DataStoreService.getKeyValue(dataStoreKey).then( log => {
            const current = new TrackerDataExportLog($scope.params.filename, start, end);
            log = log || {};
            $scope.getSelectedServices().map( service => {
                log[service.code] = current;
            });
            return DataStoreService.setKeyValue(dataStoreKey, log);
        });
    }

    $scope.getSelectedServices = function () {
        return !$scope.services ? [] :
            $scope.services.filter( service => service.selected );
    };

    function getSelectedPrograms () {
        return $scope.getSelectedServices().reduce( (array, service) => {
            return array.concat(service.programs);
        }, []);
    }

    $scope.$watch(
        () => $scope.services,
        (newServices) => evaluateAllServices(newServices),
        true
    );

    function evaluateAllServices (newServices) {
        if(newServices != undefined) {
            $scope.allServices.selected = newServices.reduce( (state, current) => {
                return state && current.selected;
            }, true);
        }
    }

}];
