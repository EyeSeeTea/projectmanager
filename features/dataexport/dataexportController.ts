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
    $scope.isMFP = false;
    
    $scope.setActiveTab = function (item) {
        $scope.activeTab = item;
    };
       
    UserService.currentUserHasRole("Medical Focal Point")
        .then( isMFP => {
            if (isMFP) {
                $scope.isMfp = isMFP;
                $scope.setActiveTab(1);
            }
        });
    
}];