export class IdName {
    constructor(
        public id: string,
        public name: string
    ){}
}

export class CommonVariable {
    constructor(
        public url: string,
        public urlbase: string,
        public isOnline: boolean,
        public apiVersion: string,
        public OrganisationUnit: string,
        public OrganisationUnitList: Orgunit[],
        public Period: string,
        public DataSet: string
    ){}
}

export class Orgunit extends IdName {}

export class OrgunitExtended extends Orgunit {
    constructor(
        public id: string,
        public name: string,
        public level: number,
        public children: Orgunit[]
    ){
        super(id, name);
    }
}

export class OrgunitStatus extends OrgunitExtended {
    constructor(
        public id: string,
        public name: string,
        public level: number,
        public openingDate: Date,
        public closedDate: Date,
        public attributeValues: AttributeValue[],
        public children: OrgunitStatus[]
    ){
        super(id, name, level, children);
    }
}

export class OrgunitGroupSet {
    constructor(
        public id: string,
        public name: string,
        public organisationUnitGroups: IdName[]        
    ){}
}

export class Program {
    constructor(
        public id: string,
        public name: string,
        public programStages: any[]
    ){}
}

export class Job {
    constructor(
        public id: string,
        public name: string
        
    ){}
}


export class TrackerDataExportLog {
    constructor(
        public filename: string,
        public start: Date,
        public end: Date,
        public serverName:string,
        public projectName: string
    ){}
}
export class AggregatedDataExportLog {
    constructor(
        public filename: string,
        public lastUpdated: Date,
        public end: Date
        
    ){}
}
export class ProgressStatus {
    constructor(
        public visible: boolean,
        public active: boolean,
        public type: string,
        public value: number
    ){}

    static initialWithProgress: ProgressStatus = new ProgressStatus(true, true, "info", 0);
    static initialWithoutProgress: ProgressStatus = new ProgressStatus(true, true, "info", 100);
    static doneSuccessful: ProgressStatus = new ProgressStatus(true, false, "success", 100);
    static doneWithFailure: ProgressStatus = new ProgressStatus(true, false, "danger", 100);
    static hidden: ProgressStatus = new ProgressStatus(false, false, "info", 100);
}

export class ValidationRecord {
    constructor(
        public lastDatePush: number,
        public lastPushDateSaved: number
    ){}
}

export class RESTUtil {

    requestGetData(url, successFunc, failFunc) {
        return $.ajax({
            type: "GET",
            dataType: "json",
            url: url,
            async: true,
            success: successFunc,
            error: failFunc
        });
    };

    requestPostData(url, successFunc, failFunc) {
        return $.ajax({
            type: "POST",
            dataType: "json",
            url: url,
            async: true,
            success: successFunc,
            error: failFunc
        });
    };
};

export class AvailableDataItem {
    constructor(
        public id: string,
        public name: string,
        public fullName: string,
        public parents: string[],
        public level: number,
        public relativeLevel: number,
        public isLastLevel: boolean,
        public data: {[key: string]: {value: string, noValidatedPeriod: boolean}}
        
    ){}
}

export class MetadataVersion {
    constructor(
        public name: string,        // Like "Version_2"
        public type: string,        // Like "BEST_EFFORT"
        public created: string,
        public id: string,
        public hashCode: string
    ){}
}

export class MetadataSyncRecord {
    constructor(
        public project: string,
        public version: string,
        public created: Date
    ){}
}

export class CurrentUser {
    constructor(
        public id: string,
        public name: string,
        public userCredentials: {username:string,usernameid: string, userRoles: IdName[]},
        public userGroups: IdName[],
        public organisationUnits: OrgunitExtended[],
        public dataViewOrganisationUnits: {id: string, level: number, children:{id: string, level: number, children: string[]}[]}[]
    ){}
}

export class RemoteQuery {
    constructor(
        public method: string,
        public resource: string,
        public apiVersion?: string,
        public data?: any
    ){}
}

export class MessageConversation {
    constructor(
        public subject: string,
        public text: string,
        public users?: {id: string}[],
        public userGroups?: {id: string}[]
    ){}
}

export class AttributeValue {
    constructor(
        public value: string,
        public attribute: {id: string}
    ){}
}

export class ServiceWithPrograms {
    constructor(
        public name: string,
        public code: string,
        public programs: string            //Code
    ){}
}

export class EventList {
    constructor(
        public events: any[]
    ){}

    static empty = new EventList([]);
}

export class EnrollmentList {
    constructor(
        public enrollments: any[]
    ){}

    static empty = new EnrollmentList([]);
}

export class TrackedEntityInstanceList {
    constructor(
        public trackedEntityInstances: any[]
    ){}

    static empty = new TrackedEntityInstanceList([]);
}

export class EventDataWrapper {
    constructor(
        public events: any[],
        public enrollments: any[],
        public trackedEntityInstances: any[]
    ){}

    addEvents(events: any[]) {
        this.events = this.events.concat(events);
    }

    addTrackedEntityInstances(trackedEntityInstances: any[]) {
        this.trackedEntityInstances = this.trackedEntityInstances.concat(trackedEntityInstances);
    }

    addEnrollments(enrollments: any[]) {
        this.enrollments = this.enrollments.concat(enrollments);
    }
}