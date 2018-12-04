import { UserService } from '../../services/users/UserService';

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
//import { CommonVariable } from '../../model/model';
export class TrackerDataExport {
    isSuperUser ="";
    isOnline=null;
    activeTab: number = 1;
    static $inject =["UserService", "commonvariable"];
    constructor(private UserService, private commonvariable){

        this.init();
    }
async init() {
 this.isOnline = this.commonvariable.isOnline
  this.isSuperUser= await this.UserService.currentUserHasRole("Superuser");
  console.log("super");
  console.log(this.isSuperUser);
  var element = angular.element($('#tab'));
element.scope().$apply();
}
    setActiveTab = function (item) {
        this.activeTab = item;
    };
}
