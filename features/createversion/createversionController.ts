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

//import { CommonVariable, MetadataSyncRecord, OrgunitExtended, ProgressStatus, AttributeValue, OrgunitStatus } from '../../model/model';
//import { MetadataSyncService, OrgunitService, ProjectStatusDataStoreService } from '../../services/services.module';

export class CreateVersion {

    static $inject = ['$q', '$http', 'SqlService', 'commonvariable', 'FilterResource']


    monitorDisplayed: boolean = false;
    result = "";
    version1 = "";
    version2 = "";
    swap_versions_id="";
    set_resources_public_to_private_id="";
    versions_id="";
    constructor(
        private $q: ng.IQService,
        private $http,
        private SqlService,
        private commonvariable,
        private FilterResource
    ) {



    }

    async submit_version() {

        var remoteSettings = {
            url: this.commonvariable.url,
            api: this.commonvariable.url,
            loggerAuth: 'Basic ' + btoa('versioner' + ":" + 'Versioner123!')
        }


        /*       
        var req = new XMLHttpRequest();
       req.open('GET', remoteSettings.url, false);
       req.send(null);
       //var headers = req.getAllResponseHeaders().toLowerCase();
       var headers = req.getResponseHeader("Authorization");
       console.log(headers);
       */
        //sqlView1: JrMKelOYGIe
        //sqlView swap: G6tMJtdYoNV


       // http://localhost:8989/dhis/api/sqlViews?paging=false&filter=displayName:eq:swap_versions&fields=id

       await this.FilterResource.get({resource:'sqlViews', filter:'displayName:eq:swap_versions'})
             .$promise.then(data =>{ 
             this.swap_versions_id=data.sqlViews[0].id;
       });
       await this.FilterResource.get({resource:'sqlViews', filter:'displayName:eq:set_resources_public_to_private'})
       .$promise.then(data =>{ 
       this.set_resources_public_to_private_id=data.sqlViews[0].id;
        });
        await this.FilterResource.get({resource:'sqlViews', filter:'displayName:eq:versions'})
        .$promise.then(data =>{ 
        this.versions_id=data.sqlViews[0].id;
         });

    console.log("Swap: "+this.swap_versions_id);

    console.log("set_resources_public_to_private_id: "+this.set_resources_public_to_private_id);
    console.log("versions_id: "+this.versions_id);
        await this.SqlService.executeSqlQuery(this.set_resources_public_to_private_id);
        this.result = "Executed SqlQuery set_resources_public_to_private. Preparing Version\n";


        await this.$http({
            method: "POST",
            url: remoteSettings.api + 'maintenance/cacheClear',

        });

        this.result += "Executed cache clear\n";

        await this.$http({
            method: "POST",
            url: remoteSettings.api + 'metadata/version/create?type=BEST_EFFORT',

            headers: {
                Authorization: remoteSettings.loggerAuth
            },
        });

        await this.SqlService.executeSqlQuery(this.versions_id)
            .then(versions => {
                this.version1 = versions.listGrid.rows[0].toString();
                this.result += "Created " + this.version1 + "  \n";
            });


        await this.$http({
            method: "POST",
            url: remoteSettings.api + 'metadata/version/create?type=BEST_EFFORT',

            headers: {
                Authorization: remoteSettings.loggerAuth
            },
        });


        await this.SqlService.executeSqlQuery(this.versions_id)
            .then(versions => {
                this.version2 = versions.listGrid.rows[0].toString();
                this.result += "Created " + this.version2 + "  \n";
            });




        this.result += "Executed SqlQuery swap_versions \n";
        await this.SqlService.executeSqlQuery(this.swap_versions_id);



    }




}








