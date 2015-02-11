Dhis2Api.directive('d2Treeorganisationunit', function(){
	return{
		restrict: 'E',
		templateUrl: 'directives/treeorganisationunit/organisationUnitTreeView.html',
		scope: {
		      treetype: '@',
		      size:'@'
		    }
	}
	}); 
Dhis2Api.controller("d2TreeorganisationUnitController", ['$scope','TreeOrganisationunit',"commonvariable", function ($scope,TreeOrganisationunit,commonvariable) {
	$scope.currentid="";
	 TreeOrganisationunit.get({filter:'level:eq:1'})
	 .$promise.then(function(data){
		  $scope.treeOrganisationUnitList = data.organisationUnits;
	 });
	 
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
    	 }
    
     
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
}]);

