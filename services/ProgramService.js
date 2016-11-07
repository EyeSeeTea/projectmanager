
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

appManagerMSF.factory("ProgramService", ['UserService', 'Organisationunit', 'OrganisationUnitGroup', function(UserService, Organisationunit, OrganisationUnitGroup) {

    const serviceCodeId = "pG4YeQyynJh";

    function getProgramsUnderUserHierarchy () {
        return UserService.getCurrentUserOrgunits()
            .then(getProgramsUnderHierarchy)
    }

    function getProgramsUnderUserHierarchyByService () {
        return getProgramsUnderUserHierarchy()
            .then(groupProgramsByService);
    }

    function getProgramsUnderHierarchy (orgunits) {
        var queryParams = {
            filter: orgunits.map(function (orgunit) { return 'path:like:' + orgunit.id;}),
            rootJunction: 'OR',
            fields: 'programs[id,attributeValues]'
        };

        return Organisationunit.get(queryParams).$promise.then(function (data) {
            var includedPrograms = {};
            return data.organisationUnits
                .reduce( function (programArray, orgunit) {
                    return programArray.concat(orgunit.programs.filter( function (program) {
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

    function groupProgramsByService (programs) {
        var codes = {};
        for (var i = 0; i < programs.length; i++){
            var serviceValue = programs[i].attributeValues.filter(function (attributeValue) {
                return attributeValue.attribute.id == serviceCodeId;
            });
            if (serviceValue.length == 1) {
                codes[serviceValue[0].value] = codes[serviceValue[0].value] || [];
                codes[serviceValue[0].value].push(programs[i]);
            }
        }

        var programQuery = {
            filter: 'code:in:[' + Object.getOwnPropertyNames(codes).map(
                function (code) {return 'OUG_' + code;})
                .join(",") + "]",
            fields: 'displayName,code'
        };

        return OrganisationUnitGroup.get(programQuery).$promise.then(function (data) {
            return data.organisationUnitGroups.map(function (group) {
                return {
                    name: group.displayName,
                    code: group.code,
                    programs: codes[group.code.split('OUG_')[1]]
                }
            });
        });
    }
    
    return {
        getProgramsUnderUserHierarchy: getProgramsUnderUserHierarchy,
        getProgramsUnderUserHierarchyByService: getProgramsUnderUserHierarchyByService
    }

}]);