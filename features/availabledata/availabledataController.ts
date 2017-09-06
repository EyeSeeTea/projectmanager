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

import * as angular from 'angular';
import { AvailableDataItem, CurrentUser, ProgressStatus } from '../../model/model';
import { AnalyticsService, UserService } from '../../services/services.module';

export class AvailableData {

	static $inject = ["$q", "$http", "$parse", "Organisationunit", "OrganisationUnitGroupSet", "OrgunitGroupSetService", "UserService", "userDataStoreService", "AnalyticsService"];

	constructor(private $q: ng.IQService, private $http: ng.IHttpService, private $parse: ng.IParseService,
				private Organisationunit, private OrganisationUnitGroupSet,	private OrgunitGroupSetService,
				private UserService: UserService, private userDataStoreService, private AnalyticsService: AnalyticsService
	){
		// Initialize table
		this.loadUserSettings()
			.then(() => this.loadFilters())
			.then(() => this.loadTable());
	}

	availableDataStatus = ProgressStatus.initialWithoutProgress;

	availablePeriods = [
		{id: "LAST_3_MONTHS", name: 3},
		{id: "LAST_6_MONTHS", name: 6},
		{id: "LAST_12_MONTHS", name: 12}
	];

	selectedPeriod = {
		id: "LAST_6_MONTHS",
		name: "Last 6 months"
	};

	availableFilters = [
		{id:"BtFXTpKRl6n", name: "1. Health Service", selected: false}
	];

	selectedFilters = {};
	orgunitsInfo = {};
	periods;
	tableRows: AvailableDataItem[] = [];
	tableDisplayed: boolean = false;

	loadUserSettings() {
		return this.userDataStoreService.getCurrentUserSettings().then(
			userSettings => {
				if(userSettings.availableData.period != null)
					this.selectedPeriod = userSettings.availableData.period;
				if(userSettings.availableData.filters != null)
					this.selectedFilters = userSettings.availableData.filters;
			},
			error => console.log("There are not settings for current user")
		)
	}

	loadFilters() {
		return this.OrgunitGroupSetService.getOrgunitGroupSets(this.availableFilters)
			.then(filters => {
					this.availableFilters = filters;
					// Preselect filters
					angular.forEach(this.availableFilters, filter => {
						filter.selected = this.selectedFilters[filter.id];
					});
				});
	}

	loadTable() {
		// Initialize common variables
		this.tableRows = [];
		this.orgunitsInfo = {};

		// Initialize visibility of table and progressBar
		this.tableDisplayed = false;
		this.availableDataStatus = ProgressStatus.initialWithoutProgress;
		
		this.UserService.getCurrentUser().then( me => {
			var dataViewOrgUnits = me.dataViewOrganisationUnits;

			var k = dataViewOrgUnits.length;
			var currentOu = 0;
			angular.forEach(dataViewOrgUnits, dataViewOrgUnit => {
				var parentPromise = this.AnalyticsService.queryAvailableData(dataViewOrgUnit, this.selectedPeriod, this.selectedFilters);
				var childrenPromise = this.AnalyticsService.queryAvailableData(dataViewOrgUnit.children, this.selectedPeriod, this.selectedFilters);

				// Add orgunits to orgunitsInfo. That info will be required later.
				this.orgunitsInfo[dataViewOrgUnit.id] = dataViewOrgUnit;
				dataViewOrgUnit.children.map( child => this.orgunitsInfo[child.id] = child );

				this.$q.all([parentPromise, childrenPromise])
					.then( analyticsData => {
						const parentResult = analyticsData[0];
						const childrenResult = analyticsData[1];

						// Generate public period array. It is required for other functions
						this.regenerateScopePeriodArray(parentResult);

						const parentRows = this.AnalyticsService.formatAnalyticsResult(parentResult, this.orgunitsInfo, []);
						const childrenRows = this.AnalyticsService.formatAnalyticsResult(childrenResult, this.orgunitsInfo, [dataViewOrgUnit.id]);
						this.tableRows = this.tableRows.concat(parentRows).concat(childrenRows);
						
						// Make visible orgunits under dataViewOrgunit
						this.orgunitsInfo[dataViewOrgUnit.id].clicked = true;

						// Check if last dataViewOrgunit
						if(k === ++currentOu){  
							this.tableDisplayed = true;
							this.availableDataStatus = ProgressStatus.hidden;
						}
					});
			});
		});
	}

