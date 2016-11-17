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
        return readEventZipFile(file).then(function(content) {
            if (content.isEmpty) {
                return $q.reject("The file does not contain event data.");
            } else {
                var importOrder = [EventHelper.TEIS, EventHelper.ENROLLMENTS, EventHelper.EVENTS];
                return importOrder.reduce(function (promise, element) {
                    if (content.elements[element] != undefined) {
                        return promise.then(function () {
                            return uploadFile(element, content.elements[element].asArrayBuffer());
                        });
                    } else {
                        return promise;
                    }
                }, $q.resolve("Start"));
            }
        });
    };

    function readZipFile (file) {
        console.log(file);
        var deferred = $q.defer();
        var fileReader = new FileReader();
        fileReader.readAsArrayBuffer(file);
        fileReader.onload = function(e) {
            deferred.resolve(e.target.result)
        };
        return deferred.promise;
    }

    function readEventZipFile (file) {
        return readZipFile(file).then(function (content) {
            var zip = new JSZip(content);
            var elements = {};
            elements[EventHelper.TEIS] = zip.file(EventHelper.TEIS_ZIP);
            elements[EventHelper.ENROLLMENTS] = zip.file(EventHelper.ENROLLMENTS_ZIP);
            elements[EventHelper.EVENTS] = zip.file(EventHelper.EVENTS_ZIP);

            var isEmpty = elements[EventHelper.TEIS] == undefined &&
                elements[EventHelper.ENROLLMENTS] == undefined &&
                elements[EventHelper.EVENTS] == undefined;

            return {
                isEmpty: isEmpty,
                elements: elements
            }
        });
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

    function previewEventFile (file) {
        return readEventZipFile(file)
            .then(function(content) {
                console.log("entra");
                if (content.elements[EventHelper.EVENTS] != undefined) {
                    return content.elements[EventHelper.EVENTS];
                } else {
                    console.log("undefined");
                    return $q.reject("No events");
                }
            });
    }

    return {
        importEventFile: importEventFile,
        previewEventFile: previewEventFile
    }
}]);