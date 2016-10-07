
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

appManagerMSF.factory("EventsService", ["$q", "Events", "TrackedEntityInstances", "Enrollments", function($q, Events, TrackedEntityInstances, Enrollments) {

    /**
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
    var exportEventsWithDependencies = function (startDate, endDate, orgunits, programs) {
        return getEvents(startDate, endDate, orgunits, programs)
            .then(addTrackedEntitiesAndEnrollments)
    };

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
    function getEvents (startDate, endDate, orgunits, programs) {
        var commonParams = {
            startDate: startDate,
            endDate: endDate,
            ouMode: 'DESCENDANTS'
        };

        // Create a promise array with the possible combinations of orgunit / program
        var eventsPromises = [];
        getOrgunitProgramCombo(orgunits, programs).forEach(function (customParams) {
            eventsPromises.push(Events.get(angular.extend({}, commonParams, customParams)).$promise);
        });

        return $q.all(eventsPromises).then(
            function (eventsArray) {
                return eventsArray.reduce(function (totalEvents, eventsResult) {
                    return {events: totalEvents.events.concat(eventsResult.events)};
                }, {events: []});
            }
        )
    }

    /**
     * This method accepts an object with the property events, and returns a promise that resolves to an object with
     * the given events plus the trackedEntityInstances and enrollments included in the events.
     * @param events Object with the structure {events: [<array_of_events>]}
     * @returns {*} Promise that resolves to an object containing events, trackedEntityInstances and enrollments
     */
    function addTrackedEntitiesAndEnrollments (events) {
        var eventsWithTeisAndEnrolls = events;

        var teisArray = extractEventsPropertyToArray(events, 'trackedEntityInstance');
        var enrollsArray = extractEventsPropertyToArray(events, 'enrollment');

        return getTrackedEntityInstancesByUid(teisArray)
            .then(function (trackedEntityInstances) {
                angular.extend(eventsWithTeisAndEnrolls, trackedEntityInstances);
                return getEnrollmentsByUid(enrollsArray);
            })
            .then(function (enrollments) {
                angular.extend(eventsWithTeisAndEnrolls, enrollments);
                return eventsWithTeisAndEnrolls;
            });
    }

    /**
     * This methods queries for a list of trackedEntityInstances
     * @param teisUids Array of trackedEntityInstances uids (e.g.: ['ajdfkj','kkjefk']
     * @returns {*} A promise that resolves to an object like {trackedEntityInstances: [...]}
     */
    function getTrackedEntityInstancesByUid (teisUids) {
        var teiPromises = teisUids.map(function (tei) {
            return TrackedEntityInstances.get({uid: tei}).$promise;
        });

        return $q.all(teiPromises)
            .then(function (teiArray) {
                return teiArray.reduce(function (totalTeis, tei) {
                    totalTeis.trackedEntityInstances.push(cleanResponse(tei));
                    return totalTeis;
                }, {trackedEntityInstances: []});
            })
    }

    /**
     * This methods queries for a list of enrollments
     * @param enrollUids Array of enrollments uids (e.g.: ['ajdfkj','kkjefk']
     * @returns {*} A promise that resolves to an object like {enrollments: [...]}
     */
    function getEnrollmentsByUid (enrollUids) {
        var enrollPromises = enrollUids.map(function (enrollment) {
            return Enrollments.get({uid: enrollment}).$promise;
        });

        return $q.all(enrollPromises)
            .then(function (enrollArray) {
                return enrollArray.reduce(function (totalEnrolls, enrollment) {
                    totalEnrolls.enrollments.push(cleanResponse(enrollment));
                    return totalEnrolls;
                }, {enrollments: []});
            })
    }

    // Util functions
    function getOrgunitProgramCombo (orgunits, programs) {
        var combo = [];
        orgunits.forEach(function (orgunit) {
            if (programs && programs.length > 0) {
                programs.forEach(function (program) {
                    combo.push({orgUnit: orgunit.id, program: program.id});
                })
            } else {
                combo.push({orgUnit: orgunit.id});
            }
        });
        return combo;
    }

    function extractEventsPropertyToArray (eventsObject, property) {
        var array  = eventsObject.events.map( function (event) {
            return event[property];
        });
        return getUniqueInArray(array );
    }

    function getUniqueInArray (array) {
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

    function cleanResponse (response) {
        return JSON.parse(angular.toJson(response));
    }

    return {
        exportEventsWithDependencies: exportEventsWithDependencies
    }
    
}]);
