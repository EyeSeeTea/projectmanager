
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

var treeorganisationunitDirective =  [function(){
	return{
		restrict: 'E',
		template: require('./organisationUnitTreeView.html'),
		css: require('./organisationUnitTreeCss.css'),
		controller: treeorganisationunitController,
		scope: {
		      treetype: '@',
		      size:'@'
		    }
	}
}]; 

var treeorganisationunitController = ['$scope','$q','TreeOrganisationunit',"commonvariable","UserService", function ($scope,$q,TreeOrganisationunit,commonvariable,UserService) {
	$scope.currentid="";
     $scope.loadingTree=true;
    
    ///query me api for get OU asigned to user
	UserService.getCurrentUser().then(function(data){

        $scope.InitialTree=[];
        $scope.treeOrganisationUnitList=[];
        var kvalue=0;
        var numOU=0;
        angular.forEach(data.organisationUnits, function(value,key){
            kvalue++;
            numOU=data.organisationUnits.length;
            TreeOrganisationunit.get({uid:value.id})
                     .$promise.then(function(data){
                        $scope.treeOrganisationUnitList.push(data);
                        //console.log(kvalue+" , "+numOU)
                        if(kvalue==numOU){
                            $scope.loadingTree=false;
                     }
             });

         });
        //callBackAsync afer finish forecah
      });

    /////

	// TreeOrganisationunit.get({filter:'level:eq:1'})
	// .$promise.then(function(data){
	//	  $scope.treeOrganisationUnitList = data.organisationUnits;
	// });
	 
	$scope.update = function (json, valorOrig, valorDest)		{
    	 var type;
    	 var resultado;
    	 for (var i=0; i<json.length;i++){
    		 type = typeof json[i].children;
    	 		if (type=="undefined"){
    				resultado = true;
    			 	if (json[i].id==valorOrig){
    			 		json[i].children = valorDest;
    			 	}
    			}
    			else{
    				if (json[i].id==valorOrig){
    					json[i].children = valorDest;
    				}
    				resultado = $scope.update(json[i].children, valorOrig, valorDest);
    			}
    		}

    	 return json;
    	 };
    
     
  $scope.$watch(
            function(OrganisationUnit) {
            	   	if($scope.OrganisationUnit.currentNode && $scope.currentid!=$scope.OrganisationUnit.currentNode.id && typeof($scope.OrganisationUnit.currentNode.children)=="undefined"){
            	   		$scope.currentid=$scope.OrganisationUnit.currentNode.id;
						TreeOrganisationunit.get({uid:$scope.OrganisationUnit.currentNode.id})
						.$promise.then(function(data){
							$scope.treeOrganisationUnitList=$scope.update($scope.treeOrganisationUnitList, $scope.OrganisationUnit.currentNode.id,data.children) 									  
						});
					}
   	
           	   	switch($scope.treetype){
            	   	case "single":
            	   		commonvariable.OrganisationUnit=$scope.OrganisationUnit.currentNode;
            	   		break;
            	   	case "multiple":
            	   		commonvariable.OrganisationUnitList=$scope.OrganisationUnit.listNodesSelected;	
            	   		break;
            	   	}
            }
        );
}];

module.exports = treeorganisationunitDirective;