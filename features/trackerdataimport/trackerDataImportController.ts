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

export const trackerDataImport = ["$scope", "$q", "EventImportService", "AnalyticsService", "DemographicsService", function($scope, $q, EventImportService, AnalyticsService, DemographicsService) {

    $scope.progressStatus = {};
    $scope.undefinedFile = false;

    let $file;//single file 
    
    $scope.showImportDialog = function(){

        varValidation();

        if (!$scope.undefinedFile){
            $("#importConfirmation").modal();
        }
    };

    $scope.sendFiles = function(){

        $("#importConfirmation").modal("hide");
        
        $scope.progressStatus = ProgressStatus.initialWithoutProgress;

        $scope.summary = undefined;
        $scope.analyticsLog = [];

        EventImportService.importEventFile($file)
            .then(AnalyticsService.refreshAnalytics)
            .then(
                success => $scope.progressStatus = ProgressStatus.doneSuccessful,
                error => $scope.progressStatus = ProgressStatus.doneWithFailure,
                notification => $scope.analyticsLog.push(notification)
            );        
    };
    
    function varValidation() {
        $scope.undefinedFile = ($file == undefined);
    }
    
    $scope.showFileContentSummary = function(){
        varValidation();
        if (!$scope.undefinedFile) {
            $scope.progressStatus = ProgressStatus.initialWithoutProgress;
            $scope.summary = undefined;
            EventImportService.previewEventFile($file).then( summary => {
                $scope.summary = summary;
                $scope.progressStatus = ProgressStatus.hidden;
            });
        }
    };
    
    $scope.onFileSelect = function ($files) {
        for (var i = 0; i < $files.length; i++) {
            $file = $files[i];//set a single file
            $scope.undefinedFile = false;
            $scope.importFailed = false;
        }
        $scope.previewDataImport = false;
    };

}];
