
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

import * as angular from 'angular';
import { Orgunit, Program } from '../../model/model';
import { EventHelper, SystemService } from '../services.module';
import { EventList, EnrollmentList, TrackedEntityInstanceList, EventDataWrapper } from '../../model/model';

export class EventExportService {

    static $inject = ['$q','EventHelper', 'SystemService', 'Events', 'TrackedEntityInstances', 'Enrollments'];

    // Minumum time (in seconds) since the lastUpdated event
    private minTimeAfterUpdates = 10 

    constructor(
        private $q: ng.IQService, 
        private EventHelper: EventHelper,
        private SystemService: SystemService, 
        private Events, 
        private TrackedEntityInstances, 
        private Enrollments
    ){}

    /**
     * Same that exportEventsWithDependencies, but returns a compressed file.
     * @param startDate Start of export period
     * @param endDate End of export period
     * @param orgunits Array of orgunits
     * @param programs Array of programs (optional)
     * @returns {*} Promise that resolves to a zip object with containing three zip files: events, trackedEntityInstances and enrollments
     */
    /**
    exportEventsWithDependenciesInZip (startDate: string, endDate: string, orgunits: Orgunit[], programs?: Program[]) {
        return this.exportEventsWithDependencies(startDate, endDate, orgunits, programs)
            .then(wrapper => 
                
                { 
                    //console.log(wrapper.enrollments);
                   // console.log(wrapper.events);
                   // console.log(wrapper.trackedEntityInstances);
                    var ev=wrapper.events;
                    var enr=wrapper.enrollments;
                    var enrollments2;
                    ev.forEach(ev=>{
                         console.log(ev)
                    
                    
                    })
                    enr.forEach(el=>{
                            console.log(el)
                        //enrollments2[el.enrollment]=el;
                        
                        })

//console.log(enrollments2);


                    this.EventHelper.encryptObject(wrapper)})
            .then(file => this.compressFileByElementType(file));
    };
*/
    /**
     * Same that exportEventsFromLastWithDependencies, but returns a compressed file.
     * @param lastUpdated Date to start the event query
     * @param orgunits Array of orgunits
     * @param programs Array of programs (optional)
     * @returns {*} Promise that resolves to a zip object with containing three zip files: events, trackedEntityInstances and enrollments
     */
    exportEventsFromLastWithDependenciesInZip (lastUpdated: string, endDate, serverName, orgunits: Orgunit[], programs?: Program[]) {
        return this.exportEventsFromLastWithDependencies2(lastUpdated, endDate, orgunits, programs)
           .then(wrapper => this.EventHelper.encryptObject(wrapper))
            .then(file => this.compressFileByElementType2(file, lastUpdated, endDate, serverName, orgunits, programs));
    };

