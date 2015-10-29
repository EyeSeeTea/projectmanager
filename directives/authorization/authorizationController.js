
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



Dhis2Api.directive('d2Authorization', function(){
	return{
		restrict: 'E',
		templateUrl: 'directives/authorization/authorizationView.html',
		scope: {
		      menuoption: '@'
		    }
	}
	}); 
Dhis2Api.controller("d2AuthorizationController", ['$scope',"userAuthorization",'$modal',function ($scope,userAuthorization, $modal) {
	var authorization =userAuthorization.get({menuoption:$scope.menuoption});
	authorization.$promise.then(function(data) {
		if(data.status=="false")
			$scope.open();
	});
	
	  $scope.open = function () {

	    var modalInstance = $modal.open({
	      templateUrl: 'myModalContent.html',
	      controller: 'ModalInstanceCtrl',
	      backdrop: false
	    });
  };
}]);

Dhis2Api.controller('ModalInstanceCtrl', function ($scope, $modalInstance) {
	  $scope.cancel = function () {
	    $modalInstance.dismiss('cancel');
	  };
});