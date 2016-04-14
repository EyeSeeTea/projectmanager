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