appManagerMSF.filter('to_trusted', ['$sce', function($sce){
        return function(codeHtml) {
            return $sce.trustAsHtml(codeHtml);
        };
    }]);
appManagerMSF.controller('dataapprovalController', ["$scope",'$filter',"commonvariable","DataApprovalsState","DataSetForm", function($scope, $filter,commonvariable,DataApprovalsState,DataSetForm) {
	var $translate = $filter('translate');
    $scope.Clearform=function(){
    	window.location.reload();  	
    }
     $scope.GetValueOfDataSet=function(){
      	var StateForApproval = DataApprovalsState.get({ds:commonvariable.DataSet.id,pe:commonvariable.Period,ou:commonvariable.OrganisationUnit.id});
    	StateForApproval.$promise.then(function(data) {
    		$scope.Approval=data;
 	    	if($scope.Approval.mayReadData){
		    	var datasetValue=DataSetForm.get({ds:commonvariable.DataSet.id,pe:commonvariable.Period,ou:commonvariable.OrganisationUnit.id}); 
		    	datasetValue.$promise.then(function(data) {
		    		var result=data.codeHtml;
		    		$scope.DatasetValue=result.replace('id="shareForm"','id="shareForm" style="display:none" ');    		  		
		    	});
	    	}
	    	if($scope.Approval.mayApprove){
	    		$scope.approve=true; 		
	    	}
	    	$scope.collapsed=true;
    	});
    }
     $scope.PostChangeStatusdapproval=function(){
    	 DataApprovalsState.post({ds:commonvariable.DataSet.id,pe:commonvariable.Period,ou:commonvariable.OrganisationUnit.id});
    	 $scope.GetValueOfDataSet();
     }
     
     $scope.RemoveChangeStatusdapproval=function(){
    	 DataApprovalsState.remove({ds:commonvariable.DataSet.id,pe:commonvariable.Period,ou:commonvariable.OrganisationUnit.id});
    	  $scope.GetValueOfDataSet();
     }
     $scope.verif   
}]);

