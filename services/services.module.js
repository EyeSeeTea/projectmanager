require('../core/dhis2Api');

var analyticsService = require('./analytics/AnalyticsService');
var dataImportService = require('./data/DataImportService');
var demographicsService = require('./demographics/DemographicsService');
var dataStoreService = require('./data-store/DataStoreService');
var userdataStoreService = require('./data-store/userDataStoreService');
var eventExportService = require('./events/EventExportService');
var eventHelper = require('./events/EventHelper');
var eventImportService = require('./events/EventImportService');
var metadataImportService = require('./metadata/MetadataImportService');
var metadataSyncService = require('./metadata/MetadataSyncService');
import {orgunitGroupSetService} from './orgunits/OrgunitGroupSetService';
var programsService = require('./programs/ProgramService');
var remoteApiService = require('./metadata/RemoteApiService');
var sqlService = require('./sql/SqlService');
var userService = require('./users/UserService');

var servicesModule = angular.module('Services', ['Dhis2Api'])
    .factory('AnalyticsService', analyticsService)
    .factory('DataImportService', dataImportService)
    .factory('DemographicsService', demographicsService)
    .factory('DataStoreService', dataStoreService)
    .factory('userDataStoreService', userdataStoreService)
    .factory('EventExportService', eventExportService)
    .factory('EventHelper', eventHelper)
    .factory('EventImportService', eventImportService)
    .factory('MetadataImportService', metadataImportService)
    .factory('MetadataSyncService', metadataSyncService)
    .factory('OrgunitGroupSetService', orgunitGroupSetService)
    .factory('ProgramService', programsService)
    .factory('RemoteApiService', remoteApiService)
    .factory('sqlService', sqlService)
    .factory('UserService', userService);

module.exports = servicesModule;