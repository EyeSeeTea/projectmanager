
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
    var versionDiff;

    /**
     * Execute a metadata sync using the an auxiliary user to control how many updates are remaining. It uses metadata
     * history order.
     * @returns {*} It return a promise that notifies about the progress of the process.
     */
    var executeMetadataSyncDiff = function () {
        return getVersionDifference()
            .then(metadataSyncDiffRecursive)
            .then(updateVersionDiff);
    };

    function metadataSyncDiffRecursive (versionArray) {
        var deferred = $q.defer();

        versionArray.reduce(function (previousPromise, version, index) {
            return previousPromise.then(function (result) {
                return metadataSync(version.name)
                    .then(function (currentVersion) {
                        deferred.notify({
                            currentVersion: currentVersion,
                            progress: {
                                updated: index + 1,
                                total: versionArray.length
                            }
                        });
                        if (index + 1 === versionArray.length) deferred.resolve("Done");
                    }, function (error) {
                        deferred.reject(error);
                    });
            })
        }, $q.resolve("Start"));

        return deferred.promise;
    }

    function metadataSync (versionName) {
        return MetadataSync.get({versionName: versionName}).$promise
            .then(updateLocalMetadataVersion);
    }

    /**
     * Execute a metadata sync incrementally until no more versions are available. It does not rely on version date, but
     * version numbers. It does not require an auxiliary user, but it cannot know how many updates are remaining.
     * @returns {Promise} It returns a promise that notifies about the last successful update.
     */
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


    /**
     * Get remote version. It requires an auxiliary user to be configured (RemoteApiService).
     * @returns {*} Returns a promise that resolves to metadata version of remote server.
     */
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
                    handleGetRemoteVersionError
                )
        }
    };

    /**
     * Get local metadata version.
     * @returns {*} A promise that resolves to metadata version of local server.
     */
    var getLocalMetadataVersion = function () {
        return $q(function (resolve) {
            resolve(localMetadataVersion ? localMetadataVersion : updateLocalMetadataVersion());
        })
            .catch(handleGetLocalVersionError);
    };

    /**
     * Check if remote server is available.
     * @returns {*} A promise that successes if remote is available, and fails if not. If failure, it returns a error message.
     */
    var isRemoteServerAvailable = function () {
        return RemoteAvailability.get().$promise
            .then(handleAvailabilityResponse);
    };

    /**
     * Get the difference between local and remote server.
     * @returns {*} An array with the version objects that are different.
     */
    var getVersionDifference = function () {
        return $q(function (resolve) {
            resolve(versionDiff ? versionDiff : updateVersionDiff());
        });
    };

    //////////////////////////////
    // Private update functions //
    //////////////////////////////

    function updateVersionDiff () {
        return getLocalMetadataVersion()
            .then(function (localVersion) {
                return RemoteApiService.executeRemoteQuery({
                    method: 'GET',
                    resource: 'metadata/version/history?baseline=' + localVersion,
                    authType: 'METADATA',
                    apiVersion: ''
                })
            })
            .then(function (result) {
                versionDiff = result.data == "" ? [] : result.data.metadataversions;
                return versionDiff;
            });

    }

    function  updateLocalMetadataVersion () {
        return MetadataVersion.get().$promise
            .then(
                function (version) {
                    localMetadataVersion = version.name;
                    return localMetadataVersion;
                }
            )
    }

    ////////////////////
    // Error handlers //
    ////////////////////

    function handleGetLocalVersionError (error) {
        var message = error;
        if (error.status == 500) {
            message = 'NO_LOCAL_METADATA_VERSION';
        }
        return $q.reject(message);
    }

    function handleGetRemoteVersionError (error) {
        var message = error;
        if (error.status == 500) {
            message = 'NO_REMOTE_METADATA_VERSION';
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
        executeMetadataSyncDiff: executeMetadataSyncDiff,
        getRemoteMetadataVersion: getRemoteMetadataVersion,
        getLocalMetadataVersion: getLocalMetadataVersion,
        getVersionDifference: getVersionDifference,
        isRemoteServerAvailable: isRemoteServerAvailable
    }
}]);