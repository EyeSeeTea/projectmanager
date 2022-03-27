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
import { CurrentUser, OrgunitExtended } from '../../model/model';

export class UserService {

    static $inject = ['$q', 'meUser', 'User'];

    constructor(
        private $q: ng.IQService,
        private meUser,
        private User
    ){}
 
    private currentUser: CurrentUser;
    private currentUserTree;
    private currentUserFields = {
        fields: "id,name,userCredentials[username,userRoles[id,name]],userGroups[id,name]" +
            "organisationUnits[id,level,name,children[id,name]],dataViewOrganisationUnits[id,level,children[id,level,children]]"
    };
    
    getCurrentUser(): ng.IPromise<CurrentUser> {
        if (this.currentUser != null) {
            return this.$q.when(this.currentUser);
        } else {
            return this.meUser.get(this.currentUserFields).$promise.then( me => {
                this.currentUser = me;
                return this.currentUser;
            });
        }
    }

    getCurrentUserTree(): ng.IPromise<CurrentUser> {
        const currentUserFieldsTree = {
            fields: "id,name,userRoles[id,name],userCredentials[username,userRoles[id,name]],userGroups[id,name]" +
                "organisationUnits[id,level,name,children[id,name, level,organisationUnitGroups[id], children[id, name,level,organisationUnitGroups[id],children[id, name, level,organisationUnitGroups[id], children[id,name, level,children[id,name]]]]]],organisationUnitGroups[id]," + 
                "dataViewOrganisationUnits[id,name,level,children[id,name, level,organisationUnitGroups[id], children[id, name,level,organisationUnitGroups[id],children[id, name, level,organisationUnitGroups[id], children[id,name, level,children[id,name]]]]]]"
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
    getCurrentUserProjects(): ng.IPromise<CurrentUser> {
        const currentUserFieldsTree = {
            fields: "id,name,userRoles[id,name],userCredentials[username,userRoles[id,name]],userGroups[id,name]" +
                "organisationUnits[id,level,name,children[id,name, level,organisationUnitGroups[id], children[id, name,level,organisationUnitGroups[id],children[id, name, level,organisationUnitGroups[id], children[id,name, level,children[id,name]]]]]],organisationUnitGroups[id]," + 
                "dataViewOrganisationUnits[id,name,level,children[id,name, level,organisationUnitGroups[id], children[id, name,level,organisationUnitGroups[id],children[id, name, level,organisationUnitGroups[id], children[id,name, level,children[id,name]]]]]]"
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
    currentUserHasGroup(groupName): ng.IPromise<boolean> {
        return this.getCurrentUser().then( me => me.userGroups.some( userGroup => userGroup.name === groupName ));
    }

    /**
     * It returns a promise that resolves to a boolean indicating if current user has the role or not
     * @param roleName Role name to evaluate
     */
    currentUserHasRole(roleName): ng.IPromise<boolean> {
        return this.getCurrentUser().then( me => me.userCredentials.userRoles.some( userRole => userRole.name === roleName ));
    }
    
    /**
     * It returns a promise that resolves to a list of users associated to a project and its health sites
     * @param project Orgunit object
     */
    getProjectUsers(project) {
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
