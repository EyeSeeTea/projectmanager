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

export const importeddataDirective = [function () {
    return {
        restrict: 'E',
        controller: importeddataController,
        template: require('./importeddataView.html'),
        scope: {}
    }
}];

var importeddataController = ["$scope", '$interval', "$q", '$upload', '$filter', "Analytics", "Organisationunit", "DataStoreService", "UserService", "DataImportService", "AnalyticsService", "DataExport", function ($scope, $interval, $q, $upload, $filter, Analytics, Organisationunit, DataStoreService, UserService, DataImportService, AnalyticsService, DataExport) {

    var serversPushDatesNamespace = "ServersPushDates";
    var lastPushDateSaved = null;
    var lastDatePush = null;
    $scope.showProjectsTable = false;
    $scope.showHeader = false;
    $scope.filter = {};
    var projectsDatastore = [];
    var missions = [];
    var projects = [];
    var sites = [];
    var services = [];


    $scope.cells = [{ name: "Cell1", id: "kZZv93qYHHE" }, { name: "Cell2", id: "S2TjYXvvixI" }, { name: "Cell3", id: "HtTAwt3tb2J" }, { name: "Cell4", id: "WwsadBUxD0X" }, { name: "Cell5", id: "LZBm2f3o63Q" }, { name: "UE", id: "pI3jvvIVWed" }];
    $scope.validationDataStatus = {
        visible: false,
        type: "info",
        value: 100,
        active: true
    };


    function fillDatastore() {

        $scope.validationDataStatus.visible = true;
        return getProjectsDatastore(serversPushDatesNamespace).then(
            projectsDatastore => {
                return getUserMissions().then(
                    missions => {
                        return missions.reduce((total7, mission) => {
                            return total7.then(
                                /* Buscamos los proyectos para cada mision */
                                () => {
                                    return getMissionProjects(mission, projectsDatastore).then(
                                        projects => {
                                            return projects.reduce((total6, project) => {
                                                return total6.then(
                                                    () => {
                                                        return DataStoreService.getNamespaceKeyValue(serversPushDatesNamespace, project.id + "_date").then(
                                                            data => {

                                                                lastDatePush = null;
                                                                if (data != undefined) {
                                                                    lastDatePush = data.lastDatePush;
                                                                    lastPushDateSaved = data.lastPushDateSaved;
                                                                     if (lastPushDateSaved != lastDatePush) {
                                                                    sites = getProjectSites(project); // Si lo pongo fuera no tiene valor cuando entra aqui
                                                                    services = getSiteServices(sites);
                                                                    return servicesValues(project, services);
                                                                    }
                                                                } else { console.log("no hay datos importados"); }
                                                            }
                                                        ).then(
                                                            () => {
                                                                if ((lastDatePush != undefined) && (lastPushDateSaved != lastDatePush)) {
                                                                    return DataStoreService.updateNamespaceKeyArraylastPush(serversPushDatesNamespace, project.id + "_date", lastDatePush);
                                                                }
                                                            });
                                                    });
                                            }, $q.when("Done total 6"));
                                        });
                                });
                        }, $q.when("Done total 7"));
                    });
            }
        );


    }

    $scope.filterMission = function (filter) {

        $scope.missionFilter.missionID = filter.selected;
        $scope.cellFilter.cellID = ""
        $scope.showDetails = false;
    }

    $scope.modifycell = function (cell) {
        if (cell != undefined) {
            $scope.cellFilter.cellID = cell.id;

        } else { $scope.cellFilter.cellID = "" }
        $scope.missionFilter.missionID = "";


        $scope.filter.selected = "";

        $scope.showDetails = false;
    }


    $scope.submit_validate = function (project) {
        console.log(project);
        console.log("Validar" + project.id);


    }
    $scope.show_details = function (project) {
        $scope.searchText.project = project.id;
        $scope.showDetails = true;

    }
    $scope.show_details_mission = function (mission) {
        $scope.missionFilter.missionID = mission.id;
        $scope.showProjectsTable = true;

    }



    $scope.submit_validate_dataset = function (dataset) {

        return DataStoreService.deleteNamespaceKeyValue(serversPushDatesNamespace, dataset.project + "_values", dataset).then(
            datasets => {
                var index = $scope.datasets.indexOf(dataset);
                $scope.datasets.splice(index, 1);
                for (var i in $scope.projects) {
                    if ($scope.projects[i].id == dataset.project) { $scope.projects[i].datasets-- }
                }
            });
    }

    $scope.showZero = function (value) {
        if ($scope.zero == true) {
            $scope.zeroShow = $scope.greaterThan('datasets', -1);
        }
        else {
            $scope.zeroShow = $scope.greaterThan('datasets', 0);
        }
    }

    $scope.greaterThan = function (prop, val) {
        return function (item) {
            if (item[prop] > val) return true;
        }
    }

    $scope.show_details_dataset = function (dataset) {
        console.log(dataset);
        console.log("Details dataset" + dataset.dataSet);
    }

    function readDatastore() {

        $scope.orderByField = 'siteName';
        $scope.reverseSort = false;
        $scope.orderByFieldProject = 'missionName';
        $scope.reverseSortProject = false;
        $scope.showDetails = false;
        $scope.projects = [];
        $scope.missions = [];
        $scope.datasets = [];
        $scope.searchText = {};
        $scope.missionFilter = {};
        $scope.cellFilter = {};
        $scope.zeroShow = {};
        $scope.validationDataStatus.visible = false;
        $scope.showProjectsTable = true;
        $scope.showHeader = true;
        var projects_scope = [];
        var datasets_scope = [];
        $scope.zero = true;


        return getProjectsDatastore(serversPushDatesNamespace).then(

            projectsDatastore => {
                return getUserMissions().then(
                    missions => {
                        angular.forEach(missions, function (mission) {
                            /* Buscamos los proyectos para cada mision */
                            mission['missionID'] = mission.id;
                            mission['cellID'] = getOrgunitCell(mission);
                            return getMissionProjects(mission, projectsDatastore).then(
                                projects => {
                                    return projects.reduce((total6, project) => {
                                        return total6.then(
                                            () => {
                                                return DataStoreService.getNamespaceKeyValue(serversPushDatesNamespace, project.id + "_date").then(
                                                    data => {
                                                        if (data != undefined) {
                                                            lastDatePush = data.lastDatePush;
                                                            lastPushDateSaved = data.lastPushDateSaved;
                                                            project['lastDatePush'] = data.lastDatePush;
                                                            project['missionName'] = mission.name;
                                                            project['missionID'] = mission.id;
                                                            project['cellID'] = getOrgunitCell(project);
                                                            return DataStoreService.getNamespaceKeyValue(serversPushDatesNamespace, project.id + "_values").then(
                                                                data => {
                                                                    datasets_scope = datasets_scope.concat(data.values);
                                                                    $scope.datasets = datasets_scope;
                                                                    project['datasets'] = data.values.length;
                                                                    projects_scope.push(project);
                                                                    $scope.projects = projects_scope;
                                                                });
                                                        }
                                                    }
                                                )
                                            })
                                    }, $q.when("Done total 6"))
                                });
                        })
                    });
            });
    }





    function servicesValues(project, services) {
        return services.reduce((total2, service) => {
            return total2.then(
                () => {
                    return getDatasets(service.id).then(
                        dataSets => {
                            return dataSetsValues(dataSets, service, project);
                        });
                }
            );
        }, $q.when("Done total 2"));
    }


    function dataSetsValues(dataSets, service, project) {
        return dataSets.reduce((total3, dataSet) => {
            return total3.then(
                () => {
                    if (lastPushDateSaved != lastDatePush) { //DESCOMENTAR, comentado para pruebas
                        return readDatasetValues(dataSet.id, service.id, new Date(lastPushDateSaved)).then(
                            dataValues => {
                                
                                if (dataValues != undefined) {
                                    return updateDatastoreValues(dataValues, project.id, service, dataSet);
                                }
                            });
                    }
                });
        }, $q.when("Done total 3"));
    }

    function updateDatastoreValues(dataValues, project, service, dataSet) {

        var periods = [];
        for (var i in dataValues) {
            periods.push(dataValues[i].period);
        }
        var uniquePeriods = [...new Set(periods)];



        return uniquePeriods.reduce((total, period) => {
            var register = {
                project: project,
                siteName: service.siteName,
                service: service.id,
                serviceName: service.name,
                dataSet: dataSet.id,
                dataSetName: dataSet.name,
                lastDatePush: lastDatePush,
                period: period
            };


            return total.then(
                () => {
                    return DataStoreService.updateNamespaceKeyArrayPeriod(serversPushDatesNamespace, project + "_values", register)
                })
        }, $q.when("Done total"));
    }


    function readDatasetValues(datasetUid, service, lastUpdated) {
        return DataExport.get({
            dataSet: datasetUid,
            orgUnit: service,
            lastUpdated: lastUpdated,
            includeDeleted: true
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

    function getOrgunitCell(project) {
        var cell = "";
        for (var i in project.organisationUnitGroups) {
            for (var z in $scope.cells) {
                if (project.organisationUnitGroups[i].id == $scope.cells[z].id) {
                    cell = $scope.cells[z].id;
                    return $scope.cells[z].id;
                }
            }
        }
        return cell;
    }


    function getUserMissions() {
        return $q(function (resolve) {
            resolve(
                UserService.getCurrentUserTree().then(function (me) {
                    /* Buscamos las misiones que tiene asignadas el usuario */
                    missions = me.dataViewOrganisationUnits;

                    $scope.isMedco = false;

                    angular.forEach(me.userCredentials.userRoles, function (userRole) {
                        $scope.isMedco = userRole.name === "MedCo" ? true : $scope.isMedco;
                    });

                    if (missions[0].level == 1) {
                        missions = missions[0].children[1].children;
                        $scope.showMissions = true

                    }
                    if (missions[0].level == 2) {
                        missions = missions[0].children
                        $scope.showMissions = true
                    }


                    $scope.missions = missions;

                    return missions;
                }));
        });
    };

    function getMissionProjects(mission, projectsDatastore) {
        return $q(function (resolve) {

            projects = mission.children;
            var projects2 = [];
            angular.forEach(projects, function (project, index2) {
                var index = projectsDatastore.indexOf(project.id);
                //  console.log("project " + project.id + " index " + index2 + " index encontrado " + index);
                if (index > -1) {
                    projects2[index] = project
                }
            });

            resolve(projects2);
            //  })
        });

    }
    function getProjectSites(project) {
        var sites = [];
        /* Ponemos juntos todos los sites para luego buscar todos los services */
        sites = sites.concat(project.children);
        return sites;
    }

    function getSiteServices(sites) {
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


    fillDatastore().then(() => { readDatastore(); });

}];

