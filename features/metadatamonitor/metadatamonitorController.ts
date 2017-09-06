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

import { MetadataSyncRecord, OrgunitExtended, ProgressStatus } from '../../model/model';
import { MetadataSyncService, OrgunitService } from '../../services/services.module';

export class MetadataMonitor {

	static $inject = ['$q', 'DataStoreService', 'MetadataSyncService', 'OrgunitService']

    readonly namespace = "projectServers";

    missionSyncRecords: MissionSyncRecord[];
    monitorDisplayed: boolean = false;
    loadingStatus: ProgressStatus;
    localMetadataVersion: string;

    constructor(
        private $q: ng.IQService,
        private DataStoreService,
        private MetadataSyncService: MetadataSyncService,
        private OrgunitService: OrgunitService
    ){
        this.loadingStatus = ProgressStatus.initialWithoutProgress;
        
        this.$q.all([this.loadLocalMetadataVersion(), this.loadSyncRecords()])
            .then(() => {
                this.monitorDisplayed = true;
                this.loadingStatus = ProgressStatus.hidden;
            });
    }

    private loadSyncRecords() {
        return this.$q.all([this.getSyncRecords(), this.OrgunitService.getMissionsWithProjects()])
            .then( result => {
                const syncRecordMap = result[0];
                const missions = result[1]
                return this.getMissionSyncRecords(missions, syncRecordMap);
            })
            .then( missionSyncRecords => this.missionSyncRecords = missionSyncRecords );
    }

    private getSyncRecords() {
        return this.DataStoreService.getNamespaceKeys(this.namespace)
            .then( keys => {
                const promises = keys.map( key => this.DataStoreService.getNamespaceKeyValue(this.namespace, key) );
                return this.$q.all(promises);
            })
            .then( records => {
                var syncRecordMap = {};
                records.forEach( (record: MetadataSyncRecord) => {
                    syncRecordMap[record.project] = record
                });
                return syncRecordMap;
            });
    }

    private loadLocalMetadataVersion(): ng.IPromise<string> {
        return this.MetadataSyncService.getLocalMetadataVersion().then( version => this.localMetadataVersion = version );
    }

    private getMissionSyncRecords(missions: OrgunitExtended[], syncRecordMap): MissionSyncRecord[] {
        return missions.map( mission => 
            new MissionSyncRecord(
                mission.id,
                mission.name,
                mission.children.map( project => new ProjectSyncRecord(project.id, project.name, syncRecordMap[project.id]) )
            )
        );
    }

}

class ProjectSyncRecord {
    constructor(
        public id: string,
        public name: string,
        public record: MetadataSyncRecord
    ){}
}

class MissionSyncRecord {
    constructor(
        public id: string,
        public name: string,
        public projects: ProjectSyncRecord[]
    ){}
}
