
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

import { DataStoreNames, UserService } from '../services.module';

export class UserDataStoreService {

    static $inject = ['userDataStore', 'UserService', 'DataStoreNames'];

    constructor(
        private userDataStore,
        private UserService: UserService,
        private DataStoreNames: DataStoreNames
    ){}

    readonly namespace = this.DataStoreNames.AVAILABLE_DATA;
    readonly defaultArrayKey = this.DataStoreNames.DEFAULT_ARRAY_KEY;

    
    getUserId() {
        return this.UserService.getCurrentUser().then(user => user.id);
    }
    

    getCurrentUserSettings() {
        return this.userDataStore.get({namespace: this.namespace}).$promise;
    }

    /**
     *
     * @param module Module name (like "availableData", "resetpasswd",...)
     * @param property With the syntax {"key": "property-name", "value": "property-value"}
     * @returns {*}
     */
    updateCurrentUserSettings(module, property) {
        var userSettings = {};
        return this.getCurrentUserSettings()
            .then(successResult => {
                userSettings = successResult;
                // Update userSettings with new property, without modifying the others
                if(userSettings[module] == undefined)
                    userSettings[module] = {};
                userSettings[module][property.key] = property.value;
                
                return this.userDataStore.put({namespace:this.namespace}, userSettings);
            },
            error => {
                userSettings[module] = {};
                userSettings[module][property.key] = property.value;

                return this.userDataStore.save({namespace:this.namespace}, userSettings);
            });
    }

    /**
     * Set the value for the key and namespace provided.
     * @param namespace Name of the namespace
     * @param key Name of the key
     * @param value New value
     * @returns {*} 
     */
    setNamespaceKeyValue(namespace, key, value) {
        return this.getNamespaceKeyValue(namespace, key)
            .then(currentValue => {
                if (currentValue != undefined) {
                    return this.userDataStore.put({namespace: namespace, key: key}, value);
                } else {
                    return this.userDataStore.save({namespace: namespace, key: key}, value);
                }
            })
    }

    /**
     * Set the value for the key provided in the default namespace.
     * @param key Name of the key
     * @param value New value
     */
    setKeyValue(key, value) {
        return this.setNamespaceKeyValue(this.namespace, key, value);
    }

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
                    return this.userDataStore.put({namespace: namespace, key: key}, currentValue);
                } else {
                    currentValue = {};
                    currentValue[this.defaultArrayKey] = [value];
                    return this.userDataStore.save({namespace: namespace, key: key}, currentValue);
                }
            });
    }

    /**
     * Get currentValue for the pair (namespace, key)
     * @param namespace Name of the namespace
     * @param key Name of the key
     * @returns {*|g|n} Promise with the value of the pair (namespace, key)
     */
    getNamespaceKeyValue(namespace, key){
        return this.userDataStore.get({namespace: namespace, key: key}).$promise.then(
            data => data,
            error => undefined
        )
    }
    
    getKeyValue(key) {
        return this.getNamespaceKeyValue(this.namespace, key);
    };

}