    /**
     * 
     * Exports all events and dependencies (trackedEntityInstances and enrollments) between startDate and endDate for the
     * given array of orgunits and their descendants and, optionally, for the given array of programs. Returns a promise
     * that resolves to an object with the structure:
     * {events: [<array_of_events], trackedEntityInstances: [<array_of_teis>], enrollments: [<array_of_enrollments>]}
     * @param startDate Start of export period
     * @param endDate End of export period
     * @param orgunits Array of orgunits
     * @param programs Array of programs (optional)
     * @returns {*} Promise that resolves to an object containing events, trackedEntityInstances and enrollments
     */
    /**
    exportEventsWithDependencies (startDate: string, endDate: string, orgunits: Orgunit[], programs: Program[]) {
        return this.getEvents(startDate, endDate, orgunits, programs)
            .then(events => this.addRelatedTrackedEntitiesAndEnrollments(events))
    };
*/
    /**
     * Exports all events and dependencies (trackedEntityInstances and enrollments) from lastUpdated for the
     * given array of orgunits and their descendants and, optionally, for the given array of programs. Returns a promise
     * that resolves to an object with the structure:
     * {events: [<array_of_events], trackedEntityInstances: [<array_of_teis>], enrollments: [<array_of_enrollments>]}
     * @param lastUpdated Date to start the event query
     * @param orgunits Array of orgunits
     * @param programs Array of programs (optional)
     * @returns {*} Promise that resolves to an object containing events, trackedEntityInstances and enrollments
     */
    exportEventsFromLastWithDependencies2 (lastUpdated: string, endDate: string, orgunits: Orgunit[], programs: Program[]) {
        const orgunitProgramCombo = this.getOrgunitProgramCombo(orgunits, programs);
      
        return this.$q.all([
            this.getTrackedEntityInstancesFromLastWithDependecies(lastUpdated, endDate, orgunitProgramCombo)
            
        ])
        .then(([teisWithDependencies]) => {
            let dataWrapper = teisWithDependencies;
            //console.log("dataWrapper");
            //console.log(dataWrapper);
            return dataWrapper;
        });
     
    };
/**
     * Exports all events and dependencies (trackedEntityInstances and enrollments) from lastUpdated for the
     * given array of orgunits and their descendants and, optionally, for the given array of programs. Returns a promise
     * that resolves to an object with the structure:
     * {events: [<array_of_events], trackedEntityInstances: [<array_of_teis>], enrollments: [<array_of_enrollments>]}
     * @param lastUpdated Date to start the event query
     * @param orgunits Array of orgunits
     * @param programs Array of programs (optional)
     * @returns {*} Promise that resolves to an object containing events, trackedEntityInstances and enrollments
     */
    /**
    exportEventsFromLastWithDependencies (lastUpdated: string, orgunits: Orgunit[], programs: Program[]) {
        const orgunitProgramCombo = this.getOrgunitProgramCombo(orgunits, programs);
            
        return this.$q.all([
            this.getEventsFromLast(lastUpdated, orgunits, programs),
            this.getTrackedEntityInstancesFromLast(lastUpdated, orgunitProgramCombo),
            this.getEnrollmentsFromLast(lastUpdated, orgunitProgramCombo)
        ])
            .then(([events, teis, enrolls]) => {
                let dataWrapper = new EventDataWrapper(events.events, enrolls.enrollments, teis.trackedEntityInstances);
                return this.addMissingTrackedEntitiesAndEnrollments(dataWrapper);
            });
             
    };
    */
    /**
     * Exports all events between startDate and endDate for the given array of orgunits and their descendants and, optionally,
     * for the given array of programs. Returns a promise that resolves to an object with the structure:
     * {events: [<array_of_events]}
     * @param startDate Start of export period
     * @param endDate End of export period
     * @param orgunits Array of orgunits
     * @param programs Array of programs (optional)
     * @returns {*} Promise that resolves to an object containing events
     */
    getEvents (startDate: string, endDate: string, orgunits: Orgunit[], programs: Program[]): ng.IPromise<EventList> {
        var commonParams = {
            startDate: startDate,
            endDate: endDate,
            ouMode: 'DESCENDANTS'
        };
        return this.getEventsFromOrgunitAndPrograms(commonParams, orgunits, programs);
    }

    /**
     * Exports all events from lastUpdated for the given array of orgunits and their descendants and, optionally,
     * for the given array of programs. Returns a promise that resolves to an object with the structure:
     * {events: [<array_of_events]}
     * @param lastUpdated Date to start the event query
     * @param orgunits Array of orgunits
     * @param programs Array of programs (optional)
     * @returns {*} Promise that resolves to an object containing events
     */
    getEventsFromLast (lastUpdated: string, orgunits: Orgunit[], programs: Program[]): ng.IPromise<EventList> {
        const commonParams = {
            lastUpdated: lastUpdated,
            ouMode: 'DESCENDANTS'
        };
        return this.getEventsFromOrgunitAndPrograms(commonParams, orgunits, programs);
    }

