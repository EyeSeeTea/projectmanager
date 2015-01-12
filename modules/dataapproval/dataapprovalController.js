appManagerMSF.controller('dataapprovalController', ["$scope",'$filter',"commonvariable","DataApprovalsState","AnaliticsDAppr", function($scope, $filter,commonvariable,DataApprovalsState,AnaliticsDAppr) {
	var $translate = $filter('translate');
    $scope.title = $translate('DATA_APPROVAL'); 
    $scope.GetValueOfDataSet=function(){
    	var Dataelements=commonvariable.DataSet.dataElements;

    	var LstDataElement="";
    	for(var k in  Dataelements) {
    		   LstDataElement= LstDataElement+ Dataelements[k].id+(k<Dataelements.length-1?";":"");
    		}
    	var StateForApproval = DataApprovalsState.get({ds:commonvariable.DataSet.id,pe:commonvariable.Period,ou:commonvariable.OrganisationUnit.id});
    	$scope.Approvalstate=StateForApproval;
    	//$scope.DatasetValue=AnaliticsDAppr.get({dimension:'dx:'+LstDataElement,dimension:'pe:'+commonvariable.Period,dimension:'ou:'+commonvariable.OrganisationUnit.id});
    }
    
    
}]);