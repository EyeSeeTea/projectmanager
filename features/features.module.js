require('../core/dhis2Api');
require('../services/services.module');
require('../directives/directives.module');

var featuresModule = angular.module('Features', ['Dhis2Api', 'Directives', 'Services']);

module.exports = featuresModule;