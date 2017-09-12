
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

import { CommonVariable } from '../../model/model';
import { DataStoreService } from '../../services/services.module';

export class RemoteApiService {

    static $inject = ['$q', '$http', 'DataStoreService', 'RemoteInstanceUrl', 'RemoteAvailability', 'commonvariable'];

    constructor(
        private $q: ng.IQService,
        private $http: ng.IHttpService,
        private DataStoreService: DataStoreService,
        private RemoteInstanceUrl,
        private RemoteAvailability,
        private commonvariable: CommonVariable
    ){}

    remoteSettings;
    defaultAPIVersion = this.commonvariable.apiVersion;

    // DataStore configuration for remote user
    readonly remoteSettingsNamespace = 'remoteSettings';
    readonly remoteUserProperty = 'remoteUser';
    
    // Error messages
    readonly NO_LOGGER_USER = 'NO_LOGGER_USER';
    readonly INVALID_LOGGER_USER = 'INVALID_LOGGER_USER';
    readonly NOT_IN_WHITELIST = 'NOT_IN_WHITELIST';
    readonly LOGGER_USER_NOT_AUTHORIZED = 'LOGGER_USER_NOT_AUTHORIZED';
    readonly REMOTE_NOT_CONFIGURED = 'REMOTE_NOT_CONFIGURED';

    // Error messages
    readonly REMOTE_NOT_AVAILABLE = "REMOTE_NOT_AVAILABLE";
    readonly AUTHENTICATION_FAILED = "AUTHENTICATION_FAILED";
    readonly REMOTE_IS_AVAILABLE = "REMOTE_IS_AVAILABLE";


    updateRemoteSettings() {
        return this.RemoteInstanceUrl.get().$promise
            .then( remoteUrl => {
                
                if (remoteUrl.html == "") {
                    return this.$q.reject(this.REMOTE_NOT_CONFIGURED);
                }
                return this.DataStoreService.getKeyValue(this.remoteSettingsNamespace).then(
                   settings => {
                       if (settings[this.remoteUserProperty]){
                           this.remoteSettings = {
                               url: remoteUrl.html,
                               api: remoteUrl.html + '/api',
                               loggerAuth: 'Basic ' + btoa(settings[this.remoteUserProperty].username + ":" + settings[this.remoteUserProperty].password)
                           }
                        } else {
                           return this.$q.reject(this.INVALID_LOGGER_USER);
                       }
                   },
                   error => this.$q.reject(this.NO_LOGGER_USER)
               );
            });
    };
    
    executeRemoteQuery(remoteQuery) {
       
        // Check if apiVersion is defined in remoteQuery (two digits).
        let apiVersion = remoteQuery.apiVersion == undefined ? '/' + this.defaultAPIVersion :
            /^\d{2}$/.test(remoteQuery.apiVersion) ? '/' + remoteQuery.apiVersion : '';
        
        return this.init()
            .then(
                success => {
                    // Choose authorization. Defaults to data authorization
                    var authorization = this.remoteSettings.loggerAuth;
                       return this.$http({
                        method: remoteQuery.method,
                        url: this.remoteSettings.api + apiVersion + '/' + remoteQuery.resource,
                        data: remoteQuery.data,
                        headers: {
                          Authorization: authorization
                        },
                         
                    })
                }
            )
            .catch((error) => this.handleRemoteErrors(error));
    };    

     /**
     * Check if remote server is available.
     * @returns {*} A promise that successes if remote is available, and fails if not. If failure, it returns a error message.
     */
    isRemoteServerAvailable() {
        return this.RemoteAvailability.get().$promise
            .then((response) => this.handleAvailabilityResponse(response));
    };

    private init() {
        if (this.remoteSettings != undefined){
            return this.$q.resolve("Setting exists");
        } else {
            return this.updateRemoteSettings();
        }
    }

    private handleAvailabilityResponse(response) {
        if (response.statusCode == 200) {
            return this.$q.resolve(this.REMOTE_IS_AVAILABLE);
        }
        else if (response.statusCode == 502 && response.message == "Remote server is not configured") {
            return this.$q.reject(this.REMOTE_NOT_CONFIGURED);
        }
        else if (response.statusCode == 502 && response.message == "Network is unreachable") {
            return this.$q.reject(this.REMOTE_NOT_AVAILABLE);
        }
        else if (response.statusCode == 401 && response.message == "Authentication failed") {
            return this.$q.reject(this.AUTHENTICATION_FAILED);
        }
        else {
            return this.$q.reject(response.message);
        }
    }

    private handleRemoteErrors(message) {
        var errorString = message;
        if (message === this.NO_LOGGER_USER) {
            errorString = this.NO_LOGGER_USER;
        }
        else if (message == this.INVALID_LOGGER_USER) {
            errorString = this.INVALID_LOGGER_USER;
        }
        else if (message.status == -1) {
            errorString = this.NOT_IN_WHITELIST;
        }
        else if (message.status == 401) {
            errorString = this.LOGGER_USER_NOT_AUTHORIZED;
        }
        return this.$q.reject(errorString);
    }
    
}