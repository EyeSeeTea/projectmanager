
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

import { AbstractDataStoreService } from './AbstractDataStoreService';

export class ServerPushDatesDataStoreService extends AbstractDataStoreService {

    protected namespace = this.DataStoreNames.SERVER_PUSH_DATES;

    private defaultArrayKey = this.DataStoreNames.DEFAULT_ARRAY_KEY;    

    /**
    * Introduces a new value in the array. This methods expects the value of the pair (namespace, key) to be an array.
    * If the value is empty, it creates a new array.
    * @param namespace Name of the namespace
    * @param key Name of the key
    * @param value New value to be pushed into the array
    * @returns {*} Promise with the result of the put/post method
    */
    deleteNamespaceKeyValue(key, value) {
        return this.getKeyValue(key)
            .then( currentValue => {
                if (currentValue != undefined) {

                    //console.log("Period: " + value.period);
                    for (var dataValue in currentValue[this.defaultArrayKey]) {

                        if (currentValue[this.defaultArrayKey][dataValue].period == value.period && 
                                currentValue[this.defaultArrayKey][dataValue].service == value.service && 
                                currentValue[this.defaultArrayKey][dataValue].dataSet == value.dataSet) {
                            //console.log(currentValue[this.defaultArrayKey]);
                        
                            console.log("Borrado: " + value.period + " del dataset " + value.dataSet + " del Site " + value.siteName);
                            currentValue[this.defaultArrayKey].splice(dataValue,1);

                            this.setKeyValue(key, currentValue);
                            return  currentValue[this.defaultArrayKey];    
                            }
                    }
                } 
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
    updateNamespaceKeyArrayPeriod(key, value) {
        return this.getKeyValue(key)
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
                                return this.DataStore.put({ namespace: this.namespace, key: key }, currentValue)
                            }
                    }

                    if (push == true) {
                        console.log("Insertado periodo: " + value.period + " del dataset " + value.dataSet + " del Service " + value.service);
                        if (currentValue[this.defaultArrayKey] == undefined){ 
                            currentValue[this.defaultArrayKey] = [value];
                        } else {
                            currentValue[this.defaultArrayKey].push(value);
                        }

                        return this.DataStore.put({ namespace: this.namespace, key: key }, currentValue)
                    }
                } else {
                    currentValue = {};
                    currentValue[this.defaultArrayKey] = [value];
                    return this.DataStore.save({ namespace: this.namespace, key: key }, currentValue);
                }
            });
    }

    updateNamespaceKeyArraylastPush(key, lastPushDate) {
        return this.getKeyValue(key)
            .then( currentValue => {
                if (currentValue != undefined) {
                    currentValue['lastPushDateSaved'] = lastPushDate;
                    return this.setKeyValue(key , currentValue);
                }
            });
    }
    

}