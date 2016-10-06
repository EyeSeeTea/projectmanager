
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

    var exportEventsWithDependencies = function (startDate, endDate, orgunits, programs) {
        return getEvents(startDate, endDate, orgunits, programs)
            .then(addTrackedEntitiesAndEnrollments)
    };

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
    
    function addTrackedEntitiesAndEnrollments (events) {
        var eventsWithTeisAndEnrolls = events;

        var teisAndEnrolls = extractTrackedEntitiesAndEnrollments(events);

        var teiPromises = [];
        if (teisAndEnrolls.trackedEntityInstances) {
            teisAndEnrolls.trackedEntityInstances.forEach(function (tei) {
                teiPromises.push(TrackedEntityInstances.get({uid: tei.id}).$promise);
            })
        }

        var enrollmentsPromises = [];
        if (teisAndEnrolls.enrollments) {
            teisAndEnrolls.enrollments.forEach(function (enrollment) {
                enrollmentsPromises.push(Enrollments.get({uid: enrollment.id}).$promise);
            })
        }

        return $q.all(teiPromises)
            .then(function (teiArray) {
                var teis = teiArray.reduce(function (totalTeis, tei) {
                    totalTeis.trackedEntityInstances.push(cleanResponse(tei));
                    return totalTeis;
                }, {trackedEntityInstances: []});
                angular.extend(eventsWithTeisAndEnrolls, teis);

                return $q.all(enrollmentsPromises);
            })
            .then(function (enrollmentsArray) {
                var enrollments = enrollmentsArray.reduce(function (totalEnrolls, enrollment) {
                    totalEnrolls.enrollments.push(cleanResponse(enrollment));
                    return totalEnrolls;
                }, {enrollments: []});
                angular.extend(eventsWithTeisAndEnrolls, enrollments);

                return eventsWithTeisAndEnrolls;
            });
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

    function extractTrackedEntitiesAndEnrollments (events) {
        // TODO Should return an object of type {"trackedEntityInstances":[{id:...},{id:...}], "enrollments":[{id:...},{id:...}]}
        return {
            trackedEntityInstances: [{id: 'Rlbqiv1mRhH'},{id: 'rdUxVJia6ul'}],
//            trackedEntityInstances: [],
            enrollments: [{id: 'o3grMf7MOZG'}, {id: 'dtiu1x8P1f0'}]
//            enrollments: []
        };
    }

    function cleanResponse (response) {
        return JSON.parse(angular.toJson(response));
    }

    return {
        exportEventsWithDependencies: exportEventsWithDependencies
    }
    
}]);
