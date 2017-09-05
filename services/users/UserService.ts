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
import { OrgunitExtended } from '../../model/model';

export class UserService {

    static $inject = ['$q', 'meUser', 'User'];

    constructor(
        private $q: ng.IQService,
        private meUser,
        private User
    ){}
 
    private currentUser;
    private currentUserTree;
    private currentUserFields = {
        fields: "id,name,userRoles[id,name],userCredentials[username,userRoles[id,name]],userGroups[id,name]" +
            "organisationUnits[id,level,name,children[id,name]],dataViewOrganisationUnits[id,level]"
    };
    
    getCurrentUser () {
        if (this.currentUser != null) {
            return this.$q.when(this.currentUser);
        } else {
            return this.meUser.get(this.currentUserFields).$promise.then( me => {
                this.currentUser = me;
                return this.currentUser;
            });
        }
    }

    getCurrentUserTree () {
        const currentUserFieldsTree = {
            fields: "id,name,userRoles[id,name],userCredentials[username,userRoles[id,name]],userGroups[id,name]" +
                "organisationUnits[id,level,name,children],organisationUnitGroups[id],dataViewOrganisationUnits[id,name,level,children[id,name, level,organisationUnitGroups[id], children[id, name,level,organisationUnitGroups[id],children[id, name, level,organisationUnitGroups[id], children[id,name, level,children[id,name]]]]]]"
        };
        if (this.currentUserTree != null) {
            return this.$q.when(this.currentUserTree);
        } else {
            return this.meUser.get(currentUserFieldsTree).$promise.then(me => {
                this.currentUserTree = me;
                return this.currentUserTree;
            });
        }
    }


    getCurrentUserOrgunits(): ng.IPromise<OrgunitExtended[]>{
        return this.getCurrentUser()
            .then( me => me.organisationUnits );
    }

    /**
     * It returns a promise that resolves to a boolean indicating if current user has the group or not
     * @param groupName Group name to evaluate
     */
    currentUserHasGroup (groupName): ng.IPromise<Boolean> {
        return this.getCurrentUser().then( me => {
            var hasGroup: Boolean = false;
            angular.forEach(me.userGroups, userGroup => {
                hasGroup = userGroup.name === groupName ? true : hasGroup;
            });
            return hasGroup;
        });
    }

    /**
     * It returns a promise that resolves to a boolean indicating if current user has the role or not
     * @param roleName Role name to evaluate
     */
    currentUserHasRole (roleName): ng.IPromise<Boolean> {
        return this.getCurrentUser().then( me => {
            var hasRole = false;
            angular.forEach(me.userCredentials.userRoles, userRole => {
                hasRole = userRole.name === roleName ? true : hasRole;
            });
            return hasRole;
        });
    }
    
    /**
     * It returns a promise that resolves to a list of users associated to a project and its health sites
     * @param project Orgunit object
     */
    getProjectUsers (project) {
        var childrenIds = project.children.map( child => child.id );

        var projectFilter = {
            "filter": "organisationUnits.id:in:[" + [project.id].concat(childrenIds).toString() + "]"
        };

        return this.User.get(projectFilter).$promise.then( projectUsers => projectUsers.users );
    }
    
    updateUserPassword(user, password) {
        user.userCredentials.password = password;
        return this.User.put({iduser:user.id}, user).$promise;
    }
    
}
