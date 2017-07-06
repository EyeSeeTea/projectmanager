
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
import { EventExportService } from '../../services/services.module';

export const trackerExportLatestDirective = [function(){
    return{
        restrict: 'E',
        controller: trackerExportLatestController,
        css: require('./trackerExportLatestCss.css'),
        template: require('./trackerExportLatestView.html'),
        scope: {}
    }
}];

var trackerExportLatestController = ['$scope', '$filter', 'ProgramService', 'UserService', 'EventExportService', 'DataStoreService', 
    function ($scope: ng.IScope, $filter, ProgramService, UserService, EventExportService: EventExportService, DataStoreService) {

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
        return UserService.getCurrentUserOrgunits()
            .then( orgunits => EventExportService.exportEventsFromLastWithDependenciesInZip($scope.params.date, orgunits, getSelectedPrograms()) )
            .then( eventsZipFile => saveAs(eventsZipFile, $scope.params.filename + '.zip') )
            .then( () => logExport() )
            .then( () => updateLastExportInfo() )
            .then( () => setLatestExportAsDefault() )
            .then( () => console.log("Everything done") )
            .finally( () => $scope.exporting = false );
    };

    function logExport () {
        return DataStoreService.getKeyValue(dataStoreKey).then( log => {
            const current: TrackerDataExportLog = generateLog();
            log = log || {};
            $scope.getSelectedServices().map( service => {
                log[service.code] = current;
            });
            return DataStoreService.setKeyValue(dataStoreKey, log);
        });
    }

    function generateLog (): TrackerDataExportLog {
        return new TrackerDataExportLog(
            $scope.params.filename,
            (new Date($scope.params.date)).toISOString(),
            (new Date()).toISOString()
        )
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
