
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
 
export class HmisSettingService {

    // HMIS setting sql view
    // We expect that the table has two columns: name (charvar[255]) and value (text)
    private readonly HMIS_SETTINGS = 'MAd7IN5UJLv';

    // Keys
    private readonly TRACKER_EXPORT_ENCRYPT_PASSWORD = "trackerExportPassword";

    static $inject = ['SqlService'];
    
    constructor(private SqlService: SqlService){}

    /**
     * It returns an object whose keys are the property names and values are the property values.
     */
    getAll(): Promise<Object> {
        return this.SqlService.executeSqlQuery(this.HMIS_SETTINGS).then(result => {
            // We expect that the table has two columns: name (charvar[255]) and value (text)
            var settingsObject = {};
            result.rows.forEach( row => settingsObject[row[0]] = row[1] );
            return settingsObject;
        })
    }

    getTrackerDataEncryptationPassword(): Promise<String> {
        return this.getAll().then( settings => settings[this.TRACKER_EXPORT_ENCRYPT_PASSWORD]);
    }

}