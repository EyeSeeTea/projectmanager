require('../core/dhis2Api');
require('../services/services.module');

var dataImportPreviewDirective = require('./dataimportpreview/dataimportpreviewController');
var datasetEntryFormDirective = require('./dataimportpreview/datasetentryformController');
var headerDirective = require('./header/headerController');
var menuDirective = require('./menu/menuController');
var messagesDirectives = require('./messages/messagesController');
var formatPeriodFilter = require('./filters/formatPeriod');
var orderObjectByFilter = require('./filters/orderObjectByFilter');

var directivesModule = angular.module('Directives', ['Dhis2Api', 'Services'])
    .directive('d2Dataimportpreview', dataImportPreviewDirective)
    .directive('d2DatasetEntryForm', datasetEntryFormDirective)
    .directive('d2Header', headerDirective)
    .directive('d2Messages', messagesDirectives)
    .directive('d2Secondarymenu', menuDirective)
    .filter('orderObjectBy', orderObjectByFilter)
    .filter('d2FormatPeriod', formatPeriodFilter);

module.exports = directivesModule;