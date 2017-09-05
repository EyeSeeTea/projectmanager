
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
import { Orgunit, Program } from '../../model/model';

export class ProgramService {

    static $inject = ['UserService', 'Organisationunit', 'OrganisationUnitGroup', 'Programs'];

    constructor(
        private UserService: UserService,
        private Organisationunit,
        private OrganisationUnitGroup,
        private Programs
    ){}

    readonly serviceCodeId = "pG4YeQyynJh";

    getProgramsUnderUserHierarchy() {
        return this.UserService.getCurrentUserOrgunits()
            .then(userOrgUnits => this.getProgramsUnderHierarchy(userOrgUnits))
    }

    getProgramsUnderUserHierarchyByService() {
        return this.getProgramsUnderUserHierarchy()
            .then(programs => this.groupProgramsByService(programs));
    }

    private getProgramsUnderHierarchy (orgunits: Orgunit[]) {
        const queryParams = {
            filter: orgunits.map( orgunit => 'path:like:' + orgunit.id ),
            rootJunction: 'OR',
            fields: 'programs[id,attributeValues]'
        };

        return this.Organisationunit.get(queryParams).$promise.then( (data) => {
            var includedPrograms = {};
            return data.organisationUnits
                .reduce( (programArray, orgunit) => {
                    return programArray.concat(orgunit.programs.filter( (program) => {
                        if (!includedPrograms[program.id]) {
                            includedPrograms[program.id] = 1;
                            return true;
                        } else {
                            return false;
                        }
                    }));
                }, []);
        });
    }

    private groupProgramsByService(programs) {
        var codes = {};
        for (var i = 0; i < programs.length; i++){
            var serviceValue = programs[i].attributeValues.filter( (attributeValue) => attributeValue.attribute.id == this.serviceCodeId);
            if (serviceValue.length == 1) {
                codes[serviceValue[0].value] = codes[serviceValue[0].value] || [];
                codes[serviceValue[0].value].push(programs[i]);
            }
        }

        const programQuery = {
            filter: 'code:in:[' + Object.getOwnPropertyNames(codes).map( code => 'OUG_' + code ).join(",") + "]",
            fields: 'displayName,code'
        };

        return this.OrganisationUnitGroup.get(programQuery).$promise.then( (data) => {
            return data.organisationUnitGroups.map( (group) => 
                ({
                    name: group.displayName,
                    code: group.code,
                    programs: codes[group.code.split('OUG_')[1]]
                })
            );
        });
    }
    
    getProgramAndStages(programId: string): ng.IPromise<Program> {
        var fields = "id,displayName~rename(name),programStages[id,displayName~rename(name)]";
        return this.Programs.get({uid: programId, fields: fields}).$promise;
    }
    
}