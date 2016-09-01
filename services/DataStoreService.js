
/*
 Copyright (c) 2015.

 This file is part of Project Manager.

 Project Manager is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Project Manager is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Project Manager.  If not, see <http://www.gnu.org/licenses/>. */

appManagerMSF.factory("DataStoreService", ['DataStore','UserService', function(DataStore, UserService) {

    var namespace = "projectmanager";
    var defaultArrayKey = "values";

    var getUserId = function() {
        return UserService.getCurrentUser().then(function (user) {
            return user.id;
        });
    };

    var getCurrentUserSettings = function() {
        return getUserId().then(function(userid){
            return DataStore.get({namespace: namespace, key: userid}).$promise
        });
    };

    /**
     *
     * @param module Module name (like "availableData", "resetpasswd",...)
     * @param property With the syntax {"key": "property-name", "value": "property-value"}
     * @returns {*}
     */
    var updateCurrentUserSettings = function(module, property){
        var userSettings = {};
        return getCurrentUserSettings()
            .then(function(successResult){
                userSettings = successResult;
                // Update userSettings with new property, without modifying the others
                if(userSettings[module] == undefined)
                    userSettings[module] = {};
                userSettings[module][property.key] = property.value;
                return getUserId().then(function(userid){
                    return DataStore.put({namespace:namespace, key:userid}, userSettings);
                });
            },
            function(){
                userSettings[module] = {};
                userSettings[module][property.key] = property.value;
                return getUserId().then(function(userid){
                    return DataStore.save({namespace:namespace, key:userid}, userSettings);
                });
            });
    };

    /**
     * Introduces a new value in the array. This methods expects the value of the pair (namespace, key) to be an array.
     * If the value is empty, it creates a new array.
     * @param namespace Name of the namespace
     * @param key Name of the key
     * @param value New value to be pushed into the array
     * @returns {*} Promise with the result of the put/post method
     */
    var updateNamespaceKeyArray = function(namespace, key, value){
        return getNamespaceKeyValue(namespace, key)
            .then(function(currentValue){
                currentValue[defaultArrayKey].push(value);
                return DataStore.put({namespace: namespace, key: key}, currentValue);
            },
            function(noData){
                var currentValue = {};
                currentValue[defaultArrayKey] = [value];
                return DataStore.save({namespace: namespace, key: key}, currentValue);
            }
        )
    };

    /**
     * Get currentValue for the pair (namespace, key)
     * @param namespace Name of the namespace
     * @param key Name of the key
     * @returns {*|g|n} Promise with the value of the pair (namespace, key)
     */
    var getNamespaceKeyValue = function(namespace, key){
        return DataStore.get({namespace: namespace, key: key}).$promise;
    };

    return {
        getCurrentUserSettings: getCurrentUserSettings,
        updateCurrentUserSettings: updateCurrentUserSettings,
        getNamespaceKeyValue: getNamespaceKeyValue,
        updateNamespaceKeyArray: updateNamespaceKeyArray
    };

}]);