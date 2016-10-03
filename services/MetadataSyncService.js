
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

appManagerMSF.factory("MetadataSyncService", ['$q', 'RemoteApiService', 'MetadataVersion', 'MetadataSync', 'RemoteAvailability', function($q, RemoteApiService, MetadataVersion, MetadataSync, RemoteAvailability) {

    // Error messages
    var REMOTE_NOT_AVAILABLE = "REMOTE_NOT_AVAILABLE";
    var REMOTE_NOT_CONFIGURED = "REMOTE_NOT_CONFIGURED";
    var AUTHENTICATION_FAILED = "AUTHENTICATION_FAILED";
    var REMOTE_IS_AVAILABLE = "REMOTE_IS_AVAILABLE";

    var remoteMetadataVersion;
    var localMetadataVersion;

    var executeMetadataSync = function () {
        var deferred = $q.defer();

        metadataSyncRecursive(deferred)
            .catch(handleSyncVersionError)
            .then(function () {
                deferred.resolve("Done");
            },
            function () {
                deferred.reject("Error");
            });

        return deferred.promise;
    };
    
    function metadataSyncRecursive (deferCtrl) {
        deferCtrl.notify({currentVersion: localMetadataVersion});
        return metadataSyncNextVersion()
            .then(metadataSyncRecursive.bind(null, deferCtrl));
    }

    function metadataSyncNextVersion () {
        var nextVersion = getNextVersion(localMetadataVersion);

        return MetadataSync.get({versionName: nextVersion}).$promise
            .then(updateLocalMetadataVersion);
    }

    function getNextVersion (currentVersion) {
        var currentTokens = currentVersion.split('_');
        return currentTokens[0] + "_" + (parseInt(currentTokens[1]) + 1);
    }


    var getRemoteMetadataVersion = function () {
        if (remoteMetadataVersion) {
            return $q.resolve(remoteMetadataVersion);
        } else {
            return RemoteApiService.executeRemoteQuery({
                method: 'GET',
                resource: 'metadata/version',
                authType: 'METADATA',
                apiVersion: ''
            })
                .then(
                    function (version) {
                        remoteMetadataVersion = version.data.name;
                        return remoteMetadataVersion;
                    },
                    handleGetVersionError
                )
        }
    };

    var getLocalMetadataVersion = function () {
        return $q(function (resolve) {
            resolve(localMetadataVersion ? localMetadataVersion : updateLocalMetadataVersion());
        })
            .catch(handleGetVersionError);
    };

    var isRemoteServerAvailable = function () {
        return RemoteAvailability.get().$promise
            .then(handleAvailabilityResponse);
    };

    function  updateLocalMetadataVersion () {
        return MetadataVersion.get().$promise
            .then(
                function (version) {
                    localMetadataVersion = version.name;
                    return localMetadataVersion;
                }
            )
    }

    function handleGetVersionError (error) {
        var message = error;
        if (error.status == 500) {
            message = 'NO_METADATA_VERSION';
        }
        return $q.reject(message);
    }
    
    function handleSyncVersionError (error) {
        // Bad request. Next version does not exist. Sync done.
        if (error.status == 400) {
            return $q.resolve("Done");
        }
        return $q.reject("Error")
    }

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
    
    return {
        executeMetadataSync: executeMetadataSync,
        getRemoteMetadataVersion: getRemoteMetadataVersion,
        getLocalMetadataVersion: getLocalMetadataVersion,
        isRemoteServerAvailable: isRemoteServerAvailable
    }
}]);