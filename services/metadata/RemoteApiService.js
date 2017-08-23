
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

var remoteApiService = ['$q', '$http', 'DataStoreService', 'RemoteInstanceUrl', 'RemoteAvailability', 'commonvariable', function($q, $http, DataStoreService, RemoteInstanceUrl, RemoteAvailability, commonvariable) {

    var remoteSettings;
    var defaultAPIVersion = commonvariable.apiVersion;

    // DataStore configuration for remote user
    var remoteSettingsNamespace = 'remoteSettings';
    var remoteUserProperty = 'remoteUser';
    
    // Error messages
    var NO_LOGGER_USER = 'NO_LOGGER_USER';
    var INVALID_LOGGER_USER = 'INVALID_LOGGER_USER';
    var NOT_IN_WHITELIST = 'NOT_IN_WHITELIST';
    var LOGGER_USER_NOT_AUTHORIZED = 'LOGGER_USER_NOT_AUTHORIZED';
    var REMOTE_NOT_CONFIGURED = 'REMOTE_NOT_CONFIGURED';

 // Error messages
    var REMOTE_NOT_AVAILABLE = "REMOTE_NOT_AVAILABLE";
    var REMOTE_NOT_CONFIGURED = "REMOTE_NOT_CONFIGURED";
    var AUTHENTICATION_FAILED = "AUTHENTICATION_FAILED";
    var REMOTE_IS_AVAILABLE = "REMOTE_IS_AVAILABLE";


    var updateRemoteSettings = function () {
        return RemoteInstanceUrl.get().$promise
            .then(function (remoteUrl) {
                
                if (remoteUrl.html == "") {
                    return $q.reject(REMOTE_NOT_CONFIGURED);
                }
                return DataStoreService.getKeyValue(remoteSettingsNamespace).then(
                   function (settings) {
                      
                       if (settings[remoteUserProperty]){
                           remoteSettings = {
                               url: remoteUrl.html,
                               api: remoteUrl.html + '/api',
                               loggerAuth: 'Basic ' + btoa(settings[remoteUserProperty].username + ":" + settings[remoteUserProperty].password)
                           }
                        } else {
                           return $q.reject(INVALID_LOGGER_USER);
                       }
                   },
                   function error() {
                       return $q.reject(NO_LOGGER_USER);
                   }
               );
            });
    };
    
    var executeRemoteQuery = function (remoteQuery) {
       
        // Check if apiVersion is defined in remoteQuery (two digits).
        var apiVersion = remoteQuery.apiVersion == undefined ? '/' + defaultAPIVersion :
            /^\d{2}$/.test(remoteQuery.apiVersion) ? '/' + remoteQuery.apiVersion : '';
        
        return init()
            .then(
                function success() {
                    // Choose authorization. Defaults to data authorization
                    var authorization = remoteSettings.loggerAuth;
                       return $http({
                        method: remoteQuery.method,
                        url: remoteSettings.api + apiVersion + '/' + remoteQuery.resource,
                        data: remoteQuery.data,
                        headers: {
                          Authorization: authorization
                        },
                         
                    })
                }
            )
            .catch(handleRemoteErrors);
    };

    function init () {
        if (remoteSettings != undefined){
            return $q.resolve("Setting exits");
        } else {
            return updateRemoteSettings();
        }
    }
    

     /**
     * Check if remote server is available.
     * @returns {*} A promise that successes if remote is available, and fails if not. If failure, it returns a error message.
     */
    var isRemoteServerAvailable = function () {
        return RemoteAvailability.get().$promise
            .then(handleAvailabilityResponse);
    };


function handleAvailabilityResponse (response) {
        if (response.statusCode == 200) {
            return $q.resolve(REMOTE_IS_AVAILABLE);
        }
        else if (response.statusCode == 502 && response.message == "Remote server is not configured") {
            return $q.reject(REMOTE_NOT_CONFIGURED);
        }
        else if (response.statusCode == 502 && response.message == "Network is unreachable") {
            return $q.reject(REMOTE_NOT_AVAILABLE);
        }
        else if (response.statusCode == 401 && response.message == "Authentication failed") {
            return $q.reject(AUTHENTICATION_FAILED);
        }
        else {
            return $q.reject(response.message);
        }
    }

    function handleRemoteErrors (message) {
        var errorString = message;
        if (message === NO_LOGGER_USER) {
            errorString = NO_LOGGER_USER;
        }
        else if (message == INVALID_LOGGER_USER) {
            errorString = INVALID_LOGGER_USER;
        }
        else if (message.status == -1) {
            errorString = NOT_IN_WHITELIST;
        }
        else if (message.status == 401) {
            errorString = LOGGER_USER_NOT_AUTHORIZED;
        }
        return $q.reject(errorString);
    }
    
    return {
        updateRemoteSettings: updateRemoteSettings,
        executeRemoteQuery: executeRemoteQuery,
        isRemoteServerAvailable: isRemoteServerAvailable
    }
}];

module.exports = remoteApiService;