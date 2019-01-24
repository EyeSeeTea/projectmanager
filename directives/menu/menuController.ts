
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
    isHMISOfficerGroup: boolean = false;
    showMetadataImport: boolean = false;
    showDataImport: boolean = false;
    showDataExport: boolean = false;
    showTrackerExport: boolean = false;
    showTrackerImport: boolean = false;
    showValidation: boolean = false;
    showMetadataMonitor: boolean = false;
    showProject: boolean=false;
    showCapital: boolean=false;
    isOffline:boolean=false;
    showValidationRequest: boolean=false;
    dhisUrl = window.location.href.split('api/apps/')[0];

    constructor(private commonvariable: CommonVariable, 
                private UserService: UserService) {}
    goHome = function(){
                    window.location.replace(this.dhisUrl);
              };

    $onInit() {
        
        this.UserService.getCurrentUser().then(me => {
            this.isOnline = this.commonvariable.isOnline;
            this.isOffline = !this.isOnline;
            const isMedco = me.userCredentials.userRoles.some(role => role.name == 'MedCo');
            const isTESACO = me.userCredentials.userRoles.some(role => role.name == 'TesaCo');
            const isMFP = me.userCredentials.userRoles.some(role => role.name == 'Medical Focal Point')
            
            //const hasTrackerRoles = me.userCredentials.userRoles.some(role => /Individual Data/i.test(role.name));
            
            const hasTrackerRoles = me.userCredentials.userRoles.some(role =>role.name == 'Exportation Individual data');
            



            const isHMISOfficer = me.userCredentials.userRoles.some(role => role.name == 'HMIS Officer')
            const isSuperUser = me.userCredentials.userRoles.some(role => role.name == 'Superuser')
            const isOnlineDataSync = me.userCredentials.userRoles.some(role => role.name == 'Online Data Sync')
 
           
            this.isAdministrator = me.userGroups.some(group => group.name == 'Administrators');
            this.isHMISOfficerGroup = me.userGroups.some(group => group.name == 'HMIS Officers');
           
           
            this.showMetadataImport = isSuperUser || (this.isOffline && ( this.isAdministrator || isOnlineDataSync));
            this.showDataImport =  isSuperUser || this.isAdministrator || isMedco || (isMFP && this.isOffline );
            this.showValidation =   isSuperUser || (this.isOnline && ( this.isAdministrator || isMedco || isTESACO)) ;
            this.showDataExport =  isSuperUser || this.isAdministrator || (isMFP && this.isOffline);
            
            this.showValidationRequest =  isMFP && this.isOnline;

            
            this.showTrackerExport =  isSuperUser || this.isAdministrator || (isMFP && hasTrackerRoles && this.isOffline);
            this.showTrackerImport =  isSuperUser || this.isAdministrator || isMedco || (isMFP && hasTrackerRoles && this.isOffline);
            this.showCapital =  isSuperUser || this.showDataImport  || this.showTrackerImport || this.showValidation;
            this.showProject =   isSuperUser || this.showDataExport || this.showTrackerExport || this.showMetadataImport || this.showValidationRequest;
            this.showMetadataMonitor =  isSuperUser || this.isAdministrator || isHMISOfficer || this.isHMISOfficerGroup;
        });
    }
}