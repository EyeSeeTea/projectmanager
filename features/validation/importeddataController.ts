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
import { CommonVariable, Orgunit, ProgressStatus } from '../../model/model';
import { UserService, ValidationService } from '../../services/services.module';

export class ImportedDataComponent implements ng.IComponentOptions {
    public template: string;
    public css: string;
    public controller: any;

    constructor() {
        this.template = require('./importeddataView.html');
        this.css = require('./importeddataController.css');
        this.controller = ImportedDataController

    }
}

export class ImportedDataController {

    static $inject = ["$q", "commonvariable", "ValidationService", "DataSetEntryForm", "UserService", "DataExport"];

    private datasets: any[] = [];
    private showProjectsTable: boolean = false;
    private showHeader: boolean = false;
    private showDetails: boolean = false;
    private showPreview: boolean = false;
    
    private zero: boolean = true;
    private zeroShow;
    private isMedco: boolean;
    private showMissions: boolean;

    private orderByField = 'siteName';
    private orderByFieldProject = 'missionName';
    private reverseSort = false;
    private reverseSortProject = false;

    private filter: { selected: string } = {
        selected: null
    };
    private missionFilter: { missionID?: string } = {};
    private cellFilter: { cellID?: string } = {};

    private searchText: { project?: string } = {}
    private datahistory;

    private cells: Orgunit[] = [
        { name: "Cell1", id: "kZZv93qYHHE" },
        { name: "Cell2", id: "S2TjYXvvixI" },
        { name: "Cell3", id: "HtTAwt3tb2J" },
        { name: "Cell4", id: "WwsadBUxD0X" },
        { name: "Cell5", id: "LZBm2f3o63Q" },
        { name: "UE", id: "pI3jvvIVWed" }
    ];
    private projects;
    private missions;

    private validationDataStatus = ProgressStatus.initialWithoutProgress;

    constructor(
        private $q: ng.IQService,
        private commonvariable: CommonVariable,
        private ValidationService: ValidationService,
        private DataSetEntryForm,
        private UserService: UserService,
        private DataExport
        
    ) {
        this.fillDatastore().then(() => this.readDatastore());
    }

    filterMission(filter) {
       
        this.missionFilter.missionID = this.filter.selected;
        this.cellFilter.cellID = ""
        this.showDetails = false;
        this.showPreview=false;
    }

    modifycell(cell: Orgunit) {
        if (cell != undefined) {
            this.cellFilter.cellID = cell.id;
        } else {
            this.cellFilter.cellID = "";
        }
        this.missionFilter.missionID = "";
        this.filter.selected = "";
        this.showDetails = false;
         this.showPreview=false;
    }

    show_details(project) {
        this.searchText.project = project.id;
        this.showDetails = true;
        this.showPreview=false;
        
    }
/*
    show_details_mission(mission) {
        this.missionFilter.missionID = mission.id;
        this.showProjectsTable = true;
         this.showPreview=false;

    }
*/
    submit_validate_dataset(dataset) {
        
        this.ValidationService.validateDataset(dataset).then(
            () => {
                var index = this.datasets.indexOf(dataset);
                this.datasets.splice(index, 1);
                for (var i in this.projects) {
                    if (this.projects[i].id == dataset.project) { this.projects[i].datasets-- }
                }
            });
            this.showPreview=false;
    }

    showZero(value) {
        if (this.zero == true) {
            this.zeroShow = this.greaterThan('datasets', -1);
        }
        else {
            this.zeroShow = this.greaterThan('datasets', 0);
        }
    }

    private greaterThan(prop, val) {
        return item => {
            if (item[prop] > val) return true;
        }
    }

    show_details_dataset(dataset) {
          this.showPreview=true;
        this.DataSetEntryForm.get({ dataSetId: dataset.dataSet }).$promise.then(dataSetHtml => {
            var codeHtml = dataSetHtml.codeHtml;
            codeHtml = codeHtml.replace(/id="tabs"/g, 'id="tabs-' + dataset.dataSet + '"');
            $("#dataset").html(codeHtml);
            this.formatDatasets(dataset);
            this.readDatasetValuesPreview(dataset.dataSet, dataset.service, dataset.period).then(dataValues => {
                this.previewDataset(dataValues, dataset.lastPushDateSaved);
            })
        })
    }

    private previewDataset(dataValues, lastPushDateSaved) {
        angular.forEach(dataValues, datavalue => {
            //console.log(datavalue);
            var valueCell = $("#" + datavalue.dataElement + "-" + datavalue.categoryOptionCombo + "-val");
            if (new Date(datavalue.lastUpdated).getTime() > lastPushDateSaved) { valueCell.addClass("newValue") }

            valueCell.val(datavalue.value);
            // Check if the dataelement cell exists
            /**TODO 
            if (valueCell.length == 1) {
            
                if (valueCell.val().length > 0) {
                    valueCell.val(parseFloat(valueCell.val()) + parseFloat(datavalue.value));
                } else {
                    valueCell.val(datavalue.value);
                }
            } else {
                // TODO Manage not present dataelements
            }
             */
        });
    };

    private formatDatasets(dataset) {
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
        $(".entryfield").click((event) => {
            var idtokens = event.target.id.split("-");
            var de = idtokens[0];
            var co = idtokens[1];
            // var cp = idtokens[2];

            // TODO Assign orgunit and periodId values
            // TODO And import HTML modal
            this.datahistory = this.commonvariable.url + "charts/history/data.png?de=" + de + "&co=" + co + "&ou="
                + dataset.service + "&pe=" + dataset.period + "&cp=AOPzxwWACxk";

            var element = angular.element($('.entryfield'));
            element.scope().$apply();
            // $scope.$apply();
            $("#dataValueHistory").modal();
        });
    };

    readDatasetValuesPreview(datasetId, service, period) {
        return this.DataExport.get({
            dataSet: datasetId,
            orgUnit: service,
            period: period,
            includeDeleted: true
        }).$promise
            .then(result => result.dataValues);
    }

    readDatastore() {

        this.orderByField = 'siteName';
        this.orderByFieldProject = 'missionName';
        this.reverseSort = false;
        this.reverseSortProject = false;
        this.showDetails = false;
        this.projects = [];
        this.missions = [];
        this.datasets = [];
        this.searchText = {};
        this.missionFilter = {};
        this.cellFilter = {};
        this.zeroShow = {};
        this.validationDataStatus.visible = false;
        this.showProjectsTable = true;
        this.showHeader = true;
        this.isMedco = false;
        this.showMissions = false;
        this.showPreview=false;


        this.UserService.currentUserHasRole("MedCo").then(medCo => {
            if (medCo == true) { this.isMedco = true }
            
        });
        this.UserService.currentUserHasRole("TesaCo").then(value => {
            if (value == true) { this.showMissions = true }
        });

        this.UserService.currentUserHasRole("Superuser").then(value => {
         
            if (value == true) { this.showMissions = true }
        });

        this.ValidationService.readDatastore().then(
            data => {
                this.datasets = data.datasets;
                this.projects = data.projects;
                this.missions = data.missions;
            });
    }

    fillDatastore() {
        this.validationDataStatus.visible = true;
        this.showHeader = false;
        
        return this.ValidationService.fillDatastore();
    }

}
