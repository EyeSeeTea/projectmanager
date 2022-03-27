import { SystemService } from '../../services/system/SystemService';

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

export class HeaderComponent implements ng.IComponentOptions {
    public controller: any;
    public template: string;
    
    constructor() {
        this.controller = HeaderController;
        this.template = require('./headerView.html');
    }
}

class HeaderController {
    
    static $inject = ['SystemService'];

	systemName: string;

    constructor(private SystemService: SystemService) {
        this.SystemService.getSystemName().then( 
            name => this.systemName = name 
        );
    }
}
