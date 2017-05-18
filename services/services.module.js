require('../core/dhis2Api');

var analyticsService = require('./analytics/AnalyticsService');
var dataImportService = require('./data/DataImportService');
var demographicsService = require('./demographics/DemographicsService');
var dataStoreService = require('./data-store/DataStoreService');
var metadataImportService = require('./metadata/MetadataImportService');
var metadataSyncService = require('./metadata/MetadataSyncService');
var orgunitGroupSetService = require('./orgunits/OrgunitGroupSetService');
var remoteApiService = require('./metadata/RemoteApiService');
var sqlService = require('./sql/SqlService');
var userService = require('./users/UserService');

var servicesModule = angular.module('Services', ['Dhis2Api'])
    .factory('AnalyticsService', analyticsService)
    .factory('DataImportService', dataImportService)
    .factory('DemographicsService', demographicsService)
    .factory('DataStoreService', dataStoreService)
    .factory('MetadataImportService', metadataImportService)
    .factory('MetadataSyncService', metadataSyncService)
    .factory('OrgunitGroupSetService', orgunitGroupSetService)
    .factory('RemoteApiService', remoteApiService)
    .factory('sqlService', sqlService)
    .factory('UserService', userService);

module.exports = servicesModule;