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

import { UserService } from '../../services/services.module';

export const dataExport = ['$scope', 'commonvariable', 'UserService', function ($scope, commonvariable, UserService: UserService) {
    
    $scope.activeTab = 2;
    $scope.onlineSyncPermission = false;
    $scope.isOnline = commonvariable.isOnline
    $scope.manualExportPermission= 
    $scope.setActiveTab = function (item) {
        $scope.activeTab = item;
    };
       
    UserService.currentUserHasRole("Online Data Sync")
        .then( onlineSyncPermission => {
            if (onlineSyncPermission) {
                $scope.onlineSyncPermission = onlineSyncPermission;
                $scope.setActiveTab(1);
            }
        });


        UserService.currentUserHasRole("HMIS Management: Aggregated Data Sync")
        .then( onlineSyncPermission => {
            if (onlineSyncPermission) {
                $scope.onlineSyncPermission = onlineSyncPermission;
                $scope.setActiveTab(1);
            }
        });


        UserService.getCurrentUser().then(me => {
            const isMedco = me.userCredentials.userRoles.some(role => role.name == 'MedCo' || role.name == 'Position: MedCo');
            const isTESACO = me.userCredentials.userRoles.some(role => role.name == 'TesaCo' || role.name=='Position: TesaCo');
            const isMFP = me.userCredentials.userRoles.some(role => role.name == 'Medical Focal Point' || role.name=='Position: Medical Focal Point');
            const hasTrackerRoles = me.userCredentials.userRoles.some(role =>role.name == 'Exportation Individual data' || role.name=='HMIS Management: Export tracker data');
            
            const isHMISOfficer = me.userCredentials.userRoles.some(role => role.name == 'HMIS Officer' || role.name=='Position: HMIS Officer');
            const isSuperUser = me.userCredentials.userRoles.some(role => role.name == 'Superuser' || role.name=='Position: Superuser');
 
            this.isAdministrator = me.userGroups.some(group => group.name == 'Administrators');
            this.isHMISOfficerGroup = me.userGroups.some(group => group.name == 'HMIS Officers');
       
            $scope.manualExportPermission= (isMFP && !$scope.isOnline) || isSuperUser;
            $scope.showValidationRequest =  isMFP && $scope.isOnline;
        });

    
}];
