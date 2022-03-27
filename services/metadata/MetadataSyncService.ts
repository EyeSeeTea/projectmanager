
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

import { MetadataSyncRecord, MetadataVersion } from '../../model/model';
import { ProjectStatusRemoteDataStoreService, RemoteApiService, UserService } from '../../services/services.module';

export class MetadataSyncService {

    static $inject = ['$q', 'RemoteApiService', 'MetadataVersion', 'MetadataSync', 'UserService', 'ProjectStatusRemoteDataStoreService'];

    constructor(
        private $q: ng.IQService,
        private RemoteApiService: RemoteApiService,
        private MetadataVersion,
        private MetadataSync,
        private UserService: UserService,
        private ProjectStatusRemoteDataStoreService: ProjectStatusRemoteDataStoreService
    ){}

    // Error messages
    private VERSION_CORRUPTED = "VERSION_CORRUPTED";

    private remoteMetadataVersion;
    private localMetadataVersion;
    private versionDiff: MetadataVersion[];

    /**
     * Execute a metadata sync using an auxiliary user to control how many updates are remaining. It uses metadata
     * history order.
     * @returns {*} It return a promise that notifies about the progress of the process.
     */
    executeMetadataSyncDiff () {
        return this.getVersionDifference()
            .then((diff) => this.metadataSyncDiffRecursive(diff))
            .then(() => this.updateVersionDiff());
    }

    private metadataSyncDiffRecursive(versionArray) {
        if (versionArray.length == 0) {
            return this.$q.resolve("No version diff");
        }

        var deferred = this.$q.defer();

        versionArray.reduce( (previousPromise, version, index) => {
            return previousPromise.then( result => {
                return this.metadataSync(version.name)
                    .then((currentVersion) => this.writeRegisterInRemoteServer(currentVersion))
                    .then((currentVersion) => {
                        deferred.notify({
                            currentVersion: currentVersion,
                            progress: {
                                updated: index + 1,
                                total: versionArray.length
                            }
                        });
                        if (index + 1 === versionArray.length) deferred.resolve("Done");
                    })
                    .catch(error => {
                        deferred.reject(error);
                        // Return a promises that resolves to null to stop chaining 
                        // http://blog.zeit.io/stop-a-promise-chain-without-using-reject-with-angular-s-q/
                        return this.$q( () => null );
                    });
            })
        }, this.$q.resolve("Start"));

        return deferred.promise;
    }

    private metadataSync (versionName) {
        return this.MetadataSync.get({versionName: versionName}).$promise
            .catch(response => this.evaluateIfBestEffort(response.data))
            .then(() => this.updateLocalMetadataVersion());
    }

    /**
     * This method is used to interpretate as correct the rejection thrown by the API when there is a warning in BEST_EFFORT strategy.
     * It is risky because it could hide other errors, but it is the only way to go on.
     * @param log 
     */
    private evaluateIfBestEffort (log: SyncLog): ng.IPromise<string> {
        try {
            if (log.response.importReport.status == "WARNING" &&
                    log.response.metadataVersion.type == "BEST_EFFORT") {
                console.log(`${log.response.metadataVersion.displayName}: Skipping warning with BEST_EFFORT strategy`);
                return this.$q.resolve("Warning with BEST_EFFORT is acceptable.")
            } else {
                return this.$q.reject("Error when synch'ing metadata version")
            }
        } catch (error) {
            console.log("Rejecting because of unhandled exception");
            return this.$q.reject("Unexpected error when synch'ing metadata version.");
        }
    }

    private writeRegisterInRemoteServer (currentVersion) {
        // Try PUT first. If failure, try POST to create a new entry in the namespace.
        return this.UserService.getCurrentUser()
            .then( user => {
                var orgunitid = user.organisationUnits[0].id;
                var register = new MetadataSyncRecord(orgunitid, currentVersion, new Date());
                return this.ProjectStatusRemoteDataStoreService.setKeyValue(orgunitid, register)
            })
            .then( success => currentVersion );
    }

    /**
     * Execute a metadata sync incrementally until no more versions are available. It does not rely on version date, but
     * version numbers. It does not require an auxiliary user, but it cannot know how many updates are remaining.
     * @returns {Promise} It returns a promise that notifies about the last successful update.
     */
    executeMetadataSync() {
        var deferred = this.$q.defer();

        this.metadataSyncRecursive(deferred)
            .catch(error => this.handleSyncVersionError(error))
            .then( () => {
                deferred.resolve("Done");
            },
            error => {
                deferred.reject("Error");
            });

        return deferred.promise;
    }
    
