require('../core/dhis2Api');
require('../services/services.module');
require('../directives/directives.module');

var analytics = require('./analytics/analyticsController');
var availableData = require('./availabledata/availabledataController');
var dataExport = require('./dataexport/dataexportController');
var dataImport = require('./dataimport/dataimportController');
var metadataExport = require('./metadataexport/metadataexportController');
var metadataImport = require('./metadataimport/metadataimportController');
var resetPassword = require('./resetpasswd/resetpasswdController');
var trackerDataExport = require('./trackerdataexport/trackerDataExportController');
var trackerDataImport = require('./trackerdataimport/trackerDataImportController');

var featuresModule = angular.module('Features', ['Dhis2Api', 'Directives', 'Services'])
    .controller('analyticsController', analytics)
    .controller('availabledataController', availableData)
    .controller('dataexportController', dataExport)
    .controller('dataimportController', dataImport)
    .controller('metadataexportController', metadataExport)
    .controller('metadataimportController', metadataImport)
    .controller('resetpasswdController', resetPassword)
    .controller('trackerDataExportController', trackerDataExport)
    .controller('trackerDataImportController', trackerDataImport);

module.exports = featuresModule;