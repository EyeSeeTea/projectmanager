
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

