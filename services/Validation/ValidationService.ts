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

import * as angular from 'angular';

import { ServerPushDatesDataStoreService, UserService } from '../services.module'
import { Orgunit } from '../../model/model';

export class ValidationService {
    private projects;
    private datasets;
    static $inject = ['$q', 'UserService', 'Organisationunit', 'DataExport', 'ServerPushDatesDataStoreService'];

    constructor(private $q: ng.IQService, private UserService: UserService, 
                private Organisationunit, private DataExport,
                private ServerPushDatesDataStoreService: ServerPushDatesDataStoreService) {}


    fillDatastore(): ng.IPromise<any> {
        return this.getProjectsDatastore().then(
            projectsDatastore => {
                return this.getUserMissions().then(
                    missions => {

                        var missionArrayPromises = missions.map(mission => this.fillDatastoreMissions(mission, projectsDatastore));
                        return this.$q.all(missionArrayPromises)
                            .then(result => "done")

                    }
                )
            }
        )
    }

    private fillDatastoreMissions(mission, projectsDatastore) {
        var projects = [];
        projects = this.getMissionProjects(mission, projectsDatastore);
        var projectArrayPromises = projects.map(project => this.fillDatastoreProjects(mission, project));
        return this.$q.all(projectArrayPromises)
            .then(result => "done")


    }

    private fillDatastoreProjects(mission, project) {

        var lastPushDateSaved = null;
        var lastDatePush = null;
        var sites = [];
        var services = [];
        var orgUnits=[];
        return this.ServerPushDatesDataStoreService.getKeyValue(project.id + "_date").then(
            data => {
                lastDatePush = null;
                if (data != undefined) {
                    lastDatePush = data.lastDatePush;
                    lastPushDateSaved = data.lastPushDateSaved;
                    if (lastPushDateSaved != lastDatePush) {
                        sites = this.getProjectSites(project); // Si lo pongo fuera no tiene valor cuando entra aqui
                        services = this.getSiteServices(sites);
                       orgUnits=sites.concat(services);
                       var project2=project;
                       project2.siteName=""; // N/A
                       project2.siteId=""; // N/A
                       project2.serviceName=""; //N/A
                       //var name=project.name;
                       //project2.name="N/A";
                       project2.serviceId=""; //N/A
                       orgUnits=orgUnits.concat(project2);
                      // project.name=name;
                       //console.log("Org Units");
                       //console.log(orgUnits);
                        // crear array orgUnits que incluya services y sites para buscar sus dataasets
                        // en los datasets a nivel de site poner service = N/A
                        // en los dataSets a nivel de proyecto poner site y service = N/A
                       // return this.servicesValues(mission.id, project, services, lastDatePush, lastPushDateSaved);
                        return this.orgUnitsValues(mission.id, project, orgUnits, lastDatePush, lastPushDateSaved);
                  
                    }
                } else { console.log("No hay datos importados"); }
            }
        ).then(
            () => {
                if ((lastDatePush != undefined) && (lastPushDateSaved != lastDatePush)) {
                    return this.ServerPushDatesDataStoreService.updateNamespaceKeyArraylastPush(project.id + "_date", lastDatePush);
                }
            });
    }


    private getProjectSites(project) {
        var sites = [];
        /* Ponemos juntos todos los sites para luego buscar todos los services */
        
        sites = sites.concat(project.children);
      
        //Añadir esto para los datasets a nivel de site
        angular.forEach(sites, function (site) {
            site.siteName = site.name;
            site.siteId = site.id;
        
        });
        
        return sites;
    }

    private getSiteServices(sites) {
        var services = [];
        angular.forEach(sites, function (site) {
            /* Ponemos juntos todos los Services para luego buscar todos los datasets */
            angular.forEach(site.children, function (child) {
                child.siteName = site.name;
                child.siteId = site.id;
                child.serviceName=child.name;
                child.serviceId=child.id;
            });
            //Se puede añadir los sites a los servicios, para que despues incluya
            //los datasets de los sites
            //site.siteName=site.name;
            //site.siteId=site.id;
            //services=services.concat(site);
            
            services = services.concat(site.children);
        });
        return services;
    }
    //aqui deberia recibir los sites o hacer un sitesValues
    private orgUnitsValues(mission, project, orgUnits, lastDatePush, lastPushDateSaved) {
        return orgUnits.reduce((total2, orgUnit) => {
            return total2.then(
                () => {
                    return this.getDatasets(orgUnit.id).then(
                        dataSets => {
                            //concatenar los datasets de site y proyecto
                            //this.getDatasets(project.id)
                           return this.getDatasets(project.id).then(
                          
                           dataSetsProject => {
                            var dataSetsIncludeProject=dataSetsProject.concat(dataSets);
                            //console.log("DataSets");
                           //IncludeProject); // NO se usa
                            return this.dataSetsValues(dataSets, orgUnit, mission, project, lastDatePush, lastPushDateSaved);
                           })
                        });
                }
            );
        }, this.$q.when("Done total 2"));
    }

