
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

import { Orgunit } from '../../model/model';

export class ProjectSelectorComponent implements ng.IComponentOptions {
    public bindings: any;
    public controller: any;
    public template: string;

    constructor() {
        this.bindings = {
            project: '='
        };
        this.controller = ProjectSelectorController;
        this.template = require('./projectSelectorView.html');
    }
}

interface IProjectSelectorController {
    project: Orgunit;
}

class ProjectSelectorController implements IProjectSelectorController {
    
    project: Orgunit;
    missions: Orgunit[];
    projects: Orgunit[];
    selection: {mission: Orgunit, project: Orgunit};

    static $inject = ['Organisationunit'];

    constructor(private Organisationunit) {
        this.Organisationunit.get({filter: 'level:eq:3'}).$promise.then( result => {
            this.missions = result.organisationUnits;
        });
    }

    modifyMission() {
        var filters = { filter: [
            'level:eq:4',
            'path:like:' + this.selection.mission.id
        ]};
        this.Organisationunit.get(filters).$promise.then( result => {
            this.projects = result.organisationUnits;
        });
    }

    modifyProject() {
        this.project = this.selection.project;
    };
}
