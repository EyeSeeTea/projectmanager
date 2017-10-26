
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

import { CommonVariable } from '../../model/model';

export class MetadataImportService {
    
    static $inject = ['$q', '$http', 'commonvariable'];

    constructor(private $q: ng.IQService, 
                private $http: ng.IHttpService, 
                private commonvariable: CommonVariable) {}

    fileContent;

    importMetadataFile (file) {

        var deferred = this.$q.defer();

        this.readZipFile(file)
            .then( content =>
                content.file("metadata.json").async("uint8array"))
            .then( metadata => 
                this.$http({
                    method: 'POST',
                    url: this.commonvariable.url + "metadata",
                    data: new Uint8Array(metadata),
                    headers: {'Content-Type': 'application/json'},
                    transformRequest: []
                })
            )
            .then(
                response => deferred.resolve(response.data),
                error => deferred.reject(error)
            );

        return deferred.promise;
    };

    private readZipFile (file): Promise<JSZip> {
        return (new JSZip()).loadAsync(file)
    }

}
