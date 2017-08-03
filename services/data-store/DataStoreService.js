
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

var dataStoreService = ['DataStore', 'UserService', function (DataStore, UserService) {

    var namespace = "HMIS_Management";
    var defaultArrayKey = "values";

    var getUserId = function () {
        return UserService.getCurrentUser().then(function (user) {
            return user.id;
        });
    };

    var getCurrentUserSettings = function () {
        return getUserId().then(function (userid) {
            return DataStore.get({ namespace: namespace, key: userid }).$promise

        });
    };

    /**
     *
     * @param module Module name (like "availableData", "resetpasswd",...)
     * @param property With the syntax {"key": "property-name", "value": "property-value"}
     * @returns {*}
     */
    var updateCurrentUserSettings = function (module, property) {
        var userSettings = {};
        return getCurrentUserSettings()
            .then(function (successResult) {
                userSettings = successResult;
                // Update userSettings with new property, without modifying the others
                if (userSettings[module] == undefined)
                    userSettings[module] = {};
                userSettings[module][property.key] = property.value;
                return getUserId().then(function (userid) {
                    return DataStore.put({ namespace: namespace, key: userid }, userSettings);
                });
            },
            function () {
                userSettings[module] = {};
                userSettings[module][property.key] = property.value;
                return getUserId().then(function (userid) {
                    return DataStore.save({ namespace: namespace, key: userid }, userSettings);
                });
            });
    };

    /**
     * Set the value for the key and namespace provided.
     * @param namespace Name of the namespace
     * @param key Name of the key
     * @param value New value
     * @returns {*} 
     */
    var setNamespaceKeyValue = function (namespace, key, value) {
        return getNamespaceKeyValue(namespace, key)
            .then(function (currentValue) {
                if (currentValue != undefined) {
                    return DataStore.put({ namespace: namespace, key: key }, value);
                } else {
                    return DataStore.save({ namespace: namespace, key: key }, value);
                }
            })
    };

    /**
     * Set the value for the key provided in the default namespace.
     * @param key Name of the key
     * @param value New value
     */
    var setKeyValue = function (key, value) {
        return setNamespaceKeyValue(namespace, key, value);
    };

    /**
     * Introduces a new value in the array. This methods expects the value of the pair (namespace, key) to be an array.
     * If the value is empty, it creates a new array.
     * @param namespace Name of the namespace
     * @param key Name of the key
     * @param value New value to be pushed into the array
     * @returns {*} Promise with the result of the put/post method
     */
    var updateNamespaceKeyArray = function (namespace, key, value) {
        return getNamespaceKeyValue(namespace, key)
            .then(function (currentValue) {
                if (currentValue != undefined) {
                    currentValue[defaultArrayKey].push(value);
                    return DataStore.put({ namespace: namespace, key: key }, currentValue);
                } else {
                    currentValue = {};
                    currentValue[defaultArrayKey] = [value];
                    return DataStore.save({ namespace: namespace, key: key }, currentValue);
                }
            });
    };


    var updateNamespaceKeyArraylastPush = function (namespace, key, lastPushDate) {
        return getNamespaceKeyValue(namespace, key)
            .then(
            currentValue => {
                if (currentValue != undefined) {
                    currentValue['lastPushDateSaved'] = lastPushDate;
                    return DataStore.put({ namespace: namespace, key: key }, currentValue)
                }
            });
    }



    /**
        * Introduces a new value in the array. This methods expects the value of the pair (namespace, key) to be an array.
        * If the value is empty, it creates a new array.
        * @param namespace Name of the namespace
        * @param key Name of the key
        * @param value New value to be pushed into the array
        * @returns {*} Promise with the result of the put/post method
        */
    var updateNamespaceKeyArrayPeriod = function (namespace, key, value) {
        return getNamespaceKeyValue(namespace, key)
            .then(
            currentValue => {
                var push = true;
                if (currentValue != undefined) {

                    console.log("Period: " + value.period);
                    for (var dataValue in currentValue[defaultArrayKey]) {

                        if (currentValue[defaultArrayKey][dataValue].period == value.period && currentValue[defaultArrayKey][dataValue].orgUnit == value.orgUnit && currentValue[defaultArrayKey][dataValue].dataSet == value.dataSet) {
                            console.log(currentValue[defaultArrayKey]);
                            push = false;
                            console.log("Actualizado: " + value.period + " del dataset " + value.dataSet + " del Service " + value.orgUnit);
                            currentValue[defaultArrayKey][dataValue] = value;
                            console.log(currentValue[defaultArrayKey][dataValue]);
                         }
                    }

                    if (push == true) {
                        console.log("Insertado periodo: " + value.period + " del dataset " + value.dataSet + " del Service " + value.orgUnit);
                        if (currentValue[defaultArrayKey]==undefined){ currentValue[defaultArrayKey]=[]; }
                      /*  console.log("insertado antes " );
                        console.log(currentValue[defaultArrayKey]); */
                        currentValue[defaultArrayKey].push(value);
                        /* console.log("insertado despues "); */
                        console.log(currentValue[defaultArrayKey][dataValue]);
                      /*  return DataStore.put({ namespace: namespace, key: key }, currentValue) */


                    }

                    return DataStore.put({ namespace: namespace, key: key }, currentValue)

                } else {
                    currentValue = {};
                    currentValue[defaultArrayKey] = [value];
                    return DataStore.save({ namespace: namespace, key: key }, currentValue);
                }
            });
    };



    /**
     * Get currentValue for the pair (namespace, key)
     * @param namespace Name of the namespace
     * @param key Name of the key
     * @returns {*|g|n} Promise with the value of the pair (namespace, key)
     */
    var getNamespaceKeyValue = function (namespace, key) {
        return DataStore.get({ namespace: namespace, key: key }).$promise.then(
            function (data) { return data; },
            function () { return undefined }
        )
    };




    /**
     * Get currentValue for the pair (namespace, key)
     * @param namespace Name of the namespace
     * @param key Name of the key
     * @returns {*|g|n} Promise with the value of the pair (namespace, key)
     */
    var getNamespaceKeys = function (namespace) {
        var key="";
        return DataStore.query({ namespace: namespace, key: key }).$promise.then(
            function (data) { return data; },
            function () { return undefined }
        )
    };

    var getNamespaceDataSetValidationDate = function (namespace, key, orgUnit, dataSet) {

        return DataStore.get({ namespace: namespace, key: key }).$promise.then(
            data => {
                console.log("Namespace");
                console.log(data);

                for (var value in data.values) {
                    console.log("Value");
                    console.log(value);


                    if (data.values[value].orgUnit == orgUnit && data.values[value].dataSet == dataSet) {

                        return new Date(data.lastValidationDate);
                    }

                }

            },
            () => { return undefined }


        )
    };








    var getKeyValue = function (key) {
        return getNamespaceKeyValue(namespace, key);
    };

    return {
        getCurrentUserSettings: getCurrentUserSettings,
        updateCurrentUserSettings: updateCurrentUserSettings,
        getNamespaceKeyValue: getNamespaceKeyValue,
        setNamespaceKeyValue: setNamespaceKeyValue,
        updateNamespaceKeyArray: updateNamespaceKeyArray,
        updateNamespaceKeyArrayPeriod: updateNamespaceKeyArrayPeriod,
        setKeyValue: setKeyValue,
        getKeyValue: getKeyValue,
        getNamespaceDataSetValidationDate: getNamespaceDataSetValidationDate,
        updateNamespaceKeyArraylastPush: updateNamespaceKeyArraylastPush,
        getNamespaceKeys: getNamespaceKeys
    };

}];

module.exports = dataStoreService;