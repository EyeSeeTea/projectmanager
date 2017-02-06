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

appManagerMSF.factory("EventImportService", ["$q", "$http", "commonvariable", "EventHelper", "ProgramService", function($q, $http, commonvariable, EventHelper, ProgramService) {
    
    var importEventFile = function (file) {
        // It is required to wrap the return into a deferred object. If not, the following promises are not notified
        var deferred = $q.defer();
        readEventZipFile(file).then(function (content) {
            if (content.isEmpty) {
                return deferred.reject("The file does not contain event data.");
            } else {
                var importOrder = [EventHelper.TEIS, EventHelper.ENROLLMENTS, EventHelper.EVENTS];
                return importOrder.reduce(function (promise, element) {
                    if (content.elements[element] != undefined) {
                        return promise.then(function () {
                            return content.elements[element].async("uint8array")
                                .then(function (data) {
                                    return uploadFile(element, data);
                                });
                        });
                    } else {
                        return promise;
                    }
                }, $q.resolve("Start"))
                    .then(
                        function () {deferred.resolve("Done");},
                        function (error) {deferred.reject(error);}
                    );
            }
        });
        return deferred.promise;
    };

    function readZipFile (file) {
        return JSZip.loadAsync(file)
    }

    function readEventZipFile (file) {
        return readZipFile(file).then(function (content) {

            var elements = {};
            elements[EventHelper.TEIS] = content.file(EventHelper.TEIS_ZIP);
            elements[EventHelper.ENROLLMENTS] = content.file(EventHelper.ENROLLMENTS_ZIP);
            elements[EventHelper.EVENTS] = content.file(EventHelper.EVENTS_ZIP);

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
            transformRequest: {}
        });
    }

    function previewEventFile (file) {
        // It is required to wrap the return into a deferred object. If not, the following promises are not notified
        var deferred = $q.defer();
        extractEvents(file)
            .then(classifyEventsByProgramAndStage)
            .then(addNameToProgramsAndStages)
            .then(
                function (file) {deferred.resolve(file)},
                function (error) {deferred.reject(error)}
            );
        return deferred.promise;
    }

    function extractEvents (file) {
        return readEventZipFile(file)
            .then(function(content) {
                if (content.elements[EventHelper.EVENTS] != undefined) {
                    return content.elements[EventHelper.EVENTS].async("arraybuffer")
                } else {
                    return $q.reject("No events");
                }
            })
            .then(function (zipFile) {
                return JSZip.loadAsync(zipFile);
            })
            .then(function (eventsFile) {
                return eventsFile.file(EventHelper.EVENTS_JSON).async("string");
            })
            .then(function (eventsRaw) {
                return JSON.parse(eventsRaw).events;
            });
    }

    function classifyEventsByProgramAndStage (events) {
        var programs = {};
        $.each(events, function (index, event) {
            programs[event.program] = programs[event.program] || {stages:{}};
            programs[event.program].stages[event.programStage] = programs[event.program].stages[event.programStage] || {value: 0};
            programs[event.program].stages[event.programStage].value++;
        });
        return programs;
    }
    
    function addNameToProgramsAndStages (eventsByProgram) {
        var promiseArray = $.map(eventsByProgram, function (value, property) {
            return ProgramService.getProgramAndStages(property);
        });

        return $q.all(promiseArray).then(function (data) {
            $.each(data, function (index, program) {
                eventsByProgram[program.id].name = program.name;
                $.each(program.programStages, function (index, stage) {
                    if (eventsByProgram[program.id].stages[stage.id]) {
                        eventsByProgram[program.id].stages[stage.id].name = stage.name;
                    }
                })
            });
            return eventsByProgram;
        });
    }

    return {
        importEventFile: importEventFile,
        previewEventFile: previewEventFile
    }
}]);