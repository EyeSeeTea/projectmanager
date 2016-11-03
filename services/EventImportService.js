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

appManagerMSF.factory("EventImportService", ["$q", "$http", "commonvariable", "EventHelper", function($q, $http, commonvariable, EventHelper) {
    
    var importEventFile = function (file) {
        return readZipFile(file).then(function(content) {
            var returnPromise = $q.resolve("Start");
            var isEmptyFile = true;
            var zip = new JSZip(content);

            if (zip.file(EventHelper.TEIS_ZIP) != undefined) {
                isEmptyFile = false;
                returnPromise = returnPromise.then(function () {
                    return uploadFile(EventHelper.TEIS, zip.file(EventHelper.TEIS_ZIP).asArrayBuffer());
                });
            }

            if (zip.file(EventHelper.ENROLLMENTS_ZIP) != undefined) {
                isEmptyFile = false;
                returnPromise = returnPromise.then(function () {
                    return uploadFile(EventHelper.ENROLLMENTS, zip.file(EventHelper.ENROLLMENTS_ZIP).asArrayBuffer());
                });
            }

            if (zip.file(EventHelper.EVENTS_ZIP) != undefined) {
                isEmptyFile = false;
                returnPromise = returnPromise.then(function () {
                    return uploadFile(EventHelper.EVENTS, zip.file(EventHelper.EVENTS_ZIP).asArrayBuffer());
                });
            }

            if (isEmptyFile) {
                return $q.reject("The file does not contain event data.")
            } else {
                return returnPromise;
            }
        });
    };

    function readZipFile (file) {
        var deferred = $q.defer();
        var fileReader = new FileReader();
        fileReader.readAsArrayBuffer(file);
        fileReader.onload = function(e) {
            deferred.resolve(e.target.result)
        };
        return deferred.promise
    }

    function uploadFile (endpoint, file) {
        return $http({
            method: 'POST',
            url: commonvariable.url + endpoint,
            params: {
                strategy: 'CREATE_AND_UPDATE'
            },
            data: new Uint8Array(file),
            headers: {'Content-Type': 'application/json'},
            transformRequest: []
        })
    }

    return {
        importEventFile: importEventFile
    }
}]);