
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


appManagerMSF.filter('to_trusted', ['$sce', function($sce){
        return function(codeHtml) {
            return $sce.trustAsHtml(codeHtml);
        };
    }]);
appManagerMSF.controller('dataapprovalController', ["$scope",'$filter',"commonvariable","DataApprovalsState","DataSetForm", "$modal","DataApprovalsAccept", function($scope, $filter,commonvariable,DataApprovalsState,DataSetForm,$modal,DataApprovalsAccept) {
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
    	}).catch(function(e){
    		console.log(e);
    		$scope.msjValidation=$translate('APPROVAL_VALIDATION_DATA')+" ("+e.statusText+")";
	    	var datasetValue=DataSetForm.get({ds:commonvariable.DataSet.id,pe:commonvariable.Period,ou:commonvariable.OrganisationUnit.id}); 
	    	datasetValue.$promise.then(function(data) {
	    		var result=data.codeHtml;
	    		$scope.DatasetValue=result.replace('id="shareForm"','id="shareForm" style="display:none" ');  
	    	});
	    	$scope.collapsed=true;
	    	$scope.progressbarDisplayed=true;
    	});
    }
    
     $scope.$watch(
 	        function(DatasetValue) {
 	        		$("#viewform").each(function() {
 	        			  var $viewform = $( this );
 	        			  $viewform.find("table").addClass("table table-bordered");
 	        		
 	        		});	        	
     });
     
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
    
     $scope.PostChangeStatusAccept=function(){
    	 DataApprovalsAccept.post({ds:commonvariable.DataSet.id,pe:commonvariable.Period,ou:commonvariable.OrganisationUnit.id})
    	 .$promise.then(function() {
    		 $scope.GetValueOfDataSet();    		  		
	    	});
     }
     
     $scope.RemoveChangeStatusAccept=function(){
    	 DataApprovalsAccept.remove({ds:commonvariable.DataSet.id,pe:commonvariable.Period,ou:commonvariable.OrganisationUnit.id})
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
		 $scope.VarValidation(commonvariable.DataSet,commonvariable.Period,commonvariable.OrganisationUnit);
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
		    	 case 4: 
		    		 $scope.openModal({tittle:$translate('APPROVAL_ACCEPT_TITLE') ,description:$translate('APPROVAL_ACCEPT_DESC'),op:option});
		    		 break;
		    	 case 5: 
		    		 $scope.openModal({tittle:$translate('APPROVAL_UNACCEPT_TITLE') ,description:$translate('APPROVAL_UNACCEPT_DESC'),op:option});
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
	    	 case 4: 
	    		 $scope.PostChangeStatusAccept();
	    		 break;
	    	 case 5: 
	    		 $scope.RemoveChangeStatusAccept();
	    		 break;
	    	 } 
	      
	    });
	  };
	 
}]);