    private metadataSyncRecursive(deferCtrl) {
        deferCtrl.notify({currentVersion: this.localMetadataVersion});
        return this.metadataSyncNextVersion()
            .then(() => this.metadataSyncRecursive(deferCtrl));
    }

    private metadataSyncNextVersion() {
        var nextVersion = this.getNextVersion(this.localMetadataVersion);

        return this.MetadataSync.get({versionName: nextVersion}).$promise
            .then(() => this.updateLocalMetadataVersion());
    }

    private getNextVersion(currentVersion): string {
        var currentTokens = currentVersion.split('_');
        return currentTokens[0] + "_" + (parseInt(currentTokens[1]) + 1);
    }


    /**
     * Get remote version. It requires an auxiliary user to be configured (RemoteApiService).
     * @returns {*} Returns a promise that resolves to metadata version of remote server.
     */
    getRemoteMetadataVersion(): ng.IPromise<string> {
        if (this.remoteMetadataVersion) {
            return this.$q.resolve(this.remoteMetadataVersion);
        } else {
            return this.RemoteApiService.getMetadataVersion()
                .then( version => {
                        this.remoteMetadataVersion = version.data.name;
                        return this.remoteMetadataVersion;
                    },
                    error => this.handleGetRemoteVersionError(error)
                )
        }
    }

    /**
     * Get local metadata version.
     * @returns {*} A promise that resolves to metadata version of local server.
     */
    getLocalMetadataVersion(): ng.IPromise<string> {
        return this.$q( resolve => {
            resolve(this.localMetadataVersion ? this.localMetadataVersion : this.updateLocalMetadataVersion());
        })
            .catch(error => this.handleGetLocalVersionError(error));
    }

    /**
     * Check if remote server is available.
     * @returns {*} A promise that successes if remote is available, and fails if not. If failure, it returns a error message.
     */
    isRemoteServerAvailable() {
        return this.RemoteApiService.isRemoteServerAvailable();
    }

    /**
     * Get the difference between local and remote server.
     * @returns {*} An array with the version objects that are different.
     */
    getVersionDifference() {
        return this.$q( resolve => resolve(this.versionDiff ? this.versionDiff : this.updateVersionDiff()))
    }

    //////////////////////////////
    // Private update functions //
    //////////////////////////////

    private updateVersionDiff(): ng.IPromise<MetadataVersion[]> {
        return this.getLocalMetadataVersion()
            .then( localVersion  => this.RemoteApiService.getMetadataVersionDiff(localVersion) )
            .then( result => {
                this.versionDiff = result.data == "" ? [] : result.data.metadataversions;
               // console.log("versiones");
               // console.log(this.versionDiff);
                //ordenar metadataVersions
                return this.versionDiff;
            });
    }

    private updateLocalMetadataVersion(): ng.IPromise<string> {
        return this.MetadataVersion.get().$promise
            .then( (version: MetadataVersion) => {
                    this.localMetadataVersion = version.name;
                    return this.localMetadataVersion;
                }
            )
    }

    ////////////////////
    // Error handlers //
    ////////////////////

    private handleGetLocalVersionError(error) {
        var message = error;
        if (error.status == 500) {
            message = 'NO_LOCAL_METADATA_VERSION';
        }
        return this.$q.reject(message);
    }

    private handleGetRemoteVersionError(error) {
        var message = error;
        if (error.status == 500) {
            message = 'NO_REMOTE_METADATA_VERSION';
        }
        return this.$q.reject(message);
    }
    
    private handleSyncVersionError(error) {
        // Bad request. Next version does not exist. Sync done.
        if (error.status == 400) {
            return this.$q.resolve("Done");
        }
        else if (error.httpStatusCode == 500 && error.message == "Exception occurred while doing metadata sync: Metadata snapshot is corrupted. Not saving it locally") {
            return this.$q.reject(this.VERSION_CORRUPTED);
        }
        return this.$q.reject("Error")
    }
    
}

class SyncLog {
    constructor(
        public httpStatus: string,
        public httpStatusCode: string,
        public status: string,
        public response: SyncResponse
    ){}
}

class SyncResponse {
    constructor(
        public importReport: {status: string},
        public metadataVersion: {type: string, displayName: string}
    ){}
}