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


appManagerMSF.factory('UserService',['$q', 'meUser', function($q, meUser){
 
    var currentUser;
    
    var currentUserFields = {
        fields: "id,name,userRoles[id,name],userCredentials[username,userRoles[id,name]],userGroups[id,name]" +
            "organisationUnits[id,level,name],dataViewOrganisationUnits[id,level,children[id,level,children]]"
    };
    
    function getCurrentUser() {
        if (currentUser != null) {
            return $q.when(currentUser);
        } else {
            return meUser.get(currentUserFields).$promise.then(function(me){
                currentUser = me;
                return currentUser;
            });
        }
    }
    
    return {
        getCurrentUser: getCurrentUser
    }
    
}]);