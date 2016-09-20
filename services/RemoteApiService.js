
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
    
    // Error messages
    var NO_REMOTE_SETTINGS = 'NO REMOTE SETTINGS';
    var INVALID_REMOTE_SETTINGS = 'INVALID REMOTE SETTINGS';

    var updateRemoteSettings = function () {
        return DataStoreService.getKeyValue('remoteSettings').then(
            function (settings) {
                if (settings && settings.url && settings.metadataCredentials && settings.dataCredentials){
                    remoteSettings = {
                        url: settings.url,
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
    
    var exampleFunction = function () {
        return init()
            .then(
                function success() {
                    return $http({
                        method: 'GET',
                        url: remoteSettings.url + '/api/24/dataElements/eqbf2wJJ8ab',
                        headers: {
                            Authorization: remoteSettings.metadataAuth
                        }
                    })
                })
            .then(
                function (success) {
                    console.log(success);
                })
    };

    function init () {
        if (remoteSettings != undefined){
            return $q.resolve("Setting exits");
        } else {
            return updateRemoteSettings();
        }
    }
    
    var handleRemoteErrors = function (message) {
        if (message === NO_REMOTE_SETTINGS) {
            console.log("No remote settings");
        }
        else if (message == INVALID_REMOTE_SETTINGS) {
            console.log("Invalid remote settings");
        }
        else if (message.status == -1) {
            console.log("IP address not in whitelist");
        }
        else if (message.status == 401) {
            console.log("Remote user not authorized");
        }
    };
    
    return {
        updateRemoteSettings: updateRemoteSettings,
        exampleFunction: exampleFunction,
        handleRemoteErrors: handleRemoteErrors
    }
}]);