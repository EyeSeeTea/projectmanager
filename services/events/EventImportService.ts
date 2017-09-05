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

import { CommonVariable, Program } from '../../model/model';
import { EventHelper, ProgramService } from '../services.module';

export class EventImportService {

    static $inject =["$q", "$http", "commonvariable", "EventHelper", "ProgramService"];
    
    constructor(
        private $q: ng.IQService,
        private $http, 
        private commonvariable: CommonVariable,
        private EventHelper: EventHelper, 
        private ProgramService: ProgramService
    ){}

    importEventFile (file) {
        // It is required to wrap the return into a deferred object. If not, the following promises are not notified
        var deferred = this.$q.defer();
        this.readEventZipFile(file).then( (content) => {
            if (content.isEmpty) {
                return deferred.reject("The file does not contain event data.");
            } else {
                return this.getAndUploadEventFileElement(content, this.EventHelper.TEIS)
                    .then( () => this.getAndUploadEnrollmentsAsActive(content) )
                    .then( () => this.getAndUploadEventFileElement(content, this.EventHelper.EVENTS) )
                    .then( () => this.getAndUploadEventFileElement(content, this.EventHelper.ENROLLMENTS) )
                    .then(
                        () => deferred.resolve("Done"),
                        (error) => deferred.reject(error)
                );
            }
        });
        return deferred.promise;
    };

    private readZipFile (file): Promise<JSZip> {
        return (new JSZip()).loadAsync(file)
    }

    private readEventZipFile (file) {
        return this.readZipFile(file).then( (content) => {

            let elements = {};
            elements[this.EventHelper.TEIS] = content.file(this.EventHelper.TEIS_ZIP);
            elements[this.EventHelper.ENROLLMENTS] = content.file(this.EventHelper.ENROLLMENTS_ZIP);
            elements[this.EventHelper.EVENTS] = content.file(this.EventHelper.EVENTS_ZIP);

            const isEmpty = elements[this.EventHelper.TEIS] == undefined &&
                elements[this.EventHelper.ENROLLMENTS] == undefined &&
                elements[this.EventHelper.EVENTS] == undefined;

            return {
                isEmpty: isEmpty,
                elements: elements
            }
        });
    }

    private getAndUploadEventFileElement (content, element) {
        return this.getEventZipFileElement(content, element)
                .then( (data) => this.uploadFile(element, data) );
    }

    private getAndUploadEnrollmentsAsActive (content) {
        return content.elements[this.EventHelper.ENROLLMENTS].async("arraybuffer")
            .then( (zipFile) => (new JSZip()).loadAsync(zipFile) )
            .then( (enrollmentsFile) => enrollmentsFile.file(this.EventHelper.ENROLLMENTS_JSON).async("string") )
            .then( (enrollmentsRaw) => {
                const activeEnrollments = JSON.parse(enrollmentsRaw).enrollments.map( (enrollment) => {
                    enrollment.status = "ACTIVE";
                    return enrollment;
                });
                return  (new JSZip()).file(
                    this.EventHelper.ENROLLMENTS_JSON,
                    JSON.stringify({"enrollments": activeEnrollments})
                )
                    .generateAsync({type: "uint8array", compression: "DEFLATE"});
            })
            .then( (enrollmentsAsActiveInZip) => this.uploadFile(this.EventHelper.ENROLLMENTS, enrollmentsAsActiveInZip) );
    }

    private getEventZipFileElement (content, element) {
        if (content.elements[element] != undefined) {
            return content.elements[element].async("uint8array");
        } else {
            return this.$q.resolve(undefined);
        }
    }

    private uploadFile (endpoint, file) {
        if (file != undefined) {
            return this.$http({
                method: 'POST',
                url: this.commonvariable.url + endpoint,
                params: {
                    strategy: 'CREATE_AND_UPDATE'
                },
                data: new Uint8Array(file),
                headers: {'Content-Type': 'application/json'},
                transformRequest: {}
            });
        } else {
            this.$q.resolve("Nothing to upload");
        }
    }

    previewEventFile (file) {
        // It is required to wrap the return into a deferred object. If not, the following promises are not notified
        var deferred = this.$q.defer();
        this.extractEvents(file)
            .then((events) => this.classifyEventsByProgramAndStage(events))
            .then((programs) => this.addNameToProgramsAndStages(programs))
            .then(
                (summary) => deferred.resolve(summary),
                (error) => deferred.reject(error)
            );
        return deferred.promise;
    }

    private extractEvents (file) {
        return this.readEventZipFile(file)
            .then((content) => {
                if (content.elements[this.EventHelper.EVENTS] != undefined) {
                    return content.elements[this.EventHelper.EVENTS].async("arraybuffer")
                } else {
                    return this.$q.reject("No events");
                }
            })
            .then((zipFile) => (new JSZip()).loadAsync(zipFile))
            .then((eventsFile) => eventsFile.file(this.EventHelper.EVENTS_JSON).async("string"))
            .then((eventsRaw) => JSON.parse(eventsRaw).events);
    }

    private classifyEventsByProgramAndStage (events) {
        var programs = {};
        $.each(events, (index, event) => {
            programs[event.program] = programs[event.program] || {stages:{}};
            programs[event.program].stages[event.programStage] = programs[event.program].stages[event.programStage] || {value: 0};
            programs[event.program].stages[event.programStage].value++;
        });
        return programs;
    }
    
    private addNameToProgramsAndStages (eventsByProgram) {
        var promiseArray = $.map(eventsByProgram, (value, programId) => {
            return this.ProgramService.getProgramAndStages(programId);
        });

        return this.$q.all(promiseArray).then((data) => {
            data.forEach(program => {
                eventsByProgram[program.id].name = program.name;
                program.programStages.forEach( stage => {
                    if (eventsByProgram[program.id].stages[stage.id]) {
                        eventsByProgram[program.id].stages[stage.id].name = stage.name;
                    }
                })
            });
            return eventsByProgram;
        });
    }
}