   private getDatasets(orgUnit) {
    var filters = { filter: [
        'id:eq:' + orgUnit
        //'dataSets.attributeValues.attribute.code:neq:HIDE_IN_VALIDATION'
   // NO Filtrar por api, obtener todo y despues filtar los dataSets
   
]};

return this.Organisationunit.get(filters).$promise.then(
            data => {
                var dataSets=data.organisationUnits[0].dataSets;
                //var dataSets_filtered = data.organisationUnits[0].dataSets.filter(filter_datasets);
                var filtered = [];
                var include=true;
            for (var i = 0; i < dataSets.length; i++) {
                include=true;
                for (var i2 = 0; i2 < dataSets[i].attributeValues.length; i2++)
            {
                if (dataSets[i].attributeValues[i2].attribute.code == "HIDE_IN_VALIDATION" &&
                dataSets[i].attributeValues[i2].value == "true"
                ) { include=false;  
                //console.log("dataset");
                //console.log( dataSets[i]);
                }
            }  
               if (include) {filtered.push(dataSets[i]);}
            }
            return filtered;
            }
    
                
            );
    }

  

    private dataSetsValues(dataSets, orgUnit, mission, project, lastDatePush, lastPushDateSaved) {
        return dataSets.reduce((total3, dataSet) => {
            return total3.then(
                () => {
                    if (lastPushDateSaved != lastDatePush) { //DESCOMENTAR, comentado para pruebas
                       
                       //new Date((new Date(1530866294000).toString()).split("GMT")[0]+"GMT +0000")
                        return this.readDatasetValues(dataSet.id, orgUnit.id, new Date(new Date(lastPushDateSaved).toLocaleString())).then(
                            dataValues => {
                                
                                if (dataValues != undefined) {
                                    //Añadir en la llamada el site (id y name)
                                    return this.updateDatastoreValues(dataValues, mission, project.id, orgUnit, dataSet, lastDatePush, lastPushDateSaved);
                                }
                            });
                    }
                });
        }, this.$q.when("Done total 3"));
    }




    private readDatasetValues(datasetId, orgUnitId, lastUpdated) {
     //  console.log("READ DATASET VALUES")
     //   console.log("DATASETID");
     //   console.log(datasetId);
     //   console.log("ORGUNIT");
      //  console.log(orgUnitId);
        
        return this.DataExport.get({
            dataSet: datasetId,
            orgUnit: orgUnitId,
            lastUpdated: lastUpdated,
            includeDeleted: true
        }).$promise
            .then(function (result) {
                return result.dataValues;
            });
    }



    private updateDatastoreValues(dataValues, mission, project, service, dataSet, lastDatePush, lastPushDateSaved) {

        var periods = [];
        for (var i in dataValues) {
            periods.push(dataValues[i].period);
        }
        var uniquePeriods = [...new Set(periods)];

        return uniquePeriods.reduce((total, period) => {
            var uniquePeriodRecord = {

                missionId: mission,
                project: project,
                siteName: service.siteName,
                siteId: service.siteId,
                service: service.serviceId,
                serviceName: service.serviceName, // TODO: ServiceName?
                dataSet: dataSet.id,
                dataSetName: dataSet.name,
                lastDatePush: lastDatePush,
                lastPushDateSaved: lastPushDateSaved,
                period: period
            };
            return total.then(
                () => {
                    return this.ServerPushDatesDataStoreService.updateNamespaceKeyArrayPeriod(project + "_values", uniquePeriodRecord);
                })
        }, this.$q.when("Done total"));
    }


    readDatastore(): ng.IPromise<ProjectDatastoreRecord> {
        var lastPushDateSaved = null;
        var lastDatePush = null;
        var missions = [];

        this.datasets = [];
        this.projects = [];
   
                return this.getProjectsDatastore().then(

                    projectsDatastore => {
                        return this.getUserMissions().then(
                            UserMissions => {

                                var missionArrayPromises = UserMissions.map(mission => {
                                    mission['missionID'] = mission.id;
                                    mission['cellID'] = this.getOrgunitCell(mission);
                                    return this.readDatastoreMissions(mission, projectsDatastore)
                                });
                                missions = UserMissions;
                                return this.$q.all(missionArrayPromises)
                                    .then(result => "done");
                            }).then(() => {


                                return { missions: missions, projects: this.projects, datasets: this.datasets };
                            });
                    });
       
    }


