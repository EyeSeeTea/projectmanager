require('../core/dhis2Api');
require('../services/services.module');

var dataImportPreviewDirective = require('./dataimportpreview/dataimportpreviewController');
var datasetEntryFormDirective = require('./dataimportpreview/datasetentryformController');
import { HeaderComponent } from './header/headerController.ts';
import { MenuComponent } from './menu/menuController.ts';
var messagesDirectives = require('./messages/messagesController');
import {progressBarDynamic} from './progressBarDynamic/progressBarDynamicController';
import { ProjectSelectorComponent } from './projectSelector/projectSelectorController';
var treeorganisationunitDirective = require('./treeorganisationunit/organisationUnitTreeController');
var containsDigitDirective = require('./validators/containsDigit');
var containsUppercaseDirective = require('./validators/containsUppercase');
var maxDateDirective = require('./validators/maxDate');

import {dataexportmanualDirective} from  './dataexportmanual/dataexportmanualController';
import {datasyncDirective} from  './datasync/datasyncController';

import {importdatamanualDirective} from  './importdatamanual/importdatamanualController';
import {ImportedDataComponent} from  './importeddata/importeddataController';

import {trackerExportDetailedDirective} from './trackerexportdetailed/trackerExportDetailedController';
import {trackerExportLatestDirective} from './trackerexportlatest/trackerExportLatestController';
var formatPeriodFilter = require('./filters/formatPeriod');
var orderObjectByFilter = require('./filters/orderObjectByFilter');

var directivesModule = angular.module('Directives', ['Dhis2Api', 'Services'])
    .directive('d2Dataimportpreview', dataImportPreviewDirective)
    .directive('d2DatasetEntryForm', datasetEntryFormDirective)
    .component('d2Header', new HeaderComponent())
    .directive('d2Messages', messagesDirectives)
    .directive('d2ProgressbarDynamic', progressBarDynamic)
    .component('d2Secondarymenu', new MenuComponent())
    .directive('d2Treeorganisationunit', treeorganisationunitDirective)
    .directive('containsDigit', containsDigitDirective)
    .directive('containsUppercase', containsUppercaseDirective)
    .directive('maxDate', maxDateDirective)
    .component('projectSelector', new ProjectSelectorComponent())
    .directive('trackerExportDetailed', trackerExportDetailedDirective)
    .directive('trackerExportLatest', trackerExportLatestDirective)
    .directive('aggregateDataExportManual', dataexportmanualDirective)
    .directive('aggregateDataSync', datasyncDirective)
    .directive('importDataManual', importdatamanualDirective)
    .component('importedData', new ImportedDataComponent())
   

    .filter('orderObjectBy', orderObjectByFilter)
    .filter('d2FormatPeriod', formatPeriodFilter);

module.exports = directivesModule;