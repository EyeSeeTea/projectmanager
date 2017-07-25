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

    static $inject = ["$q", "EventImportService", "AnalyticsService", "DemographicsService", "EventHelper"];

    progressStatus = {};
    undefinedFile: boolean = false;
    summary: any;
    analyticsLog: any[];

    importFailed: boolean;
    previewDataImport: boolean;

    $file;//single file

    constructor(private $q: ng.IQService, private EventImportService: EventImportService, private AnalyticsService, 
                private DemographicsService) {}

    showImportDialog() {

        this.varValidation();
        if (!this.undefinedFile){
            $("#importConfirmation").modal();
        }
    };

    sendFiles() {

        $("#importConfirmation").modal("hide");
        
        this.progressStatus = ProgressStatus.initialWithoutProgress;

        this.summary = undefined;
        this.analyticsLog = [];

        this.EventImportService.importEventFile(this.$file)
            .then(() => this.AnalyticsService.refreshEventAnalytics())
            .then(
                success => this.progressStatus = ProgressStatus.doneSuccessful,
                error => this.progressStatus = ProgressStatus.doneWithFailure,
                notification => this.analyticsLog.push(notification)
            );        
    };

    public showFileContentSummary() {
        this.varValidation();
        if (!this.undefinedFile) {
            this.progressStatus = ProgressStatus.initialWithoutProgress;
            this.summary = undefined;
            this.EventImportService.previewEventFile(this.$file).then( summary => {
                this.summary = summary;
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
