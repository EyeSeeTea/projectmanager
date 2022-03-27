import * as angular from 'angular';

require('../core/dhis2Api');

import { AnalyticsService } from './analytics/AnalyticsService';
import { DataImportService } from './data/DataImportService';
import { DemographicsService } from './demographics/DemographicsService';
import { DataStoreNames } from './data-store/DataStoreNames';
import { DataStoreService } from './data-store/DataStoreService';
import { UserDataStoreService } from './data-store/UserDataStoreService';
import { EventExportService } from './events/EventExportService';
import { EventHelper } from './events/EventHelper';
import { EventImportService } from './events/EventImportService';
import { EventService } from './events/EventService';
import { HmisSettingService } from './system/HmisSettingService';
import { MessageService } from './messages/MessageService';
import { MetadataImportService } from './metadata/MetadataImportService';
import { MetadataSyncService } from './metadata/MetadataSyncService';
import { OrgunitGroupSetService } from './orgunits/OrgunitGroupSetService';
import { OrgunitService } from './orgunits/OrgunitService';
import { SystemService } from './system/SystemService';
import { ProgramService } from './programs/ProgramService';
import { ProjectStatusDataStoreService } from './data-store/ProjectStatusDataStoreService';
import { ProjectStatusRemoteDataStoreService } from './data-store/remote/ProjectStatusRemoteDataStoreService';
import { ServerPushDatesDataStoreService } from './data-store/ServerPushDatesDataStoreService';
import { ServerPushDatesRemoteDataStoreService } from './data-store/remote/ServerPushDatesRemoteDataStoreService';
import { RemoteApiService } from './metadata/RemoteApiService';
import { SqlService } from './sql/SqlService';
import { UserService } from './users/UserService';
import { ValidationService } from './Validation/ValidationService';

export const servicesModule = angular.module('Services', ['Dhis2Api'])
    .service('AnalyticsService', AnalyticsService)
    .service('DataImportService', DataImportService)
    .service('DemographicsService', DemographicsService)
    .service('DataStoreNames', DataStoreNames)
    .service('DataStoreService', DataStoreService)
    .service('UserDataStoreService', UserDataStoreService)
    .service('EventExportService', EventExportService)
    .service('EventHelper', EventHelper)
    .service('EventImportService', EventImportService)
    .service('EventService', EventService)
    .service('HmisSettingService', HmisSettingService)
    .service('MessageService', MessageService)
    .service('MetadataImportService', MetadataImportService)
    .service('MetadataSyncService', MetadataSyncService)
    .service('OrgunitGroupSetService', OrgunitGroupSetService)
    .service('OrgunitService', OrgunitService)
    .service('SystemService', SystemService)
    .service('ProgramService', ProgramService)
    .service('ProjectStatusDataStoreService', ProjectStatusDataStoreService)
    .service('ProjectStatusRemoteDataStoreService', ProjectStatusRemoteDataStoreService)
    .service('ServerPushDatesDataStoreService', ServerPushDatesDataStoreService)
    .service('ServerPushDatesRemoteDataStoreService', ServerPushDatesRemoteDataStoreService)
    .service('RemoteApiService', RemoteApiService)
    .service('SqlService', SqlService)
    .service('UserService', UserService)
    .service('ValidationService', ValidationService);

export {
    AnalyticsService,
    DataImportService,
    DataStoreNames,
    DataStoreService,
    DemographicsService,
    EventExportService,
    EventHelper,
    EventImportService,
    EventService,
    HmisSettingService,
    MessageService,
    MetadataImportService,
    MetadataSyncService,
    OrgunitGroupSetService,
    OrgunitService,
    ProgramService,
    ProjectStatusDataStoreService,
    ProjectStatusRemoteDataStoreService,
    ServerPushDatesDataStoreService,
    ServerPushDatesRemoteDataStoreService,
    RemoteApiService,
    SqlService,
    SystemService,
    UserDataStoreService,
    UserService,
    ValidationService
}