Dhis2Api.directive('d2Dropdownperiod', function(){
	return{
		restrict: 'E',
		templateUrl: 'directives/period/periodView.html'
	}
	});

Dhis2Api.controller("d2DropDownPeriodController", ['$scope',function ($scope) {

	$scope.TipoPeriodo= [
		{name:"Diario",value:1},
		{name:"Semanal",value:2},
		{name:"Mensual",value:3},
		{name:"Mensual",value:3}

	];


		$scope.Meses= [
			{name:"Enero",value:1},
			{name:"Febrero",value:2},
			{name:"Marzo",value:3}
		];


/*	$scope.Anios = function(start, end) {
		start=1900;
		end=2015;
		var result = [];
		for (var i = start; i <= end; i++) {
			result.push(i);
		}
		return result;
	};*/
	var Anios=[];
	$scope.Anios=[];
	for (var i= 1900; i<=2020; i++){
		Anios.push(i);
	}


	$scope.MesSeleccionado = function(peSelected){
		$scope.monthname=peSelected.name;
}

//	$scope.AnoSeleccionado = function(anSelected){
//		$scope.ano=anSelected;
//	}



}]);