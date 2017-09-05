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
import { OrgunitService } from '../../services/services.module';

export class MetadataMonitor {

	static $inject = ['$q', 'DataStoreService', 'OrgunitService']

    readonly namespace = "projectServers";

    missionSyncRecords: MissionSyncRecord[];
    monitorDisplayed: boolean = false;
    loadingStatus: ProgressStatus;

    constructor(
        private $q: ng.IQService,
        private DataStoreService,
        private OrgunitService: OrgunitService
    ){
        this.loadingStatus = ProgressStatus.initialWithoutProgress;
        this.getSyncRecords()
            .then( syncRecordMap => {
                this.OrgunitService.getMissionsWithProjects()
                    .then( missions => {
                        this.missionSyncRecords = this.getMissionSyncRecords(missions, syncRecordMap);
                        this.monitorDisplayed = true;
                        this.loadingStatus = ProgressStatus.hidden;
                    }
        )})
    }

    getSyncRecords() {
        return this.DataStoreService.getNamespaceKeys(this.namespace)
            .then( keys => {
                const promises = keys.map( key => this.DataStoreService.getNamespaceKeyValue(this.namespace, key) );
                return this.$q.all(promises);
            }).then( records => {
                var syncRecordMap = {};
                records.forEach( (record: MetadataSyncRecord) => {
                    syncRecordMap[record.project] = record
                });
                return syncRecordMap;
            });
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
