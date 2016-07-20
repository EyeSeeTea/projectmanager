
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


appManagerMSF.factory('sqlService',["SqlView", "SqlViewData", function(SqlView, SqlViewData){

    var createPayload = function(sqlQuery) {
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

    var sqlView = function(payload) {
        return SqlView.save(payload).$promise.then( function(data) {
            return data.response.lastImported;
        },{});
    };

    var getSqlViewData = function(queryId) {
        return SqlViewData.get({viewId:queryId}).$promise.then(function(queryResult) {
            SqlView.delete({viewId:queryId});
            return queryResult;
        })
    };

    function executeSqlView(query) {
        var payload = createPayload(query);
        return sqlView(payload)
            .then(getSqlViewData);
    }

    return {
        executeSqlView: executeSqlView
    };

}]);
