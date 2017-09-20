require('../core/dhis2Api');
require('../services/services.module');

var dataImportPreviewDirective = require('./dataimportpreview/dataimportpreviewController');
var datasetEntryFormDirective = require('./dataimportpreview/datasetentryformController');
var headerDirective = require('./header/headerController');
var menuDirective = require('./menu/menuController');
var messagesDirectives = require('./messages/messagesController');
import {progressBarDynamic} from './progressBarDynamic/progressBarDynamicController';
var projectSelector = require('./projectSelector/projectSelectorController');
var treeorganisationunitDirective = require('./treeorganisationunit/organisationUnitTreeController');
var containsDigitDirective = require('./validators/containsDigit');
var containsUppercaseDirective = require('./validators/containsUppercase');
var maxDateDirective = require('./validators/maxDate');

import {dataexportmanualDirective} from  './dataexportmanual/dataexportmanualController';
import {datasyncDirective} from  './datasync/datasyncController';

import {importdatamanualDirective} from  './importdatamanual/importdatamanualController';
import {importeddataDirective} from  './importeddata/importeddataController';

import {trackerExportDetailedDirective} from './trackerexportdetailed/trackerExportDetailedController';
import {trackerExportLatestDirective} from './trackerexportlatest/trackerExportLatestController';
var formatPeriodFilter = require('./filters/formatPeriod');
var orderObjectByFilter = require('./filters/orderObjectByFilter');

var directivesModule = angular.module('Directives', ['Dhis2Api', 'Services'])
    .directive('d2Dataimportpreview', dataImportPreviewDirective)
    .directive('d2DatasetEntryForm', datasetEntryFormDirective)
    .directive('d2Header', headerDirective)
    .directive('d2Messages', messagesDirectives)
    .directive('d2ProgressbarDynamic', progressBarDynamic)
    .directive('d2Secondarymenu', menuDirective)
    .directive('d2Treeorganisationunit', treeorganisationunitDirective)
    .directive('containsDigit', containsDigitDirective)
    .directive('containsUppercase', containsUppercaseDirective)
    .directive('maxDate', maxDateDirective)
    .directive('projectSelector', projectSelector)
    .directive('trackerExportDetailed', trackerExportDetailedDirective)
    .directive('trackerExportLatest', trackerExportLatestDirective)
    .directive('aggregateDataExportManual', dataexportmanualDirective)
    .directive('aggregateDataSync', datasyncDirective)
    .directive('importDataManual', importdatamanualDirective)
    .directive('importedData', importeddataDirective)
   

    .filter('orderObjectBy', orderObjectByFilter)
    .filter('d2FormatPeriod', formatPeriodFilter);

module.exports = directivesModule;