    /**
     * Exports all trackedEntityInstances for the given orgunitProgramCombo. It includes orgunit descendants. Returns a promise that
     * resolves to a TrackedEntityInstanceList
     * @param lastUpdated Data to start the trackedEntityInstanceQuery
     * @param orgunitProgramCombo Combo of orgunit/program
     * @returns {*} Promise that resolves to a TrackedEntityInstanceList object
     */
    getTrackedEntityInstancesFromLastWithDependecies (lastUpdated: string,endDate, orgunitProgramCombo: OrgunitProgramComboItem[]): ng.IPromise<TrackedEntityInstanceList> {
        const commonParams = {
            lastUpdatedStartDate: lastUpdated,
            paging: false,
            ouMode: 'ACCESSIBLE',
            lastUpdatedEndDate:  endDate
        };
        let teiPromises = orgunitProgramCombo.map( (combination) => {
            //ou: combination.orgUnit,
            const params = angular.extend({}, commonParams, { program: combination.program, fields: "*", includeDeleted: "true"});
            return this.TrackedEntityInstances.get(params).$promise;
        });

        return this.$q.all(teiPromises).then(
            (teisArray: TrackedEntityInstanceList[]) => teisArray.reduce( (totalTeis: TrackedEntityInstanceList, currentTei: TrackedEntityInstanceList) => {
                    return new TrackedEntityInstanceList(totalTeis.trackedEntityInstances.concat(currentTei.trackedEntityInstances));
                }, TrackedEntityInstanceList.empty)
        )
    }
/**
     * Exports all trackedEntityInstances for the given orgunitProgramCombo. It includes orgunit descendants. Returns a promise that
     * resolves to a TrackedEntityInstanceList
     * @param lastUpdated Data to start the trackedEntityInstanceQuery
     * @param orgunitProgramCombo Combo of orgunit/program
     * @returns {*} Promise that resolves to a TrackedEntityInstanceList object
     */
    getTrackedEntityInstancesFromLast (lastUpdated: string, orgunitProgramCombo: OrgunitProgramComboItem[]): ng.IPromise<TrackedEntityInstanceList> {
        const commonParams = {
            lastUpdated: lastUpdated,
            ouMode: 'ACCESSIBLE'
        };
        let teiPromises = orgunitProgramCombo.map( (combination) => {
            //ou: combination.orgUnit, 
            const params = angular.extend({}, commonParams, {program: combination.program});
            return this.TrackedEntityInstances.get(params).$promise;
        });

        return this.$q.all(teiPromises).then(
            (teisArray: TrackedEntityInstanceList[]) => teisArray.reduce( (totalTeis: TrackedEntityInstanceList, currentTei: TrackedEntityInstanceList) => {
                    return new TrackedEntityInstanceList(totalTeis.trackedEntityInstances.concat(currentTei.trackedEntityInstances));
                }, TrackedEntityInstanceList.empty)
        )
    }


    /**
     * Exports all enrollments for the given orgunitProgramCombo. It includes orgunit descendants. Returns a promise that
     * resolves to a EnrollmentList
     * @param lastUpdated Data to start the trackedEntityInstanceQuery
     * @param orgunitProgramCombo Combo of orgunit/program
     * @returns {*} Promise that resolves to an EnrollmentList object
     */
    private getEnrollmentsFromLast (lastUpdated: string, orgunitProgramCombo: OrgunitProgramComboItem[]): ng.IPromise<EnrollmentList> {
        const commonParams = {
            lastUpdated: lastUpdated,
            ouMode: 'DESCENDANTS'
        };
        let enrollPromises = orgunitProgramCombo.map( (combination) => {
            const params = angular.extend({}, commonParams, {ou: combination.orgUnit, program: combination.program});
            return this.Enrollments.get(params).$promise;
        });

        return this.$q.all(enrollPromises).then(
            (enrollsArray: EnrollmentList[]) => enrollsArray.reduce( (totalEnrolls: EnrollmentList, currentEnroll: EnrollmentList) => {
                    return new EnrollmentList(totalEnrolls.enrollments.concat(currentEnroll.enrollments));
                }, EnrollmentList.empty)
        )
    }
    
