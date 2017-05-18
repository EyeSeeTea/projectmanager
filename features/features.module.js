require('../core/dhis2Api');
require('../services/services.module');

var featuresModule = angular.module('Features', ['Dhis2Api', 'Services']);

module.exports = featuresModule;