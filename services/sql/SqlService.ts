
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

export class SqlService {

    static $inject = ['SqlView', 'SqlViewData'];

    constructor( private SqlView, private SqlViewData ){}

    private createSqlQueryPayload(sqlQuery) {
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

    private createSqlQuery(payload) {
        return this.SqlView.save(payload).$promise.then( data => {
                 return data.response.uid;
        },{});
    };

    private getSqlQueryData(queryId) {
        return this.executeSqlQuery(queryId).then( queryResult => {
            this.SqlView.delete({id:queryId});
            return queryResult;
        })
    };

    /**
     * This method executes an SQL code. To do that, it creates, executes and deletes an auxiliary SQL Query. 
     * It returns a promise that resolves with its result.
     * @param sqlCode SQL code to execute.
     */
    executeSqlCode(sqlCode: string) {
        var payload = this.createSqlQueryPayload(sqlCode);
        return this.createSqlQuery(payload)
            .then( uid => this.getSqlQueryData(uid) )
    }

    /**
     * This methods executes an existing SQL View of type SQL Query and returns a promise that resolves with its result.
     * IMPORTANT: It must be an SQL View of type SQL Query.
     * @param queryId SQLView uid to execute.
     */
    executeSqlQuery(queryId: string) {
        return this.SqlViewData.get({id:queryId}).$promise;
    }

}
