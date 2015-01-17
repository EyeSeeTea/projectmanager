'use strict';

Dhis2Api.directive('d2Dropdownperiod', function(){
	return{
		restrict: 'E',
		templateUrl: 'directives/period/PeriodView.html'
	}
});


Dhis2Api.controller("d2DropDownPeriodController", ['$scope',"commonvariable",function ($scope,commonvariable) {


	$scope.disabled = undefined;

	$scope.enable = function() {
		$scope.disabled = false;
	};

	$scope.disable = function() {
		$scope.disabled = true;
	};

	$scope.clear = function() {
		$scope.tipoperiodo.selected = undefined;

	};
    $scope.tipoperiodo = {};
	$scope.tiposperiodo= [
		{name:"Diario",formato:'yyyyMMdd',modo:"day"},
		{name:"Semanal",formato:'yyyyWww',modo:"week"},
		{name:"Mensual",formato:'yyyyMM',modo:"month"},
		{name:"Semestral",formato:'yyyySS',modo:"sixmonth"},
		{name:"Anual",formato:'yyyy',modo:"year"}
	];



	$scope.tipoPeriodoSeleccionado = function(ptSelected){
		$scope.periodtypename=ptSelected.name;
		$scope.periodtypeformat=ptSelected.formato;
		$scope.periodtypemode=ptSelected.modo;

	};

	$scope.mesSeleccionado = function(mesSelected){
		$scope.monthname=mesSelected.name;
	};

	$scope.AnoSeleccionado = function(anoSelected){
		$scope.ano=anoSelected;
	};

	$scope.semestreSeleccionado = function(anoSelected){
		$scope.semestre=anoSelected;
	};

	$scope.semanaSeleccionada = function(weSelected,$event){
		$event.preventDefault();
		$event.stopPropagation();
		$scope.opened = true;
		$scope.week=weSelected;

	};


	$scope.asignarFecha=function(modelo){
		$scope.dia=modelo.getDate('dd');
		$scope.ano=modelo.getFullYear('yyyy');
		$scope.mes=modelo.getMonth('MM');

		switch ($scope.periodtypemode){
			case "day":
			//commonvariable.Period=$scope.ano.toString()+$scope.mes.toString()+$scope.dia.toString();
				commonvariable.Period=modelo.getItem();
				break;
			case "week":
				commonvariable.Period=$scope.ano.toString()+$scope.semanadelano(modelo);
				break;
			case "month":
				commonvariable.Period=$scope.ano.toString()+$scope.mes.toString();
				break;
			case "year":
				commonvariable.Period=$scope.ano.toString();
				break;
			case "sixmonth":
				commonvariable.Period=$scope.ano.toString();
				break;
			default :
				break;

		} ;
		console.log(commonvariable.Period);


	};


//Calendar functions
	$scope.today = function() {
		$scope.dt = new Date();
	};
	$scope.today();

	$scope.clear = function () {
		$scope.dt = null;
	};

	// Disable weekend selection
	$scope.disabled = function(date, mode) {
		return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
	};

	$scope.toggleMin = function() {
		$scope.minDate = $scope.minDate ? null : new Date();
	};
	$scope.toggleMin();


	$scope.open = function($event) {
		$event.preventDefault();
		$event.stopPropagation();
		$scope.opened = true;


	};


	$scope.dateOptions = {
		formatYear: "yyyy",
		startingDay: 1,
		minMode: "day"
	};



	$scope.minDate = $scope.minDate ? null : new Date();
	$scope.maxDate = new Date("12/31/2023");

////////------Función devolver semana
	// A esta funcion se le pasa el parametro en formato fecha
// dd/mm/yyyy o dd-mm-yyyy ambos son aceptados

	$scope.semanadelano =function (fecha){
		var dia=0;
		var mes=0;
		var ano=0;

		dia=fecha.getDate();
		mes=fecha.getMonth();
		ano=fecha.getYear();
		$scope.const  =  [2,1,7,6,5,4,3];
		// Constantes para el calculo del primer dia de la primera semana del año

	//	if (fecha.match(/\//)){
	//		fecha   =  fecha.replace(/\//g,"-",fecha);
	//	};
		// Con lo anterior permitimos que la fecha pasada a la funcion este
		// separada por "/" al remplazarlas por "-" mediante .replace y el uso
		// de expresiones regulares

	//	fecha  =  fecha.split("-");
		// Partimos la fecha en trozos para obtener dia, mes y año por separado




	//	dia    =  eval(fecha[0]);
	//	mes    =  eval(fecha[1]);
	//	ano       =  eval(fecha[2]);
	//	if (mes!=0) {
	//		mes--;
	//	};
		// Convertimos el mes a formato javascript 0=enero

		var dia_pri=0;
		var tiempo0=0;
		var tiempo1=0;
		var lapso=0;
		dia_pri   =  new Date(ano,0,1);
		dia_pri   =  dia_pri.getDay();
		// Obtenemos el dia de la semana del 1 de enero
		dia_pri   =  eval($scope.const[dia_pri]);
		// Obtenemos el valor de la constante correspondiente al día
		tiempo0   =  new Date(ano,0,dia_pri);
		// Establecemos la fecha del primer dia de la semana del año
		dia       =  (dia+dia_pri);
		// Sumamos el valor de la constante a la fecha ingresada para mantener
		// los lapsos de tiempo
		tiempo1   =  new Date(ano,mes,dia);
		// Obtenemos la fecha con la que operaremos
		lapso     =  (tiempo1 - tiempo0)
		// Restamos ambas fechas y obtenemos una marca de tiempo
		$scope.semanas   =  Math.floor(lapso/1000/60/60/24/7);
		// Dividimos la marca de tiempo para obtener el numero de semanas

		if (dia_pri == 1) {
			$scope.semanas++;
		};
		// Si el 1 de enero es lunes le sumamos 1 a la semana caso contrarios el
		// calculo nos daria 0 y nos presentaria la semana como semana 52 del
		// año anterior

		if ($scope.semanas == 0) {
			$scope.semanas=52;
			ano--;
		};
		// Establecemos que si el resultado de semanas es 0 lo cambie a 52 y
		// reste 1 al año esto funciona para todos los años en donde el 1 de
		// Enero no es Lunes

		if (ano < 10) {
			ano = '0'+ano;
		};
		// Por pura estetica establecemos que si el año es menor de 10, aumente
		// un 0 por delante, esto para aquellos que ingresen formato de fecha
		// corto dd/mm/yy
		return 'W'+$scope.semanas;
		//alert('W'+$scope.semanas);
		// Con esta sentencia arrojamos el resultado. Esta ultima linea puede ser
		// cambiada a gusto y conveniencia del lector
	};
///////////////////////////////////////
	$scope.semestral=[];
	for (var i=2010; i<=2030; i++){
		for (var j= 1; j<=2; j++){
			$scope.semestral.push(i+'S'+j);
	}
	};

}]);