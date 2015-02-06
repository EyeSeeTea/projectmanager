Dhis2Api.directive('d2Messages', function(){
	return{
		restrict: 'E',
		templateUrl: 'directives/messages/messagesView.html',
		scope: {
		      type: '@',
		      textmessage: '@'
		    }
	}
	}); 
Dhis2Api.controller("d2messagesController", ['$scope',function ($scope) {

	switch($scope.type){
		case 'success':
			$scope.typemessage="alert alert-success";
			$scope.iconmessage="glyphicon glyphicon-ok";
			break;
		case 'info':
			$scope.typemessage="alert alert-info";
			$scope.iconmessage="glyphicon glyphicon-info-sign";
			break;
		case 'warning':
			$scope.typemessage="alert alert-warning";
			$scope.iconmessage="glyphicon glyphicon-info-sign";
			break;	
		case 'danger':
			$scope.typemessage="alert alert-danger";
			$scope.iconmessage="glyphicon glyphicon-exclamation-sign";
			break;	
	
	}
	
}]);

