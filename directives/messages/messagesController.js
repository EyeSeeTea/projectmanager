
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

var messagesDirective = [function(){
	return{
		restrict: 'E',
		template: require('./messagesView.html'),
		controller: messagesController,
		scope: {
		      type: '@',
		      textmessage: '@'
		    }
	}
}];

var messagesController = ['$scope',function ($scope) {

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
}];

module.exports = messagesDirective;