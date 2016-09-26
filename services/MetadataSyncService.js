
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

appManagerMSF.factory("MetadataSyncService", ['$q', 'RemoteApiService', 'MetadataVersion', 'MetadataSync', function($q, RemoteApiService, MetadataVersion, MetadataSync) {

    var remoteMetadataVersion;
    var localMetadataVersion;

    var executeMetadataSync = function () {
        var deferred = $q.defer();

        metadataSyncRecursive(deferred)
            .catch(handleSyncVersionError)
            .then(function () {
                deferred.resolve("Done");
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
        console.log(error);

        // Bad request. Next version does not exist
        if (error.status == 400) {
            return $q.resolve("Done");
        }
        return $q.reject("Error")
    }
    
    return {
        executeMetadataSync: executeMetadataSync,
        getRemoteMetadataVersion: getRemoteMetadataVersion,
        getLocalMetadataVersion: getLocalMetadataVersion
    }
}]);