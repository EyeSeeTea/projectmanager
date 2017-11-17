
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

export class sqlService {

    static $inject = ['SqlView', 'SqlViewData'];

    constructor( private SqlView, private SqlViewData){}

    private createPayload(sqlQuery) {
        // Generate a random name, based on a random integer.
        // Probability of duplicity: 1 / 100.000
        var name = "query" + Math.floor(Math.random() * 100000);

        return {"name":name,"sqlQuery":sqlQuery,
            "displayName":name,
            "publicAccess":"rw------",
            "type":"QUERY",
            "externalAccess":false,
            "cacheStrategy":"RESPECT_SYSTEM_SETTING",
            "access":{
                "read":true,
                "update":true,
                "externalize":true,
                "delete":true,
                "write":true,
                "manage":true},
            "userGroupAccesses":[]}
    };

    private sqlView(payload) {
        return this.SqlView.save(payload).$promise.then( data => {
                 return data.response.uid;
        },{});
    };

    private getSqlViewData(queryId) {
        return this.SqlViewData.get({id:queryId}).$promise.then( queryResult => {
            this.SqlView.delete({id:queryId});
            return queryResult;
        })
    };

    executeSqlView(query) {
        var payload = this.createPayload(query);
        return this.sqlView(payload)
            .then(uid=>  this.getSqlViewData(uid));
    }

}
