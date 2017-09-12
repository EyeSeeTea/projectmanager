
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

import { DataStoreNames, RemoteApiService } from '../../services.module';

export abstract class AbstractRemoteDataStoreService {

    protected abstract namespace: string;

    static $inject = ['RemoteApiService', 'DataStoreNames'];

    constructor(
        protected RemoteApiService: RemoteApiService,
        protected DataStoreNames: DataStoreNames
    ){}

    setKeyValue(key, value) {
        return this.RemoteApiService.executeRemoteQuery({
                    method: 'PUT',
                    resource: 'dataStore/' + this.namespace + '/' + key,
                    data: value
                }).then(
                    success => success,
                    error => this.RemoteApiService.executeRemoteQuery({
                            method: 'POST',
                            resource: 'dataStore/' + this.namespace + '/' + key,
                            data: value
                        })
                );
    }
}