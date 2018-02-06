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

import { CommonVariable, EventDataWrapper, Program } from '../../model/model';
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
        this.readEventZipFile(file).then( 
            (eventFile: EventDataWrapper) => {
                return this.getAndUploadTeis(eventFile)
                    .then( () => this.getAndUploadEnrollmentsAsActive(eventFile) )
                    .then( () => this.getAndUploadDeletedEvents(eventFile) )
                    .then( () => this.getAndUploadActiveEvents(eventFile) )
                    .then( () => this.getAndUploadEnrollments(eventFile) )
                    .then(
                        () => deferred.resolve("Done"),
                        (error) => deferred.reject(error)
                );
            },
            (error) => deferred.reject("The file does not contain event data.")
        );
        return deferred.promise;
    };

    private readZipFile (file): Promise<JSZip> {
        return (new JSZip()).loadAsync(file)
    }

    private readEventZipFile (file): Promise<EventDataWrapper> {
        return this.readZipFile(file).then( (content) => {
            var encryptedFile = content.file(this.EventHelper.EVENTS);

            if (encryptedFile == undefined) {
                return this.$q.reject("No events file");
            } 

            return encryptedFile.async("string")
                .then(encrpyted => this.EventHelper.decryptObject(encrpyted));
        });
    }

    private getAndUploadTeis (content: EventDataWrapper) {
        const teis = new Object();
        teis[this.EventHelper.TEIS] = content[this.EventHelper.TEIS];
        const params = { strategy: 'CREATE_AND_UPDATE'}
        return this.zipObject(this.EventHelper.TEIS, teis)
            .then( (data) => this.uploadFile(this.EventHelper.TEIS, data, params) );
    }

    private getAndUploadEnrollmentsAsActive (content: EventDataWrapper) {
        const activeEnrollments = content.enrollments.map( (enrollment) => {
            let copy = Object.assign({}, enrollment);
            copy.status = "ACTIVE";
            return copy;
        });

        const enrollments = new Object();
        enrollments[this.EventHelper.ENROLLMENTS] = activeEnrollments;
        const params = { strategy: 'CREATE_AND_UPDATE' }
        return this.zipObject(this.EventHelper.ENROLLMENTS, enrollments)
            .then( (data) => this.uploadFile(this.EventHelper.ENROLLMENTS, data, params) );
    }

    private getAndUploadDeletedEvents (content: EventDataWrapper) {
        const deletedEvents = content.events.filter( event => event.deleted);
        const events = new Object();
        events[this.EventHelper.EVENTS] = deletedEvents;
        const params = { strategy: 'UPDATE'}
        return this.zipObject(this.EventHelper.EVENTS, events)
            .then( (data) => this.uploadFile(this.EventHelper.EVENTS, data, params) );
    }

    private getAndUploadActiveEvents (content: EventDataWrapper) {
        const activeEvents = content.events.filter( event => !event.deleted);
        const events = new Object();
        events[this.EventHelper.EVENTS] = activeEvents;
        const params = { strategy: 'CREATE_AND_UPDATE'}
        return this.zipObject(this.EventHelper.EVENTS, events)
            .then( (data) => this.uploadFile(this.EventHelper.EVENTS, data, params) );
    }

    private getAndUploadEnrollments (content: EventDataWrapper) {
        const enrollments = new Object();
        enrollments[this.EventHelper.ENROLLMENTS] = content[this.EventHelper.ENROLLMENTS];
        const params = { strategy: 'CREATE_AND_UPDATE'}
        return this.zipObject(this.EventHelper.ENROLLMENTS, enrollments)
            .then( (data) => this.uploadFile(this.EventHelper.ENROLLMENTS, data, params) );
    }

    private zipObject (name: string, object) {
        return  (new JSZip())
            .file(name, JSON.stringify(object))
            .generateAsync({type: "uint8array", compression: "DEFLATE"});
    }

    private uploadFile (endpoint: string, file, params) {
        if (file != undefined) {
            return this.$http({
                method: 'POST',
                url: this.commonvariable.url + endpoint,
                params: params,
                data: new Uint8Array(file),
                headers: {'Content-Type': 'application/json'},
                transformRequest: {}
            });
        } else {
            return this.$q.resolve("Nothing to upload");
        }
    }

    previewEventFile (file) {
        // It is required to wrap the return into a deferred object. If not, the following promises are not notified
        var deferred = this.$q.defer();
        this.readEventZipFile(file)
            .then((eventFile) => this.classifyEventsByProgramAndStage(eventFile.events))
            .then((programs) => this.addNameToProgramsAndStages(programs))
            .then((summary) => deferred.resolve(summary))
            .catch((error) => deferred.reject(error));
        return deferred.promise;
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
