
import * as angular from 'angular';

import { UserService } from '../users/UserService';
import { DataStoreService } from '../data-store/DataStoreService';
import { Orgunit } from '../../model/model';


export class ValidationService {

    static $inject = ['$q', 'DataStoreService', 'UserService', 'Organisationunit', 'DataExport'];

    constructor(private $q: ng.IQService, private DataStoreService: DataStoreService, private UserService: UserService, private Organisationunit, private DataExport) { }



    fillDatastore(): ng.IPromise<any> {
        var serversPushDatesNamespace = "ServersPushDates";
        var lastPushDateSaved = null;
        var lastDatePush = null;
        var sites = [];
        var services = [];

        return this.getProjectsDatastore(serversPushDatesNamespace).then(
            projectsDatastore => {
                return this.getUserMissions().then(
                    missions => {
                        return missions.reduce((total7, mission) => {
                            return total7.then(
                                /* Buscamos los proyectos para cada mision */
                                () => {
                                    return this.getMissionProjects(mission, projectsDatastore).reduce((total6, project) => {
                                        //var projectArrayPromises = projects.map( project => getDatasets(project));
                                        //$q.all(projectArrayPromises)
                                        //    .then(result => "done")

                                        return total6.then(
                                            () => {
                                                return this.DataStoreService.getNamespaceKeyValue(serversPushDatesNamespace, project.id + "_date").then(
                                                    data => {
                                                        lastDatePush = null;
                                                        if (data != undefined) {
                                                            lastDatePush = data.lastDatePush;
                                                            lastPushDateSaved = data.lastPushDateSaved;
                                                            if (lastPushDateSaved != lastDatePush) {
                                                                sites = this.getProjectSites(project); // Si lo pongo fuera no tiene valor cuando entra aqui
                                                                services = this.getSiteServices(sites);
                                                                return this.servicesValues(project, services, lastDatePush, lastPushDateSaved);
                                                            }
                                                        } else { console.log("no hay datos importados"); }
                                                    }
                                                ).then(
                                                    () => {
                                                        if ((lastDatePush != undefined) && (lastPushDateSaved != lastDatePush)) {
                                                            return this.DataStoreService.updateNamespaceKeyArraylastPush(serversPushDatesNamespace, project.id + "_date", lastDatePush);
                                                        }
                                                    });
                                            });
                                    }, this.$q.when("Done total 6"));
                                });
                        }, this.$q.when("Done total 7"));
                    }
                )
            }
        )
    }






    private getProjectSites(project) {
        var sites = [];
        /* Ponemos juntos todos los sites para luego buscar todos los services */
        sites = sites.concat(project.children);
        return sites;
    }

    private getSiteServices(sites) {
        var services = [];
        angular.forEach(sites, function (site) {
            /* Ponemos juntos todos los Services para luego buscar todos los datasets */
            angular.forEach(site.children, function (child) {
                child.siteName = site.name;
            });
            services = services.concat(site.children);
        });
        return services;
    }

    private servicesValues(project, services, lastDatePush, lastPushDateSaved) {
        return services.reduce((total2, service) => {
            return total2.then(
                () => {
                    return this.getDatasets(service.id).then(
                        dataSets => {
                            return this.dataSetsValues(dataSets, service, project, lastDatePush, lastPushDateSaved);
                        });
                }
            );
        }, this.$q.when("Done total 2"));
    }


    private getDatasets(orgUnit) {
        var filter = { filter: 'id:eq:' + orgUnit };
        return this.Organisationunit.get(filter).$promise.then(
            data => {
                return data.organisationUnits[0].dataSets;
            });
    }


    private dataSetsValues(dataSets, service, project, lastDatePush, lastPushDateSaved) {
        return dataSets.reduce((total3, dataSet) => {
            return total3.then(
                () => {
                    if (lastPushDateSaved != lastDatePush) { //DESCOMENTAR, comentado para pruebas
                        return this.readDatasetValues(dataSet.id, service.id, new Date(lastPushDateSaved)).then(
                            dataValues => {
                                if (dataValues != undefined) {
                                    return this.updateDatastoreValues(dataValues, project.id, service, dataSet, lastDatePush, lastPushDateSaved);
                                }
                            });
                    }
                });
        }, this.$q.when("Done total 3"));
    }




    private readDatasetValues(datasetId, service, lastUpdated) {
        return this.DataExport.get({
            dataSet: datasetId,
            orgUnit: service,
            lastUpdated: lastUpdated,
            includeDeleted: true
        }).$promise
            .then(function (result) {
                return result.dataValues;
            });
    }



