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

import { ProgressStatus } from '../../model/model';
import { EventImportService } from '../../services/services.module';

export class TrackerDataImport {

    static $inject = ["$q", "EventImportService", "AnalyticsService", "DemographicsService", "DataStoreService","EventHelper"];

    progressStatus = {};
    analyticsStatus = {};
    refreshingData=false;
    importingData=false;
    undefinedFile: boolean = false;
    summary;
    analyticsLog: any[];
    import_result=false;
    importGap=false;
    message="";
    d="";
    imported="";
    deleted="";
    updated="";
    ignored="";
    projectName="";
    projectId="";
    lastUpdated="";
    endDate="";
    lastUpdatedDataStore="";
    endDateDataStore="";
    importFailed: boolean;
    previewDataImport: boolean;
    analyticsShow=false;

    $file;//single file

    constructor(private $q: ng.IQService, private EventImportService: EventImportService, private AnalyticsService, 
                private DemographicsService, private DataStoreService) {}

    showImportDialog() {

        this.varValidation();
        if (!this.undefinedFile){
            $("#importConfirmation").modal();
        }
    };

    sendFiles() {

        $("#importConfirmation").modal("hide");
        
       
        this.summary = undefined;
        this.analyticsLog = [];
        this.EventImportService.readEventZipFile(this.$file).then( 
            (eventFile) => {
            var namespace="ServersTrackerImportDates";
            var dataStoreKey=eventFile["settings"].projectId;

            
            this.projectName=eventFile["settings"].projectName;       
            this.lastUpdated= eventFile["settings"].lastUpdated;
            this.endDate=eventFile["settings"].endDate;

            this.DataStoreService.getNamespaceKeyValue(namespace, dataStoreKey)
            .then(data=>{
                
                this.lastUpdatedDataStore= data.lastUpdated;
                this.endDateDataStore=data.endDate;
if (this.lastUpdated>data.endDate) { this.importGap=true;} 
return this.importGap
            })
           
            .then(d => {

                if (!this.importGap) {
                    this.importingData=true;
        this.progressStatus = ProgressStatus.initialWithoutProgress;
                    this.EventImportService.importEventFile2(this.$file)
                        .then((result) => {
                        console.log("resultado3");
                        console.log(result);
                        this.import_result=true;
                        this.message=result["data"].data.message;
                        this.imported=result["data"].data.response.imported;
                        this.updated=result["data"].data.response.updated;
                        this.deleted=result["data"].data.response.deleted;
                        this.ignored=result["data"].data.response.ignored;
                        this.progressStatus = ProgressStatus.doneSuccessful;
                        //this.progressStatus = ProgressStatus.doneWithFailure
                        var namespace="ServersTrackerImportDates";
                        
                    console.log(this.$file.name);
                        var dataStoreKey=result["settings"].projectId;
                        this.projectName=result["settings"].projectName;
                        this.lastUpdated= result["settings"].lastUpdated;
                        this.endDate=result["settings"].endDate; 
                        var log={
                            projectId: result["settings"].projectId,
                            projectName:  result["settings"].projectName,
                            lastUpdated:  result["settings"].lastUpdated,
                            filename:this.$file.name,
                            endDate:  result["settings"].endDate
            
                        }
                    
                      
            
                        this.DataStoreService.setNamespaceKeyValue(namespace, dataStoreKey, log);
                        this.refreshingData=true;
                        this.analyticsStatus = ProgressStatus.initialWithoutProgress;
                        this.analyticsShow=true;
                        })
                        .then(() => this.AnalyticsService.refreshEventAnalytics())
                        .then(
                            success => this.analyticsStatus = ProgressStatus.doneSuccessful,
                            error => this.analyticsStatus = ProgressStatus.doneWithFailure,
                            notification => this.analyticsLog.push(notification)
                        );        
                };

            });
        });
    }
    public showFileContentSummary() {
       this.refreshingData=false;
       this.import_result=false;
       this.analyticsShow=false;
    this.importingData=false;
        this.varValidation();
        if (!this.undefinedFile) {
            this.importingData=false;
            this.progressStatus = ProgressStatus.initialWithoutProgress;
            this.summary = undefined;
            this.EventImportService.previewEventFile(this.$file).then( result => {
                this.summary = result["summary"];
                this.projectName=result["settings"].projectName;
                this.projectId=result["settings"].projectId;
                this.lastUpdated= result["settings"].lastUpdated;
                this.endDate=result["settings"].endDate; 
		
                this.progressStatus = ProgressStatus.hidden;
            });
        }
    };

    onFileSelect($files) {
        for (var i = 0; i < $files.length; i++) {
            this.$file = $files[i];//set a single file
            this.undefinedFile = false;
            this.importFailed = false;
        }
        this.previewDataImport = false;
    };

    private varValidation() {
        this.undefinedFile = (this.$file == undefined);
    }
}