    private getEventsFromOrgunitAndPrograms (commonParams: any, orgunits: Orgunit[], programs: Program[]): ng.IPromise<EventList> {
        let maxLastUpdatedDateAllowed: Date;
        let eventsPromises = [];
        this.getOrgunitProgramCombo(orgunits, programs).forEach( (customParams) => {
            eventsPromises.push(this.Events.get(angular.extend({}, commonParams, customParams)).$promise);
        });

        return this.SystemService.getServerDateWithoutTimezone().then( serverDateResponse => {
            maxLastUpdatedDateAllowed = new Date(serverDateResponse);
            maxLastUpdatedDateAllowed.setSeconds(maxLastUpdatedDateAllowed.getSeconds() - this.minTimeAfterUpdates);
            return null;
        })
            .then( () => this.$q.all(eventsPromises))
            .then( (eventsArray: EventList[]) => {
                const eventList = eventsArray.reduce( (totalEvents: EventList, eventsResult: EventList) => {
                    return new EventList(totalEvents.events.concat(eventsResult.events));
                }, EventList.empty)
                const recentlyUpdated = eventList.events.some(event => new Date(event.lastUpdated) > maxLastUpdatedDateAllowed)
                if (recentlyUpdated) {
                    console.log("EventExportService: delaying event export for " + this.minTimeAfterUpdates + " seconds");
                    return this.SystemService.sleep(this.minTimeAfterUpdates * 1000)
                        .then(() => this.getEventsFromOrgunitAndPrograms(commonParams, orgunits, programs));
                } else {
                    return eventList;
                }
            }
        )
    }

