
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

import * as angular from 'angular';

export class trackerOnlineSyncComponent implements ng.IComponentOptions {
    public controller: any;
    public template: string;
    public css: string;

    constructor() {
        this.controller = trackerOnlineSyncController;
        this.template = require('./trackerOnlineSyncView.html');
        this.css = require('./trackerOnlineSyncCss.css');
    }
}

class trackerOnlineSyncController {

 

  
    exporting = false;
    syncFinished=false;
   // jobId="hM8gvQULb71"; //ejg2w529PyN
    
    exportError;
    dataStoreKey: string = 'trackeronlinesync';
    lastExecutedStatus="";
    lastExecuted="";
    jobId=null;

    static $inject = ['$filter', 'ProgramService', 'UserService',   'DataStoreService', 'SystemService'];

    constructor(private $filter, private ProgramService: ProgramService, private UserService: UserService, 
                
                private DataStoreService: DataStoreService, private SystemService: SystemService) {this.init();}
   
   
async init() {
    console.log("jobId");
    this.jobId=await this.ProgramService.getJobId("individual");
    this.jobId=this.jobId.jobConfigurations[0].id;
   
    var result2 =await this.ProgramService.jobs(this.jobId);
    this.lastExecutedStatus=result2.lastExecutedStatus;
    this.lastExecuted=result2.lastExecuted;
    var element = angular.element($('#submit'));
    element.scope().$apply();
}
    async submit () {
       this.exporting = true;
       this.exportError = undefined;
       var result =await this.ProgramService.programSync(this.jobId);
       var result2 =await this.ProgramService.jobs(this.jobId);
       this.lastExecutedStatus=result2.lastExecutedStatus;
       this.lastExecuted=result2.lastExecuted;
       //console.log(result2);
        this.exporting = false;
        this.syncFinished=true;
        var element = angular.element($('#submit'));
        element.scope().$apply();
            
           
    };

}
