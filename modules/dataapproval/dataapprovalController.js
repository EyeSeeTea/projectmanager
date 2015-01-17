appManagerMSF.filter('to_trusted', ['$sce', function($sce){
        return function(codeHtml) {
            return $sce.trustAsHtml(codeHtml);
        };
    }]);
appManagerMSF.controller('dataapprovalController', ["$scope",'$filter',"commonvariable","DataApprovalsState","DataSetForm", "userAuthorization", function($scope, $filter,commonvariable,DataApprovalsState,DataSetForm,userAuthorization) {
	var authorization =userAuthorization.get({menuoption:"F_APPROVE_DATA"});
	authorization.$promise.then(function(data) {
		$scope.authorization=data.status;
	});
	console.log(authorization);
	var $translate = $filter('translate');
    $scope.title = $translate('DATA_APPROVAL'); 
     $scope.GetValueOfDataSet=function(){
    	var Dataelements=commonvariable.DataSet.dataElements;

    	var LstDataElement="";
    	for(var k in  Dataelements) {
    		   LstDataElement= LstDataElement+ Dataelements[k].id+(k<Dataelements.length-1?";":"");
    		}
    	var StateForApproval = DataApprovalsState.get({ds:commonvariable.DataSet.id,pe:commonvariable.Period,ou:commonvariable.OrganisationUnit.id});
    	StateForApproval.$promise.then(function(data) {
    		$scope.Approvalstate=data.state;
    	});
    
    	var datasetValue=DataSetForm.get({ds:commonvariable.DataSet.id,pe:commonvariable.Period,ou:commonvariable.OrganisationUnit.id}); 
    	datasetValue.$promise.then(function(data) {
    		$scope.DatasetValue=data.codeHtml;
    	});
    }
    
    
}]);