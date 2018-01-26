
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
import { CommonVariable } from '../../model/model';

export class MenuComponent implements ng.IComponentOptions {
    public controller: any;
    public template: string;

    constructor() {
        this.controller = MenuController;
        this.template = require('./menuView.html');
    }
}

class MenuController {
    
    static $inject = ['commonvariable', 'UserService'];

	isOnline: boolean;
    isAdministrator: boolean = false;
    isHMISOfficer: boolean = false;
    showDataImport: boolean = false;
    showTrackerExport: boolean = false;
    showTrackerImport: boolean = false;
    showValidation: boolean = false;
    showMetadataMonitor: boolean = false;

    constructor(private commonvariable: CommonVariable, 
                private UserService: UserService) {}

    $onInit() {
        this.isOnline = this.commonvariable.isOnline;
        
        this.UserService.getCurrentUser().then(me => {
            const isMedco = me.userCredentials.userRoles.some(role => role.name == 'MedCo');
            const isTESACO = me.userCredentials.userRoles.some(role => role.name == 'TesaCo');
            const isMFP = me.userCredentials.userRoles.some(role => role.name == 'Medical Focal Point')
            const hasTrackerRoles = me.userCredentials.userRoles.some(role => /Individual Data/i.test(role.name));

            this.isAdministrator = me.userGroups.some(group => group.name == 'Administrators');
            this.isHMISOfficer = me.userGroups.some(group => group.name == 'HMIS Officers');

            this.showDataImport = this.isAdministrator || isMedco || isMFP;
            this.showValidation = this.isAdministrator || isMedco || isTESACO ;
            
            this.showTrackerExport = this.isAdministrator || (isMFP && hasTrackerRoles);
            this.showTrackerImport = this.isAdministrator || isMedco;

            this.showMetadataMonitor = this.isAdministrator || this.isHMISOfficer;
        });
    }
}