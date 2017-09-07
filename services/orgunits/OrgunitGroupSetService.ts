
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
import { OrgunitGroupSet, IdName } from '../../model/model';

export class OrgunitGroupSetService {

    static $inject = ['$q', 'OrganisationUnitGroupSet','OrganisationUnitGroup'];

    constructor(
        private $q: ng.IQService,
        private OrganisationUnitGroupSet,
        private OrganisationUnitGroup
    ){}

    /**
     * It returns and array of organisationUnitGroupsSets. The structure of each groupSet is the same that querying
     * the endpoint "api/organisationUnitGroupSets/:uid", and the names for both groupSet and groups are translated.
     *
     * @param groupSets - Array of organisationUnitGroupSets. OrgunitGroupSet = {"id": "ddslkfjdfsjk",...}
     * @returns {*} - Array of organisationUnitGroupSets with name and children[id, name]
     */
    getOrgunitGroupSets(groupSets: IdName[]): ng.IPromise<OrgunitGroupSet[]> {
        const promiseArray: ng.IPromise<OrgunitGroupSet>[] = groupSets.map(groupSet => this.getTranslatedOrgunitGroupSet(groupSet));
        return this.$q.all(promiseArray);
    };

    private getTranslatedOrgunitGroupSet(groupSet: IdName): ng.IPromise<OrgunitGroupSet> {
        return this.OrganisationUnitGroupSet.get({
            groupsetid: groupSet.id,
            fields: "displayName|rename(name),id,organisationUnitGroups[id,displayName|rename(name)]",
            paging: false,
            translate: true
        }).$promise
    };
}