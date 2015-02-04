(function (jQuery) {
    //TODO: Improve this script loader and bootstrapper
    var dhis2Root;
    var dhis2CoreScripts = [
//        '/dhis-web-commons/javascripts/jQuery/calendars/jquery.calendars.min.js',
//        '/dhis-web-commons/javascripts/jQuery/calendars/jquery.calendars.plus.min.js',
//        '/dhis-web-commons/javascripts/dhis2/dhis2.util.js',
//        '/dhis-web-commons/javascripts/dhis2/dhis2.period.js',
//        '/dhis-web-commons/javascripts/jQuery/ui/jquery-ui.min.js',
        '/dhis-web-commons/javascripts/dhis2/dhis2.translate.js',
        '/dhis-web-commons/javascripts/dhis2/dhis2.menu.js',
        '/dhis-web-commons/javascripts/dhis2/dhis2.menu.ui.js',
        
    ];
    $.ajaxSetup({
        cache: true
    });
    function loadScript(callBack) {
        var script;
        if (dhis2CoreScripts.length > 0) {
            script = dhis2CoreScripts.shift();
            jQuery.getScript(dhis2Root + script, function () {
                loadScript(callBack);
            });
        } else {
            callBack();
        }
    }
    jQuery.get('manifest.webapp').success(function (manifest) {
        var manifest = JSON.parse(manifest);
        dhis2Root = manifest.activities.dhis.href;
        if (!dhis2Root) {
            console.error('Error trying to get the dhis2 url from the manifest');
        }
        window.dhis2 = window.dhis2 || {};
        dhis2.settings = dhis2.settings || {};
        dhis2.settings.baseUrl = dhis2Root.replace(window.location.origin, '').replace(/^\//, ''); //TODO: Perhaps this regex should go into the menu.js
        //Load all the required scripts and then launch the angular app
        loadScript(function (){
            angular.module('appManagerMSF').factory('AppManifest', function () {
                return manifest;
            });
//            jQuery.get(dhis2Root + '/api/systemSettings.json').success(function (systemSettings) {
//                function configureApp(language) {
//                    angular.module('PEPFAR.approvals').config(function ($provide, d2ApiProvider, $translateProvider) {
//                        $provide.constant('API_ENDPOINT', dhis2Root + '/api');
//                        d2ApiProvider.setBaseUrl(dhis2Root + '/api');
//                        $translateProvider.use(language);
//                        $translateProvider.preferredLanguage(language);
//                    });
//                }
//                angular.module('PEPFAR.approvals').factory('systemSettings', function () {
//                    return systemSettings;
//                });
//                jQuery.ajax({ url: dhis2Root + '/api/userSettings/keyUiLocale/', contentType: 'text/plain', method: 'GET', dataType: 'text' }).success(function (uiLocale) {
//                    configureApp(uiLocale);
//                    angular.bootstrap(document, ['PEPFAR.approvals']);
//                }).fail(function () {
//                    console.warn('Failed to load uiLocale from userSettings: defaulting to english');
//                    configureApp('en');
//                    angular.bootstrap(document, ['PEPFAR.approvals']);
//                });
//            });
        });
        //Load the jquery ui stylesheet for the forms
        jQuery('<link/>', {
            rel: 'stylesheet',
            type: 'text/css',
            //href: dhis2Root + '/dhis-web-commons/javascripts/jQuery/ui/css/redmond/jquery-ui.css'
            href: dhis2Root + '/dhis-web-commons/font-awesome/css/font-awesome.min.css'
        }).appendTo('head');
        jQuery('<link/>', {
            rel: 'stylesheet',
            type: 'text/css',
            href: dhis2Root + '/dhis-web-commons/css/menu.css'
        }).appendTo('head');
    });
})(jQuery);