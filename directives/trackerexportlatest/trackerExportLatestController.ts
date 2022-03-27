
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

    params = { date: null, endDate: null, maxDate: null, filename: ""};
    dateOptions={};
    dateEndOptions={};
    services = null;
    allServices = { lastExported: "", selected: false};
    exporting = false;
    dateopened = false;
    endDateopened = false;
    serverName="";
    projectName="";
    projectId="";
    exportError;
    endDateEnable=false;
    enableDate=false;
    dataStoreKey: string = 'trackerexport';

    static $inject = ['$filter', 'ProgramService', 'UserService', 'EventExportService', 'EventService', 'DataStoreService', 'SystemService'];

    constructor(private $filter, private ProgramService: ProgramService, private UserService: UserService, 
                private EventExportService: EventExportService, private EventService: EventService, 
                private DataStoreService: DataStoreService, private SystemService: SystemService) {}

    $onInit() {

        this.UserService.getCurrentUser().then (user=> {
             this.serverName=user.userCredentials.username.split("-")[1];
            } ).then(()=>{
                
                return    this.UserService.getCurrentUserOrgunits()
            
            })

        .then((ou)=>
        {
            this.projectName=ou[0].name;
            this.projectId=ou[0].id;
            //console.log("ou");
            //console.log(ou[0].name);
        })
            .then(()=>this.ProgramService.getProgramsUnderUserHierarchyByService())
        
            .then( data => {
                this.services = data;
                this.clickAllServices();
            })
            .then( () => this.updateLastExportInfo() )
           .then( ()=> this.SystemService.getServerDateWithTimezone())
           
            
            .then( serverDate=> this.setLatestExportAsDefault(serverDate) );
    }

    updateLastExportInfo () {
        return this.DataStoreService.getKeyValue(this.dataStoreKey).then( log => {
            //console.log(log[this.projectId][this.serverName]);
            var log2=log[this.projectId];
            
            if (log2 != undefined) {
                if  (log2[this.serverName]!=undefined){
                this.services.map( service => {
                    service.lastExported = log2[this.serverName][service.code];
                
                });
            }
            } 
        
            return "Done";
        });
    }

    setLatestExportAsDefault (serverDate)  {
        
        var latest = this.services.reduce( (previous, current) => {
            if (previous.lastExported === undefined || current.lastExported === undefined) {
                return {lastExported: {"end":"2019-01-01"}};
            } else if (previous.lastExported.end < current.lastExported.end) {
                return previous;
            } else {
                return current;
            }
        });
        if (latest.lastExported==undefined) { 
         latest = {"lastExported": {"end":"2019-01-01"}};
        }
        //console.log("latest.lastExported");
        //console.log(latest.lastExported);
        this.allServices.lastExported = latest.lastExported;
        this.params.date  = latest.lastExported !== undefined ? new Date(latest.lastExported.end) : '';
        this.params.maxDate = latest.lastExported !== undefined ? new Date(latest.lastExported.end) : '';
        var d=   new Date(latest.lastExported.end) ; // Maximal selectable date
        var month= d.getMonth()+1;
        //this.params.endDate= new Date();

        this.params.endDate = serverDate;
        this.dateOptions = {maxDate : d};
        this.dateEndOptions = {maxDate : this.params.endDate};
         // console.log("this.dateOptions");
         // console.log(this.dateOptions);
    }
    
    openLastUpdated ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        this.dateopened = true;
    };

    openEndDate ($event) {
       // $event.preventDefault();
       // $event.stopPropagation();
        this.endDateopened = true;
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
    
    enableEndDate (value) {
       
       this.endDateEnable= this.enableDate;

    }
    submit () {
        this.exporting = true;
        this.exportError = undefined;
        const startDate: Date = this.params.date;
        const endDate: Date = this.params.endDate;
        var serverDate: Date;
        var serverName;
        return this.UserService.getCurrentUser()
        .then(user=> serverName=user.userCredentials.username.split("-")[1]
        )
        .then(()=> this.SystemService.getServerDateWithTimezone())
            .then( date => serverDate = date )
            .then( () => this.EventService.updateEventData() )
            .then( () => this.UserService.getCurrentUserOrgunits() )
            .then( orgunits => this.EventExportService.exportEventsFromLastWithDependenciesInZip(startDate.toISOString(), endDate, serverName, orgunits, this.getSelectedPrograms()) )
            .then( eventsZipFile => saveAs(eventsZipFile, this.params.filename + '.zip') )
            .then( () => this.logExport(startDate, endDate, serverName, this.projectId, this.projectName) )
            .then( () => this.updateLastExportInfo() )
            .then( () => console.log("Everything done") )
            .catch( error => this.exportError = error )
            .finally( () => this.exporting = false )
            // It is necessary to introduce this delay because of maxDate validator.
            .then( () => this.setLatestExportAsDefault(endDate) )
    };

    logExport (start: Date, end: Date, serverName, projectId, projectName) {
        return this.DataStoreService.getKeyValue(this.dataStoreKey).then( log => {
            const current = new TrackerDataExportLog(this.params.filename, start, end, serverName, projectName);
            log = log || [];
            if (log[projectId]==undefined) {  log[projectId]={};}
            if (log[projectId][serverName]==undefined) { log[projectId][serverName]={}}
            this.getSelectedServices().map( service => {
                log[projectId][serverName][service.code] = current;
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
