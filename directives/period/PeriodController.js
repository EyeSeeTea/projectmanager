'use strict';

Dhis2Api.directive('d2Dropdownperiod', function(){
	return{
		restrict: 'E',
		templateUrl: 'directives/period/PeriodView.html'
	}
});


Dhis2Api.controller("d2DropDownPeriodController", ['$scope','$filter','commonvariable',function ($scope,$filter,commonvariable) {
var $translate = $filter('translate');

	////////////////////

	$scope.formData = {};
	$scope.data = {};

	$scope.dateOptions = {
		formatYear: 'yy',
		startingDay: 1,
		showWeeks:'false'
	};
	$scope.ok = function(){
		alert(show);
	};

	$scope.$watch('formData.dueDate',function(dateVal){
		var weekYear = getWeekNumber(dateVal);
		var year = weekYear[0];
		var week = weekYear[1];

		if(angular.isDefined(week) && angular.isDefined(year)){
			var startDate = getStartDateOfWeek(week, year);
		}
		var weekPeriod = getStartDateOfWeek(week, year);
		if(weekPeriod[0] != 'NaN/NaN/NaN' && weekPeriod[1] != 'NaN/NaN/NaN'){
			$scope.formData.dueDate = 'W' + week + ' ' + weekPeriod[0] + " to "+ weekPeriod[1];
			commonvariable.Period=year + 'W' + week;
			console.log(commonvariable.Period);
			//$scope.semanas=week;
		}


	});

	function getStartDateOfWeek(w, y) {
		var simple = new Date(y, 0, 1 + (w - 1) * 7);
		var dow = simple.getDay();
		var ISOweekStart = simple;
		if (dow <= 4)
			ISOweekStart.setDate(simple.getDate() - simple.getDay());
		else
			ISOweekStart.setDate(simple.getDate() + 7 - simple.getDay());

		var ISOweekEnd = new Date(ISOweekStart);
		ISOweekEnd.setDate(ISOweekEnd.getDate() + 6);

		ISOweekStart = (ISOweekStart.getDate()+1)+'/'+(ISOweekStart.getMonth()+1)+'/'+ISOweekStart.getFullYear();
		ISOweekEnd = (ISOweekEnd.getDate()+1)+'/'+(ISOweekEnd.getMonth()+1)+'/'+ISOweekEnd.getFullYear();
		return [ISOweekStart, ISOweekEnd];
	}

	function getWeekNumber(d) {
		d = new Date(+d);
		d.setHours(0,0,0);
		d.setDate(d.getDate() + 4 - (d.getDay()||7));
		var yearStart = new Date(d.getFullYear(),0,1);
		var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
		return [d.getFullYear(), weekNo];
	}

//////////////////////////
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
		{name:$translate('PERIOD_DAILY'),formato:'yyyyMMdd',modo:"Daily", periodtypeid:1},
		{name:$translate('PERIOD_WEEKLY'),formato:'yyyyWww',modo:"Weekly", periodtypeid:2},
		{name:$translate('PERIOD_MONTHLY'),formato:'yyyyMM',modo:"Monthly", periodtypeid:3},
		{name:$translate('PERIOD_SEMESTRAL'),formato:'yyyySS',modo:"SixMonthly", periodtypeid:4},
		{name:$translate('PERIOD_YEAR'),formato:'yyyy',modo:"Yearly", periodtypeid:5},
		{name:$translate('PERIOD_FINANCIAL_APRIL'),formato:'yyyyApril',modo:"FinancialApril", periodtypeid:6},
		{name:$translate('PERIOD_FINANCIAL_JULY'),formato:'yyyyJuly',modo:"FinancialJuly", periodtypeid:7},
		{name:$translate('PERIOD_FINANCIAL_OCTOBER'),formato:'yyyyOct',modo:"FinancialOct", periodtypeid:8}
	];

	////
	$scope.periodDataSetType=1;
	$scope.$watch(
	        function($scope) {
	        	for(var idx=0;idx<8;idx++){
	        		if($scope.tiposperiodo[idx].modo==commonvariable.DataSet.periodType){
	        			$scope.periodDataSetType=$scope.tiposperiodo[idx].periodtypeid;
	        			idx=9;
	        		}
	        		
	        	}
	         });
	
	////
	$scope.tipoPeriodoSeleccionado = function(ptSelected){
		$scope.periodtypename=ptSelected.name;
		$scope.periodtypeformat=ptSelected.formato;
		$scope.periodtypemode=ptSelected.modo;
		$scope.periodtypeid=ptSelected.periodtypeid;
	};

	$scope.mesSeleccionado = function(mesSelected){
		$scope.monthname=mesSelected.name;
	};

	$scope.AnoSeleccionado = function(anoSelected){
		$scope.ano=anoSelected;
	};

	$scope.semestreSeleccionado = function(anoSelected){
		$scope.semestre=anoSelected;
		commonvariable.Period=$scope.semestre;
	};

	$scope.periodoFinanciero = function(peSelected){

		switch (peSelected.type) {
			case "April":
				$scope.financialPeriodApril = peSelected.anio + 'April';
				commonvariable.Period = $scope.financialPeriodApril;
				break;
			case "July":
				$scope.financialPeriodJuly = peSelected.anio + 'July';
				commonvariable.Period = $scope.financialPeriodJuly;
				break;
			case "Oct":
				$scope.financialPeriodOct = peSelected.anio + 'Oct';
				commonvariable.Period = $scope.financialPeriodOct;
				break;
			default :
				break;
		};
	};

	$scope.semanaSeleccionada = function(weSelected,$event){
		$event.preventDefault();
		$event.stopPropagation();
		$scope.opened = true;
		$scope.week=weSelected;

	};


	$scope.asignarFecha=function(modelo){
		if(modelo==undefined)
			return 0;
		$scope.dia=modelo.getDate('dd');
		$scope.ano=modelo.getFullYear('yyyy');
		$scope.mes=modelo.getMonth('MM');

		switch ($scope.periodtypemode){
			case "Daily":
				 var nmes=($scope.mes)*1+1
				 if ($scope.mes < 10) 
	                   	$scope.mes = '0'+nmes;
	                else
	                	$scope.mes = nmes;
				if ($scope.dia < 10)                   
                	$scope.dia = '0'+$scope.dia;
				commonvariable.Period=$scope.ano.toString()+$scope.mes.toString()+$scope.dia.toString();
				break;
			case "Weekly":
				commonvariable.Period=$scope.ano.toString()+$scope.semanadelano(modelo);
				break;
			case "Monthly":
				 var nmes=($scope.mes)*1+1
                if ($scope.mes < 10) 
                   	$scope.mes = '0'+nmes;
                else
                	$scope.mes = nmes;
                commonvariable.Period=$scope.ano.toString()+$scope.mes.toString();
				break;
			case "Yearly":
				commonvariable.Period=$scope.ano.toString();
				break;
			case "SixMonthly":
				commonvariable.Period=$scope.ano.toString();
				break;
			default :
				break;

		} ;
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


	$scope.minDate = $scope.minDate ? null : new Date();
	$scope.maxDate = new Date("12/31/2023");


///////////////////////////////////////
	$scope.semestral=[];
	for (var i=2010; i<=2020; i++){
		for (var j= 1; j<=2; j++){
			$scope.semestral.push(i+'S'+j);
	}
	};
//////////////////////////////////////
//	Financial periods
	$scope.financialApril=[];
	$scope.financialJuly=[];
	$scope.financialOct=[];
	for (var i=2010; i<=2020; i++){
		$scope.financialApril.push({description:('April ' + (i-1)+' March ' + i), anio:(i-1), type:'April'});
		$scope.financialJuly.push({description:('July ' + (i-1) +' June ' + i), anio:(i-1), type:'July'});
		$scope.financialOct.push({description:('October ' + (i-1)+' September ' + i),anio:(i-1), type:'Oct'});
	}
}]);