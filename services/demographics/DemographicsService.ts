
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

import { SqlService } from '../services.module';

export class DemographicsService {

    static $inject = ['SqlService'];

    // SQL views to execute
    private readonly DEMOGRAPHICS_FUNCTIONS = 'RQWlHLHAhnk'; //materialized
    private readonly DEMOGRAPHICS_MAIN = 'A5MuhFdD9zq'; //materialized
    
    constructor(private SqlService: SqlService){}

    updateDemographicData () {
        return this.SqlService.refreshSqlQuery(this.DEMOGRAPHICS_FUNCTIONS)
        .then( () => this.SqlService.executeSqlQuery(this.DEMOGRAPHICS_FUNCTIONS))
        .then( () => this.SqlService.refreshSqlQuery(this.DEMOGRAPHICS_MAIN))
            .then( () => this.SqlService.executeSqlQuery(this.DEMOGRAPHICS_MAIN))
    }

}
