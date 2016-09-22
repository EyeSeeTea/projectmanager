
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

appManagerMSF.factory("MetadataSyncService", ['$q', 'RemoteApiService', 'MetadataVersion', function($q, RemoteApiService, MetadataVersion) {

    var remoteMetadataVersion;
    var localMetadataVersion;

    var executeMetadataSync = function () {
        
    };

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
        if (localMetadataVersion) {
            return $q.resolve(localMetadataVersion);
        } else {
            return MetadataVersion.get().$promise
                .then(
                    function (version) {
                        localMetadataVersion = version.name;
                        return localMetadataVersion;
                    },
                    handleGetVersionError
                )
        }
    };

    function handleGetVersionError (error) {
        var message = error;
        if (error.status == 500) {
            message = 'NO_METADATA_VERSION';
        }
        return $q.reject(message);
    }
    
    return {
        executeMetadataSync: executeMetadataSync,
        getRemoteMetadataVersion: getRemoteMetadataVersion,
        getLocalMetadataVersion: getLocalMetadataVersion
    }
}]);