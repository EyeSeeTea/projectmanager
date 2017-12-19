
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

import { EventHelper, SqlService } from '../services.module';

export class EventService {

    static $inject = ['EventHelper', 'SqlService'];

    constructor(private EventHelper: EventHelper, private SqlService: SqlService){}

    updateEventData() {
        return this.SqlService.executeSqlQuery(this.EventHelper.PROGRAM_RULES_COMMON_FUNCTIONS)
            .then( () => this.SqlService.executeSqlQuery(this.EventHelper.PROGRAM_RULES_MENTAL_HEALTH))
            .then( () => this.SqlService.executeSqlQuery(this.EventHelper.PROGRAM_RULES_MAIN));
    }
}