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

import { AnalyticsService } from '../../services/services.module';
import { ProgressStatus } from '../../model/model';

export class Analytics {

	static $inject = ["AnalyticsService", "DemographicsService"];

	constructor(
		private AnalyticsService: AnalyticsService,
		private DemographicsService
	){}

	progressStatus: ProgressStatus;
	summaryDisplayed: boolean = false;
	notifications: string[];

	analytics () {

		this.progressStatus = ProgressStatus.initialWithoutProgress;
		this.summaryDisplayed = true;
		this.notifications = [];

		this.DemographicsService.updateDemographicData()
			.then( () => this.AnalyticsService.refreshAllAnalytics() )
			.then(  
				success => this.progressStatus = ProgressStatus.doneSuccessful,
				error => {
					this.progressStatus = ProgressStatus.doneWithFailure;
					console.log(error);
				},
				notification => this.notifications.push(notification)
			);
	};
	
};