	private regenerateScopePeriodArray(analyticsResponse) {
		this.periods = analyticsResponse.metaData.dimensions.pe.map(period => {
			return {
				id: period,
				//name: "period"
				name: analyticsResponse.metaData.items[period].name
			}
		});
	}

	isClicked(orgunitIds: string[]): boolean {
		return orgunitIds.reduce( (result, orgunitId) => {
			return result && this.orgunitsInfo[orgunitId].clicked === true
		}, true);
	}

	clickOrgunit(orgunit) {
		if(this.orgunitsInfo[orgunit.id].clicked){
			this.orgunitsInfo[orgunit.id].clicked = false;
		} else {
			this.orgunitsInfo[orgunit.id].clicked = true;
			if(!this.childrenLoaded(orgunit.id)){
				this.loadChildren(orgunit);
			}
		}
	}

	loadChildren(orgunit) {
		// Add a loading icon and save the reference
		var loadingIcon = this.addLoadingIcon(orgunit.id);

		var childrenInfo = this.Organisationunit.get({
			paging: false,
			fields: "id,name,level,children",
			filter: "id:in:[" + this.orgunitsInfo[orgunit.id].children.map( child => child.id ).join(",") + "]"
		}).$promise;

		var childrenQuery = this.AnalyticsService.queryAvailableData(this.orgunitsInfo[orgunit.id].children, this.selectedPeriod,
			this.selectedFilters);

		this.$q.all([childrenInfo, childrenQuery])
			.then( data => {
				var childrenInfo = data[0].organisationUnits;
				// Add children information to orgunitsInfo
				$.map(childrenInfo, child => {
					this.orgunitsInfo[child.id] = child;
				});

				// Add analytics information to table
				var childrenResult = data[1];
				var childrenHierarchy = orgunit.parents.slice(0);
				childrenHierarchy.push(orgunit.id);
				var childrenRows = this.AnalyticsService.formatAnalyticsResult(childrenResult, this.orgunitsInfo, childrenHierarchy);
				this.tableRows = this.tableRows.concat(childrenRows);
			})
			.finally( () => {
				// Once finished, remove loadingIcon
				loadingIcon.remove();
			});
	}

	private childrenLoaded(orgunitId): boolean {
		return this.orgunitsInfo[orgunitId].children
			.some( child => this.orgunitsInfo[child.id] != undefined );
	}

	private addLoadingIcon(orgunitId) {
		var orgunitRow = $("#ou_" + orgunitId);
		orgunitRow.append("<span class='children-loading-icon glyphicon glyphicon-repeat'></span>");
		return (orgunitRow.find(".children-loading-icon"));
	}

	modifyFilter(filter) {
		if(filter.selected === undefined || filter.selected === null){
			delete this.selectedFilters[filter.id];
		} else {
			// Update filter information
			this.selectedFilters[filter.id] = filter.selected;
		}

		/*
		var filterSetting = {};
		filterSetting = {
			"key": "filters",
			"value": selectedFilters
		};

		DataStoreService.updateCurrentUserSettings("availableData", filterSetting)
			.then(function () {
				console.log("settings updated");
			});
		**/

		this.loadTable();
	}

	modifyPeriod(period) {
		this.selectedPeriod = {
			id: period.id,
			name: period.name
		};

		var periodSetting = {
			"key": "period",
			"value": this.selectedPeriod
		};

		this.userDataStoreService.updateCurrentUserSettings("availableData", periodSetting)
			.then(() => {});

		this.loadTable();
	}
}
