
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

appManagerMSF.factory("OrgunitGroupSetService", ['OrganisationUnitGroupSet','OrganisationUnitGroup','$q', function(OrganisationUnitGroupSet, OrganisationUnitGroup, $q) {

    /**
     * It returns and array of organisationUnitGroupsSets. The structure of each groupSet is the same that querying
     * the endpoint "api/organisationUnitGroupSets/:uid", and the names for both groupSet and groups are translated.
     *
     * @param groupSets - Array of organisationUnitGroupSets. OrgunitGroupSet = {"id": "ddslkfjdfsjk",...}
     * @returns {*} - Array of organisationUnitGroupSets with name and children[id, name]
     */
    var getOrgunitGroupSets = function(groupSets){
        var promiseArray = [];
        angular.forEach(groupSets, function(groupSet){
            promiseArray.push(getTranslatedOrgunitGroupSet(groupSet).then(getTranslatedOrgunitGroups));
        });

        return $q.all(promiseArray)
            .then(function(data){
                return data;
            });
    };

    var getTranslatedOrgunitGroupSet = function(groupSet){
        return OrganisationUnitGroupSet.get({
            groupsetid: groupSet.id,
            fields: "displayName|rename(name),id,organisationUnitGroups[id]",
            paging: false,
            translate: true
        }).$promise
            .then(function(groupSetInfo){
                return groupSetInfo;
            });
    };

    var getTranslatedOrgunitGroups = function(groupSetInfo){
        var groups = groupSetInfo.organisationUnitGroups;
        return OrganisationUnitGroup.get({
            filter: "id:in:[" + groups.map(function(group){return group.id;}).join(",") + "]",
            fields: "displayName|rename(name),id",
            paging: false,
            translate: true
        }).$promise
            .then(function(groupsInfo){
                // In GroupSetInfo, replace 'organisationUnitGroups' attribute with the translated values
                groupSetInfo.organisationUnitGroups = groupsInfo.organisationUnitGroups;
                return groupSetInfo;
            });
    };

    return {
        getOrgunitGroupSets: getOrgunitGroupSets
    }

}]);
