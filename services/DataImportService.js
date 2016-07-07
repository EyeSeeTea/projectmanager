
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

appManagerMSF.factory("DataImportService", [function() {

    var formattedData = {}, formattedSummary = {};

    var getFormattedData = function (){

    };

    var getFormattedSummary = function(rawData){
        for(var i = 0, len = rawData.length; i < len; i++){
            var value = {
                dataElementId: rawData[i].dataElement,
                categoryOptionId: rawData[i].categoryOptionCombo,
                value: rawData[i].value
            };
            if(formattedSummary[rawData[i].orgUnit] === undefined ){
                formattedSummary[rawData[i].orgUnit] = {periods:{}};
            }
            if(formattedSummary[rawData[i].orgUnit]['periods'][rawData[i].period] === undefined){
                formattedSummary[rawData[i].orgUnit]['periods'][rawData[i].period] = [];
            }
            formattedSummary[rawData[i].orgUnit]['periods'][rawData[i].period]++;
        }
        return formattedSummary;
    };

    var classifyRawData = function(rawData){

    };

    return {
        getFormattedSummary: getFormattedSummary
    }
}]);