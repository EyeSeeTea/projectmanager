appManagerMSF.filter('to_trusted', ['$sce', function($sce){
        return function(codeHtml) {
            return $sce.trustAsHtml(codeHtml);
        };
    }]);
appManagerMSF.controller('dataapprovalController', ["$scope",'$filter',"commonvariable","DataApprovalsState","DataSetForm", "$modal", function($scope, $filter,commonvariable,DataApprovalsState,DataSetForm,$modal) {
	var $translate = $filter('translate');
	 $scope.msjValidation=1;
	$scope.Clearform=function(){
    	window.location.reload();  	
    }
	
	$scope.progressbarDisplayed=false;
	
     $scope.GetValueOfDataSet=function(){
    	 $scope.DatasetValue=undefined;
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
	    	$scope.collapsed=true;
	    	$scope.progressbarDisplayed=true;
    	});
    }
     $scope.PostChangeStatusdapproval=function(){
    	 DataApprovalsState.post({ds:commonvariable.DataSet.id,pe:commonvariable.Period,ou:commonvariable.OrganisationUnit.id})
    	 .$promise.then(function() {
    		 $scope.GetValueOfDataSet();    		  		
	    	});
     }
     
     $scope.RemoveChangeStatusdapproval=function(){
    	 DataApprovalsState.remove({ds:commonvariable.DataSet.id,pe:commonvariable.Period,ou:commonvariable.OrganisationUnit.id})
    	 .$promise.then(function() {
    		 $scope.GetValueOfDataSet();    		  		
	    	}); 
      }
    
     $scope.VarValidation=function(dataSet,Period,OrganisationUnit){
    	 $scope.msjValidation=1;
    	 if(!dataSet)
    		 	$scope.msjValidation= $translate('APPROVAL_VALIDATION_FORM'); 
    	 if(!Period)
 		 		$scope.msjValidation=(($scope.msjValidation!=1)?$scope.msjValidation+" ,":"")+ $translate('APPROVAL_VALIDATION_PERIOD');
    	 if(!OrganisationUnit)
  		 		$scope.msjValidation=(($scope.msjValidation!=1)?$scope.msjValidation+" ,":"")+ $translate('APPROVAL_VALIDATION_OU');
      	 
     }
     
	 $scope.executeoption=function(option){
		 $scope.VarValidation(commonvariable.DataSet.id,commonvariable.Period,commonvariable.OrganisationUnit.id);
		 	if($scope.msjValidation==1){
			 	switch(option){
		    	 case 1: 
		    		 $scope.GetValueOfDataSet();
		    		 break;
		    	 case 2:
		    		 $scope.openModal({tittle:$translate('APPROVAL_VALIDATION_TITLE') ,description:$translate('APPROVAL_VALIDATION_DESC'),op:option});
		    		 break;
		    	 case 3: 
		    		 $scope.openModal({tittle:$translate('UNAPPROVAL_VALIDATION_TITLE') ,description:$translate('UNAPPROVAL_VALIDATION_DESC'),op:option});
		    		 break;		    		 
		    	 } 
		 	}
	    	 
	     }
	 
	 
	  $scope.openModal = function (dataInformation) {

	    var modalInstance = $modal.open({
	      templateUrl: 'ModalConfirm.html',
	      controller: 'ModalConfirmCtrl',
	      resolve: {
	          information: function () {
	            return dataInformation;
	          }
	        }
	    });
	    
    modalInstance.result.then(function (selectedOption) {
	      switch(selectedOption){
	    	 case 2:
	    		 $scope.PostChangeStatusdapproval();
	    		 break;
	    	 case 3: 
	    		 $scope.RemoveChangeStatusdapproval();
	    		 break;		    		 
	    	 } 
	      
	    });
	  };
	 
}]);


