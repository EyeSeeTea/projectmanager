import * as angular from 'angular';

require('../core/dhis2Api');

import { AnalyticsService } from './analytics/AnalyticsService';
import { DataImportService } from './data/DataImportService';
var demographicsService = require('./demographics/DemographicsService');
import { DataStoreNames } from './data-store/DataStoreNames';
import { DataStoreService } from './data-store/DataStoreService';
import { UserDataStoreService } from './data-store/UserDataStoreService';
import { EventExportService } from './events/EventExportService';
import { EventHelper } from './events/EventHelper';
import { EventImportService } from './events/EventImportService';
import { MessageService } from './messages/MessageService';
var metadataImportService = require('./metadata/MetadataImportService');
import { MetadataSyncService } from './metadata/MetadataSyncService';
import { OrgunitGroupSetService } from './orgunits/OrgunitGroupSetService';
import { OrgunitService } from './orgunits/OrgunitService';
import { SystemService } from './system/SystemService';
import { ProgramService } from './programs/ProgramService';
import { ProjectStatusDataStoreService } from './data-store/ProjectStatusDataStoreService';
import { ProjectStatusRemoteDataStoreService } from './data-store/remote/ProjectStatusRemoteDataStoreService';
import { RemoteApiService } from './metadata/RemoteApiService';
var sqlService = require('./sql/SqlService');
import { UserService } from './users/UserService';

export const servicesModule = angular.module('Services', ['Dhis2Api'])
    .service('AnalyticsService', AnalyticsService)
    .service('DataImportService', DataImportService)
    .factory('DemographicsService', demographicsService)
    .service('DataStoreNames', DataStoreNames)
    .service('DataStoreService', DataStoreService)
    .service('UserDataStoreService', UserDataStoreService)
    .service('EventExportService', EventExportService)
    .service('EventHelper', EventHelper)
    .service('EventImportService', EventImportService)
    .service('MessageService', MessageService)
    .factory('MetadataImportService', metadataImportService)
    .service('MetadataSyncService', MetadataSyncService)
    .service('OrgunitGroupSetService', OrgunitGroupSetService)
    .service('OrgunitService', OrgunitService)
    .service('SystemService', SystemService)
    .service('ProgramService', ProgramService)
    .service('ProjectStatusDataStoreService', ProjectStatusDataStoreService)
    .service('ProjectStatusRemoteDataStoreService', ProjectStatusRemoteDataStoreService)
    .service('RemoteApiService', RemoteApiService)
    .factory('sqlService', sqlService)
    .service('UserService', UserService);

export {
    AnalyticsService,
    DataImportService,
    DataStoreNames,
    DataStoreService,
    EventExportService,
    EventHelper,
    EventImportService,
    MessageService,
    MetadataSyncService,
    OrgunitGroupSetService,
    OrgunitService,
    ProgramService,
    ProjectStatusDataStoreService,
    ProjectStatusRemoteDataStoreService,
    RemoteApiService,
    SystemService,
    UserDataStoreService,
    UserService
}