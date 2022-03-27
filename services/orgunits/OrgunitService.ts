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

import { OrgunitExtended, OrgunitStatus } from '../../model/model';

export class OrgunitService {

    static $inject = ['Organisationunit'];

    readonly OCBA = "G7g4TvbjFlX";

    constructor(
        private Organisationunit
    ){}

    getMissionsWithProjects(): ng.IPromise<OrgunitExtended[]> {
        const params = {
            filter: ["level:eq:3", "path:like:" + this.OCBA],
            fields: "id,name,level,children[id,name,level]"
        }
        return this.Organisationunit.get(params).$promise.then( result => result.organisationUnits);
    }

    getMissionsWithProjectsAndStatus(): ng.IPromise<OrgunitStatus[]> {
        const fields = "id,name,level,openingDate,closedDate,attributeValues";
        const params = {
            filter: ["level:eq:3", "path:like:" + this.OCBA],
            fields: `${fields},children[${fields}]`
        }
        return this.Organisationunit.get(params).$promise.then( result => result.organisationUnits);
    }
}