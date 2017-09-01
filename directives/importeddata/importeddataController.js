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
        css: require('./importeddataController.css'),
        scope: {}
    }
}];

var importeddataController = ["$scope", "$q", "commonvariable",  "DataSetEntryForm",  "Organisationunit", "DataStoreService", "UserService",  "DataExport", function ($scope,  $q,  commonvariable,  DataSetEntryForm, Organisationunit, DataStoreService, UserService, DataExport) {

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
        DataSetEntryForm.get({ dataSetId: dataset.dataSet }).$promise.then(function (dataSetHtml) {
            var codeHtml = dataSetHtml.codeHtml;
            codeHtml = codeHtml.replace(/id="tabs"/g, 'id="tabs-' + dataset.dataSet + '"');
            $("#dataset").html(codeHtml);
            formatDatasets();
            readDatasetValuesPreview(dataset.dataSet, dataset.service, dataset.period).then(dataValues => {
                previewDataset(dataValues, dataset.lastPushDateSaved);
            })
        })
    }

    function previewDataset(dataValues, lastPushDateSaved) {
        angular.forEach(dataValues, function (datavalue) {
            var valueCell = $("#" + datavalue.dataElement + "-" + datavalue.categoryOptionCombo + "-val");
            if (new Date(datavalue.lastUpdated).getTime() > lastPushDateSaved) { valueCell.addClass("newValue") }

            // Check if the dataelement cell exists
            if (valueCell.length == 1) {
                if (valueCell.val().length > 0) {
                    valueCell.val(parseFloat(valueCell.val()) + parseFloat(datavalue.value));
                } else {
                    valueCell.val(datavalue.value);
                }
            } else {
                // TODO Manage not present dataelements
            }
        });
    };
    function formatDatasets() {
        // Remove section filters
        $(".sectionFilter").remove();
        // Set entryfields as readonly
        $(".entryfield").prop("readonly", true);
        // Set some layout to tables
        $(".sectionTable").addClass("table table-condensed table-bordered table-striped");
        // Modify titles of sections to place them as section header
        var sectionLinks = $("div[id^='tabs-'] > ul > li > a");
        sectionLinks.each(function () {
            var sectionId = $(this).attr("href");
            if (sectionId.startsWith("#")) { sectionId = sectionId.substring(1); }
            $("#" + sectionId).prepend("<h3>" + $(this).html() + "</h3>");
            $(this).parent().remove();
        });

        // Add click event listeners to entryfields
        $(".entryfield").click(function () {
            var idtokens = $(this).attr("id").split("-");
            var de = idtokens[0];
            var co = idtokens[1];
            $scope.datahistory = commonvariable.url + "charts/history/data.png?de=" + de + "&co=" + co + "&ou="
                + $scope.orgunit + "&pe=" + $scope.periodId;
            $scope.$apply();
            $("#dataValueHistory").modal();
        });
    };

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
                                                            var today = new Date().getTime();
                                                            var diff = (today - lastDatePush) / (1000 * 60 * 60 * 24);
                                                            if (diff > 30) { project['overdueSync'] = true }
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
                    return DataStoreService.updateNamespaceKeyArrayPeriod(serversPushDatesNamespace, project + "_values", uniquePeriodRecord)
                })
        }, $q.when("Done total"));
    }


    function readDatasetValues(datasetId, service, lastUpdated) {
        return DataExport.get({
            dataSet: datasetId,
            orgUnit: service,
            lastUpdated: lastUpdated,
            includeDeleted: true
        }).$promise
            .then(function (result) {
                return result.dataValues;
            });
    }

    function readDatasetValuesPreview(datasetId, service, period) {
        return DataExport.get({
            dataSet: datasetId,
            orgUnit: service,
            period: period,
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
                UserService.getCurrentUserTree().then(me => {
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
                if (index > -1) {
                    projects2[index] = project
                }
            });
            resolve(projects2);
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