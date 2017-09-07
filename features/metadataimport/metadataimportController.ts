
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
import { CommonVariable, ProgressStatus, MetadataVersion } from '../../model/model';
import { AnalyticsService, MetadataSyncService } from '../../services/services.module';

export class MetadataImport {

	static $inject = ["$q", "commonvariable", "MetadataSyncService", "DemographicsService", "AnalyticsService", "MetadataImportService"]

	constructor(
		private $q: ng.IQService,
		private commonvariable: CommonVariable,
		private MetadataSyncService: MetadataSyncService,
		private DemographicsService,
		private AnalyticsService: AnalyticsService,
		private MetadataImportService
	){
		this.initMetadataSyncInfo();
	}

	progressStatus: ProgressStatus;
	syncStatus: ProgressStatus;
	undefinedFile: boolean = false;
	metadataSyncError: string;
	analyticsLog;
	summaryDisplayed: boolean = false;

	localMetadataVersion: string;
	remoteMetadataVersion: string;
	versionDiffNumber: number;

	$file; //single file

	// Initialize metadata sync information
	initMetadataSyncInfo() {
		return this.MetadataSyncService.getLocalMetadataVersion()
			.then(localVersion => this.setLocalMetadataVersion(localVersion))
			.then(() => this.MetadataSyncService.isRemoteServerAvailable())
			.then(() => this.MetadataSyncService.getRemoteMetadataVersion())
			.then(remoteVersion => this.setRemoteMetadataVersion(remoteVersion))
			.then(() => this.MetadataSyncService.getVersionDifference())
			.then(versionDiff => this.setVersionDiff(versionDiff))
			.catch((message) => {
				this.metadataSyncError = message;
				this.$q.reject(message);
			});
	}

	setLocalMetadataVersion(version: string) {
		this.localMetadataVersion = version;
	}

	setRemoteMetadataVersion(version: string) {
		this.remoteMetadataVersion = version;
	}

	setVersionDiff(versionDiff: MetadataVersion[]) {
		this.versionDiffNumber = versionDiff.length;
	}

	metadataSync() {
		this.syncStatus = ProgressStatus.initialWithProgress;
		
		this.MetadataSyncService.executeMetadataSyncDiff()
			.then(
				(success) => {
					this.syncStatus = ProgressStatus.doneSuccessful;
					console.log("Metadata synchronization done");
					return this.initMetadataSyncInfo();
				},
				(error) => {
					this.syncStatus = ProgressStatus.doneWithFailure;
					console.log("Error in automatic metadata sync");
					throw "Metadata sync failed";
				},
				(status) => {
					this.setLocalMetadataVersion(status.currentVersion);
					this.syncStatus.value = (status.progress.updated / status.progress.total) * 100;
				}
			);
	};
	
	metadataSyncIncremental() {
		this.analyticsLog = [];
		this.syncStatus = ProgressStatus.initialWithoutProgress;
		this.MetadataSyncService.executeMetadataSync()
			.then( 
				(success) => {
					this.syncStatus = ProgressStatus.doneSuccessful;
					this.progressStatus = ProgressStatus.doneSuccessful;
					console.log("Metadata synchronization done");
				},
				(error) => {
					this.syncStatus = ProgressStatus.doneWithFailure;
					console.log("Error in automatic metadata sync");
					throw "Metadata sync failed";
				},
				(data) => {
					console.log("Updated to " + data.currentVersion);
					this.localMetadataVersion = data.currentVersion;
				}
			)
			.then(() => this.DemographicsService.updateDemographicData())
			.then(() => this.AnalyticsService.refreshAllAnalytics())
			.then(
				(success) => this.progressStatus = ProgressStatus.doneSuccessful,
				(error) => {
					this.progressStatus = ProgressStatus.doneWithFailure;
					console.log(error);
				},
				(notification) => {
					if (notification != undefined) this.analyticsLog.push(notification);
				}
			);
	};
		
	sendFiles() {
		this.varValidation();

		if (!this.undefinedFile){
			this.progressStatus = ProgressStatus.initialWithoutProgress;

			this.analyticsLog = [];
			this.MetadataImportService.importMetadataFile(this.$file)
				.then(data => this.printImportSummary(data))
				.then(() => this.DemographicsService.updateDemographicData())
				.then(() => this.AnalyticsService.refreshAllAnalytics())
				.then(
					(success) => this.progressStatus = ProgressStatus.doneSuccessful,
					(error) => {
						this.progressStatus = ProgressStatus.doneWithFailure;
						console.log(error);
					},
					(notification) => {
						this.analyticsLog.push(notification);
					}
				);
		}
	};

	private varValidation() {
		this.undefinedFile = (this.$file == undefined);
	}

	private printImportSummary(data) {
		angular.forEach(data.stats, (value, property) => {
			$('#importCount').append(value + " " + property + "<br>");
		});
		this.summaryDisplayed = true;
	}

	onFileSelect($files) {
		for (var i = 0; i < $files.length; i++) {
			this.$file = $files[i];//set a single file
			this.undefinedFile = false;
		}
	};
}
