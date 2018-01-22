
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

import { TrackerDataExportLog, ServiceWithPrograms } from '../../model/model';
import { DataStoreService, EventExportService, EventService, ProgramService, SystemService, UserService } from '../../services/services.module';

export class TrackerExportLatestComponent implements ng.IComponentOptions {
    public controller: any;
    public template: string;
    public css: string;

    constructor() {
        this.controller = TrackerExportLatestController;
        this.template = require('./trackerExportLatestView.html');
        this.css = require('./trackerExportLatestCss.css');
    }
}

class TrackerExportLatestController {

    params = { date: null, maxDate: null, filename: ""};
    services = null;
    allServices = { lastExported: "", selected: false};
    exporting = false;
    dateopened = false;
    exportError;
    dataStoreKey: string = 'trackerexport';

    static $inject = ['$filter', 'ProgramService', 'UserService', 'EventExportService', 'EventService', 'DataStoreService', 'SystemService'];

    constructor(private $filter, private ProgramService: ProgramService, private UserService: UserService, 
                private EventExportService: EventExportService, private EventService: EventService, 
                private DataStoreService: DataStoreService, private SystemService: SystemService) {}

    $onInit() {
        this.ProgramService.getProgramsUnderUserHierarchyByService()
            .then( data => {
                this.services = data;
                this.clickAllServices();
            })
            .then( () => this.updateLastExportInfo() )
            .then( () => this.setLatestExportAsDefault() );
    }

    updateLastExportInfo () {
        return this.DataStoreService.getKeyValue(this.dataStoreKey).then( log => {
            if (log != undefined) {
                this.services.map( service => {
                    service.lastExported = log[service.code];
                });
            }
            return "Done";
        });
    }

    setLatestExportAsDefault () {
        const latest = this.services.reduce( (previous, current) => {
            if (previous.lastExported === undefined || current.lastExported === undefined) {
                return {lastExported: undefined};
            } else if (previous.lastExported.end < current.lastExported.end) {
                return previous;
            } else {
                return current;
            }
        }, {lastExported: {end:null}});
        this.allServices.lastExported = latest.lastExported;
        this.params.date  = latest.lastExported !== undefined ? new Date(latest.lastExported.end) : '';
        this.params.maxDate = latest.lastExported !== undefined ? new Date(latest.lastExported.end) : '';
    }
    
    openLastUpdated ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        this.dateopened = true;
    };

    clickService (service) {
        service.selected = !service.selected;
        this.evaluateAllServices();
    }
    
    clickAllServices () {
        this.allServices.selected = !this.allServices.selected;
        this.services.map( service => {
            service.selected = this.allServices.selected;
        });
    };
    
    submit () {
        this.exporting = true;
        this.exportError = undefined;
        const startDate: Date = this.params.date;
        var serverDate: Date;
        return this.SystemService.getServerDateWithTimezone()
            .then( date => serverDate = date )
            .then( () => this.EventService.updateEventData() )
            .then( () => this.UserService.getCurrentUserOrgunits() )
            .then( orgunits => this.EventExportService.exportEventsFromLastWithDependenciesInZip(startDate.toISOString(), orgunits, this.getSelectedPrograms()) )
            .then( eventsZipFile => saveAs(eventsZipFile, this.params.filename + '.zip') )
            .then( () => this.logExport(startDate, serverDate) )
            .then( () => this.updateLastExportInfo() )
            .then( () => console.log("Everything done") )
            .catch( error => this.exportError = error )
            .finally( () => this.exporting = false )
            // It is necessary to introduce this delay because of maxDate validator.
            .then( () => this.setLatestExportAsDefault() )
    };

    logExport (start: Date, end: Date) {
        return this.DataStoreService.getKeyValue(this.dataStoreKey).then( log => {
            const current = new TrackerDataExportLog(this.params.filename, start, end);
            log = log || {};
            this.getSelectedServices().map( service => {
                log[service.code] = current;
            });
            return this.DataStoreService.setKeyValue(this.dataStoreKey, log);
        });
    }

    getSelectedServices () {
        return !this.services ? [] :
            this.services.filter( service => service.selected );
    };

    getSelectedPrograms () {
        return this.getSelectedServices().reduce( (array, service) => {
            return array.concat(service.programs);
        }, []);
    }

    evaluateAllServices () {
        if(this.services != undefined) {
            this.allServices.selected = this.services.reduce( (state, current) => {
                return state && current.selected;
            }, true);
            // Commented because of some problems with refresh times
            /**
            this.params.maxDate = this.services
                .filter( service => service.selected && service.lastExported != undefined )
                .map( service => service.lastExported.end )
                .reduce((a, b) => a < b ? a : b , undefined);
            */
        }
    }

}
