
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

appManagerMSF.factory("EventHelper", function() {

    // Constants to keep common names between EventExportService and EventImportService
    const TEIS = 'trackedEntityInstances';
    const TEIS_JSON = TEIS + ".json";
    const TEIS_ZIP = TEIS + ".zip";
    const ENROLLMENTS = 'enrollments';
    const ENROLLMENTS_JSON = ENROLLMENTS + '.json';
    const ENROLLMENTS_ZIP = ENROLLMENTS + '.zip';
    const EVENTS = 'events';
    const EVENTS_JSON = EVENTS + '.json';
    const EVENTS_ZIP = EVENTS + '.zip';

    return {
        TEIS: TEIS,
        TEIS_JSON: TEIS_JSON,
        TEIS_ZIP: TEIS_ZIP,
        ENROLLMENTS: ENROLLMENTS,
        ENROLLMENTS_JSON: ENROLLMENTS_JSON,
        ENROLLMENTS_ZIP: ENROLLMENTS_ZIP,
        EVENTS: EVENTS,
        EVENTS_JSON: EVENTS_JSON,
        EVENTS_ZIP: EVENTS_ZIP
    }

});