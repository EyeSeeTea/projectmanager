
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

var metadataImportService = ['$q', '$http', 'commonvariable', function($q, $http, commonvariable) {

    var compress = false;
    var fileContent;

    var importMetadataFile = function (file) {

        var deferred = $q.defer();

        compress = getExtension(file.name) == "zip";

        var fileReader = new FileReader();
        fileReader.readAsArrayBuffer(file);
        fileReader.onload = function (e) {

            fileContent = e.target.result;

            new JSZip.external.Promise(
                function (resolve, reject) {
                    if (compress) {
                        resolve(JSZip.loadAsync(fileContent).then(function(data){
                            return data.file("metadata.json").async("uint8array");
                        }));
                    } else {
                        resolve(fileContent);
                    }
                })
                .then(function (data) {
                    return $http({
                        method: 'POST',
                        url: commonvariable.url + "metadata",
                        data: new Uint8Array(data),
                        headers: {'Content-Type': 'application/json'},
                        transformRequest: []
                    })
                })
                .then(
                    function (response) {
                        deferred.resolve(response.data);
                    },
                    function (error) {
                        deferred.reject(error);
                    },
                    function (notification) {
                        deferred.notify(notification);
                    }
                )

        };

        return deferred.promise;
    };


    function getExtension (filename) {
        var parts = filename.split('.');
        return parts[parts.length - 1];
    }

    return {
        importMetadataFile: importMetadataFile
    }

}];

module.exports = metadataImportService;