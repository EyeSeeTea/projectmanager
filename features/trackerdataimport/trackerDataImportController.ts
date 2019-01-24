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
//import { UserService } from '../../services/users/UserService';
import { DataStoreNames } from '../../services/data-store/DataStoreNames';
import { pbkdf2Sync } from 'crypto';

export class TrackerDataImport {
 

    static $inject = ["$q", "EventImportService", "AnalyticsService", "DemographicsService", "DataStoreService","ProgramService","UserService","EventHelper"];

    progressStatus = {};
    analyticsStatus = {};
    refreshingData=false;
    importingData=false;
    undefinedFile: boolean = false;
    summary;
    analyticsLog: any[];
    import_result=false;
    importGap=false;
    importOUTDATED=false;
    message="";
    d="";
    imported="";
    deleted="";
    updated="";
    ignored="";
    projectName="";
    projectId="";
    serverName="";
    lastUpdated="";
    endDate="";
    lastUpdatedDataStore="";
    endDateDataStore="";
    importFailed: boolean;
    previewDataImport: boolean;
    analyticsShow=false;

    $file;//single file
    projects=[];
    programsNames=[];

    constructor(private $q: ng.IQService, private EventImportService: EventImportService, private AnalyticsService, 
                private DemographicsService, private DataStoreService, private ProgramService, private UserService) {
                    this.init();
                }
    
               async init(){
                var namespace="ServersTrackerImportDates";
                var p2=[];
                var p3=[];
                var project;
                var p= await this.getUserProjects();
                var keys= await this.DataStoreService.getNamespaceKeys(namespace);
              //  if ( keys==undefined) { await this.DataStoreService.setNamespaceKeys(namespace,{});
            
           // }
                for( project in p)  {
                
                    if (keys.indexOf(p[project].id)>-1) {
                                var data= await this.getImportDate(p[project].id);
     
                                    var d; 
                 
                                        for ( d in data) {
                                            
                                            //if (p3[project]==undefined) { p3[project]=[];}
                                            p3["name"]=p[project]["name"];
                                            p3["id"]=p[project]["id"];
                                            
                                           if (Object.keys(data).length>1) {p3["serverName"]=data[d].serverName;}
                                          
                                            p3["lastImportDate"]=data[d].endDate;
                                            var programsDataStore=data[d].programs;
                                            
                                           if (programsDataStore!=undefined) {
                                           
                                            for ( var index in programsDataStore)  { 
                                               
                                               if (this.programsNames[index]==undefined) {
                                                var prog= await this.ProgramService.getProgramAndStages(programsDataStore[index]); 
                                                this.programsNames[index]=prog.name;
                                                programsDataStore[index]=prog.name;
                                            }
                                                else { 

                                                    programsDataStore[index]=this.programsNames[index];
                                                }
                                               
                                               
                                            
                                        }
                                    }
                                            p3["programs"]=JSON.stringify(programsDataStore);
                                            if (p3["programs"]!=undefined) {  p3["programs"]=p3["programs"].replace(new RegExp('"', 'g') ,"").replace(new RegExp("\\[", 'g'),"").replace(new RegExp("\\]", 'g'),"").replace(new RegExp(",", 'g'),", ")}
                                            
                                            p2.push(p3);
                                            p3=[];
    
                                    
                     }
     
                };
      
               
                this.projects=p.concat(p2);
                this.projects=this.projects.filter(p => p.lastImportDate!=undefined);
                //console.log(this.projects)
                                                }  
                                            }    
               
    showImportDialog() {

        this.varValidation();

        if (!this.undefinedFile){
            $("#importConfirmation").modal();
        }
    };

   