    private updateDatastoreValues(dataValues, project, service, dataSet, lastDatePush, lastPushDateSaved) {

        var serversPushDatesNamespace = "ServersPushDates";
        var periods = [];
        for (var i in dataValues) {
            periods.push(dataValues[i].period);
        }
        var uniquePeriods = [...new Set(periods)];

        return uniquePeriods.reduce((total, period) => {
            var uniquePeriodRecord = {
                project: project,
                siteName: service.siteName,
                service: service.id,
                serviceName: service.name,
                dataSet: dataSet.id,
                dataSetName: dataSet.name,
                lastDatePush: lastDatePush,
                lastPushDateSaved: lastPushDateSaved,
                period: period
            };
            return total.then(
                () => {
                    return this.DataStoreService.updateNamespaceKeyArrayPeriod(serversPushDatesNamespace, project + "_values", uniquePeriodRecord)
                })
        }, this.$q.when("Done total"));
    }


    readDatastore(): ng.IPromise<ProjectDatastoreRecord> {
        var serversPushDatesNamespace = "ServersPushDates";
        var lastPushDateSaved = null;
        var lastDatePush = null;
        var missions = [];
        var projects = [];

        var projects_scope = [];
        var datasets_scope = [];



        return this.getProjectsDatastore(serversPushDatesNamespace).then(

            projectsDatastore => {
                return this.getUserMissions().then(
                    UserMissions => {

                        var missionPromises = UserMissions.map(mission => {
                            mission['missionID'] = mission.id;
                            mission['cellID'] = this.getOrgunitCell(mission);
                            return this.getMissionProjects(mission, projectsDatastore).reduce((total6, project) => {
                                return total6.then(
                                    () => {
                                        return this.DataStoreService.getNamespaceKeyValue(serversPushDatesNamespace, project.id + "_date").then(
                                            data => {
                                                if (data != undefined) {
                                                    lastDatePush = data.lastDatePush;
                                                    lastPushDateSaved = data.lastPushDateSaved;
                                                    project['lastDatePush'] = data.lastDatePush;
                                                    project['missionName'] = mission.name;
                                                    project['missionID'] = mission.id;
                                                    project['cellID'] = this.getOrgunitCell(project);
                                                    var today = new Date().getTime();
                                                    var diff = (today - lastDatePush) / (1000 * 60 * 60 * 24);
                                                    if (diff > 30) { project['overdueSync'] = true }
                                                    return this.DataStoreService.getNamespaceKeyValue(serversPushDatesNamespace, project.id + "_values").then(
                                                        data => {
                                                            datasets_scope = datasets_scope.concat(data.values);


                                                            //  $scope.datasets = datasets_scope;
                                                            project['datasets'] = data.values.length;
                                                            projects_scope.push(project);
                                                            //  $scope.projects = projects_scope;
                                                            return this.$q.resolve("Done project");
                                                        });
                                                } else {
                                                    return this.$q.resolve("No data for this project")
                                                }
                                            }
                                        )
                                    })
                            }, this.$q.when("Done total 6"))

                        });
                        missions = UserMissions;
                        return this.$q.all(missionPromises);
                    }).then(() => {

                        return { missions: missions, projects: projects_scope, datasets: datasets_scope };
                    });
            });
    }


    private getProjectsDatastore(namespace) {
        var projects = [];
        return this.DataStoreService.getNamespaceKeys(namespace).then(
            data => {
                projects = data.filter(this.projectsFilter);
                projects.forEach(this.projectsRemoveText);
                return projects;
            });
    }


    private getUserMissions() {
        return this.UserService.getCurrentUserTree().then(me => {
            /* Buscamos las misiones que tiene asignadas el usuario */
            var missions = [];
            missions = me.dataViewOrganisationUnits;

            /*
            $scope.isMedco = false;
            angular.forEach(me.userCredentials.userRoles, function (userRole) {
                $scope.isMedco = userRole.name === "MedCo" ? true : $scope.isMedco;
            });
    
    */

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

validateDataset (dataset) {
  var serversPushDatesNamespace = "ServersPushDates";
        
        return this.DataStoreService.deleteNamespaceKeyValue(serversPushDatesNamespace, dataset.project + "_values", dataset);
           

}
}

class ProjectDatastoreRecord {
    constructor(
        public misions: MisionRecord[],
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
        public cellID: string,
        public datasets: number,

    ) { }
}

class MisionRecord {
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
        public lastDatePush: number

    ) { }
}

