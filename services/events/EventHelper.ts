
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

var AES = require('crypto-js/aes');
var EncUTF8 = require('crypto-js/enc-utf8');

export class EventHelper {

    // Constants to keep common names between EventExportService and EventImportService
    public readonly TEIS = 'trackedEntityInstances';
    public readonly TEIS_JSON = this.TEIS + ".json";
    public readonly TEIS_ZIP = this.TEIS + ".zip";
    public readonly ENROLLMENTS = 'enrollments';
    public readonly ENROLLMENTS_JSON = this.ENROLLMENTS + '.json';
    public readonly ENROLLMENTS_ZIP = this.ENROLLMENTS + '.zip';
    public readonly EVENTS = 'events';
    public readonly EVENTS_JSON = this. EVENTS + '.json';
    public readonly EVENTS_ZIP = this.EVENTS + '.zip';

    // SQL Views to execute
    public readonly PROGRAM_RULES_COMMON_FUNCTIONS = 'I8hzoc338oW';
    public readonly PROGRAM_RULES_MENTAL_HEALTH = 'NEBzjTSyP18';
    public readonly PROGRAM_RULES_MAIN = 'sEhYspTc8iB';

    private encryptationPassword = "SamplePassword23!";

    encryptObject(object: Object) {
        var asString = JSON.stringify(object);
        return AES.encrypt(asString, this.encryptationPassword).toString();
    }

    decryptObject(encrypted) {
        var decrypted = AES.decrypt(encrypted, this.encryptationPassword);
        return JSON.parse(decrypted.toString(EncUTF8));
    }

};