    sendFiles() {

        $("#importConfirmation").modal("hide");
        this.importOUTDATED=false;
        this.importGap=false;
       
        this.summary = undefined;
        this.analyticsLog = [];
        this.EventImportService.readEventZipFile(this.$file).then( 
            (eventFile) => {
            var namespace="ServersTrackerImportDates";
            var dataStoreKey=eventFile["settings"].projectId;
            var serverName=eventFile["settings"].serverName;
            this.projectName=eventFile["settings"].projectName;       
            this.lastUpdated= eventFile["settings"].lastUpdated;
            this.endDate=eventFile["settings"].endDate;

            this.DataStoreService.getNamespaceKeyValue(namespace, dataStoreKey)
            .then(data=>{
                if (data!=undefined) {
                  if(  data[serverName]!=undefined) { 
                this.lastUpdatedDataStore= data[serverName].lastUpdated;
                this.endDateDataStore=data[serverName].endDate;
            if (this.lastUpdated>data[serverName].endDate) { this.importGap=true;} 
            if (this.endDate<data[serverName].endDate) { this.importOUTDATED=true;} 
                    return this.importGap
                }
                } else {return this.importGap}
}
        )
           
            .then(d => {

                if (!this.importGap && !this.importOUTDATED) {
                    this.importingData=true;
                    this.progressStatus = ProgressStatus.initialWithoutProgress;
                    this.EventImportService.importEventFile2(this.$file)
                        .then((result) => {
                        
                        this.import_result=true;
                        this.message=result["data"].data.message;
                        this.imported=result["data"].data.response.imported;
                        this.updated=result["data"].data.response.updated;
                        this.deleted=result["data"].data.response.deleted;
                        this.ignored=result["data"].data.response.ignored;
                        this.progressStatus = ProgressStatus.doneSuccessful;
                        //this.progressStatus = ProgressStatus.doneWithFailure
                        var namespace="ServersTrackerImportDates";
                                            
                        var dataStoreKey=result["settings"].projectId;
                        this.serverName=result["settings"].serverName;
                        this.projectName=result["settings"].projectName;
                        this.lastUpdated= result["settings"].lastUpdated;
                        this.endDate=result["settings"].endDate; 
                        this.DataStoreService.getNamespaceKeyValue(namespace, dataStoreKey).then(log => {

                            if (log==undefined) { log={};}
                            var programs=result["settings"].programs.map(p=>p.id);


                            log[serverName]={
                                projectId: result["settings"].projectId,
                                projectName:  result["settings"].projectName,
                                serverName:  result["settings"].serverName,
                                lastUpdated:  result["settings"].lastUpdated,
                                programs: programs,
                                filename:this.$file.name,
                                endDate:  result["settings"].endDate
                
                            }
                        
                          
                
                            this.DataStoreService.setNamespaceKeyValue(namespace, dataStoreKey, log);
                            this.refreshingData=true;
                            this.analyticsStatus = ProgressStatus.initialWithoutProgress;
                            this.analyticsShow=true;
                        })
                      
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
        this.importOUTDATED=false;
        this.importGap=false;
        this.varValidation();
        if (!this.undefinedFile) {
            this.importingData=false;
            this.progressStatus = ProgressStatus.initialWithoutProgress;
            this.summary = undefined;
            this.EventImportService.previewEventFile(this.$file).then( result => {
               //console.log("result");
                //console.log(result);
                this.summary = result["summary"];
                this.projectName=result["settings"].projectName;
                this.serverName=result["settings"].serverName;
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
    public getImportDate(projectId) {
        var projects = [];
        var namespace="ServersTrackerImportDates";
        var servers=[];
        var d;
   
        return this.DataStoreService.getNamespaceKeyValue(namespace, projectId)
        .then(datos=>{
            //console.log("datos");
            //console.log(datos.toJSON());
           
           if (datos!=undefined) {
            for(d in datos.toJSON()) {
                //console.log("d");
                //console.log(d);
                servers[d]={"serverName": d, "endDate":datos[d].endDate, "programs":datos[d].programs}
            }
            return servers;
        
       
    } else {return null}

        }
           )
        
        
        
    }

    private getUserProjects() {
        return this.UserService.getCurrentUserTree().then(me => {
            
            /* Buscamos las misiones que tiene asignadas el usuario */
            var missions = [];
            var projects = [];
            missions = me.dataViewOrganisationUnits;
           
            projects=this.addProjects(missions);
           // console.log("projects");
           // console.log(projects);

            return projects;
        })

    };

    private addProjects(ous) {
        var projects=[];
     
     ous.forEach(element => {
         //projects.push(element)
       if (element.name!="OC")  {
        if (element.level==4) { projects.push(element);} 
         element.children.forEach(element2 => {
            if (element2.level==4) { projects.push(element2);} 
            if (element2.name!="OC")  {
            element2.children.forEach(element3 => {
                if (element3.level==4) { projects.push(element3);}   
                element3.children.forEach(element4 =>{
                   if (element4.level==4) { projects.push(element4);} 
                })

            });
        }            
        });

    } 
     });
     
    return projects;
    }

}

