
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

appManagerMSF.factory("RemoteApiService", ['$q', '$base64', '$http', 'DataStoreService', function($q, $base64, $http, DataStoreService) {

    var remoteSettings;
    var defaultAPIVersion = 24;
    
    // Error messages
    var NO_REMOTE_SETTINGS = 'NO REMOTE SETTINGS';
    var INVALID_REMOTE_SETTINGS = 'INVALID REMOTE SETTINGS';

    var updateRemoteSettings = function () {
        return DataStoreService.getKeyValue('remoteSettings').then(
            function (settings) {
                if (settings && settings.url && settings.metadataCredentials && settings.dataCredentials){
                    remoteSettings = {
                        url: settings.url,
                        api: settings.url + '/api',
                        metadataAuth: 'Basic ' + $base64.encode(settings.metadataCredentials.username + ":" + settings.metadataCredentials.password),
                        dataAuth: 'Basic ' + $base64.encode(settings.dataCredentials.username + ":" + settings.dataCredentials.password)
                    }
                } else {
                    return $q.reject(INVALID_REMOTE_SETTINGS);
                }
            },
            function error() {
                return $q.reject(NO_REMOTE_SETTINGS);
            }
        );
    };
    
    var executeRemoteQuery = function (remoteQuery) {
        // Check if apiVersion is defined in remoteQuery (two digits).
        var apiVersion = remoteQuery.apiVersion == undefined ? '/' + defaultAPIVersion :
            /^\d{2}$/.test(remoteQuery.apiVersion) ? '/' + remoteQuery.apiVersion : '';
        
        return init()
            .then(
                function success() {
                    // Choose authorization. Defaults to data authorization
                    var authorization = remoteQuery.authType == 'METADATA' ? remoteSettings.metadataAuth : remoteSettings.dataAuth;
                    return $http({
                        method: remoteQuery.method,
                        url: remoteSettings.api + apiVersion + '/' + remoteQuery.resource,
                        data: remoteQuery.data,
                        headers: {
                            Authorization: authorization
                        }
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
    
    function handleRemoteErrors (message) {
        var errorString = message;
        if (message === NO_REMOTE_SETTINGS) {
            errorString = NO_REMOTE_SETTINGS;
        }
        else if (message == INVALID_REMOTE_SETTINGS) {
            errorString = INVALID_REMOTE_SETTINGS;
        }
        else if (message.status == -1) {
            errorString = 'NOT_IN_WHITELIST';
        }
        else if (message.status == 401) {
            errorString = 'USER_NOT_AUTHORIZED';
        }
        return $q.reject(errorString);
    }
    
    return {
        updateRemoteSettings: updateRemoteSettings,
        executeRemoteQuery: executeRemoteQuery
    }
}]);
