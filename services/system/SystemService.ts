
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

import { Orgunit, Program } from '../../model/model';

export class SystemService {

    static $inject = ['$q', 'Info', 'Ping'];

    constructor(private $q: ng.IQService, private Info, private Ping){}

    /**
     * This method gives you the server date with time zone. It is obtained checking the http headers in the response.
     * It returns a promise that resolves to a Date object.
     */
    getServerDateWithTimezone(): ng.IPromise<Date> {
        return this.Ping.get().$promise.then(
            // Ping resource returns a transformed response. See Ping resource
            (pingResponse) => new Date(pingResponse.headers.date)
        )
    }

    /**
     * This method gives you the server date without timezone in string format. The date is relative to the server timezone:
     * for example, the server is located at UTC+2 and it is 14:00. It will return "2017-08-03T14:00:00.000" (instead of 2017-08-03T12:00:00.000Z).
     * It returns a promise that resolves to the string.
     */
    getServerDateWithoutTimezone(): ng.IPromise<string> {
        return this.Info.get().$promise.then(
            (response) => response.serverDate
        )
    }

    getSystemName(): ng.IPromise<string> {
        return this.Info.get().$promise.then(
            (response) => response.systemName
        )
    }

    sleep(milliseconds: number): ng.IPromise<any> {
        const deferred = this.$q.defer();
        setTimeout(() => deferred.resolve("Done"), milliseconds);
        return deferred.promise;
    }

}