require('../core/dhis2Api');
require('../services/services.module');
require('../directives/directives.module');


import {Analytics} from './analytics/analyticsController';
import {AvailableData} from './availabledata/availabledataController';
import {dataExport} from './dataexport/dataexportController';
import {dataimport} from './dataimport/dataimportController';
import {ImportedDataController} from './validation/importeddataController';
var metadataExport = require('./metadataexport/metadataexportController');
import {MetadataImport} from './metadataimport/metadataimportController';
import {MetadataMonitor} from './metadatamonitor/metadatamonitorController';
import {ResetPassword} from './resetpasswd/resetpasswdController';
import {TrackerDataExport} from './trackerdataexport/trackerDataExportController';
import {TrackerDataImport} from './trackerdataimport/trackerDataImportController';

var featuresModule = angular.module('Features', ['Dhis2Api', 'Directives', 'Services'])
    .controller('analyticsController', Analytics)
    .controller('availabledataController', AvailableData)
    .controller('dataexportController', dataExport)
    .controller('dataimportController', dataimport)
    .controller('importeddataController', ImportedDataController)
    .controller('metadataexportController', metadataExport)
    .controller('metadataimportController', MetadataImport)
    .controller('metadatamonitorController', MetadataMonitor)
    .controller('resetpasswdController', ResetPassword)
    .controller('trackerDataExportController', TrackerDataExport)
    .controller('trackerDataImportController', TrackerDataImport);

module.exports = featuresModule;