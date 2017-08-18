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

export const validationdataDirective = [function () {
    return {
        restrict: 'E',
        controller: validationdataController,
        template: require('./validationdata.html'),
        scope: {}
    }
}];

var validationdataController = ["$scope", '$interval', "$q", '$upload', '$filter', "Analytics", "Organisationunit", "DataStoreService", "UserService", "DataImportService", "AnalyticsService", "DataExport", function ($scope, $interval, $q, $upload, $filter, Analytics, Organisationunit, DataStoreService, UserService, DataImportService, AnalyticsService, DataExport) {

    var serversPushDatesNamespace = "ServersPushDates";
    var lastPushDateSaved = null;
    var lastDatePush = null;
    $scope.projects=[];
  var projects_scope = [];

    var projectsDatastore = [];
    var projects = [];
    var projects2 = [];
    var sites = [];
    var services = [];
    var missions = [];

    function readDatastore() {

        getProjectsDatastore(serversPushDatesNamespace).then(projects =>projectsDatastore=projects);

        getUserMissions().then(

            missions => {
                angular.forEach(missions, function (mission) {
                    /* Buscamos los proyectos para cada mision */

                    getMissionProjects(mission).then(
                        projects => {
                   
                            
                            projects.reduce((total6, project) => {
                                return total6.then(
                                    () => {
                                        return DataStoreService.getNamespaceKeyValue(serversPushDatesNamespace, project.id + "_date").then(
                                            data => {

                                                lastDatePush = null;
                                                if (data != undefined) {
                                                   // previousLastDatePush = new Date(data.previousLastDatePush);
                                                    lastDatePush = data.lastDatePush;
                                                    lastPushDateSaved = data.lastPushDateSaved;
                                                   project['lastDatePush'] = new Date(data.lastDatePush).toString();
                                                  // project['lastPushDateSaved'] = data.lastPushDateSaved;
                                                   
                                                   // $scope.sync_result_date = new Date(data.lastDatePush).toString();
                                                   // sites = getProjectSites(projects); // Si lo pongo fuera no tiene valor cuando entra aqui
                                                   // services = getSiteServices(sites);

                                                  //  return servicesValues(project, services);
                                                    projects_scope=projects_scope.push(project);
                                                } else { console.log("no hay datos importados"); }
                                            }
                                        ).then(
                                            () => {
                                                if (lastDatePush != undefined) {
                                                  //  return DataStoreService.updateNamespaceKeyArraylastPush(serversPushDatesNamespace, project.id + "_date", lastDatePush);
                                                }
                                            }
                                            );
                                    })
                            }, $q.when("Done total 6"))
                       
                
                
                $scope.projects=projects_scope;  
                 });
                })
            });
    }





    function servicesValues(project, services) {

        services.reduce((total2, service) => {
            console.log("service : " + service.id); 
            return total2.then(
                () => {
                    return getDatasets(service.id).then(
                        dataSets => {
                            //	console.log("datasets : ");
                             //   console.log(dataSets); 
                           dataSetsValues(dataSets, service, project);
                        });
                }
            );
        }, $q.when("Done total 2"));


    }


    function dataSetsValues(dataSets, service, project) {

        return dataSets.reduce((total3, dataSet) => {
            return total3.then(
                () => {
                    if (lastPushDateSaved != lastDatePush) {
                        return readDatasetValues(dataSet.id, service.id, new Date(lastPushDateSaved)).then(
                            dataValues => {
                                if (dataValues != undefined) {
                                    updateDatastoreValues(dataValues, project.id, service, dataSet);

                                }
                            });
                    }
                });
        }, $q.when("Done total 3"));
    }

    function updateDatastoreValues(dataValues, project, service, dataSet) {

        dataValues.reduce((total, dataValue) => {
            var register = {
                orgUnit: service.id,
                dataSet: dataSet.id,
                lastDatePush: lastDatePush,
                period: dataValue.period
            };
            return total.then(
                () => {
                    return DataStoreService.updateNamespaceKeyArrayPeriod(serversPushDatesNamespace, project + "_values", register)
                })
        }, $q.when("Done total"));
    }


    function readDatasetValues(datasetUid, orgunit, lastUpdated) {
        return DataExport.get({
            dataSet: datasetUid,
            orgUnit: orgunit,
            lastUpdated: lastUpdated
        }).$promise
            .then(function (result) {
                return result.dataValues;
            });
    }


    function getDatasets(orgUnit) {
        var filter = { filter: 'id:eq:' + orgUnit };
        return Organisationunit.get(filter).$promise.then(
            data => {
                return data.organisationUnits[0].dataSets;
            });
    }
    function projectsFilter(value) {
        return value.indexOf("date") > -1
    }

    function projectsRemoveText(item, index, arr) {
        arr[index] = item.replace("_date", "");
    }

    function getProjectsDatastore(namespace) {
        var projects = [];
        return DataStoreService.getNamespaceKeys(namespace).then(
            data => {
                projects = data.filter(projectsFilter);
                projects.forEach(projectsRemoveText);
                return projects;
            });


    }

    function getUserMissions() {
        return $q(function (resolve) {
            resolve(
                UserService.getCurrentUserTree().then(function (me) {
                    /* Buscamos las misiones que tiene asignadas el usuario */
                    missions = me.dataViewOrganisationUnits;
                    /*console.log(missions);
                    console.log(missions[0].level); */
                    if (missions[0].level == 1) { missions = missions[0].children[1].children }
                    if (missions[0].level == 2) { missions = missions[0].children }
                    return missions;
                }));
        });
    };

    function getMissionProjects(mission) {
        return $q(function (resolve) {
            /* Buscamos los proyectos para cada mision */
            //console.log("Mission:");
            //console.log(mission.id);
            projects = mission.children;
             var projects2 = [];
         //   getProjectsDatastore(serversPushDatesNamespace).then(
          //      data => {
            //        projectsDatastore = data;
                    // console.log("projectsDatastore");
                    //console.log(projectsDatastore);
                    angular.forEach(projects, function (project, index2) {
                        /* Ponemos juntos todos los sites para luego buscar todos los services */
                        var index = projectsDatastore.indexOf(project.id);
                        // console.log("project " + project.id + " index " + index2 + " index encontrado " + index);
                        if (index > -1) {
                            projects2[index] = project
                        }
                    });

                    resolve(projects2);
              //  })
        });

    }
    function getProjectSites(projects) {
        var sites = [];
        angular.forEach(projects, function (project) {
            /* Ponemos juntos todos los sites para luego buscar todos los services */
            sites = sites.concat(project.children);
        });
        return sites;
    }

    function getSiteServices(sites) {
        var services = [];
        angular.forEach(sites, function (site) {
            /* Ponemos juntos todos los Services para luego buscar todos los datasets */
            services = services.concat(site.children);
        });
        return services;
    }


    readDatastore();

}];