    private readDatastoreMissions(mission, projectsDatastore) {

        var projects = this.getMissionProjects(mission, projectsDatastore);
        var projectArrayPromises = projects.map(project => this.readDatastoreProject(mission, project));
        return this.$q.all(projectArrayPromises)
            .then(result => "done")
    }



    private readDatastoreProject(mission, project) {

        var lastPushDateSaved = null;
        var lastDatePush = null;

        return this.ServerPushDatesDataStoreService.getKeyValue(project.id + "_date").then(
            data => {
                if (data != undefined) {
                    lastDatePush = data.lastDatePush;
                    lastPushDateSaved = data.lastPushDateSaved;
                    project['lastDatePush'] = data.lastDatePush;
                    project['missionName'] = mission.name;
                    project['missionID'] = mission.id;
                    project['cellID'] = mission.cellID; //this.getOrgunitCell(project);
                    var today = new Date().getTime();
                    var diff = (today - lastDatePush) / (1000 * 60 * 60 * 24);
                    if (diff > 30) { project['overdueSync'] = true }
                    return this.ServerPushDatesDataStoreService.getKeyValue(project.id + "_values").then(
                        data => {
                            if (data != undefined) {
                                //aqui lee todos los datasets del dataStore (con el service incluido)
                                this.datasets = this.datasets.concat(data.values);
                                //FILTRAR HIDE_IN_VALIDATION
                                project['datasets'] = data.values.length;
                                this.projects.push(project);

                                return this.$q.resolve("Done project");
                            } else {
                                return this.$q.resolve("No data for this project")
                            }
                        });
                } else {
                    return this.$q.resolve("No data for this project")
                }
            }
        )
    }

    private getProjectsDatastore() {
        var projects = [];
        return this.ServerPushDatesDataStoreService.getKeys().then(
            data => {
                if (data != undefined) {
                    projects = data.filter(this.projectsFilter);
                    projects.forEach(this.projectsRemoveText);
                }
                return projects;
            });
    }


    private getUserMissions() {
        return this.UserService.getCurrentUserTree().then(me => {
            /* Buscamos las misiones que tiene asignadas el usuario */
            var missions = [];
            missions = me.dataViewOrganisationUnits;


            if (missions[0].level == 1) {
                missions = missions[0].children[1].children;
                //  $scope.showMissions = true
            }
            if (missions[0].level == 2) {
                missions = missions[0].children
                //   $scope.showMissions = true
            }
            // $scope.missions = this.missions;
            return missions;
        })

    };

    private getOrgunitCell(project) {
        var cell = "";
        var cells = [{ name: "Cell1", id: "kZZv93qYHHE" }, { name: "Cell2", id: "S2TjYXvvixI" }, { name: "Cell3", id: "HtTAwt3tb2J" }, { name: "Cell4", id: "WwsadBUxD0X" }, { name: "Cell5", id: "LZBm2f3o63Q" }, { name: "UE", id: "pI3jvvIVWed" }];
        //console.log(project);
        for (var i in project.organisationUnitGroups) {
            for (var z in cells) {
                if (project.organisationUnitGroups[i].id == cells[z].id) {
                    cell = cells[z].id;
                    return cells[z].id;
                }
            }
        }
        return cell;
    }

    private getMissionProjects(mission, projectsDatastore) {

        var projects = [];
        var projects2 = [];
        projects = mission.children;

        angular.forEach(projects, function (project, index2) {
            var index = projectsDatastore.indexOf(project.id);
            if (index > -1) {
                projects2[index] = project
            }
        });
        return projects2;


    }
    private projectsRemoveText(item, index, arr) {
        arr[index] = item.replace("_date", "");
    }

    projectsFilter(value) {
        return value.indexOf("date") > -1
    }

    validateDataset(dataset) {
        return this.ServerPushDatesDataStoreService.deleteNamespaceKeyValue(dataset.project + "_values", dataset);
    }
}

class ProjectDatastoreRecord {
    constructor(
        public missions: MissionRecord[],
        public projects: ProjectRecord[],
        public datasets: datasetRecord[],

    ) { }
}



class ProjectRecord {
    constructor(
        public id: string,
        public name: string,
        public lastDatePush: number,
        public missionName: string,
        public missionID: string,
        public siteName: string,
        public cellID: string,
        public datasets: number,

    ) { }
}

class MissionRecord {
    constructor(
        public missionID: string,
        public name: string,
        public cellID: string

    ) { }
}

class datasetRecord {
    constructor(
        public serviceName: string,
        public dataSetName: string,
        public period: string,
        public lastDatePush: number,
        public missionId: string,
        public siteId: string,
        public project: string,
        public service: string

    ) { }
}

