appManagerMSF.controller('dataapprovalController', ["$scope",'$filter',"commonvariable","DataApprovalsState","AnaliticsDAppr","DataSetForm", function($scope, $filter,commonvariable,DataApprovalsState,AnaliticsDAppr,DataSetForm) {
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
    
    	var formdata=DataSetForm.get();
    	formdata.$promise.then(function(data) {
    		//$scope.DatasetValue=data;
    		console.log(data);
    	});
//    	var paramAnalitics={dimension1:'dimension=dx:'+LstDataElement,dimension2:'dimension=pe:'+commonvariable.Period,dimension3:'dimension=ou:'+commonvariable.OrganisationUnit.id};
//    	var datasetValue=AnaliticsDAppr.get(paramAnalitics);
//    	datasetValue.$promise.then(function(data) {
//    		//$scope.DatasetValue=data;
//    		console.log(data);
//    	});
    }
    
    
}]);