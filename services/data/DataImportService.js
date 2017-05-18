
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
var Services = require('../services.module');

Services.factory("DataImportService", [function() {

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

    var getPeriodType = function( periodId ){
        // Daily, like '20160222'
        if( /^\d{8}$/.test( periodId ) ){ return 'Daily';}
        // Weekly, like '2016W12'
        else if( /^\d{4}W\d{1,2}$/.test( periodId ) ){ return 'Weekly';}
        // Monthly, like '201602'
        else if( /^\d{6}$/.test( periodId ) ){ return 'Monthly';}
        // Bi monthly, like '201602B'
        else if( /^\d{6}B$/.test( periodId ) ){ return 'BiMonthly';}
        // Quarterly, like '2016Q2'
        else if( /^\d{4}Q\d$/.test( periodId ) ){ return 'Quarterly';}
        // Six monthly, like '2016S1'
        else if( /^\d{4}S\d$/.test( periodId ) ){ return 'SixMonthly';}
        // Six monthly april, like '2015AprilS2'
        else if( /^\d{4}AprilS\d$/.test( periodId ) ){ return 'SixMonthlyApril';}
        // Yearly, like '2015'
        else if( /^\d{4}$/.test( periodId ) ){ return 'Yearly';}
        // Financial April, like '2015April'
        else if( /^\d{4}April$/.test( periodId ) ){ return 'FinancialApril';}
        // Financial July, like '2015July'
        else if( /^\d{4}July$/.test( periodId ) ){ return 'FinancialJuly';}
        // Financial Oct, like '2014Oct'
        else if( /^\d{4}Oct$/.test( periodId ) ){ return 'FinancialOct';}
        
        else{ return undefined;}
    };

    return {
        getFormattedSummary: getFormattedSummary,
        getPeriodType: getPeriodType
    }
}]);