    /**
     * This method accepts an object with the property events, and returns a promise that resolves to an object with
     * the given events plus the trackedEntityInstances and enrollments included in the events.
     * @param events Object of type EventList
     * @returns {*} Promise that resolves to an updated EventDataWrapper
     */
    /**
     *     private addRelatedTrackedEntitiesAndEnrollments (events: EventList): ng.IPromise<EventDataWrapper> {
        let dataWrapper = new EventDataWrapper(events.events, [], []);

        var teisArray = this.extractEventsPropertyToArray(events, 'trackedEntityInstance');
        var enrollsArray = this.extractEventsPropertyToArray(events, 'enrollment');

        return this.addTrackedEntitiesAndEnrollments(dataWrapper, teisArray, enrollsArray);
    }
*/
    /**
     * This method adds to the EventDataWrapper passed as parameter the trackedEntityInstances and enrollments that are 
     * related to the contained events and are not present in the EventDataWrapper.
     * @param dataWrapper Target EventDataWrapper
     * @returns {*} Promise that resolves to an updated EventDataWrapper
     */
    /**
    private addMissingTrackedEntitiesAndEnrollments (dataWrapper: EventDataWrapper): ng.IPromise<EventDataWrapper> {
        const relatedTeis = this.extractEventsPropertyToArray(new EventList(dataWrapper.events), 'trackedEntityInstance');
        const relatedEnrolls = this.extractEventsPropertyToArray(new EventList(dataWrapper.events), 'enrollment');

        const existingTeis = dataWrapper.trackedEntityInstances.map(tei => tei.trackedEntityInstance);
        const existingEnrolls = dataWrapper.enrollments.map(enroll => enroll.enrollment);

        const missingTeis = relatedTeis.filter(tei => existingTeis.indexOf(tei) < 0);
        const missingEnrolls = relatedEnrolls.filter(enroll => existingEnrolls.indexOf(enroll) < 0);

        return this.addTrackedEntitiesAndEnrollments(dataWrapper, missingTeis, missingEnrolls);
    }
    */
/** 
    private addTrackedEntitiesAndEnrollments (dataWrapper: EventDataWrapper, teisArray: string[], enrollsArray: string[]): ng.IPromise<EventDataWrapper> {
        return this.getTrackedEntityInstancesByUid(teisArray)
            .then( (trackedEntityInstances) => {
                dataWrapper.addTrackedEntityInstances(trackedEntityInstances.trackedEntityInstances)
                return this.getEnrollmentsByUid(enrollsArray);
            })
            .then( (enrollments) => {
                dataWrapper.addEnrollments(enrollments.enrollments);
                return dataWrapper;
            });
    }
*/
    /**
     * This methods queries for a list of trackedEntityInstances
     * @param teisUids Array of trackedEntityInstances uids (e.g.: ['ajdfkj','kkjefk']
     * @returns {*} A promise that resolves to an object like {trackedEntityInstances: [...]}
     */
   /**
     private getTrackedEntityInstancesByUid (teisUids: string[]): ng.IPromise<TrackedEntityInstanceList> {
        let teiPromises = teisUids.map( (tei) => this.TrackedEntityInstances.get({uid: tei}).$promise );

        return this.$q.all(teiPromises)
            .then( (teiArray) => {
                return teiArray.reduce( (totalTeis, tei) => {
                    totalTeis.trackedEntityInstances.push(this.cleanResponse(tei));
                    return totalTeis;
                }, {trackedEntityInstances: []});
            })
    }
*/
    /**
     * This methods queries for a list of enrollments
     * @param enrollUids Array of enrollments uids (e.g.: ['ajdfkj','kkjefk']
     * @returns {*} A promise that resolves to an object like {enrollments: [...]}
     */
    /**
    private getEnrollmentsByUid (enrollUids: string[]): ng.IPromise<EnrollmentList> {
        let enrollPromises = enrollUids.map( (enrollment) => this.Enrollments.get({uid: enrollment}).$promise );

        return this.$q.all(enrollPromises)
            .then( (enrollArray) => {
                return enrollArray.reduce( (totalEnrolls, enrollment) => {
                    totalEnrolls.enrollments.push(this.cleanResponse(enrollment));
                    return totalEnrolls;
                }, {enrollments: []});
            })
    }
   */
    private compressFileByElementType (file) {
        let zip: JSZip = new JSZip();
        zip.file(this.EventHelper.EVENTS, file);
        return zip.generateAsync({type: "blob", compression: "DEFLATE"});
    }
    private compressFileByElementType2 (file, lastUpdated, endDate, serverName, orgunits, programs) {
       
        let zip: JSZip = new JSZip();
        var asString = JSON.stringify(file);
        
        //console.log("asString");
        //console.log(asString);
        var settings={};
        settings["serverName"]=serverName;
        settings["projectName"]=orgunits[0].name;
        settings["projectId"]=orgunits[0].id;
        settings["lastUpdated"]=lastUpdated;
        settings["endDate"]=endDate;
        settings["programs"]=programs;
     
        
        zip.file(this.EventHelper.TEIS, asString);
        zip.file("settings", JSON.stringify(settings));
        return zip.generateAsync({type: "blob", compression: "DEFLATE"});
    }


    // Util functions
    private getOrgunitProgramCombo (orgunits: Orgunit[], programs: Program[]): OrgunitProgramComboItem[] {
        let combo: OrgunitProgramComboItem[] = [];
        orgunits.forEach( (orgunit: Orgunit) => {
            if (programs && programs.length > 0) {
                programs.forEach((program: Program) => {
                    combo.push(new OrgunitProgramComboItem(orgunit.id,program.id));
                })
            } else {
                combo.push(new OrgunitProgramComboItem(orgunit.id));
            }
        });
        return combo;
    }

    private extractEventsPropertyToArray (eventsObject: EventList, property: string) {
        let array  = eventsObject.events.map( (event) => event[property]);
        return this.getUniqueInArray(array);
    }

    private getUniqueInArray (array) {
        var u = {}, a = [];
        for (var i = 0, l = array.length; i < l; ++i){
            if (array[i] === undefined || u.hasOwnProperty(array[i])) {
                continue;
            }
            a.push(array[i]);
            u[array[i]] = 1;
        }
        return a;
    }

    private cleanResponse (response) {
        return JSON.parse(angular.toJson(response));
    }
    
};

class OrgunitProgramComboItem {
    constructor(
        public orgUnit: string,
        public program?: string
    ){}
}