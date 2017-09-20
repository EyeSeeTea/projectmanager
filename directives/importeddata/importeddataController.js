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

var importeddataController = ["$scope", "$q", "commonvariable", "ValidationService", "DataSetEntryForm",  "UserService", "DataExport", function ($scope, $q, commonvariable, ValidationService, DataSetEntryForm,  UserService, DataExport) {

    //var lastPushDateSaved = null;
    // var lastDatePush = null;
    $scope.showProjectsTable = false;
    $scope.showHeader = false;
    $scope.filter = {};
    //var projectsDatastore = [];
    //var missions = [];
    //var projects = [];
    //var sites = [];
    // var services = [];
    $scope.zero = true;


    $scope.cells = [{ name: "Cell1", id: "kZZv93qYHHE" }, { name: "Cell2", id: "S2TjYXvvixI" }, { name: "Cell3", id: "HtTAwt3tb2J" }, { name: "Cell4", id: "WwsadBUxD0X" }, { name: "Cell5", id: "LZBm2f3o63Q" }, { name: "UE", id: "pI3jvvIVWed" }];


    $scope.validationDataStatus = {
        visible: false,
        type: "info",
        value: 100,
        active: true
    };



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


    $scope.show_details = function (project) {
        $scope.searchText.project = project.id;
        $scope.showDetails = true;
    }

    $scope.show_details_mission = function (mission) {
        $scope.missionFilter.missionID = mission.id;
        $scope.showProjectsTable = true;
    }

    $scope.submit_validate_dataset = function (dataset) {

        ValidationService.validateDataset(dataset).then(

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

    function readDatastore() {

        $scope.orderByField = 'siteName';
        $scope.orderByFieldProject = 'missionName';
        $scope.reverseSort = false;
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
        $scope.isMedco = false;
        $scope.showMissions = false;


        UserService.currentUserHasRole("MedCo").then(medCo => { $scope.isMedco = medCo });
        UserService.currentUserHasRole("TesaCo").then(value => { $scope.showMissions = value });
        UserService.currentUserHasRole("superuser").then(value => {  $scope.showMissions = value });
        
        ValidationService.readDatastore().then(
            data => {

                $scope.datasets = data.datasets;
                $scope.projects = data.projects;
                $scope.missions = data.missions;
 
            });
    }
    function fillDatastore() {
        $scope.validationDataStatus.visible = true;
        return ValidationService.fillDatastore();

    }


    fillDatastore().then(() => { readDatastore(); });

}];