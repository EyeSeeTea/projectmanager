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

import { DataStoreNames, UserService } from '../services.module'

export class DataStoreService {

    static $inject = ['DataStore', 'DataStoreNames', 'UserService'];

    private namespace = this.DataStoreNames.APP;
    private defaultArrayKey = this.DataStoreNames.DEFAULT_ARRAY_KEY;

    constructor(
        private DataStore,
        private DataStoreNames: DataStoreNames,
        private UserService: UserService
    ){}

    private getUserId(): ng.IPromise<string> {
        return this.UserService.getCurrentUser().then( user => user.id );
    };

    getCurrentUserSettings() {
        return this.getUserId().then( userid => 
            this.DataStore.get({ namespace: this.namespace, key: userid }).$promise
        );
    };

    /**
     *
     * @param module Module name (like "availableData", "resetpasswd",...)
     * @param property With the syntax {"key": "property-name", "value": "property-value"}
     * @returns {*}
     */
    updateCurrentUserSettings(module, property) {
        var userSettings = {};
        return this.getCurrentUserSettings()
            .then( successResult => {
                userSettings = successResult;
                // Update userSettings with new property, without modifying the others
                if (userSettings[module] == undefined)
                    userSettings[module] = {};
                userSettings[module][property.key] = property.value;
                return this.getUserId().then( userid => 
                    this.DataStore.put({ namespace: this.namespace, key: userid }, userSettings)
                );
            },
            error => {
                userSettings[module] = {};
                userSettings[module][property.key] = property.value;
                return this.getUserId().then( userid => 
                    this.DataStore.save({ namespace: this.namespace, key: userid }, userSettings)
                );
            });
    };

    /**
     * Set the value for the key and namespace provided.
     * @param namespace Name of the namespace
     * @param key Name of the key
     * @param value New value
     * @returns {*} 
     */
    setNamespaceKeyValue(namespace, key, value) {
        return this.getNamespaceKeyValue(namespace, key)
            .then( currentValue => {
                if (currentValue != undefined) {
                    return this.DataStore.put({ namespace: namespace, key: key }, value);
                } else {
                    return this.DataStore.save({ namespace: namespace, key: key }, value);
                }
            })
    };

    /**
     * Set the value for the key provided in the default namespace.
     * @param key Name of the key
     * @param value New value
     */
    setKeyValue(key, value) {
        return this.setNamespaceKeyValue(this.namespace, key, value);
    };

    /**
     * Introduces a new value in the array. This methods expects the value of the pair (namespace, key) to be an array.
     * If the value is empty, it creates a new array.
     * @param namespace Name of the namespace
     * @param key Name of the key
     * @param value New value to be pushed into the array
     * @returns {*} Promise with the result of the put/post method
     */
    updateNamespaceKeyArray(namespace, key, value) {
        return this.getNamespaceKeyValue(namespace, key)
            .then( currentValue => {
                if (currentValue != undefined) {
                    currentValue[this.defaultArrayKey].push(value);
                    return this.DataStore.put({ namespace: namespace, key: key }, currentValue);
                } else {
                    currentValue = {};
                    currentValue[this.defaultArrayKey] = [value];
                    return this.DataStore.save({ namespace: namespace, key: key }, currentValue);
                }
            });
    };


    updateNamespaceKeyArraylastPush(namespace, key, lastPushDate) {
        return this.getNamespaceKeyValue(namespace, key)
            .then( currentValue => {
                if (currentValue != undefined) {
                    currentValue['lastPushDateSaved'] = lastPushDate;
                    return this.DataStore.put({ namespace: namespace, key: key }, currentValue)
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
    updateNamespaceKeyArrayPeriod(namespace, key, value) {
        return this.getNamespaceKeyValue(namespace, key)
            .then( currentValue => {
                var push = true;
                if (currentValue != undefined) {
                    for (var dataValue in currentValue[this.defaultArrayKey]) {
                        if (currentValue[this.defaultArrayKey][dataValue].period == value.period && 
                                currentValue[this.defaultArrayKey][dataValue].service == value.service && 
                                currentValue[this.defaultArrayKey][dataValue].dataSet == value.dataSet) {
                           // console.log(currentValue[defaultArrayKey]);
                            push = false;
                            console.log("Actualizado: " + value.period + " del dataset " + value.dataSet + " del Service " + value.service);
                            currentValue[this.defaultArrayKey][dataValue] = value;
                           // console.log(currentValue[defaultArrayKey][dataValue]);
                             return this.DataStore.put({ namespace: namespace, key: key }, currentValue)
                         }
                    }

                    if (push == true) {
                        console.log("Insertado periodo: " + value.period + " del dataset " + value.dataSet + " del Service " + value.service);
                        if (currentValue[this.defaultArrayKey] == undefined){ 
                            currentValue[this.defaultArrayKey] = [value];
                        } else {
                            currentValue[this.defaultArrayKey].push(value);
                        }

                        return this.DataStore.put({ namespace: namespace, key: key }, currentValue)
                    }
                } else {
                    currentValue = {};
                    currentValue[this.defaultArrayKey] = [value];
                    return this.DataStore.save({ namespace: namespace, key: key }, currentValue);
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
    deleteNamespaceKeyValue(namespace, key, value) {
        return this.getNamespaceKeyValue(namespace, key)
            .then( currentValue => {
                if (currentValue != undefined) {

                    //console.log("Period: " + value.period);
                    for (var dataValue in currentValue[this.defaultArrayKey]) {

                        if (currentValue[this.defaultArrayKey][dataValue].period == value.period && 
                                currentValue[this.defaultArrayKey][dataValue].service == value.service && 
                                currentValue[this.defaultArrayKey][dataValue].dataSet == value.dataSet) {
                            console.log(currentValue[this.defaultArrayKey]);
                       
                            console.log("Borrado: " + value.period + " del dataset " + value.dataSet + " del Site " + value.siteName);
                            currentValue[this.defaultArrayKey].splice(dataValue,1);


                            //console.log(currentValue[defaultArrayKey][dataValue]);
                            this.DataStore.put({ namespace: namespace, key: key }, currentValue);
                            return  currentValue[this.defaultArrayKey];    
                         }
                    }
                } 
            });
    };

    /**
     * Get currentValue for the pair (namespace, key)
     * @param namespace Name of the namespace
     * @param key Name of the key
     * @returns {*|g|n} Promise with the value of the pair (namespace, key)
     */
    getNamespaceKeyValue(namespace, key) {
        return this.DataStore.get({ namespace: namespace, key: key }).$promise.then(
            data => data,
            error => undefined
        )
    };


    /**
     * Get currentValue for the pair (namespace, key)
     * @param namespace Name of the namespace
     * @param key Name of the key
     * @returns {*|g|n} Promise with the value of the pair (namespace, key)
     */
    getNamespaceKeys(namespace) {
        var key="";
        return this.DataStore.query({ namespace: namespace, key: key }).$promise.then(
            data => data,
            error =>undefined
        )
    };

    getNamespaceDataSetValidationDate(namespace, key, orgUnit, dataSet) {

        return this.DataStore.get({ namespace: namespace, key: key }).$promise.then(
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
            () => undefined
        )
    };

    getKeyValue(key) {
        return this.getNamespaceKeyValue(this.namespace, key);
    };

}
