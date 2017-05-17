require('../core/dhis2Api');
require('../services/services.module');

var directivesModule = angular.module('Directives', ['Dhis2Api', 'Services']);

module.exports = directivesModule;