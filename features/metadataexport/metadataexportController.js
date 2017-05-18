
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

appManagerMSF.controller('metadataexportController', ["$scope",'$filter', "MetaDataExport","MetaDataExportZip", function($scope, $filter, MetaDataExport,MetaDataExportZip) {
	var $translate = $filter('translate');
	
	$scope.progressbarDisplayed = false;
	
	$scope.submit=function(){
		//Show progress bar 
		$scope.progressbarDisplayed = true;
		var result = MetaDataExport.get();
		//include current date in the file name, Helder
		var today = new Date();
		var dd = (today.getDate()<10?'0'+today.getDate():today.getDate());
		var mm = (today.getMonth()<9?'0'+(today.getMonth()+1):today.getMonth());
		var yyyy = today.getFullYear();

		//////
		var fileName = this.file_name+"_"+yyyy+mm+dd;
		result.$promise.then(function(data) {
			//Hide progress bar
			$scope.progressbarDisplayed = false;
			
			if($scope.zipped){
				var zip = new JSZip();
				zip.file(fileName + '.json', JSON.stringify(data));
				var content = zip.generate({type:"blob", compression:"DEFLATE"});
				saveAs(content, fileName + '.json.zip');
			}
			else{
				var file = new Blob([JSON.stringify(data)], { type: 'application/json' });												
				saveAs(file, fileName + '.json');
			}
    	});
	};
		
}]);